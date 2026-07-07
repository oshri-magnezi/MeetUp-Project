import Meetup from "../models/Meetup.js";

/* ─────────────────────────────────────────────
   meetupController.js — לוגיקת המפגשים
───────────────────────────────────────────── */

// GET /api/meetups — ציבורי (דף הבית טוען זאת גם ללא התחברות)
export async function getMeetups(req, res, next) {
  try {
    const meetups = await Meetup.find()
      .populate("createdBy", "name email")
      .sort({ date: 1 });
    res.json(meetups);
  } catch (err) {
    next(err);
  }
}

// POST /api/meetups — מוגן (חייב להיות מחובר)
export async function createMeetup(req, res, next) {
  try {
    const { title, description, date, location, category, maxAttendees } = req.body;

    if (!title || !date || !location || !maxAttendees) {
      return res
        .status(400)
        .json({ message: "יש למלא שם, תאריך, מיקום ומגבלת משתתפים" });
    }

    const meetup = await Meetup.create({
      title,
      description,
      date,
      location,
      category,
      maxAttendees,
      createdBy: req.user._id, // הבעלים = המשתמש המחובר
    });

    await meetup.populate("createdBy", "name email");
    res.status(201).json(meetup);
  } catch (err) {
    next(err);
  }
}

// PUT /api/meetups/:id — מוגן (רק הבעלים יכול לעדכן)
export async function updateMeetup(req, res, next) {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "המפגש לא נמצא" });
    }
    // הבעלים או מנהל (admin) בלבד
    const isOwner = meetup.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "אין לך הרשאה לעדכן מפגש זה" });
    }

    // מעדכנים רק שדות תוכן — לא בעלות ולא נתוני נרשמים
    const { title, description, date, location, category, maxAttendees } = req.body;
    if (title !== undefined)        meetup.title = title;
    if (description !== undefined)  meetup.description = description;
    if (date !== undefined)         meetup.date = date;
    if (location !== undefined)     meetup.location = location;
    if (category !== undefined)     meetup.category = category;
    if (maxAttendees !== undefined) meetup.maxAttendees = maxAttendees;

    // לא מרשים לצמצם את מגבלת המקומות מתחת לכמות הנרשמים הקיימת
    if (meetup.maxAttendees < meetup.registered) {
      return res.status(400).json({
        message: `לא ניתן להגביל ל-${meetup.maxAttendees} מקומות — כבר רשומים ${meetup.registered}`,
      });
    }

    await meetup.save(); // מפעיל את ולידציות ה-Schema
    await meetup.populate("createdBy", "name email");
    res.json(meetup);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/meetups/:id — מוגן (רק הבעלים יכול למחוק)
export async function deleteMeetup(req, res, next) {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "המפגש לא נמצא" });
    }
    // הבעלים או מנהל (admin) בלבד
    const isOwner = meetup.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "אין לך הרשאה למחוק מפגש זה" });
    }

    await meetup.deleteOne();
    res.json({ message: "המפגש נמחק בהצלחה", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

// POST /api/meetups/:id/join — מוגן
export async function joinMeetup(req, res, next) {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "המפגש לא נמצא" });
    }

    const alreadyJoined = meetup.attendees.some(
      (a) => a.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: "כבר נרשמת למפגש זה" });
    }
    if (meetup.registered >= meetup.maxAttendees) {
      return res.status(400).json({ message: "המפגש מלא" });
    }

    meetup.attendees.push(req.user._id);
    meetup.registered = meetup.attendees.length;
    await meetup.save();

    await meetup.populate("createdBy", "name email");
    res.json(meetup);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/meetups/:id/join — מוגן. ביטול רישום למפגש.
export async function leaveMeetup(req, res, next) {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "המפגש לא נמצא" });
    }

    const uid = req.user._id.toString();
    const isRegistered = meetup.attendees.some((a) => a.toString() === uid);
    if (!isRegistered) {
      return res.status(400).json({ message: "אינך רשום למפגש זה" });
    }

    meetup.attendees = meetup.attendees.filter((a) => a.toString() !== uid);
    meetup.registered = meetup.attendees.length;
    await meetup.save();

    await meetup.populate("createdBy", "name email");
    res.json(meetup);
  } catch (err) {
    next(err);
  }
}