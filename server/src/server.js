import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

/* ─────────────────────────────────────────────
   server.js — נקודת הכניסה
   מפעילים את השרת מיד (פורט 5000 תמיד פתוח ל-Frontend),
   ומתחברים ל-DB במקביל — כך שגם אם ה-DB איטי/לא זמין
   השרת פועל וה-Frontend לא מקבל שגיאת "אין חיבור לשרת".
───────────────────────────────────────────── */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 השרת פועל על http://localhost:${PORT}`);
});

connectDB();
