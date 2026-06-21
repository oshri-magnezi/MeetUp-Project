import React, { useState, useMemo } from "react";
import { useMeetups } from "../context/MeetupContext";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   Home.jsx  –  MeetUp App  (Premium glassmorphism · revamped)
───────────────────────────────────────────── */

const CATEGORIES = [
  { key: "all",      label: "הכל",      emoji: "✨" },
  { key: "sport",    label: "ספורט",    emoji: "⚽" },
  { key: "leisure",  label: "פנאי",     emoji: "🎨" },
  { key: "study",    label: "לימודים",  emoji: "📚" },
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

// מזהה אחיד למפגש (תומך גם ב-MongoDB _id וגם ב-id מקומי)
function getMeetupId(m) {
  return m._id || m.id;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

/* ── Meetup Card ─────────────────────────── */
function MeetupCard({ meetup, onJoin, joined }) {
  const registered = meetup.registered ?? 0;
  const isFull   = registered >= meetup.maxAttendees;
  const disabled = joined || isFull;
  const colors   = getCategoryColors(meetup.category);
  const pct      = Math.min(100, Math.round((registered / meetup.maxAttendees) * 100));

  return (
    <article className="card" dir="rtl">
      {/* Category badge */}
      <span
        className="badge"
        style={{ background: colors.bg, color: colors.text }}
      >
        <span
          className="badge-dot"
          style={{ background: colors.dot, boxShadow: `0 0 8px ${colors.dot}66` }}
        />
        {CATEGORIES.find((c) => c.key === meetup.category)?.label || meetup.category}
      </span>

      {/* Title */}
      <h3 className="card-title">{meetup.title}</h3>

      {/* Description */}
      <p className="card-desc">{meetup.description}</p>

      {/* Meta */}
      <div className="card-meta">
        <span className="meta-item">
          <span className="meta-icon" aria-hidden="true">📅</span>
          <span className="meta-text">{formatDate(meetup.date)}</span>
          {meetup.date && (
            <span className="meta-time">{formatTime(meetup.date)}</span>
          )}
        </span>
        {meetup.location && (
          <span className="meta-item">
            <span className="meta-icon" aria-hidden="true">📍</span>
            <span className="meta-text">{meetup.location}</span>
          </span>
        )}
      </div>

      {/* Attendees bar */}
      <div className="attendees-wrap">
        <div className="attendees-label">
          <span><strong>{registered}</strong> מתוך {meetup.maxAttendees} רשומים</span>
          {isFull && <span className="full-tag">מלא 🔒</span>}
        </div>
        <div
          className="attendees-bar-bg"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="attendees-bar-fill"
            style={{
              width: `${pct}%`,
              background: isFull ? "#e0457b" : `linear-gradient(90deg, ${colors.dot}, ${colors.dot}99)`,
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        className={`join-btn ${disabled ? (joined ? "joined" : "full") : ""}`}
        onClick={() => !disabled && onJoin(getMeetupId(meetup))}
        disabled={disabled}
        aria-label={joined ? "כבר רשום" : isFull ? "המפגש מלא" : "אשר הגעה"}
      >
        {joined ? "✅ רשום למפגש" : isFull ? "המפגש מלא" : "הצטרפות למפגש ←"}
      </button>
    </article>
  );
}

/* ── Empty State ─────────────────────────── */
function EmptyState({ onNavigate, title, sub, icon, ctaText }) {
  return (
    <div className="empty-state" dir="rtl">
      <div className="empty-icon-wrap">
        <div className="empty-icon" aria-hidden="true">{icon}</div>
      </div>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-sub">{sub}</p>
      <button className="empty-cta" onClick={onNavigate}>
        {ctaText}
      </button>
    </div>
  );
}

/* ── Home Page ───────────────────────────── */
export default function Home() {
  const { meetups, loading, error, joinMeetup } = useMeetups();
  const navigate                  = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [joinedIds, setJoinedIds] = useState(new Set());

  const filtered = useMemo(() => {
    if (activeTab === "all") return meetups;
    return meetups.filter((m) => m.category === activeTab);
  }, [meetups, activeTab]);

  // הצטרפות אופטימית: מסמנים מיד, ומבטלים אם השרת מחזיר שגיאה
  async function handleJoin(id) {
    setJoinedIds((prev) => new Set([...prev, id]));
    try {
      await joinMeetup(id);
    } catch (err) {
      setJoinedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert(err.message);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="home-bg" dir="rtl">
        <main className="home-page">

          {/* Hero Header */}
          <header className="hero-card">
            <span className="hero-eyebrow">גלה • הצטרף • חווה</span>
            <h1 className="hero-title">
              מפגשים קרובים <span>אליך מפתחים קהילה</span>
            </h1>
            <p className="hero-sub">
              בחר מפגש, אשר הגעה ותתחיל לחוות רגעים בלתי נשכחים עם אנשים מדהימים בסביבה שלך.
            </p>
          </header>

          {/* Filter tabs */}
          <nav className="filter-bar" role="tablist" aria-label="סינון לפי קטגוריה">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                role="tab"
                aria-selected={activeTab === cat.key}
                className={`filter-tab ${activeTab === cat.key ? "active" : ""}`}
                onClick={() => setActiveTab(cat.key)}
              >
                <span className="tab-emoji" aria-hidden="true">{cat.emoji}</span>
                <span className="tab-text">{cat.label}</span>
              </button>
            ))}
          </nav>

          {/* Results count info */}
          {!loading && meetups.length > 0 && (
            <p className="results-info" aria-live="polite">
              מציג <strong>{filtered.length}</strong> מפגשים
              {activeTab !== "all" && (
                <> בקטגוריית <span>{CATEGORIES.find((c) => c.key === activeTab)?.label}</span></>
              )}
            </p>
          )}

          {/* Content Section */}
          {loading ? (
            <div className="empty-state" dir="rtl">
              <div className="empty-icon-wrap">
                <div className="empty-icon" aria-hidden="true">🔄</div>
              </div>
              <h2 className="empty-title">טוען מפגשים...</h2>
              <p className="empty-sub">אנא המתן בזמן שאנו מושכים את המפגשים מהשרת.</p>
            </div>
          ) : error ? (
            <EmptyState
              title="לא הצלחנו לטעון את המפגשים"
              sub={error}
              icon="⚠️"
              ctaText="↻ רענן את הדף"
              onNavigate={() => window.location.reload()}
            />
          ) : meetups.length === 0 ? (
            <EmptyState
              title="אין מפגשים זמינים כרגע"
              sub="נראה שעדיין אין מפגשים מתוכננים במערכת. למה לא להיות הראשון שיוצר אחד?"
              icon="🗓️"
              ctaText="✨ צור מפגש חדש"
              onNavigate={() => navigate("/dashboard")}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="אין מפגשים בקטגוריה זו"
              sub="נסה לבחור קטגוריה אחרת או לחזור לצפייה בכל המפגשים הזמינים."
              icon="🔍"
              ctaText="הצג את כל המפגשים"
              onNavigate={() => setActiveTab("all")}
            />
          ) : (
            <section className="grid" aria-label="רשימת מפגשים">
              {filtered.map((meetup) => {
                const id = getMeetupId(meetup);
                return (
                  <MeetupCard
                    key={id}
                    meetup={meetup}
                    onJoin={handleJoin}
                    joined={joinedIds.has(id)}
                  />
                );
              })}
            </section>
          )}
        </main>

        {/* Decorative blobs */}
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   עיצוב CSS יוקרתי – Premium Glassmorphic
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

  /* Decorative blobs */
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

  /* Page Shell */
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

  /* Filter Tabs Bar */
  .filter-bar {
    display: flex;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 36px;
  }

  .filter-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    border-radius: 100px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    font-family: 'Rubik', sans-serif;
    font-size: 15.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    color: #4b5563;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.03);
  }
  .filter-tab:hover {
    background: rgba(255, 255, 255, 0.95);
    color: #4f46e5;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.1);
  }
  .filter-tab.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
    transform: translateY(-2px);
  }
  .tab-emoji { font-size: 18px; }

  /* Results Info text */
  .results-info {
    text-align: center;
    margin-bottom: 36px;
    font-size: 15px;
    color: #6b7280;
  }
  .results-info strong { color: #1e1b4b; font-weight: 700; font-size: 16px; }
  .results-info span { color: #7c3aed; font-weight: 600; background: #ede9fe; padding: 2px 8px; border-radius: 6px;}

  /* Cards Grid */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 32px;
    width: 100%;
  }

  /* Cards */
  .card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 32px;
    padding: 32px;
    border: 1px solid rgba(255, 255, 255, 1);
    box-shadow:
      0 12px 32px rgba(79, 70, 229, 0.06),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
  }
  .card:hover {
    transform: translateY(-8px);
    box-shadow:
      0 24px 48px rgba(124, 58, 237, 0.12),
      inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 100px;
    width: fit-content;
  }
  .badge-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
  }

  .card-title {
    font-size: 22px;
    font-weight: 800;
    color: #1e1b4b;
    line-height: 1.3;
  }

  .card-desc {
    font-size: 15px;
    color: #4b5563;
    line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 74px;
  }

  /* Meta Box */
  .card-meta {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: rgba(249, 248, 255, 0.7);
    padding: 16px;
    border-radius: 20px;
    border: 1px solid rgba(226, 221, 255, 0.6);
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14.5px;
    color: #374151;
  }
  .meta-icon { font-size: 16px; }
  .meta-text { font-weight: 500; }
  .meta-time {
    margin-right: auto;
    color: #7c3aed;
    font-weight: 700;
    font-size: 13px;
    background: #ede9fe;
    padding: 4px 10px;
    border-radius: 8px;
  }

  /* Attendees Meter */
  .attendees-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }
  .attendees-label {
    font-size: 13.5px;
    color: #6b7280;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .attendees-label strong { color: #1e1b4b; font-weight: 700; }
  .full-tag { color: #e0457b; font-weight: 800; font-size: 12.5px; background: #fff0f5; padding: 2px 8px; border-radius: 6px;}

  .attendees-bar-bg {
    height: 8px;
    background: rgba(229, 231, 235, 0.6);
    border-radius: 100px;
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  }
  .attendees-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Join Button */
  .join-btn {
    margin-top: auto;
    padding: 16px 20px;
    border-radius: 18px;
    border: none;
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
    position: relative;
    overflow: hidden;
  }
  .join-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .join-btn:hover:not(:disabled)::before { opacity: 1; }
  .join-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(124, 58, 237, 0.4);
  }
  .join-btn:active:not(:disabled) { transform: scale(0.97); }

  .join-btn.joined {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
    cursor: default;
  }
  .join-btn.joined::before { display: none; }

  .join-btn.full {
    background: #e5e7eb;
    color: #9ca3af;
    box-shadow: none;
    cursor: not-allowed;
  }
  .join-btn.full::before { display: none; }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 60px 40px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border-radius: 36px;
    border: 2px dashed rgba(167, 139, 250, 0.4);
    max-width: 560px;
    margin: 20px auto 0;
    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.04);
  }
  .empty-icon-wrap {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, #ede9fe, #f3f0ff);
    border-radius: 24px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.1);
  }
  .empty-icon { font-size: 36px; }
  .empty-title {
    font-size: 24px;
    font-weight: 800;
    color: #1e1b4b;
    margin-bottom: 12px;
  }
  .empty-sub {
    font-size: 16px;
    color: #4b5563;
    line-height: 1.6;
    margin-bottom: 32px;
  }
  .empty-cta {
    padding: 14px 36px;
    border-radius: 16px;
    border: none;
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
    transition: all 0.25s ease;
  }
  .empty-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(124, 58, 237, 0.35);
  }

  /* Accessibility: visible focus + reduced motion */
  .filter-tab:focus-visible,
  .join-btn:focus-visible,
  .empty-cta:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
  }

  /* Responsive Fixes */
  @media (max-width: 768px) {
    .home-page { padding: 40px 5% 80px; }
    .hero-card { padding: 40px 24px; border-radius: 28px; margin-bottom: 36px; }
    .hero-title { font-size: 32px; }
    .filter-bar { gap: 10px; }
    .filter-tab { padding: 12px 20px; font-size: 14.5px; }
    .grid { grid-template-columns: 1fr; gap: 24px; }
    .card { padding: 24px; border-radius: 28px; }
  }
`;