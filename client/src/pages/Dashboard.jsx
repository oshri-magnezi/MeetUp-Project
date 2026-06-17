import React, { useState } from "react";
import { useMeetups } from "../context/MeetupContext";

/* ─────────────────────────────────────────────
    Dashboard.jsx – Premium Light Glassmorphism · revamped
───────────────────────────────────────────── */

const CATEGORIES = [
  { value: "sport",   label: "⚽ ספורט" },
  { value: "leisure", label: "🎨 פנאי" },
  { value: "study",   label: "📚 לימודים" },
  { value: "other",   label: "✨ אחר" },
];

const CATEGORY_COLORS = {
  sport:   { bg: "#fff0f5", text: "#e0457b", dot: "#e0457b" },
  leisure: { bg: "#f0f5ff", text: "#4a72f5", dot: "#4a72f5" },
  study:   { bg: "#f0faf5", text: "#22a06b", dot: "#22a06b" },
  default: { bg: "#f5f0ff", text: "#7c3aed", dot: "#7c3aed" },
};

function getCategoryColors(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "",
  maxAttendees: "",
};

const REQUIRED = ["title", "date", "time", "location", "category", "maxAttendees"];

const FIELD_LABELS = {
  title: "שם המפגש",
  date: "תאריך המפגש",
  time: "שעת התחלה",
  location: "מיקום / כתובת",
  category: "קטגוריה",
  maxAttendees: "מגבלת משתתפים",
};

function formatDateTime(date, time) {
  if (!date) return "";
  const d = new Date(`${date}T${time || "00:00"}`);
  return d.toLocaleDateString("he-IL", {
    weekday: "short", day: "numeric", month: "long",
  }) + (time ? ` · ${time}` : "");
}

function Field({ label, required, error, htmlFor, children }) {
  return (
    <div className="field-wrap">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="req-star">*</span>}
      </label>
      {children}
      {error && <span className="field-error">⚠ {error}</span>}
    </div>
  );
}

