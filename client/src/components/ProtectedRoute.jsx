import { Navigate, useLocation } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";

/* ─────────────────────────────────────────────
   ProtectedRoute.jsx — שמירה על נתיבים מוגנים.

   מקור אמת יחיד: ה-user מה-Context (שעובר הידרציה סינכרונית
   מ-localStorage). מכאן שאין Race Condition: ברגע ש-login
   מעדכן את הסטייט ואז קוראים ל-navigate, ה-user כבר מעודכן.
   אין צורך בבדיקה כפולה ידנית מול localStorage.
───────────────────────────────────────────── */

export default function ProtectedRoute({ children }) {
  const { user } = useMeetups();
  const location = useLocation();

  if (!user) {
    // שומרים את היעד המקורי כדי לחזור אליו אחרי התחברות מוצלחת
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}