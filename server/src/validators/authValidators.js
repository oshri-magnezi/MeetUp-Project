import { body } from "express-validator";

/* ─────────────────────────────────────────────
   authValidators.js — חוקי ולידציה להרשמה והתחברות
   ההודעות זהות בסגנון להודעות שה-Frontend כבר מציג.
───────────────────────────────────────────── */

export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("שם הוא שדה חובה")
    .isLength({ max: 60 }).withMessage("השם ארוך מדי (עד 60 תווים)"),

  body("email")
    .trim()
    .notEmpty().withMessage("אימייל הוא שדה חובה")
    .isEmail().withMessage("כתובת אימייל לא תקינה")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("סיסמה היא שדה חובה")
    .isLength({ min: 6 }).withMessage("הסיסמה חייבת להכיל לפחות 6 תווים"),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("אימייל הוא שדה חובה")
    .isEmail().withMessage("כתובת אימייל לא תקינה")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("סיסמה היא שדה חובה"),
];
