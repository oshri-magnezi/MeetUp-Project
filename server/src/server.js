import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

/* ─────────────────────────────────────────────
   server.js — נקודת הכניסה
   קודם מתחברים ל-DB, ורק אז מפעילים את השרת.
───────────────────────────────────────────── */

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 השרת פועל על http://localhost:${PORT}`);
  });
});