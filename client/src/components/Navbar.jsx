import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";
import Icon from "./Icon";

/* ─────────────────────────────────────────────
   Navbar.jsx — סרגל הניווט הראשי.
   הקישורים נבנים דינמית לפי מצב ההתחברות והתפקיד (admin).
───────────────────────────────────────────── */

// בניית רשימת הקישורים לפי המשתמש המחובר
function buildNavLinks(user) {
  const links = [
    { to: "/", label: "דף הבית", icon: "home", end: true },
    { to: "/dashboard", label: "לוח בקרה", icon: "dashboard" },
  ];

  if (user) {
    links.push({ to: "/profile", label: "הפרופיל שלי", icon: "user" });
    if (user.role === "admin") {
      links.push({ to: "/admin", label: "ניהול משתמשים", icon: "shield" });
    }
  } else {
    links.push(
      { to: "/login", label: "התחברות", icon: "login" },
      { to: "/register", label: "הרשמה", icon: "register" }
    );
  }
  return links;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useMeetups();

  // הצללת קו תחתון כשגוללים
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // נעילת גלילת הרקע כשהתפריט הנייד פתוח
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const navLinks = buildNavLinks(user);

  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <header className={`navbar ${scrolled ? "is-scrolled" : ""}`} dir="rtl">
      <div className="navbar-inner">
        {/* לוגו — נשאר כמות שהוא (יוחלף ע"י המעצב) */}
        <NavLink to="/" className="brand" onClick={closeMenu} aria-label="MeetUp — דף הבית">
          <span className="brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="9" r="5" />
              <circle cx="16.5" cy="15.5" r="3.5" opacity="0.55" />
            </svg>
          </span>
          <span className="brand-text">Meet<b>Up</b></span>
        </NavLink>

        {/* קישורי דסקטופ */}
        <nav className="nav-links" aria-label="ניווט ראשי">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            >
              <span className="nav-link-icon"><Icon name={link.icon} /></span>
              <span>{link.label}</span>
            </NavLink>
          ))}

          {user && (
            <button onClick={handleLogout} className="nav-link logout-btn">
              <span className="nav-link-icon"><Icon name="logout" /></span>
              <span>התנתקות</span>
            </button>
          )}
        </nav>

        {/* כפתור תפריט נייד */}
        <button
          type="button"
          className={`burger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* פאנל נייד */}
      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} hidden={!menuOpen}>
        <nav className="mobile-links" aria-label="ניווט נייד">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) => `mobile-link ${isActive ? "is-active" : ""}`}
            >
              <span className="nav-link-icon"><Icon name={link.icon} /></span>
              <span>{link.label}</span>
            </NavLink>
          ))}

          {user && (
            <button onClick={handleLogout} className="mobile-link logout-btn">
              <span className="nav-link-icon"><Icon name="logout" /></span>
              <span>התנתקות</span>
            </button>
          )}
        </nav>
      </div>

      {/* רקע כהה מאחורי התפריט הנייד */}
      <button
        className={`backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        tabIndex={-1}
        aria-hidden="true"
      />
    </header>
  );
}
