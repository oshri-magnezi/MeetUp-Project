import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../api";
import Field from "../components/Field";
import PasswordInput from "../components/PasswordInput";

/* ─────────────────────────────────────────────
   Register.jsx — הרשמה מול ה-Backend.
   הסיסמה מוצפנת בצד השרת (bcrypt).
───────────────────────────────────────────── */

// בדיקת תקינות טופס ההרשמה
function validateForm({ fullName, email, password, confirm }) {
  const errors = {};
  if (!fullName.trim()) errors.fullName = "שם מלא הוא שדה חובה";
  if (!email.trim()) errors.email = "אימייל הוא שדה חובה";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "כתובת אימייל לא תקינה";
  if (!password) errors.password = "סיסמה היא שדה חובה";
  else if (password.length < 6) errors.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
  if (!confirm) errors.confirm = "אנא אשר את הסיסמה";
  else if (confirm !== password) errors.confirm = "הסיסמאות אינן תואמות";
  return errors;
}

// דירוג חוזק סיסמה (0–4) לפי אורך ומגוון תווים
function passwordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ["", "חלשה", "בינונית", "טובה", "חזקה"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
      // שולחים name (ולא fullName) כדי שהמודל יישמר אחיד וה-UI יציג user.name
      await registerRequest({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrors({ global: err.message });
    } finally {
      setLoading(false);
    }
  }

  const strength = passwordStrength(form.password);
  const passwordsMatch = form.confirm && form.confirm === form.password;

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

        <h1 className="auth-title">יצירת חשבון</h1>
        <p className="auth-sub">הצטרף עכשיו והתחל לגלות מפגשים מדהימים</p>

        {success && (
          <div className="toast success" role="status" aria-live="polite">
            נרשמת בהצלחה! מעביר אותך...
          </div>
        )}
        {(errors.global || Object.keys(errors).length > 0) && !success && (
          <div className="toast error" role="alert" aria-live="assertive">
            {errors.global ? errors.global : "אנא תקן את השגיאות המסומנות"}
          </div>
        )}

        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <Field label="שם מלא" required error={errors.fullName} htmlFor="reg-name">
            <input
              id="reg-name"
              className={`field-input ${errors.fullName ? "has-error" : ""}`}
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="ישראל ישראלי"
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              disabled={loading}
            />
          </Field>

          <Field label="אימייל" required error={errors.email} htmlFor="reg-email">
            <input
              id="reg-email"
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

          <div className="field-wrap">
            <label className="field-label" htmlFor="reg-password">
              סיסמה <span className="req-star">*</span>
            </label>
            <PasswordInput
              id="reg-password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="לפחות 6 תווים"
              autoComplete="new-password"
              invalid={!!errors.password}
              disabled={loading}
            />

            {/* מד חוזק סיסמה */}
            {form.password && (
              <div className="strength-wrap">
                <div className="strength-bar">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-seg ${level <= strength ? `level-${strength}` : ""}`}
                    />
                  ))}
                </div>
                <span className={`strength-label level-${strength}`}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="field-wrap">
            <label className="field-label" htmlFor="reg-confirm">
              אימות סיסמה <span className="req-star">*</span>
            </label>
            <PasswordInput
              id="reg-confirm"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="הזן שוב את הסיסמה"
              autoComplete="new-password"
              invalid={!!errors.confirm}
              valid={!errors.confirm && passwordsMatch}
              disabled={loading}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            {!errors.confirm && passwordsMatch && (
              <span className="field-success">✓ הסיסמאות תואמות</span>
            )}
          </div>

          <button className="btn btn-primary submit-btn" type="submit" disabled={loading}>
            <span>{loading ? <span className="spinner" aria-label="טוען" /> : "צור חשבון"}</span>
          </button>
        </form>

        <p className="auth-switch">
          כבר יש לך חשבון?{" "}
          <Link className="auth-link" to="/login">להתחברות</Link>
        </p>

      </div>
    </div>
  );
}
