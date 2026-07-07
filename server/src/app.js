import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import meetupRoutes from "./routes/meetupRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import { authLimiter } from "./middlewares/rateLimiter.js";
import { morganStream } from "./config/logger.js";

/* ─────────────────────────────────────────────
   app.js — הגדרת אפליקציית Express
───────────────────────────────────────────── */

const app = express();

// CORS — מאשר את כתובות ה-Frontend המורשות (רשימה מופרדת בפסיקים ב-.env)
// כך אותו שרת עובד גם מול Vite בפיתוח (5173) וגם מול Nginx ב-Docker (8080).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// קריאת גוף הבקשה כ-JSON
app.use(express.json());

// קריאת cookies (נחוץ ל-Refresh Token שנשמר ב-httpOnly cookie)
app.use(cookieParser());

// לוגי HTTP — Morgan דרך ה-stream של Winston (פורמט תמציתי)
app.use(morgan("tiny", { stream: morganStream }));

// בדיקת בריאות פשוטה — פתיחת הכתובת בדפדפן תראה שהשרת חי
app.get("/", (req, res) => res.json({ status: "MeetUp API פועל ✅" }));

// נתיבי ה-API (הגבלת קצב על נתיבי ההזדהות בלבד)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/meetups", meetupRoutes);

// טיפול בשגיאות — תמיד אחרי כל הנתיבים
app.use(notFound);
app.use(errorHandler);

export default app;