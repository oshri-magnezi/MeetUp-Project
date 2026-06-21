import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

/* ─────────────────────────────────────────────
   authController.js — הרשמה והתחברות
   שניהם מחזירים { user, token } — בדיוק מה שה-Frontend מצפה לו.
───────────────────────────────────────────── */

// הופך מסמך משתמש לאובייקט בטוח להחזרה (בלי הסיסמה)
function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email };
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
      return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
    }

    const token = generateToken(user._id);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
}