export default function Dashboard() {
  const { addMeetup } = useMeetups();

  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [myMeetups, setMyMeetups] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  function validate(data) {
    const errs = {};
    REQUIRED.forEach((key) => {
      if (!String(data[key]).trim()) errs[key] = `${FIELD_LABELS[key]} הוא שדה חובה`;
    });
    if (data.maxAttendees && (isNaN(Number(data.maxAttendees)) || Number(data.maxAttendees) < 2)) {
      errs.maxAttendees = "חייב להיות לפחות 2 משתתפים";
    }
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newMeetup = {
      id:          Date.now(),
      title:       form.title.trim(),
      description: form.description.trim(),
      date:        `${form.date}T${form.time}`,
      location:    form.location.trim(),
      category:    form.category,
      maxAttendees: Number(form.maxAttendees),
      registered:  1,
    };

    addMeetup(newMeetup);
    setMyMeetups((prev) => [newMeetup, ...prev]);
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleDelete(id) {
    setMyMeetups((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="home-bg" dir="rtl">
        <main className="home-page">

          {/* Hero Header */}
          <header className="hero-card">
            <span className="hero-eyebrow">ניהול קהילה • שליטה מלאה</span>
            <h1 className="hero-title">
              אזור הניהול <span>של המפגשים שלך</span>
            </h1>
            <p className="hero-sub">
              צור מפגשים קהילתיים חדשים, עקוב אחר כמות המשתתפים הרשומים ונהל את לוח הזמנים שלך בממשק אחד חכם ונקי.
            </p>
          </header>

          {/* Grid Layout: Form vs List */}
          <div className="dash-grid">

            {/* Column A: Create Form Card */}
            <section className="glass-card">
              <div className="card-header-block">
                <span className="card-header-icon" aria-hidden="true">✏️</span>
                <h2 className="card-header-title">צור מפגש חדש</h2>
              </div>

              {submitted && (
                <div className="toast-success" role="status" aria-live="polite">
                  ✨ המפגש פורסם בהצלחה ונוסף למערכת!
                </div>
              )}

              <form className="form-stack" onSubmit={handleSubmit} noValidate>
                <Field label="שם המפגש" required error={errors.title} htmlFor="d-title">
                  <input
                    id="d-title"
                    className={`form-control ${errors.title ? "has-error" : ""}`}
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="למשל: מרתון תכנות או אימון כושר"
                    maxLength={80}
                    aria-invalid={!!errors.title}
                  />
                </Field>

                <Field label="תיאור קצר ומטרת המפגש" error={errors.description} htmlFor="d-desc">
                  <textarea
                    id="d-desc"
                    className="form-control text-area"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="פרט בקצרה על הפעילות, מה הלו''ז ומה כדאי להביא..."
                    maxLength={300}
                  />
                </Field>

                <div className="form-row-split">
                  <Field label="תאריך המפגש" required error={errors.date} htmlFor="d-date">
                    <input
                      id="d-date"
                      className={`form-control ${errors.date ? "has-error" : ""}`}
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      aria-invalid={!!errors.date}
                    />
                  </Field>
                  <Field label="שעת התחלה" required error={errors.time} htmlFor="d-time">
                    <input
                      id="d-time"
                      className={`form-control ${errors.time ? "has-error" : ""}`}
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      aria-invalid={!!errors.time}
                    />
                  </Field>
                </div>

                <Field label="מיקום המפגש" required error={errors.location} htmlFor="d-loc">
                  <input
                    id="d-loc"
                    className={`form-control ${errors.location ? "has-error" : ""}`}
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="מיקום פיזי או קישור ל-Zoom"
                    aria-invalid={!!errors.location}
                  />
                </Field>

                <div className="form-row-split">
                  <Field label="קטגוריה" required error={errors.category} htmlFor="d-cat">
                    <select
                      id="d-cat"
                      className={`form-control select-control ${errors.category ? "has-error" : ""}`}
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      aria-invalid={!!errors.category}
                    >
                      <option value="">בחר קטגוריה...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="מגבלת מקומות" required error={errors.maxAttendees} htmlFor="d-max">
                    <input
                      id="d-max"
                      className={`form-control ${errors.maxAttendees ? "has-error" : ""}`}
                      type="number"
                      name="maxAttendees"
                      value={form.maxAttendees}
                      onChange={handleChange}
                      placeholder="למשל: 15"
                      min={2}
                      aria-invalid={!!errors.maxAttendees}
                    />
                  </Field>
                </div>

                <button type="submit" className="submit-action-btn">
                  פרסם מפגש חדש ←
                </button>
              </form>
            </section>

            {/* Column B: Created Meetups Feed */}
            <section className="glass-card">
              <div className="card-header-block">
                <span className="card-header-icon" aria-hidden="true">📋</span>
                <h2 className="card-header-title">המפגשים שיצרת</h2>
                {myMeetups.length > 0 && (
                  <span className="badge-count-pill">{myMeetups.length}</span>
                )}
              </div>

              {myMeetups.length === 0 ? (
                <div className="inner-empty-state">
                  <div className="inner-empty-icon" aria-hidden="true">📅</div>
                  <h3>אין לך מפגשים ברשימה</h3>
                  <p>השתמש בטופס הצידי כדי לייצר ולפרסם את המפגש הראשון שלך בקהילה.</p>
                </div>
              ) : (
                <div className="feed-stack">
                  {myMeetups.map((m) => {
                    const colors = getCategoryColors(m.category);
                    const fillPct = Math.min((m.registered / m.maxAttendees) * 100, 100);

                    return (
                      <div key={m.id} className="interactive-row-card">
                        <div className="row-main-content">

                          <div className="row-header-line">
                            <span className="row-badge" style={{ background: colors.bg, color: colors.text }}>
                              <span className="row-badge-dot" style={{ background: colors.dot }} />
                              {CATEGORIES.find((c) => c.value === m.category)?.label.split(" ")[1] || "אחר"}
                            </span>
                            <h4 className="row-card-title">{m.title}</h4>
                          </div>

                          <div className="row-meta-container">
                            <div className="row-meta-item">
                              <span aria-hidden="true">📅</span> {formatDateTime(m.date?.split("T")[0], m.date?.split("T")[1]?.slice(0,5))}
                            </div>
                            {m.location && (
                              <div className="row-meta-item">
                                <span aria-hidden="true">📍</span> {m.location}
                              </div>
                            )}
                          </div>

                          <div className="row-progress-wrapper">
                            <div className="row-progress-label">
                              <span>רשומים: <strong>{m.registered}</strong> מתוך {m.maxAttendees}</span>
                            </div>
                            <div
                              className="row-progress-track"
                              role="progressbar"
                              aria-valuenow={Math.round(fillPct)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div className="row-progress-fill" style={{ width: `${fillPct}%`, background: colors.dot }} />
                            </div>
                          </div>

                        </div>

                        <button
                          className="row-delete-action"
                          onClick={() => handleDelete(m.id)}
                          title="מחק מפגש"
                          aria-label={`מחק את המפגש ${m.title}`}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        </main>

        {/* Decorative background blobs */}
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
    UI Styles – Synchronized with Home.jsx
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .home-bg {
    min-height: 100%;
    width: 100%;
    background: #f4f3ff;
    position: relative;
    overflow-x: hidden;
    font-family: 'Rubik', sans-serif;
    display: flex;
    justify-content: center;
    flex: 1;
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
  }
  .blob-a {
    width: 600px; height: 600px;
    background: radial-gradient(circle, #a78bfa, #6d28d9);
    top: -150px; right: -150px;
  }
  .blob-b {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #818cf8, #4f46e5);
    bottom: -100px; left: -100px;
  }
  .blob-c {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #c084fc, #7c3aed);
    top: 40%; left: 10%;
  }

  .home-page {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1400px;
    padding: 50px 4% 120px;
    direction: rtl;
    display: flex;
    flex-direction: column;
  }

  /* Hero Card */
  .hero-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 36px;
    padding: 60px 40px;
    text-align: center;
    box-shadow:
      0 10px 40px rgba(79, 70, 229, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    margin-bottom: 50px;
  }

  .hero-eyebrow {
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    color: #6d28d9;
    background: rgba(237, 233, 254, 0.8);
    backdrop-filter: blur(4px);
    padding: 8px 20px;
    border-radius: 100px;
    margin-bottom: 22px;
    letter-spacing: 0.05em;
  }

  .hero-title {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    color: #1e1b4b;
    line-height: 1.2;
    margin-bottom: 18px;
    letter-spacing: -0.02em;
  }
  .hero-title span {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: clamp(16px, 2vw, 19px);
    color: #4b5563;
    max-width: 760px;
    margin: 0 auto;
    line-height: 1.6;
    font-weight: 400;
  }

  /* Dashboard Grid */
  .dash-grid {
    display: grid;
    grid-template-columns: 460px 1fr;
    gap: 32px;
    width: 100%;
    align-items: start;
  }
  @media (max-width: 1024px) {
    .dash-grid { grid-template-columns: 1fr; }
  }

  /* Glassmorphic Core Cards */
  .glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 32px;
    padding: 32px;
    border: 1px solid rgba(255, 255, 255, 1);
    box-shadow:
      0 12px 32px rgba(79, 70, 229, 0.06),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }

  .card-header-block {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(226, 221, 255, 0.6);
    padding-bottom: 16px;
  }
  .card-header-icon { font-size: 20px; }
  .card-header-title {
    font-size: 18px;
    font-weight: 800;
    color: #1e1b4b;
  }
  .badge-count-pill {
    margin-right: auto;
    background: #7c3aed;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 100px;
  }

  /* Form Elements */
  .form-stack { display: flex; flex-direction: column; gap: 18px; }
  .form-row-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .field-wrap { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 13.5px;
    font-weight: 600;
    color: #374151;
  }
  .req-star { color: #e0457b; margin-right: 2px; }

  .form-control {
    font-family: 'Rubik', sans-serif;
    font-size: 14.5px;
    color: #1e1b4b;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(226, 221, 255, 0.8);
    border-radius: 14px;
    padding: 12px 16px;
    width: 100%;
    outline: none;
    transition: all 0.2s ease;
  }
  .form-control::placeholder { color: #9ca3af; }
  .form-control:focus {
    border-color: #7c3aed;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }
  .form-control.has-error {
    border-color: #ef4444;
    background: #fef2f2;
  }
  .text-area { resize: vertical; min-height: 80px; }

  .select-control {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: left 14px center;
    background-size: 14px;
    padding-left: 40px;
  }

  .field-error {
    font-size: 12.5px;
    color: #ef4444;
    font-weight: 500;
  }

  /* Action Button */
  .submit-action-btn {
    margin-top: 6px;
    padding: 14px 20px;
    border-radius: 16px;
    border: none;
    font-family: 'Rubik', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.2);
  }
  .submit-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(124, 58, 237, 0.3);
  }

  /* Created Items Feed */
  .feed-stack { display: flex; flex-direction: column; gap: 14px; }

  .interactive-row-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(249, 248, 255, 0.6);
    border: 1px solid rgba(226, 221, 255, 0.6);
    padding: 20px;
    border-radius: 22px;
    transition: all 0.25s ease;
  }
  .interactive-row-card:hover {
    transform: translateX(-2px);
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(124, 58, 237, 0.3);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.04);
  }

  .row-main-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
  .row-header-line { display: flex; align-items: center; gap: 12px; }
  .row-card-title { font-size: 16px; font-weight: 700; color: #1e1b4b; }

  .row-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 100px;
  }
  .row-badge-dot { width: 6px; height: 6px; border-radius: 50%; }

  .row-meta-container { display: flex; flex-wrap: wrap; gap: 16px; }
  .row-meta-item {
    font-size: 13px;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .row-progress-wrapper { display: flex; flex-direction: column; gap: 6px; max-width: 240px; width: 100%; }
  .row-progress-label { font-size: 12px; color: #6b7280; }
  .row-progress-label strong { color: #1e1b4b; }
  .row-progress-track { height: 6px; background: #e5e7eb; border-radius: 100px; overflow: hidden; }
  .row-progress-fill { height: 100%; border-radius: 100px; transition: width 0.4s ease; }

  .row-delete-action {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 10px;
    border-radius: 12px;
    transition: all 0.2s ease;
    color: #9ca3af;
  }
  .row-delete-action:hover {
    background: #fff0f5;
    color: #e0457b;
  }

  .toast-success {
    background: #f0faf5;
    color: #22a06b;
    border: 1px solid rgba(34, 160, 107, 0.2);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .inner-empty-state {
    text-align: center;
    padding: 48px 24px;
    background: rgba(255, 255, 255, 0.4);
    border: 2px dashed rgba(167, 139, 250, 0.3);
    border-radius: 24px;
  }
  .inner-empty-icon { font-size: 32px; margin-bottom: 12px; }
  .inner-empty-state h3 { font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 6px; }
  .inner-empty-state p { font-size: 13.5px; color: #6b7280; line-height: 1.5; }

  /* Accessibility: visible focus + reduced motion */
  .form-control:focus-visible,
  .submit-action-btn:focus-visible,
  .row-delete-action:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
  }

  @media (max-width: 768px) {
    .home-page { padding: 40px 5% 80px; }
    .hero-card { padding: 40px 24px; border-radius: 28px; margin-bottom: 36px; }
    .hero-title { font-size: 32px; }
    .form-row-split { grid-template-columns: 1fr; }
  }
`;