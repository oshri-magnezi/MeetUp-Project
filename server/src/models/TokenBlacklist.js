import mongoose from "mongoose";

/* ─────────────────────────────────────────────
   TokenBlacklist.js — רשימת טוקנים שבוטלו (Logout)

   כל טוקן שהמשתמש התנתק ממנו נשמר כאן עד למועד פקיעתו
   המקורי. אינדקס TTL גורם ל-MongoDB למחוק את המסמך
   אוטומטית ברגע ש-expiresAt חלף — כך הרשימה נשארת קטנה
   ולא צריך ניקוי ידני.
───────────────────────────────────────────── */

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// מחיקה אוטומטית ברגע שמגיע expiresAt (expireAfterSeconds: 0)
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TokenBlacklist", tokenBlacklistSchema);
