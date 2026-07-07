import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";
import MeetupCard from "../components/MeetupCard";
import EmptyState from "../components/EmptyState";
import { CATEGORIES, getMeetupId, categoryLabel } from "../utils/meetupUtils";

/* ─────────────────────────────────────────────
   Home.jsx — דף הבית: רשימת המפגשים עם סינון לפי קטגוריה.
───────────────────────────────────────────── */

// טאב "הכל" + הקטגוריות מהמקור המשותף
const FILTER_TABS = [{ value: "all", label: "הכל" }, ...CATEGORIES];

export default function Home() {
  const { user, meetups, loading, error, joinMeetup, leaveMeetup } = useMeetups();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleMeetups = useMemo(() => {
    if (activeCategory === "all") return meetups;
    return meetups.filter((m) => m.category === activeCategory);
  }, [meetups, activeCategory]);

  // "האם אני רשום?" נגזר מרשימת הנרשמים — משקף אמת מהשרת וגם נשמר אחרי רענון
  const currentUserId = user?._id || user?.id;
  function isJoined(meetup) {
    return !!(
      currentUserId &&
      (meetup.attendees || []).some((a) => String(a) === String(currentUserId))
    );
  }

  async function handleJoin(meetupId) {
    try {
      await joinMeetup(meetupId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleLeave(meetupId) {
    try {
      await leaveMeetup(meetupId);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="page" dir="rtl">

      {/* כותרת הדף + סינון */}
      <header className="page-header">
        <div className="page-header-row">
          <h1 className="page-title">מפגשים בקהילה</h1>
          {!loading && meetups.length > 0 && (
            <p className="page-count" aria-live="polite">
              מציג <b>{visibleMeetups.length}</b> מפגשים
              {activeCategory !== "all" && (
                <> בקטגוריית <span>{categoryLabel(activeCategory)}</span></>
              )}
            </p>
          )}
        </div>
        <p className="page-subtitle">
          בחר מפגש, אשר הגעה ותתחיל לחוות רגעים בלתי נשכחים עם אנשים בסביבה שלך.
        </p>

        <nav className="filter-bar" role="tablist" aria-label="סינון לפי קטגוריה">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeCategory === tab.value}
              className={`filter-tab ${activeCategory === tab.value ? "active" : ""}`}
              onClick={() => setActiveCategory(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* תוכן */}
      {loading ? (
        <EmptyState
          icon="loader"
          spinning
          title="טוען מפגשים..."
          sub="אנא המתן בזמן שאנו מושכים את המפגשים מהשרת."
        />
      ) : error ? (
        <EmptyState
          icon="alert"
          title="לא הצלחנו לטעון את המפגשים"
          sub={error}
          ctaText="רענן את הדף"
          onCta={() => window.location.reload()}
        />
      ) : meetups.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="אין מפגשים זמינים כרגע"
          sub="נראה שעדיין אין מפגשים מתוכננים במערכת. למה לא להיות הראשון שיוצר אחד?"
          ctaText="צור מפגש חדש"
          onCta={() => navigate("/dashboard")}
        />
      ) : visibleMeetups.length === 0 ? (
        <EmptyState
          icon="search"
          title="אין מפגשים בקטגוריה זו"
          sub="נסה לבחור קטגוריה אחרת או לחזור לצפייה בכל המפגשים הזמינים."
          ctaText="הצג את כל המפגשים"
          onCta={() => setActiveCategory("all")}
        />
      ) : (
        <section className="meetup-grid" aria-label="רשימת מפגשים">
          {visibleMeetups.map((meetup) => (
            <MeetupCard
              key={getMeetupId(meetup)}
              meetup={meetup}
              isJoined={isJoined(meetup)}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          ))}
        </section>
      )}
    </main>
  );
}
