import { body } from "express-validator";

/* ─────────────────────────────────────────────
   meetupValidators.js — חוקי ולידציה למפגשים
   • createRules — כל שדות החובה נדרשים
   • updateRules — כל שדה אופציונלי, אבל אם נשלח חייב להיות תקין
───────────────────────────────────────────── */

const CATEGORIES = ["sport", "leisure", "study", "other"];

export const createMeetupRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("שם המפגש הוא שדה חובה")
    .isLength({ max: 80 }).withMessage("שם המפגש ארוך מדי (עד 80 תווים)"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("התיאור ארוך מדי (עד 300 תווים)"),

  body("date")
    .notEmpty().withMessage("תאריך המפגש הוא שדה חובה")
    .isISO8601().withMessage("תאריך המפגש אינו תקין"),

  body("location")
    .trim()
    .notEmpty().withMessage("מיקום המפגש הוא שדה חובה"),

  body("category")
    .optional()
    .isIn(CATEGORIES).withMessage("קטגוריה לא מוכרת"),

  body("maxAttendees")
    .notEmpty().withMessage("מגבלת משתתפים היא שדה חובה")
    .isInt({ min: 2 }).withMessage("חייב להיות לפחות 2 משתתפים")
    .toInt(),
];

export const updateMeetupRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("שם המפגש לא יכול להיות ריק")
    .isLength({ max: 80 }).withMessage("שם המפגש ארוך מדי (עד 80 תווים)"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("התיאור ארוך מדי (עד 300 תווים)"),

  body("date")
    .optional()
    .isISO8601().withMessage("תאריך המפגש אינו תקין"),

  body("location")
    .optional()
    .trim()
    .notEmpty().withMessage("מיקום המפגש לא יכול להיות ריק"),

  body("category")
    .optional()
    .isIn(CATEGORIES).withMessage("קטגוריה לא מוכרת"),

  body("maxAttendees")
    .optional()
    .isInt({ min: 2 }).withMessage("חייב להיות לפחות 2 משתתפים")
    .toInt(),
];
