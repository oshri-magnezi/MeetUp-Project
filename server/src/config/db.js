import mongoose from "mongoose";

/* ─────────────────────────────────────────────
   db.js — חיבור למסד הנתונים (MongoDB Atlas) דרך Mongoose
───────────────────────────────────────────── */

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ חסר MONGO_URI בקובץ .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ התחברנו ל-MongoDB");
  } catch (err) {
    console.error("❌ החיבור ל-MongoDB נכשל:", err.message);
    process.exit(1); // אין טעם להפעיל שרת בלי DB
  }
}