/* ─────────────────────────────────────────────
   meetupUtils.js — פונקציות עזר משותפות למפגשים
   מרכז את מה שהיה כפול ב-Home / Dashboard / Admin / Profile.
───────────────────────────────────────────── */

// הקטגוריות של המערכת — מקור אמת יחיד לתוויות ולערכים
export const CATEGORIES = [
  { value: "sport", label: "ספורט" },
  { value: "leisure", label: "פנאי" },
  { value: "study", label: "לימודים" },
  { value: "other", label: "אחר" },
];

// תווית עברית לקטגוריה (למשל "sport" → "ספורט")
export function categoryLabel(category) {
  return CATEGORIES.find((c) => c.value === category)?.label || "אחר";
}

// מחלקת CSS לצבע הקטגוריה (מוגדרת ב-App.css, כולל מצב כהה)
export function categoryClass(category) {
  return ["sport", "leisure", "study"].includes(category)
    ? `cat-${category}`
    : "cat-default";
}

// מזהה אחיד למפגש (תומך גם ב-MongoDB _id וגם ב-id מקומי)
export function getMeetupId(meetup) {
  return meetup._id || meetup.id;
}

// מזהה הבעלים של מפגש — תומך במספר שמות שדה אפשריים מה-Backend
export function getOwnerId(meetup) {
  const owner = meetup.createdBy ?? meetup.organizer ?? meetup.owner ?? meetup.user;
  if (owner && typeof owner === "object") return owner._id || owner.id;
  return owner;
}

// "שבת, 1 באוגוסט"
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

// "18:00"
export function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

// "שבת, 1 באוגוסט · 18:00"
export function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${formatDate(dateStr)} · ${formatTime(dateStr)}`;
}
