# MeetUp — אפליקציית מפגשים קהילתיים 

אפליקציית Full Stack לניהול והצטרפות למפגשים קהילתיים: ספורט, פנאי ולימודים.
משתמשים יכולים להירשם, להתחבר, לפרסם מפגשים חדשים, להצטרף למפגשים קיימים ולנהל את המפגשים שיצרו.

## טכנולוגיות

| שכבה | טכנולוגיות |
| --- | --- |
| **Frontend** | React 19, Vite, React Router 7, Context API, Axios |
| **Backend** | Node.js, Express, JWT, bcryptjs |
| **Database** | MongoDB + Mongoose |
| **Styling** | CSS (Design Tokens, RTL, Light/Dark mode) |

## ארכיטקטורת פרויקט

MeetUp/
├── client/
│   └── src/
│       ├── api/          # הגדרות Axios, Interceptors וטיפול בשגיאות תקשורת
│       ├── components/   # רכיבי UI משותפים (Reusable Components)
│       ├── context/      # ניהול State גלובלי
│       └── pages/        # רכיבי מסכים מרכזיים
└── server/
    └── src/
        ├── config/       # הגדרות סביבה ומסדי נתונים
        ├── controllers/  # לוגיקה עסקית
        ├── middlewares/  # אימות, הרשאות וטיפול בשגיאות
        ├── models/       # סכמות נתונים (Mongoose)
        └── routes/       # ניתוב בקשות ה-API

```

## התקנה והרצה מקומית

### 1. התקנת תלויות

יש לוודא שמותקן Node.js (גרסה 20+) ו-MongoDB.

```bash
git clone https://github.com/oshri-magnezi/MeetUp-Project.git
cd MeetUp-Project
npm install --prefix server
npm install --prefix client

```

### 2. משתני סביבה

יש ליצור קובץ `server/.env` עם הערכים הבאים:

| משתנה | תיאור |
| --- | --- |
| `PORT` | פורט השרת (ברירת מחדל: 5000) |
| `MONGO_URI` | מחרוזת החיבור ל-MongoDB |
| `JWT_SECRET` | מפתח לחתימת Access Token |
| `JWT_EXPIRES` | תוקף ה-Access Token (למשל: `30m`) |
| `JWT_REFRESH_SECRET` | מפתח ל-Refresh Token |
| `JWT_REFRESH_EXPIRES` | תוקף ה-Refresh Token (למשל: `7d`) |
| `CLIENT_URL` | כתובת ה-Frontend לטובת CORS |

### 3. הפעלה

```bash
# הרצת השרת והלקוח במקביל (משורש הפרויקט)
npm run dev --prefix server & npm run dev --prefix client

```

ניתן לאכלס את מסד הנתונים בנתוני דמו על ידי הרצת `npm run seed --prefix server`.

## API Endpoints

נתיב בסיס: `/api`

### אותנטיקציה (`/auth`)

| Method | Endpoint | תיאור | הרשאה |
| --- | --- | --- | --- |
| `POST` | `/register` | רישום משתמש חדש | ציבורי |
| `POST` | `/login` | התחברות וקבלת Tokens | ציבורי |
| `POST` | `/refresh` | חידוש Access Token (דרך Cookie) | Cookie |
| `POST` | `/logout` | התנתקות ופסילת טוקנים | JWT |

### מפגשים (`/meetups`)

| Method | Endpoint | תיאור | הרשאה |
| --- | --- | --- | --- |
| `GET` | `/` | שליפת כל המפגשים | ציבורי |
| `POST` | `/` | יצירת מפגש חדש | JWT |
| `PUT` | `/:id` | עדכון מפגש קיים | JWT (בעלים/Admin) |
| `DELETE` | `/:id` | מחיקת מפגש | JWT (בעלים/Admin) |
| `POST` | `/:id/join` | הצטרפות למפגש | JWT |

## אבטחה וביצועים

* **הצפנת נתונים:** שימוש ב-bcrypt (10 rounds) לסיסמאות, לעולם לא נחשפות ללקוח.
* **ניהול תצורה (JWT):** מנגנון דו-שכבתי. Access Token קצר-מועד ב-Headers, ו-Refresh Token ארוך-מועד ב-HTTP-Only Cookie למניעת התקפות XSS.
* **בקרת גישה (RBAC):** הפרדת הרשאות מבוססת תפקידים (`User` / `Admin`) דרך Middlewares ייעודיים.
* **הגנה מובנית:** יישום Rate Limiting להגנה מפני Brute Force, והגדרות CORS קפדניות לסביבת הלקוח בלבד.

---

**פותח על ידי Oshri Magnezi**