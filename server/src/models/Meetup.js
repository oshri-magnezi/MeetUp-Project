import mongoose from "mongoose";

/* ─────────────────────────────────────────────
   Meetup.js — מודל המפגש
   השדות תואמים בדיוק למה שה-Frontend שולח/מצפה לו.
───────────────────────────────────────────── */

const meetupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "שם המפגש הוא שדה חובה"],
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    date: {
      type: Date,
      required: [true, "תאריך המפגש הוא שדה חובה"],
    },
    location: {
      type: String,
      required: [true, "מיקום המפגש הוא שדה חובה"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["sport", "leisure", "study", "other"],
      default: "other",
    },
    maxAttendees: {
      type: Number,
      required: [true, "מגבלת משתתפים היא שדה חובה"],
      min: [2, "חייב להיות לפחות 2 משתתפים"],
    },
    registered: { type: Number, default: 0 },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Meetup", meetupSchema);