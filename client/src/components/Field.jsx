/* ─────────────────────────────────────────────
   Field.jsx — עטיפת שדה טופס: תווית, כוכבית חובה והודעת שגיאה.
───────────────────────────────────────────── */

export default function Field({ label, required, error, htmlFor, children }) {
  return (
    <div className="field-wrap">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="req-star">*</span>}
      </label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
