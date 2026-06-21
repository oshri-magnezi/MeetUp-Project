import axios from "axios";

/* ─────────────────────────────────────────────
   client.js — שכבת ה-API המרכזית (Axios Instance)
   • Base URL יחיד לכל האפליקציה (מתוך .env)
   • הצמדת JWT אוטומטית לכל בקשה (Request Interceptor)
   • טיפול מרוכז בשגיאות + ניקוי Session ב-401 (Response Interceptor)
───────────────────────────────────────────── */

// ה-Base URL נשלף מקובץ ה-.env (Vite). יש ערך ברירת מחדל לפיתוח מקומי.
// ראה .env.example: VITE_API_URL=http://localhost:5000/api
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// מפתחות localStorage מרוכזים — מקור אמת יחיד לאורך כל האפליקציה
export const LS_TOKEN = "mu_token";
export const LS_USER = "mu_user";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* ── Request Interceptor: מצמיד את ה-JWT לכל בקשה יוצאת ──
   הקריאה נעשית מ-localStorage בכל בקשה, כך שגם אם הטוקן התעדכן
   הרגע (Login) — הוא ייתפס מיד וסינכרונית.                    */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response Interceptor: נרמול שגיאות להודעה ידידותית אחת ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // טוקן לא תקין / פג תוקף — מנקים את ה-Session המקומי
    if (status === 401) {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    }

    const friendlyMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === "ECONNABORTED"
        ? "הבקשה ארכה זמן רב מדי. נסה שוב."
        : null) ||
      (!error.response
        ? "לא ניתן להתחבר לשרת. ודא שה-Backend פועל על פורט 5000."
        : "אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.");

    // מחזירים Error רגיל עם הודעה נקייה — קל לתפיסה ב-catch בכל קומפוננטה
    return Promise.reject(new Error(friendlyMessage));
  }
);

export default apiClient;