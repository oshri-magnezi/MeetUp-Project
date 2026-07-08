import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMeetups } from "../context/MeetupContext";
import { loginRequest } from "../api";
import Field from "../components/Field";
import PasswordInput from "../components/PasswordInput";

/* ─────────────────────────────────────────────
   Login.jsx — התחברות מול ה-Backend (JWT).
───────────────────────────────────────────── */

// בדיקת תקינות טופס ההתחברות
function validateForm({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "אימייל הוא שדה חובה";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "כתובת אימייל לא תקינה";
  if (!password) errors.password = "סיסמה היא שדה חובה";
  else if (password.length < 6) errors.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useMeetups();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // היעד לחזרה אחרי התחברות (אם המשתמש הגיע דרך ProtectedRoute)
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // מצופה להחזיר { user, token } מהשרת
      const { user, token } = await loginRequest({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // עדכון ה-Context + localStorage בפעולה אחת (מקור אמת יחיד).
      login(user, token);

      setSuccess(true);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({ global: err.message || "אימייל או סיסמה שגויים" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-card">

        {/* לוגו */}
        <div className="auth-logo">
          <picture>
            <source srcSet="/logo.png" media="(prefers-color-scheme: dark)" />
            <img src="/logo-light.png" alt="MeetUp" className="auth-logo-img" />
          </picture>
        </div>

        <h1 className="auth-title">התחברות ל-MeetUp</h1>
        <p className="auth-sub">התחבר כדי לגלות מפגשים קרובים אליך</p>

        {success && (
          <div className="toast success" role="status" aria-live="polite">
            התחברת בהצלחה! מעביר אותך...
          </div>
        )}

        {(errors.global || Object.keys(errors).length > 0) && !success && (
          <div className="toast error" role="alert" aria-live="assertive">
            {errors.global ? errors.global : "אנא תקן את השגיאות המסומנות"}
          </div>
        )}

        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <Field label="אימייל" required error={errors.email} htmlFor="login-email">
            <input
              id="login-email"
              className={`field-input ${errors.email ? "has-error" : ""}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={loading}
              dir="ltr"
            />
          </Field>

          <Field label="סיסמה" required error={errors.password} htmlFor="login-password">
            <PasswordInput
              id="login-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="לפחות 6 תווים"
              autoComplete="current-password"
              invalid={!!errors.password}
              disabled={loading}
            />
          </Field>

          <button className="btn btn-primary submit-btn" type="submit" disabled={loading}>
            <span>{loading ? <span className="spinner" aria-label="טוען" /> : "התחבר"}</span>
          </button>
        </form>

        <p className="auth-switch">
          חדש ב-MeetUp?{" "}
          <Link className="auth-link" to="/register">להרשמה מהירה</Link>
        </p>

      </div>
    </div>
  );
}
