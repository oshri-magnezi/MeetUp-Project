import mongoose from "mongoose";

/* ─────────────────────────────────────────────
   db.js — חיבור למסד הנתונים (MongoDB Atlas) דרך Mongoose
───────────────────────────────────────────── */

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ חסר MONGO_URI בקובץ .env");
    return;
  }

  // לוגים על מצב החיבור — כדי לראות בטרמינל אם באמת התחברנו
  mongoose.connection.on("connected", () => console.log("✅ התחברנו ל-MongoDB"));
  mongoose.connection.on("error", (e) => console.error("❌ שגיאת MongoDB:", e.message));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // ניסיון חיבור ארוך יותר לפני כישלון
      family: 4,                       // אילוץ IPv4 — פותר תקיעות SRV נפוצות ב-Windows
    });
  } catch (err) {
    // לא מפילים את השרת — הוא ממשיך לפעול וניתן לתקן/לנסות שוב את ה-DB
    console.error("❌ החיבור ל-MongoDB נכשל:", err.message);
  }
}
