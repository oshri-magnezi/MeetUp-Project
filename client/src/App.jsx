import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// ה-Context הגלובלי (ה-Provider עצמו עוטף את App בתוך main.jsx)
import { useMeetups } from './context/MeetupContext';

/* ─────────────────────────────────────────────
   Navbar Component — דינמי לפי מצב ההתחברות
───────────────────────────────────────────── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // שליפת המשתמש ופונקציית ההתנתקות מה-Context
  const { user, logout } = useMeetups();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // בניית תפריט הניווט בצורה דינמית לפי מצב החיבור
  const getNavLinks = () => {
    const links = [{ to: '/', label: 'דף הבית', emoji: '🏠', end: true }];

    if (user) {
      links.push({ to: '/dashboard', label: 'לוח בקרה', emoji: '📊' });
    } else {
      links.push(
        { to: '/login', label: 'התחברות', emoji: '🔑' },
        { to: '/register', label: 'הרשמה', emoji: '📝' }
      );
    }
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className={`mu-navbar ${scrolled ? 'is-scrolled' : ''}`} dir="rtl">
      <div className="mu-navbar__inner">
        {/* Brand */}
        <NavLink
          to="/"
          className="mu-brand"
          onClick={closeMenu}
          aria-label="MeetUp — דף הבית"
        >
          <span className="mu-brand__icon" aria-hidden="true">◈</span>
          <span className="mu-brand__text">MeetUp</span>
        </NavLink>

        {/* Desktop links */}
        <nav className="mu-links" aria-label="ניווט ראשי">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `mu-link ${isActive ? 'is-active' : ''}`
              }
            >
              <span className="mu-link__emoji" aria-hidden="true">{link.emoji}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}

          {/* כפתור התנתקות למשתמש מחובר (דסקטופ) */}
          {user && (
            <button onClick={() => { logout(); closeMenu(); }} className="mu-link mu-logout-btn">
              <span className="mu-link__emoji" aria-hidden="true">🚪</span>
              <span>התנתקות</span>
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className={`mu-burger ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'סגור תפריט' : 'פתח תפריט'}
          aria-expanded={menuOpen}
          aria-controls="mu-mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="mu-mobile-menu"
        className={`mu-mobile ${menuOpen ? 'is-open' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="mu-mobile__links" aria-label="ניווט נייד">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `mu-mobile__link ${isActive ? 'is-active' : ''}`
              }
            >
              <span className="mu-link__emoji" aria-hidden="true">{link.emoji}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}

          {/* כפתור התנתקות למשתמש מחובר (מובייל) */}
          {user && (
            <button onClick={() => { logout(); closeMenu(); }} className="mu-mobile__link mu-logout-btn">
              <span className="mu-link__emoji" aria-hidden="true">🚪</span>
              <span>התנתקות</span>
            </button>
          )}
        </nav>
      </div>

      {/* Backdrop */}
      <button
        className={`mu-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
        tabIndex={-1}
        aria-hidden="true"
      />
    </header>
  );
}

function App() {
  // משיכת המפגשים פעם אחת בעלייה — מקור נתונים יחיד ל-Home ו-Dashboard
  const { fetchMeetups } = useMeetups();
  useEffect(() => {
    fetchMeetups();
  }, [fetchMeetups]);

  return (
    <Router>
      <style>{NAV_CSS}</style>

      <Navbar />

      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* הגנה על לוח הבקרה באמצעות ה-ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

/* ─────────────────────────────────────────────
   Styles — Navbar (ללא שינוי עיצובי)
───────────────────────────────────────────── */
const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap');

  .mu-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
    direction: rtl;
    font-family: 'Rubik', sans-serif;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border-bottom: 1px solid rgba(167, 139, 250, 0.18);
    transition: box-shadow .35s ease, background .35s ease, border-color .35s ease;
  }
  .mu-navbar.is-scrolled {
    background: rgba(255, 255, 255, 0.88);
    border-bottom-color: rgba(167, 139, 250, 0.28);
    box-shadow: 0 8px 30px rgba(79, 70, 229, 0.10);
  }

  .mu-navbar__inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 14px 4%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .mu-brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    border-radius: 12px;
    padding: 4px 6px;
    transition: transform .2s ease;
  }
  .mu-brand:hover { transform: translateY(-1px); }
  .mu-brand:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 3px;
  }
  .mu-brand__icon,
  .mu-brand__text {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .mu-brand__icon { font-size: 26px; line-height: 1; }
  .mu-brand__text {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .mu-links {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mu-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    text-decoration: none;
    color: #4b5563;
    font-size: 15px;
    font-weight: 600;
    padding: 9px 16px;
    border-radius: 100px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: color .2s ease, background .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .mu-link__emoji { font-size: 16px; line-height: 1; }
  .mu-link:hover {
    color: #4f46e5;
    background: rgba(124, 58, 237, 0.07);
    transform: translateY(-2px);
  }
  .mu-link:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }
  .mu-link.is-active {
    color: #fff;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 6px 18px rgba(124, 58, 237, 0.34);
  }
  .mu-link.is-active:hover {
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(124, 58, 237, 0.42);
  }

  .mu-logout-btn {
    border: none;
    font-family: inherit;
  }
  .mu-logout-btn:hover {
    color: #dc2626 !important;
    background: rgba(220, 38, 38, 0.08) !important;
  }

  .mu-burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 44px;
    height: 44px;
    padding: 0 11px;
    border: 1px solid rgba(167, 139, 250, 0.35);
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease;
  }
  .mu-burger:hover { background: rgba(124, 58, 237, 0.08); }
  .mu-burger:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
  .mu-burger span {
    height: 2.5px;
    width: 100%;
    border-radius: 4px;
    background: #4f46e5;
    transition: transform .3s ease, opacity .2s ease;
  }
  .mu-burger.is-open span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
  .mu-burger.is-open span:nth-child(2) { opacity: 0; }
  .mu-burger.is-open span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

  .mu-mobile {
    display: none;
    overflow: hidden;
    direction: rtl;
    border-top: 1px solid rgba(167, 139, 250, 0.18);
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .mu-mobile__links {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 4% 20px;
  }
  .mu-mobile__link {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
    color: #374151;
    font-size: 16px;
    font-weight: 600;
    padding: 14px 18px;
    border-radius: 16px;
    border: 1px solid transparent;
    background: transparent;
    text-align: right;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, box-shadow .2s ease;
  }
  .mu-mobile__link:hover { background: rgba(124, 58, 237, 0.07); color: #4f46e5; }
  .mu-mobile__link:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
  .mu-mobile__link.is-active {
    color: #fff;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 6px 18px rgba(124, 58, 237, 0.30);
  }

  .mu-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: -1;
    border: none;
    background: rgba(30, 27, 75, 0.18);
    opacity: 0;
    pointer-events: none;
    transition: opacity .25s ease;
  }

  .app-container {
    width: 100%;
    min-height: calc(100svh - 69px);
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .mu-links { display: none; }
    .mu-burger { display: flex; }
    .mu-mobile { display: block; max-height: 0; transition: max-height .35s ease; }
    .mu-mobile.is-open { max-height: 360px; }
    .mu-backdrop { display: block; }
    .mu-backdrop.is-open { opacity: 1; pointer-events: auto; }
  }

  @media (prefers-color-scheme: dark) {
    .mu-navbar {
      background: rgba(22, 23, 29, 0.72);
      border-bottom-color: rgba(192, 132, 252, 0.20);
    }
    .mu-navbar.is-scrolled { background: rgba(22, 23, 29, 0.9); }
    .mu-link { color: #cbd5e1; }
    .mu-link:hover { color: #c084fc; background: rgba(192, 132, 252, 0.12); }
    .mu-burger { background: rgba(47, 48, 58, 0.6); border-color: rgba(192, 132, 252, 0.3); }
    .mu-burger span { background: #c084fc; }
    .mu-mobile { background: rgba(22, 23, 29, 0.96); border-top-color: rgba(192, 132, 252, 0.2); }
    .mu-mobile__link { color: #cbd5e1; }
    .mu-logout-btn:hover { color: #ef4444 !important; background: rgba(239, 68, 68, 0.15) !important; }
  }
`;