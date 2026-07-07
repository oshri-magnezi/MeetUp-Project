import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Meetup from "../models/Meetup.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken.js";
import { AUTH_WARN_THRESHOLD } from "../middlewares/rateLimiter.js";

/* ─────────────────────────────────────────────
   authController.js — הרשמה והתחברות
   מחזירים { user, token } (Access Token) בגוף התשובה,
   ומצמידים Refresh Token ב-httpOnly cookie.
───────────────────────────────────────────── */

const REFRESH_COOKIE = "refreshToken";

// הגדרות ה-cookie של ה-Refresh Token — httpOnly (לא נגיש ל-JS בדפדפן)
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production", // HTTPS בלבד בייצור
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ימים
};

// מנפיק Refresh Token ומצמיד אותו כ-cookie מאובטח
function attachRefreshCookie(res, userId) {
  res.cookie(REFRESH_COOKIE, generateRefreshToken(userId), refreshCookieOptions);
}

// הופך מסמך משתמש לאובייקט בטוח להחזרה (בלי הסיסמה)
function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "יש למלא שם, אימייל וסיסמה" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "כתובת האימייל כבר רשומה במערכת" });
    }

    // הסיסמה תוצפן אוטומטית ב-pre('save') של המודל
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    attachRefreshCookie(res, user._id);
    res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "יש למלא אימייל וסיסמה" });
    }

    // חובה לבקש את הסיסמה במפורש כי במודל היא מוגדרת select:false
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      // כשנותרו מעט ניסיונות — מוסיפים אזהרה כדי שהמשתמש יידע לפני חסימה
      const remaining = req.rateLimit?.remaining;
      let message = "אימייל או סיסמה שגויים";
      if (typeof remaining === "number" && remaining <= AUTH_WARN_THRESHOLD) {
        message += ` — נותרו ${remaining} ניסיונות לפני חסימה זמנית`;
      }
      return res.status(401).json({ message });
    }

    const token = generateToken(user._id);
    attachRefreshCookie(res, user._id);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh — מחדש Access Token באמצעות ה-Refresh Token מה-cookie.
// ציבורי (לא דורש Access Token — שהרי הוא בדיוק מה שפג תוקפו).
export async function refresh(req, res, next) {
  try {
    const rtoken = req.cookies?.[REFRESH_COOKIE];
    if (!rtoken) {
      return res.status(401).json({ message: "אין Refresh Token — יש להתחבר מחדש" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(rtoken);
    } catch {
      return res.status(401).json({ message: "ה-Refresh Token אינו תקין או שפג תוקפו" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "המשתמש לא נמצא" });
    }

    // מנפיקים Access Token חדש (ומרעננים גם את ה-Refresh Token — rolling)
    const token = generateToken(user._id);
    attachRefreshCookie(res, user._id);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout — מוגן. מוסיף את הטוקן הנוכחי ל-blacklist
// כך שהוא כבר לא יתקבל בבקשות עתידיות (ביטול Session אמיתי בצד השרת).
export async function logout(req, res, next) {
  try {
    const token = req.token; // הוצמד ב-protect middleware
    const decoded = jwt.decode(token);

    // שומרים עד למועד הפקיעה המקורי של הטוקן; אינדקס ה-TTL ימחק אותו אז.
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    // upsert — מונע כפילות אם המשתמש מתנתק פעמיים עם אותו טוקן
    await TokenBlacklist.updateOne(
      { token },
      { token, expiresAt },
      { upsert: true }
    );

    // מנקים את ה-Refresh Token cookie — ביטול מלא של ה-Session
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    res.json({ message: "התנתקת בהצלחה" });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/users — לאדמין בלבד (מוגן ב-protect + restrictTo("admin")).
// מדגים הרשאה לפי תפקיד ברמת הנתיב.
export async function getUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(publicUser));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/auth/users/:id — לאדמין בלבד. מחיקת משתמש כולל כל התוכן שלו:
// המפגשים שיצר נמחקים, והוא מוסר מרשימות הנרשמים של מפגשים אחרים.
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // מנהל לא יכול למחוק את עצמו (מונע נעילה מחוץ למערכת בטעות)
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ message: "לא ניתן למחוק את החשבון של עצמך" });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "המשתמש לא נמצא" });
    }

    // מחיקה מדורגת: המפגשים שהוא יצר + הסרה מנרשמים במפגשים של אחרים
    const removedMeetups = await Meetup.deleteMany({ createdBy: target._id });
    await Meetup.updateMany(
      { attendees: target._id },
      { $pull: { attendees: target._id }, $inc: { registered: -1 } }
    );

    await target.deleteOne();

    res.json({
      message: "המשתמש נמחק בהצלחה",
      id,
      deletedMeetups: removedMeetups.deletedCount,
    });
  } catch (err) {
    next(err);
  }
}