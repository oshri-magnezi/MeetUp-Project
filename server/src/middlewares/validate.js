import { validationResult } from "express-validator";

/* ─────────────────────────────────────────────
   validate.js — הרצת חוקי ולידציה (express-validator)

   מקבל מערך חוקים (body(...)), מריץ את כולם, ואם יש
   שגיאה — מחזיר 400 בפורמט האחיד { message } שכל
   האפליקציה (וה-Frontend) כבר עובדים איתו.
───────────────────────────────────────────── */

export function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      next();
    },
  ];
}
