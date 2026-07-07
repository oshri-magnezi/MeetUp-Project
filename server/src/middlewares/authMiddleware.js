import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

/* ─────────────────────────────────────────────
   authMiddleware.js — מאמת JWT בכל בקשה מוגנת
   ומוסיף את המשתמש ל-req.user עבור ה-controllers.
───────────────────────────────────────────── */

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "גישה נדחתה — חסר טוקן הזדהות" });
    }

    const token = header.split(" ")[1];

    // טוקן שבוטל ב-Logout כבר לא תקף — גם אם עדיין בתוקף זמן
    const blacklisted = await TokenBlacklist.exists({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "החיבור בוטל — יש להתחבר מחדש" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "המשתמש לא נמצא" });
    }

    req.user = user;  // זמין לכל ה-controllers המוגנים
    req.token = token; // נחוץ ל-logout כדי להוסיף ל-blacklist
    next();
  } catch (err) {
    return res.status(401).json({ message: "טוקן לא תקין או שפג תוקפו" });
  }
}

/* ─────────────────────────────────────────────
   restrictTo — הגבלת גישה לפי תפקיד (Role-based Authorization).
   שימוש: router.get("/users", protect, restrictTo("admin"), getUsers)
   חייב לרוץ אחרי protect (כדי ש-req.user כבר קיים).
───────────────────────────────────────────── */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "אין לך הרשאה לבצע פעולה זו" });
    }
    next();
  };
}