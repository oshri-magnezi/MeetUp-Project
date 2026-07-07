import { useState, useEffect } from "react";
import { useMeetups } from "../context/MeetupContext";
import { getUsersRequest, deleteUserRequest } from "../api";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import {
  getMeetupId,
  categoryLabel,
  categoryClass,
  formatDateTime,
} from "../utils/meetupUtils";

/* ─────────────────────────────────────────────
   Admin.jsx — עמוד ניהול (אדמין בלבד).
   • כל המפגשים במערכת + מחיקה (admin override בשרת)
   • כל המשתמשים + מחיקת משתמש (מוחקת גם את המפגשים שלו)
   מוגן ב-ProtectedRoute, וה-API חסום ב-restrictTo("admin").
───────────────────────────────────────────── */

/* ── שורת מפגש ברשימת הניהול ── */
function MeetupRow({ meetup, onDelete }) {
  return (
    <div className="list-row">
      <div className="list-row-main">
        <div className="list-row-header">
          <span className={`chip ${categoryClass(meetup.category)}`}>
            <span className="chip-dot" />
            {categoryLabel(meetup.category)}
          </span>
          <h4 className="list-row-title">{meetup.title}</h4>
        </div>
        <div className="list-row-meta">
          <span className="meta-item">
            <Icon name="user" size={13} /> {meetup.createdBy?.name || "לא ידוע"}
          </span>
          <span className="meta-item">
            <Icon name="calendar" size={13} /> {formatDateTime(meetup.date)}
          </span>
          <span className="meta-item">
            <Icon name="users" size={13} /> {meetup.registered ?? 0}/{meetup.maxAttendees}
          </span>
        </div>
      </div>
      <button
        className="icon-delete-btn"
        onClick={onDelete}
        title="מחק מפגש"
        aria-label={`מחק את המפגש ${meetup.title}`}
      >
        <Icon name="trash" size={17} />
      </button>
    </div>
  );
}

/* ── שורת משתמש ברשימת הניהול ── */
function UserRow({ user, isCurrentUser, onDelete }) {
  const isAdmin = user.role === "admin";
  return (
    <div className="list-row">
      <div className="user-avatar" aria-hidden="true">
        {(user.name || "?").trim().charAt(0).toUpperCase()}
      </div>
      <div className="list-row-main">
        <div className="list-row-title">
          {user.name}
          {isCurrentUser && <span className="user-me">(אתה)</span>}
        </div>
        <div className="list-row-meta">
          <span className="meta-item">
            <Icon name="mail" size={12} /> {user.email}
          </span>
        </div>
      </div>
      <span className={`role-badge ${isAdmin ? "role-admin" : "role-user"}`}>
        <Icon name={isAdmin ? "shield" : "user"} size={12} />
        {isAdmin ? "מנהל" : "משתמש"}
      </span>
      {!isCurrentUser && (
        <button
          className="icon-delete-btn"
          onClick={onDelete}
          title="מחק משתמש"
          aria-label={`מחק את המשתמש ${user.name}`}
        >
          <Icon name="trash" size={16} />
        </button>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, meetups, loading, deleteMeetup, fetchMeetups } = useMeetups();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getUsersRequest()
      .then((data) => active && setUsers(Array.isArray(data) ? data : []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setUsersLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // מחיקת מפגש — ה-Context מעדכן את הסטייט הגלובלי (גם דף הבית)
  async function handleDeleteMeetup(meetup) {
    if (!window.confirm(`למחוק את המפגש "${meetup.title}"?`)) return;
    setError("");
    try {
      await deleteMeetup(getMeetupId(meetup));
    } catch (err) {
      setError(err.message);
    }
  }

  // מחיקת משתמש — מוחקת בשרת גם את המפגשים שלו, ולכן מרעננים את הרשימה
  async function handleDeleteUser(targetUser) {
    if (!window.confirm(`למחוק את המשתמש "${targetUser.name}"? כל המפגשים שיצר יימחקו גם.`)) return;
    setError("");
    try {
      await deleteUserRequest(targetUser._id);
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      fetchMeetups();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page" dir="rtl">
      <header className="page-header">
        <h1 className="page-title">ניהול המערכת</h1>
        <p className="page-subtitle">
          שליטה מלאה בכל המפגשים והמשתמשים. עמוד זה נגיש למנהלים בלבד.
        </p>
      </header>

      {error && (
        <div className="toast error" role="alert">
          {error}
        </div>
      )}

      <div className="dash-grid">
        {/* ── כל המפגשים ── */}
        <section className="panel">
          <h2 className="panel-title">
            כל המפגשים
            {!loading && <span className="count-pill">{meetups.length}</span>}
          </h2>

          {loading ? (
            <EmptyState compact icon="loader" spinning title="טוען מפגשים..." />
          ) : meetups.length === 0 ? (
            <EmptyState compact icon="calendar" title="אין מפגשים במערכת" />
          ) : (
            <div className="list">
              {meetups.map((meetup) => (
                <MeetupRow
                  key={getMeetupId(meetup)}
                  meetup={meetup}
                  onDelete={() => handleDeleteMeetup(meetup)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── כל המשתמשים ── */}
        <section className="panel">
          <h2 className="panel-title">
            כל המשתמשים
            {!usersLoading && <span className="count-pill">{users.length}</span>}
          </h2>

          {usersLoading ? (
            <EmptyState compact icon="loader" spinning title="טוען משתמשים..." />
          ) : (
            <div className="list">
              {users.map((u) => (
                <UserRow
                  key={u._id}
                  user={u}
                  isCurrentUser={String(u._id) === String(user?._id)}
                  onDelete={() => handleDeleteUser(u)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
