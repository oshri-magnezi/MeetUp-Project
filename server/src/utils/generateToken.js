import jwt from "jsonwebtoken";

/* ─────────────────────────────────────────────
   generateToken.js — חתימת JWT עם ה-secret מה-.env
───────────────────────────────────────────── */

// Access Token — קצר טווח (ברירת מחדל 30 דקות), נשלח ב-Authorization header
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "30m",
  });
}

// Refresh Token — ארוך טווח (ברירת מחדל 7 ימים), נשמר ב-httpOnly cookie.
// חתום עם secret נפרד (אם קיים) כדי להפריד בין סוגי הטוקנים.
export function generateRefreshToken(userId) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id: userId, type: "refresh" }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
}

// אימות Refresh Token — מחזיר את ה-payload או זורק שגיאה
export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.verify(token, secret);
}