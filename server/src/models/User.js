import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ─────────────────────────────────────────────
   User.js — מודל המשתמש
   • email ייחודי (unique index — גם לביצועים וגם למניעת כפילויות)
   • הסיסמה מוצפנת אוטומטית לפני שמירה (bcrypt)
───────────────────────────────────────────── */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "שם הוא שדה חובה"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "אימייל הוא שדה חובה"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "כתובת אימייל לא תקינה"],
    },
    password: {
      type: String,
      required: [true, "סיסמה היא שדה חובה"],
      minlength: [6, "הסיסמה חייבת להכיל לפחות 6 תווים"],
      select: false, // לא יוחזר כברירת מחדל בשאילתות
    },
  },
  { timestamps: true }
);

// הצפנת הסיסמה לפני שמירה — רק אם היא חדשה/שונתה
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// השוואת סיסמה שהוזנה מול המוצפנת השמורה
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);