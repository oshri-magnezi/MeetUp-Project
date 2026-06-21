import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import meetupRoutes from "./routes/meetupRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

/* ─────────────────────────────────────────────
   app.js — הגדרת אפליקציית Express
───────────────────────────────────────────── */

const app = express();

// CORS — מאשר רק את כתובת ה-Frontend (מתוך .env)
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: clientUrl, credentials: true }));

// קריאת גוף הבקשה כ-JSON
app.use(express.json());

// בדיקת בריאות פשוטה — פתיחת הכתובת בדפדפן תראה שהשרת חי
app.get("/", (req, res) => res.json({ status: "MeetUp API פועל ✅" }));

// נתיבי ה-API
app.use("/api/auth", authRoutes);
app.use("/api/meetups", meetupRoutes);

// טיפול בשגיאות — תמיד אחרי כל הנתיבים
app.use(notFound);
app.use(errorHandler);

export default app;