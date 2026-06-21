import jwt from "jsonwebtoken";

/* ─────────────────────────────────────────────
   generateToken.js — חתימת JWT עם ה-secret מה-.env
───────────────────────────────────────────── */

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}