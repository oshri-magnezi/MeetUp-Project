# MeetUp — אפליקציית מפגשים קהילתיים

אפליקציית Full Stack למציאה, פרסום והצטרפות למפגשים קהילתיים (ספורט, פנאי, לימודים).
משתמשים נרשמים, מפרסמים מפגשים, מצטרפים למפגשים של אחרים ומנהלים את המפגשים שיצרו.
למנהל (admin) יש גישה לניהול כל המשתמשים והמפגשים.

## טכנולוגיות

| שכבה | טכנולוגיות |
|---|---|
| Frontend | React 19, Vite, React Router, Context API, Axios |
| Backend | Node.js, Express, JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| עיצוב | CSS (RTL, מצב בהיר/כהה) |

## מבנה הפרויקט

```
MeetUp-FullStackProject/
├── client/            # אפליקציית React (Vite)
│   └── src/
│       ├── api/         # שכבת Axios מרכזית
│       ├── components/  # רכיבים משותפים
│       ├── context/     # ניהול State גלובלי + Auth
│       ├── pages/       # Home, Dashboard, Login, Register, Profile, Admin
│       └── utils/       # פונקציות עזר
└── server/            # שרת Express (מבנה MVC)
    └── src/
        ├── config/       # חיבור ל-MongoDB, לוגר
        ├── controllers/  # לוגיקת auth ומפגשים
        ├── middlewares/  # אימות, הרשאות, ולידציה, שגיאות
        ├── models/       # סכמות Mongoose
        ├── routes/       # נקודות הקצה
        ├── validators/   # חוקי ולידציה
        └── utils/        # חתימת JWT
```

## התקנה והרצה

דרישות: Node.js 20+, ו-MongoDB (מקומי או [Atlas](https://www.mongodb.com/atlas)).

```bash
git clone https://github.com/oshri-magnezi/MeetUp-Project.git
cd MeetUp-Project

cd server && npm install
cd ../client && npm install
```

צור קובץ `server/.env` על בסיס `server/.env.example`:

| משתנה | תיאור |
|---|---|
| `PORT` | הפורט של השרת (5000) |
| `MONGO_URI` | מחרוזת חיבור ל-MongoDB |
| `JWT_SECRET` | מפתח לחתימת Access Token |
| `JWT_EXPIRES` | תוקף ה-Access Token (למשל `30m`) |
| `JWT_REFRESH_SECRET` | מפתח ל-Refresh Token |
| `JWT_REFRESH_EXPIRES` | תוקף ה-Refresh Token (למשל `7d`) |
| `CLIENT_URL` | כתובות Frontend מורשות ב-CORS |

הרצה (בשני טרמינלים):

```bash
cd server && npm run dev    # שרת, פורט 5000
cd client && npm run dev    # לקוח, פורט 5173
```

הדפדפן: http://localhost:5173

נתוני דוגמה (אופציונלי): `cd server && npm run seed` יוצר משתמש מנהל (`admin@meetup.com` / `admin123`) ומשתמש רגיל (`demo@meetup.com` / `demo123`) עם כמה מפגשים.

## נקודות קצה (API)

Base URL: `http://localhost:5000/api`

| Method | Endpoint | תיאור | הרשאה |
|---|---|---|---|
| POST | `/auth/register` | הרשמה | ציבורי |
| POST | `/auth/login` | התחברות | ציבורי |
| POST | `/auth/refresh` | חידוש Access Token | cookie |
| POST | `/auth/logout` | התנתקות | JWT |
| GET | `/auth/users` | רשימת משתמשים | admin |
| DELETE | `/auth/users/:id` | מחיקת משתמש והמפגשים שלו | admin |
| GET | `/meetups` | כל המפגשים | ציבורי |
| POST | `/meetups` | יצירת מפגש | JWT |
| PUT | `/meetups/:id` | עדכון מפגש | בעלים / admin |
| DELETE | `/meetups/:id` | מחיקת מפגש | בעלים / admin |
| POST | `/meetups/:id/join` | הצטרפות למפגש | JWT |
| DELETE | `/meetups/:id/join` | ביטול רישום | JWT |

## אבטחה

- סיסמאות מאוחסנות מוצפנות (bcrypt) ולא מוחזרות ללקוח.
- הזדהות מבוססת JWT: Access Token קצר-טווח, ו-Refresh Token ב-cookie מסוג httpOnly לחידוש אוטומטי.
- הרשאות לפי תפקיד (user / admin).
- הגבלת קצב על נתיבי ההתחברות, ולוגים בצד השרת.
- CORS מוגבל לכתובות ה-Frontend, והתנתקות מבטלת את הטוקן בצד השרת.

## צוות

Oshri Magnezi — פרויקט גמר, קורס פיתוח Full Stack.
