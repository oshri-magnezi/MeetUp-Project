import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "המשתמש לא נמצא" });
    }

    req.user = user; // זמין לכל ה-controllers המוגנים
    next();
  } catch (err) {
    return res.status(401).json({ message: "טוקן לא תקין או שפג תוקפו" });
  }
}