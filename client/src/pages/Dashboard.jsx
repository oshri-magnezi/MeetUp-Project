import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";
import Field from "../components/Field";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import {
  CATEGORIES,
  categoryLabel,
  categoryClass,
  getMeetupId,
  getOwnerId,
  formatDateTime,
} from "../utils/meetupUtils";

/* ─────────────────────────────────────────────
   Dashboard.jsx — לוח בקרה: יצירת מפגש + ניהול המפגשים שיצרת.
   הצפייה פתוחה לכולם; פרסום מפגש דורש התחברות.
───────────────────────────────────────────── */

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "",
  maxAttendees: "",
};

const REQUIRED_FIELDS = ["title", "date", "time", "location", "category", "maxAttendees"];

const FIELD_LABELS = {
  title: "שם המפגש",
  date: "תאריך המפגש",
  time: "שעת התחלה",
  location: "מיקום / כתובת",
  category: "קטגוריה",
  maxAttendees: "מגבלת משתתפים",
};

// בדיקת תקינות הטופס — מחזירה מפת שגיאות לפי שדה
function validateForm(form) {
  const errors = {};
  REQUIRED_FIELDS.forEach((key) => {
    if (!String(form[key]).trim()) errors[key] = `${FIELD_LABELS[key]} הוא שדה חובה`;
  });
  if (
    form.maxAttendees &&
    (isNaN(Number(form.maxAttendees)) || Number(form.maxAttendees) < 2)
  ) {
    errors.maxAttendees = "חייב להיות לפחות 2 משתתפים";
  }
  return errors;
}

