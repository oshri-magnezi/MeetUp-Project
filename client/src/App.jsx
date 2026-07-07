import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useMeetups } from './context/MeetupContext';
import './App.css';

/* ─────────────────────────────────────────────
   App.jsx — שלד האפליקציה: ניווט + הגדרת המסלולים.
   (ה-MeetupProvider עוטף את App בתוך main.jsx)
───────────────────────────────────────────── */

export default function App() {
  // משיכת המפגשים פעם אחת בעלייה — מקור נתונים יחיד לכל הדפים
  const { fetchMeetups } = useMeetups();
  useEffect(() => {
    fetchMeetups();
  }, [fetchMeetups]);

  return (
    <Router>
      <Navbar />

      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* לוח הבקרה ציבורי — פרסום מפגש חסום למי שאינו מחובר (בתוך Dashboard) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* מסלולים מוגנים — משתמש לא מחובר מופנה אוטומטית ל-Login */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
