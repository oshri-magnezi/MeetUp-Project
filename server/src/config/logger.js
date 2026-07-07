import fs from "fs";
import path from "path";
import winston from "winston";

/* ─────────────────────────────────────────────
   logger.js — לוגר אפליקטיבי מבוסס Winston
   • קונסול צבעוני לפיתוח
   • קובץ logs/error.log לשגיאות בלבד
   • קובץ logs/combined.log לכל הרמות
───────────────────────────────────────────── */

// מוודאים שתיקיית הלוגים קיימת (Winston לא יוצר אותה לבד)
const logsDir = path.resolve("logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// stream עבור morgan — כדי שגם לוגי ה-HTTP יעברו דרך Winston
export const morganStream = {
  write: (message) => logger.info(message.trim()),
};
