import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";
import Icon from "../components/Icon";
import { getMeetupId, getOwnerId, formatDate } from "../utils/meetupUtils";

/* ─────────────────────────────────────────────
   Profile.jsx — עמוד מוגן: פרטי המשתמש המחובר.
   נגיש רק דרך ProtectedRoute (מנותק מופנה ל-Login).
───────────────────────────────────────────── */

export default function Profile() {
  const { user, meetups, logout } = useMeetups();
  const navigate = useNavigate();

  // "עכשיו" מקובע לרגע פתיחת הדף (אתחול עצל — מותר להיות לא-טהור)
  const [pageOpenedAt] = useState(() => Date.now());

  // סיכום פעילות — נגזר מנתונים שכבר בזיכרון (אפס קריאות רשת):
  // כמה מפגשים יצרתי, לכמה אני רשום, ומתי המפגש העתידי הקרוב שלי.
  const stats = useMemo(() => {
    if (!user) return { created: 0, joined: 0, nextDate: null };
    const userId = String(user._id || user.id);

    const createdByMe = meetups.filter((m) => String(getOwnerId(m)) === userId);
    const joinedByMe = meetups.filter((m) =>
      (m.attendees || []).some((a) => String(a) === userId)
    );

    // המפגש העתידי הקרוב מבין אלה שיצרתי או שאני רשום אליהם (בלי כפילויות)
    const myMeetups = new Map(
      [...createdByMe, ...joinedByMe].map((m) => [getMeetupId(m), m])
    );
    const upcoming = [...myMeetups.values()]
      .filter((m) => new Date(m.date).getTime() > pageOpenedAt)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      created: createdByMe.length,
      joined: joinedByMe.length,
      nextDate: upcoming[0]?.date || null,
    };
  }, [meetups, user, pageOpenedAt]);

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
        {/* זהות: אווטאר, שם, אימייל, תפקיד */}
        <div className="profile-head">
          <div className="profile-avatar" aria-hidden="true">{avatarInitial}</div>
          <div className="profile-id">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>
          <span className={`role-badge ${isAdmin ? "role-admin" : "role-user"}`}>
            <Icon name={isAdmin ? "shield" : "user"} size={13} />
            {isAdmin ? "מנהל" : "משתמש"}
          </span>
        </div>

        {/* סיכום פעילות */}
        <div className="profile-stats">
          <div className="stat-tile">
            <div className="stat-value">{stats.created}</div>
            <div className="stat-label">מפגשים שיצרת</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.joined}</div>
            <div className="stat-label">רשום למפגשים</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value stat-date">
              {stats.nextDate ? formatDate(stats.nextDate) : "—"}
            </div>
            <div className="stat-label">המפגש הקרוב שלך</div>
          </div>
        </div>

        {/* פעולות: הראשית בונה, ההתנתקות שקטה */}
        <div className="profile-actions">
          <Link to="/dashboard" className="btn btn-primary">
            <Icon name="dashboard" size={17} />
            ללוח הבקרה
          </Link>
          <button type="button" className="btn btn-ghost btn-danger" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            התנתקות
          </button>
        </div>
      </section>
    </main>
  );
}
