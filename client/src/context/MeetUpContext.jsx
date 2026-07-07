import {
  createContext,
  useState,
  useContext,
  useCallback,
} from "react";
import {
  getMeetups,
  createMeetupRequest,
  deleteMeetupRequest,
  joinMeetupRequest,
  leaveMeetupRequest,
  logoutRequest,
} from "../api";
import { LS_TOKEN, LS_USER } from "../api/client";

/* ─────────────────────────────────────────────
   MeetupContext.jsx — Store גלובלי + Auth מרכזי
   מקור אמת יחיד: user/token המסונכרנים מול localStorage.
───────────────────────────────────────────── */

const MeetupContext = createContext(null);

export const MeetupProvider = ({ children }) => {
  /* ─── 1. AUTH ───
     הידרציה סינכרונית מ-localStorage כבר ב-render הראשון.
     זה הלב של הפתרון ל-Race Condition: כש-ProtectedRoute נטען,
     ה-user כבר קיים בזיכרון (אם המשתמש מחובר), בלי להמתין ל-effect. */
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem(LS_TOKEN) || null
  );

  /* ─── 2. MEETUPS ─── */
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ─── 3. AUTH ACTIONS ───
     login מקבל שני ארגומנטים (userData, token) ומעדכן סטייט +
     localStorage באותה פעולה — סינכרוני ועקבי. */
  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken || null);
    localStorage.setItem(LS_USER, JSON.stringify(userData));
    if (userToken) localStorage.setItem(LS_TOKEN, userToken);
  }, []);

  const logout = useCallback(async () => {
    // ביטול ה-Session בשרת קודם — בזמן שהטוקן עדיין ב-localStorage
    // וה-interceptor מצמיד אותו. גם אם הקריאה נכשלת, ממשיכים לנקות מקומית.
    try {
      await logoutRequest();
    } catch {
      /* התנתקות מקומית מובטחת גם אם השרת לא זמין */
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_TOKEN);
  }, []);

  /* ─── 4. MEETUPS ACTIONS ─── */
  const fetchMeetups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeetups();
      setMeetups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeetup = useCallback(async (payload) => {
    const created = await createMeetupRequest(payload);
    setMeetups((prev) => [created, ...prev]);
    return created;
  }, []);

  const deleteMeetup = useCallback(async (id) => {
    await deleteMeetupRequest(id);
    setMeetups((prev) => prev.filter((m) => (m._id || m.id) !== id));
  }, []);

  // מזהה המשתמש הנוכחי (למעקב אחרי מי רשום לאיזה מפגש)
  const uid = user?._id || user?.id;

  // הצטרפות עם עדכון אופטימי (attendees + registered) + Rollback אם השרת נכשל.
  // בסיום מוחלף המפגש בתשובת השרת — מקור אמת יחיד.
  const joinMeetup = useCallback(async (id) => {
    let snapshot;
    setMeetups((prev) => {
      snapshot = prev;
      return prev.map((m) => {
        if ((m._id || m.id) !== id) return m;
        const attendees = m.attendees || [];
        if (attendees.some((a) => String(a) === String(uid))) return m;
        return { ...m, attendees: [...attendees, uid], registered: (m.registered ?? 0) + 1 };
      });
    });
    try {
      const updated = await joinMeetupRequest(id);
      setMeetups((prev) => prev.map((m) => ((m._id || m.id) === id ? updated : m)));
    } catch (err) {
      if (snapshot) setMeetups(snapshot); // החזרת המצב הקודם
      throw err;
    }
  }, [uid]);

  // ביטול רישום — אותו דפוס אופטימי, בכיוון ההפוך.
  const leaveMeetup = useCallback(async (id) => {
    let snapshot;
    setMeetups((prev) => {
      snapshot = prev;
      return prev.map((m) => {
        if ((m._id || m.id) !== id) return m;
        const attendees = (m.attendees || []).filter((a) => String(a) !== String(uid));
        return { ...m, attendees, registered: Math.max(0, (m.registered ?? 1) - 1) };
      });
    });
    try {
      const updated = await leaveMeetupRequest(id);
      setMeetups((prev) => prev.map((m) => ((m._id || m.id) === id ? updated : m)));
    } catch (err) {
      if (snapshot) setMeetups(snapshot);
      throw err;
    }
  }, [uid]);

  return (
    <MeetupContext.Provider
      value={{
        // auth
        user,
        token,
        login,
        logout,
        // meetups
        meetups,
        loading,
        error,
        fetchMeetups,
        createMeetup,
        deleteMeetup,
        joinMeetup,
        leaveMeetup,
      }}
    >
      {children}
    </MeetupContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMeetups = () => {
  const ctx = useContext(MeetupContext);
  if (!ctx) {
    throw new Error("useMeetups חייב לרוץ בתוך <MeetupProvider>");
  }
  return ctx;
};