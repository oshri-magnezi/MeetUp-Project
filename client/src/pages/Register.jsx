import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
    Register.jsx  –  MeetUp App  (Premium glass · revamped)
───────────────────────────────────────────── */

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors]     = useState({});
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }

  function validate() {
    const errs = {};
    if (!formData.fullName.trim())                               errs.fullName = "שם מלא הוא שדה חובה";
    if (!formData.email.trim())                                  errs.email    = "אימייל הוא שדה חובה";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email    = "כתובת אימייל לא תקינה";
    if (!formData.password)                                      errs.password = "סיסמה היא שדה חובה";
    else if (formData.password.length < 6)                       errs.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
    if (!formData.confirm)                                       errs.confirm  = "אנא אשר את הסיסמה";
    else if (formData.confirm !== formData.password)             errs.confirm  = "הסיסמאות אינן תואמות";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    const newUser = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password
    };
    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    console.log("User registered and saved to LocalStorage:", newUser);
    setLoading(false);
    setSuccess(true);

    setTimeout(() => navigate("/login"), 1800);
  }

  function strength(p) {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }

  const strengthLevel  = strength(formData.password);
  const strengthLabels = ["", "חלשה", "בינונית", "טובה", "חזקה"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-bg" dir="rtl">
        <div className="auth-card">

          {/* Logo */}
          <div className="auth-logo">
            <span className="logo-icon" aria-hidden="true">◈</span>
            <span className="logo-text">MeetUp</span>
          </div>

          <h1 className="auth-title">יצירת חשבון 🚀</h1>
          <p className="auth-sub">הצטרף עכשיו והתחל לגלות מפגשים מדהימים</p>

          {success && (
            <div className="auth-toast success" role="status" aria-live="polite">
              🎉 נרשמת בהצלחה! מעביר אותך...
            </div>
          )}
          {Object.keys(errors).length > 0 && !success && (
            <div className="auth-toast error" role="alert" aria-live="assertive">
              ⚠️ אנא תקן את השגיאות המסומנות
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="field-wrap">
              <label className="field-label" htmlFor="reg-name">שם מלא <span className="req">*</span></label>
              <input
                id="reg-name"
                className={`field-input ${errors.fullName ? "has-error" : ""}`}
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="ישראל ישראלי"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="field-wrap">
              <label className="field-label" htmlFor="reg-email">אימייל <span className="req">*</span></label>
              <input
                id="reg-email"
                className={`field-input ${errors.email ? "has-error" : ""}`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                dir="ltr"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="field-wrap">
              <label className="field-label" htmlFor="reg-password">סיסמה <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <input
                  id="reg-password"
                  className={`field-input ${errors.password ? "has-error" : ""}`}
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="לפחות 6 תווים"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  dir="ltr"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "הסתר סיסמה" : "הצג סיסמה"}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>

              {/* Strength bar */}
              {formData.password && (
                <div className="strength-wrap">
                  <div className="strength-bar">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="strength-seg"
                        style={{ background: i <= strengthLevel ? strengthColors[strengthLevel] : "#e5e7eb" }} />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strengthColors[strengthLevel] }}>
                    {strengthLabels[strengthLevel]}
                  </span>
                </div>
              )}
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Confirm */}
            <div className="field-wrap">
              <label className="field-label" htmlFor="reg-confirm">אימות סיסמה <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <input
                  id="reg-confirm"
                  className={`field-input ${errors.confirm ? "has-error" : (formData.confirm && formData.confirm === formData.password ? "is-valid" : "")}`}
                  type={showConf ? "text" : "password"}
                  name="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="הזן שוב את הסיסמה"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirm}
                  dir="ltr"
                />
                <button type="button" className="eye-btn" onClick={() => setShowConf(v => !v)}
                  aria-label={showConf ? "הסתר סיסמה" : "הצג סיסמה"}>
                  {showConf ? "🙈" : "👁"}
                </button>
              </div>
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              {!errors.confirm && formData.confirm && formData.confirm === formData.password && (
                <span className="field-success">✓ הסיסמאות תואמות</span>
              )}
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              <span>{loading ? <span className="spinner" aria-label="טוען" /> : "צור חשבון →"}</span>
            </button>

          </form>

          <p className="auth-switch">
            כבר יש לך חשבון?{" "}
            <Link className="auth-link" to="/login">להתחברות</Link>
          </p>

        </div>

        <div className="blob blob-a" />
        <div className="blob blob-b" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
    UI Styles
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Rubik', sans-serif; }

  .auth-bg {
    min-height: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: #f4f3ff;
    padding: 7vh 24px 60px;
    position: relative;
    overflow: hidden;
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
    width: 550px; height: 550px;
    background: radial-gradient(circle, #a78bfa, #6d28d9);
    top: -120px; right: -40px;
  }
  .blob-b {
    width: 420px; height: 420px;
    background: radial-gradient(circle, #818cf8, #4f46e5);
    bottom: -80px; left: -40px;
  }

  .auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 580px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 38px;
    padding: 52px 52px 46px;
    border: 1px solid rgba(167, 139, 250, 0.3);
    box-shadow:
      0 4px 6px rgba(79, 70, 229, 0.02),
      0 28px 76px rgba(79, 70, 229, 0.15),
      0 1px 0 rgba(255, 255, 255, 0.95) inset;
    direction: rtl;
  }

  .auth-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 32px;
  }
  .logo-icon {
    font-size: 30px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }
  .logo-text {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .auth-title {
    font-size: 30px;
    font-weight: 800;
    color: #1e1b4b;
    text-align: center;
    margin-bottom: 10px;
  }
  .auth-sub {
    font-size: 16px;
    color: #6b7280;
    text-align: center;
    margin-bottom: 36px;
    line-height: 1.6;
  }

  .auth-toast {
    border-radius: 14px;
    padding: 14px 20px;
    font-size: 14.5px;
    font-weight: 500;
    margin-bottom: 24px;
    text-align: center;
    animation: fadeIn 0.3s ease;
  }
  .auth-toast.success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  .auth-toast.error   { background: #fff1f2; color: #be123c; border: 1px solid #fda4af; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-form { display: flex; flex-direction: column; gap: 22px; }

  .field-wrap { display: flex; flex-direction: column; gap: 8px; }

  .field-label {
    font-size: 14.5px;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .req { color: #e0457b; font-size: 14px; }

  .field-input {
    font-family: 'Rubik', sans-serif;
    font-size: 16px;
    color: #1e1b4b;
    background: rgba(250, 250, 250, 0.85);
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px 20px;
    width: 100%;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    outline: none;
  }
  .field-input:focus {
    border-color: #7c3aed;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(124,58,237,0.15);
  }
  .field-input.has-error {
    border-color: #fda4af;
    background: #fff1f2;
  }
  .field-input.is-valid {
    border-color: #86efac;
    background: #f0fdf4;
  }
  .field-input::placeholder { color: #d1d5db; }

  .input-icon-wrap { position: relative; }
  .input-icon-wrap .field-input { padding-left: 52px; }
  .eye-btn {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 19px;
    line-height: 1;
    padding: 4px;
    border-radius: 6px;
    transition: transform 0.15s;
    user-select: none;
  }
  .eye-btn:hover { transform: translateY(-50%) scale(1.15); }

  .field-error { font-size: 13px; color: #be123c; font-weight: 500; }
  .field-success { font-size: 13px; color: #16a34a; font-weight: 500; }

  .strength-wrap { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
  .strength-bar { display: flex; gap: 6px; flex: 1; }
  .strength-seg { flex: 1; height: 5.5px; border-radius: 100px; transition: background 0.3s ease; }
  .strength-label { font-size: 12.5px; font-weight: 600; min-width: 46px; text-align: left; }

  .submit-btn {
    width: 100%;
    padding: 17px;
    border-radius: 16px;
    border: none;
    font-family: 'Rubik', sans-serif;
    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #fff;
    box-shadow: 0 7px 26px rgba(124,58,237,0.38);
    transition: all 0.2s ease;
    margin-top: 10px;
    position: relative;
    overflow: hidden;
  }
  .submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .submit-btn:hover:not(:disabled)::before { opacity: 1; }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(124,58,237,0.48);
  }
  .submit-btn:active:not(:disabled) { transform: scale(0.985); }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .submit-btn span { position: relative; z-index: 1; }

  .spinner {
    display: inline-block;
    width: 22px; height: 22px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-switch { text-align: center; margin-top: 28px; font-size: 15px; color: #9ca3af; }
  .auth-link { color: #7c3aed; font-weight: 600; text-decoration: none; border-bottom: 1.5px solid transparent; transition: border-color 0.15s, color 0.15s; }
  .auth-link:hover { color: #4f46e5; border-bottom-color: #4f46e5; }

  /* Accessibility: visible focus + reduced motion */
  .field-input:focus-visible,
  .submit-btn:focus-visible,
  .eye-btn:focus-visible,
  .auth-link:focus-visible {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
  }

  @media (max-width: 640px) {
    .auth-bg { padding: 4vh 16px 40px; }
    .auth-card { padding: 38px 24px 32px; border-radius: 26px; }
  }
`;