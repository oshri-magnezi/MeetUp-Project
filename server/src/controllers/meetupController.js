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

// DELETE /api/meetups/:id — מוגן (רק הבעלים יכול למחוק)
export async function deleteMeetup(req, res, next) {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "המפגש לא נמצא" });
    }
    if (meetup.createdBy.toString() !== req.user._id.toString()) {
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