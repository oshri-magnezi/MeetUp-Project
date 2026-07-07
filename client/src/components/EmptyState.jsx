import Icon from "./Icon";

/* ─────────────────────────────────────────────
   EmptyState.jsx — מצב ריק / טעינה / שגיאה אחיד.
   compact=true — גרסה קטנה לשימוש בתוך פאנלים (לוח בקרה, ניהול).
───────────────────────────────────────────── */

export default function EmptyState({
  icon,
  title,
  sub,
  ctaText,
  onCta,
  spinning = false,
  compact = false,
}) {
  return (
    <div className={compact ? "empty-state compact" : "empty-state"} dir="rtl">
      <div className="empty-icon-wrap">
        <Icon name={icon} size={compact ? 20 : 24} className={spinning ? "icon-spin" : undefined} />
      </div>
      <h2 className="empty-title">{title}</h2>
      {sub && <p className="empty-sub">{sub}</p>}
      {ctaText && (
        <button className="btn btn-primary" onClick={onCta}>
          {ctaText}
        </button>
      )}
    </div>
  );
}