/* ── שורת מפגש ברשימת "המפגשים שיצרת" ── */
function MyMeetupRow({ meetup, onDelete }) {
  const registeredCount =
    meetup.registered || (meetup.attendees ? meetup.attendees.length : 1);
  const fillPercent = Math.min((registeredCount / meetup.maxAttendees) * 100, 100);

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
            <Icon name="calendar" size={13} /> {formatDateTime(meetup.date)}
          </span>
          {meetup.location && (
            <span className="meta-item">
              <Icon name="pin" size={13} /> {meetup.location}
            </span>
          )}
          <span className="meta-item">
            <Icon name="users" size={13} /> <b>{registeredCount}</b>/{meetup.maxAttendees}
          </span>
        </div>

        <div
          className="progress-track slim"
          role="progressbar"
          aria-valuenow={Math.round(fillPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`progress-fill ${categoryClass(meetup.category)}`}
            style={{ width: `${fillPercent}%` }}
          />
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

export default function Dashboard() {
  const { user, meetups, loading, error, createMeetup, deleteMeetup } = useMeetups();

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // המפגשים שהמשתמש הנוכחי יצר. אם ה-Backend לא מחזיר שדה בעלים,
  // מציגים את כל המפגשים כדי לא להישאר עם רשימה ריקה במהלך הפיתוח.
  const myMeetups = useMemo(() => {
    if (!user) return [];
    const userId = user._id || user.id;
    const hasOwnerInfo = meetups.some((m) => getOwnerId(m) != null);
    if (!hasOwnerInfo) return meetups;
    return meetups.filter((m) => String(getOwnerId(m)) === String(userId));
  }, [meetups, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // חסימת פרסום למי שאינו מחובר
    if (!user) {
      setApiError("עליך להתחבר כדי לפרסם מפגש חדש.");
      return;
    }

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      // יצירה דרך ה-Context — מעדכן את הסטייט הגלובלי (גם דף הבית מתעדכן)
      await createMeetup({
        title: form.title.trim(),
        description: form.description.trim(),
        date: `${form.date}T${form.time}`,
        location: form.location.trim(),
        category: form.category,
        maxAttendees: Number(form.maxAttendees),
      });

      setForm(EMPTY_FORM);
      setFieldErrors({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setApiError(err.message || "משהו השתבש בזמן פרסום המפגש לשרת.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(meetupId) {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את המפגש הזה?")) return;
    setApiError("");
    try {
      await deleteMeetup(meetupId);
    } catch (err) {
      setApiError(err.message || "מחיקת המפגש נכשלה. נסה שנית.");
    }
  }

  return (
    <main className="page" dir="rtl">

      <header className="page-header">
        <h1 className="page-title">
          {user?.name ? `שלום, ${user.name}` : "לוח הבקרה"}
        </h1>
        <p className="page-subtitle">
          צור מפגשים חדשים, עקוב אחר הנרשמים ונהל את לוח הזמנים שלך.
        </p>
      </header>

      <div className="dash-grid">

        {/* פאנל יצירת מפגש */}
        <section className="panel">
          <h2 className="panel-title">צור מפגש חדש</h2>

          {!user && (
            <div className="toast warn" role="status">
              <Icon name="lock" size={13} /> עליך <Link to="/login">להתחבר</Link> כדי לפרסם מפגש חדש.
            </div>
          )}

          {showSuccess && (
            <div className="toast success" role="status" aria-live="polite">
              המפגש פורסם בהצלחה ונוסף למערכת!
            </div>
          )}

          {apiError && (
            <div className="toast error" role="alert">
              {apiError}
            </div>
          )}

          <form className="form-stack" onSubmit={handleSubmit} noValidate>
            <Field label="שם המפגש" required error={fieldErrors.title} htmlFor="d-title">
              <input
                id="d-title"
                className={`field-input ${fieldErrors.title ? "has-error" : ""}`}
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="למשל: מרתון תכנות או אימון כושר"
                maxLength={80}
                aria-invalid={!!fieldErrors.title}
                disabled={isSubmitting}
              />
            </Field>

            <Field label="תיאור קצר ומטרת המפגש" error={fieldErrors.description} htmlFor="d-desc">
              <textarea
                id="d-desc"
                className="field-input"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="פרט בקצרה על הפעילות, מה הלו''ז ומה כדאי להביא..."
                maxLength={300}
                disabled={isSubmitting}
              />
            </Field>

            <div className="form-row-split">
              <Field label="תאריך המפגש" required error={fieldErrors.date} htmlFor="d-date">
                <input
                  id="d-date"
                  className={`field-input ${fieldErrors.date ? "has-error" : ""}`}
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.date}
                  disabled={isSubmitting}
                />
              </Field>
              <Field label="שעת התחלה" required error={fieldErrors.time} htmlFor="d-time">
                <input
                  id="d-time"
                  className={`field-input ${fieldErrors.time ? "has-error" : ""}`}
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.time}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <Field label="מיקום המפגש" required error={fieldErrors.location} htmlFor="d-loc">
              <input
                id="d-loc"
                className={`field-input ${fieldErrors.location ? "has-error" : ""}`}
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="מיקום פיזי או קישור ל-Zoom"
                aria-invalid={!!fieldErrors.location}
                disabled={isSubmitting}
              />
            </Field>

            <div className="form-row-split">
              <Field label="קטגוריה" required error={fieldErrors.category} htmlFor="d-cat">
                <select
                  id="d-cat"
                  className={`field-input ${fieldErrors.category ? "has-error" : ""}`}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.category}
                  disabled={isSubmitting}
                >
                  <option value="">בחר קטגוריה...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="מגבלת מקומות" required error={fieldErrors.maxAttendees} htmlFor="d-max">
                <input
                  id="d-max"
                  className={`field-input ${fieldErrors.maxAttendees ? "has-error" : ""}`}
                  type="number"
                  name="maxAttendees"
                  value={form.maxAttendees}
                  onChange={handleChange}
                  placeholder="למשל: 15"
                  min={2}
                  aria-invalid={!!fieldErrors.maxAttendees}
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !user}>
              {isSubmitting ? "מפרסם מפגש..." : !user ? "התחבר כדי לפרסם" : "פרסם מפגש חדש"}
            </button>
          </form>
        </section>

        {/* פאנל המפגשים שיצרת */}
        <section className="panel">
          <h2 className="panel-title">
            המפגשים שיצרת
            {myMeetups.length > 0 && <span className="count-pill">{myMeetups.length}</span>}
          </h2>

          {/* שגיאת טעינה כללית מה-Context */}
          {error && !loading && (
            <div className="toast error" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <EmptyState
              compact
              icon="loader"
              spinning
              title="טוען מפגשים מהשרת..."
              sub="אנא המתן בזמן שאנו מושכים נתונים מעודכנים."
            />
          ) : myMeetups.length === 0 ? (
            <EmptyState
              compact
              icon="calendar"
              title="אין לך מפגשים ברשימה"
              sub="השתמש בטופס הצידי כדי לפרסם את המפגש הראשון שלך בקהילה."
            />
          ) : (
            <div className="list">
              {myMeetups.map((meetup) => (
                <MyMeetupRow
                  key={getMeetupId(meetup)}
                  meetup={meetup}
                  onDelete={() => handleDelete(getMeetupId(meetup))}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
