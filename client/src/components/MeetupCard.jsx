import Icon from "./Icon";
import {
  getMeetupId,
  categoryLabel,
  categoryClass,
  formatDate,
  formatTime,
} from "../utils/meetupUtils";

/* ─────────────────────────────────────────────
   MeetupCard.jsx — כרטיס מפגש בדף הבית.
   מבנה ערוך: שורת קטגוריה+תאריך → כותרת → תיאור →
   מיקום ותפוסה → פס פעולה תחתון (הצטרפות/ביטול).
───────────────────────────────────────────── */

export default function MeetupCard({ meetup, isJoined, onJoin, onLeave }) {
  const registeredCount = meetup.registered ?? 0;
  const isFull = registeredCount >= meetup.maxAttendees;
  const fillPercent = Math.min(
    100,
    Math.round((registeredCount / meetup.maxAttendees) * 100)
  );

  return (
    <article className="meetup-card" dir="rtl">
      {/* שורה עליונה: קטגוריה מימין, תאריך משמאל */}
      <div className="meetup-card-top">
        <span className={`chip ${categoryClass(meetup.category)}`}>
          <span className="chip-dot" />
          {categoryLabel(meetup.category)}
        </span>
        <span className="meetup-date">
          {formatDate(meetup.date)}
          {meetup.date && <b> · {formatTime(meetup.date)}</b>}
        </span>
      </div>

      <h3 className="meetup-title">{meetup.title}</h3>
      <p className="meetup-desc">{meetup.description}</p>

      {/* מיקום + תפוסה */}
      <div className="meetup-meta">
        {meetup.location && (
          <span className="meta-item">
            <Icon name="pin" size={14} />
            {meetup.location}
          </span>
        )}
        <span className="meta-item">
          <Icon name="users" size={14} />
          <b>{registeredCount}</b>&nbsp;מתוך {meetup.maxAttendees}
          {isFull && <span className="full-tag">מלא</span>}
        </span>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={fillPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`progress-fill ${isFull ? "fill-danger" : categoryClass(meetup.category)}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {/* פס פעולה תחתון */}
      <footer className="meetup-actions">
        {isJoined ? (
          <button
            className="btn btn-ghost join-btn is-joined"
            onClick={() => onLeave(getMeetupId(meetup))}
            aria-label="בטל רישום למפגש"
          >
            <Icon name="check" size={15} className="joined-check" />
            <span className="joined-label">רשום למפגש</span>
            <span className="leave-label">ביטול רישום</span>
          </button>
        ) : isFull ? (
          <button className="btn join-btn full" disabled aria-label="המפגש מלא">
            המפגש מלא
          </button>
        ) : (
          <button
            className="btn btn-primary join-btn"
            onClick={() => onJoin(getMeetupId(meetup))}
            aria-label="הצטרפות למפגש"
          >
            הצטרפות למפגש
          </button>
        )}
      </footer>
    </article>
  );
}
