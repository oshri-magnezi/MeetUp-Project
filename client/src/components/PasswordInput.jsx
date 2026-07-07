import { useState } from "react";
import Icon from "./Icon";

/* ─────────────────────────────────────────────
   PasswordInput.jsx — שדה סיסמה עם כפתור הצגה/הסתרה.
   מרכז את הכפילות שהייתה בין Login ל-Register.
───────────────────────────────────────────── */

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid = false,
  valid = false,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  const stateClass = invalid ? "has-error" : valid ? "is-valid" : "";

  return (
    <div className="input-icon-wrap">
      <input
        id={id}
        className={`field-input ${stateClass}`}
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        disabled={disabled}
        dir="ltr"
      />
      <button
        type="button"
        className="eye-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "הסתר סיסמה" : "הצג סיסמה"}
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={17} />
      </button>
    </div>
  );
}
