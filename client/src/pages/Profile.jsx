import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";
import Icon from "../components/Icon";
import { getOwnerId } from "../utils/meetupUtils";

/* ─────────────────────────────────────────────
   Profile.jsx — עמוד מוגן: פרטי המשתמש המחובר.
   נגיש רק דרך ProtectedRoute (מנותק מופנה ל-Login).
───────────────────────────────────────────── */

export default function Profile() {
  const { user, meetups, logout } = useMeetups();
  const navigate = useNavigate();

  // כמות המפגשים שהמשתמש הנוכחי יצר
  const createdCount = useMemo(() => {
    if (!user) return 0;
    const userId = user._id || user.id;
    return meetups.filter((m) => String(getOwnerId(m)) === String(userId)).length;
  }, [meetups, user]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const avatarInitial = (user?.name || "?").trim().charAt(0).toUpperCase();
  const isAdmin = user?.role === "admin";

  return (
    <main className="page" dir="rtl">
      <header className="page-header">
        <h1 className="page-title">הפרופיל שלי</h1>
        <p className="page-subtitle">פרטי החשבון שלך ופעילותך בקהילה.</p>
      </header>

      <section className="panel profile-card">
        <div className="profile-head">
          <div className="profile-avatar" aria-hidden="true">{avatarInitial}</div>
          <div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>
          <span className={`role-badge ${isAdmin ? "role-admin" : "role-user"}`}>
            <Icon name={isAdmin ? "shield" : "user"} size={13} />
            {isAdmin ? "מנהל" : "משתמש"}
          </span>
        </div>

        <div className="profile-stat">
          <Icon name="calendar" size={18} />
          <span>
            יצרת <b>{createdCount}</b> מפגשים בקהילה
          </span>
        </div>

        <div className="profile-actions">
          <Link to="/dashboard" className="btn btn-ghost">
            <Icon name="dashboard" size={17} />
            ללוח הבקרה
          </Link>
          <button type="button" className="btn btn-primary" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            התנתקות
          </button>
        </div>
      </section>
    </main>
  );
}
