import rateLimit from "express-rate-limit";

/* ─────────────────────────────────────────────
   rateLimiter.js — הגבלת קצב בקשות (הגנה מפני brute force / DDoS)
───────────────────────────────────────────── */

// מגביל את נתיבי ההזדהות: מקסימום 10 ניסיונות ל-IP בכל 15 דקות.
// מגן בעיקר על /login מפני ניחוש סיסמאות אוטומטי.
export const AUTH_MAX_ATTEMPTS = 10;
// מתחת לכמות זו של ניסיונות שנותרו — מציגים למשתמש אזהרה
export const AUTH_WARN_THRESHOLD = 3;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: AUTH_MAX_ATTEMPTS,
  standardHeaders: true, // מחזיר כותרות RateLimit-* תקניות
  legacyHeaders: false,
  message: { message: "יותר מדי ניסיונות התחברות. נסה שוב בעוד מספר דקות." },
});
