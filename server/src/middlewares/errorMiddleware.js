import { logger } from "../config/logger.js";

/* ─────────────────────────────────────────────
   errorMiddleware.js — טיפול מרוכז בשגיאות
   פורמט תגובה אחיד: { message }  (בדיוק מה שה-Frontend קורא)
───────────────────────────────────────────── */

// נתיב לא קיים → 404
export function notFound(req, res, next) {
  res.status(404).json({ message: `הנתיב לא נמצא: ${req.originalUrl}` });
}

// Handler מרכזי לכל השגיאות באפליקציה
export function errorHandler(err, req, res, next) {
  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`, { stack: err.stack });

  let status = err.statusCode || 500;
  let message = err.message || "שגיאת שרת פנימית";

  // אימייל כפול (unique index של Mongo)
  if (err.code === 11000) {
    status = 400;
    message = "כתובת האימייל כבר רשומה במערכת";
  }

  // שגיאות ולידציה של Mongoose
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)[0]?.message || "נתונים לא תקינים";
  }

  // מזהה (ObjectId) לא תקין
  if (err.name === "CastError") {
    status = 400;
    message = "מזהה לא תקין";
  }

  res.status(status).json({ message });
}