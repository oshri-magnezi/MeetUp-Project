# MeetUp — אפליקציית מפגשים קהילתיים 

אפליקציית Full Stack לניהול והצטרפות למפגשים קהילתיים: ספורט, פנאי ולימודים.
משתמשים יכולים להירשם, להתחבר, לפרסם מפגשים חדשים, להצטרף למפגשים קיימים ולנהל את המפגשים שיצרו.

## טכנולוגיות

| שכבה | טכנולוגיות |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Context API, Axios |
| **Backend** | Node.js, Express, JWT, bcryptjs |
| **Database** | MongoDB + Mongoose |
| **עיצוב** | CSS מותאם אישית (Design Tokens, RTL, Light/Dark mode) |

## מבנה הפרויקט

```
MeetUp-FullStackProject/
├── client/                 # אפליקציית React (Vite)
│   └── src/
│       ├── api/            # שכבת Axios מרכזית (interceptors, טיפול בשגיאות)
│       ├── components/     # רכיבים משותפים (Icon, ProtectedRoute)
│       ├── context/        # MeetupContext — ניהול State גלובלי
│       └── pages/          # Home, Dashboard, Login, Register
└── server/                 # שרת Express (מבנה MVC)
    └── src/
        ├── config/         # חיבור ל-MongoDB
        ├── controllers/    # לוגיקת auth ומפגשים
        ├── middlewares/    # אימות JWT, טיפול מרכזי בשגיאות
        ├── models/         # סכמות Mongoose (User, Meetup)
        ├── routes/         # הגדרת נקודות הקצה
        └── utils/          # חתימת JWT
```

## התקנה והרצה מקומית

### דרישות מקדימות
- Node.js 20+
- MongoDB (מקומי או חשבון [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. שכפול והתקנה

```bash
git clone https://github.com/oshri-magnezi/MeetUp-Project.git
cd MeetUp-Project

# התקנת תלויות השרת
cd server && npm install

# התקנת תלויות הלקוח
cd ../client && npm install
```

### 2. משתני סביבה

צור קובץ `server/.env` על בסיס `server/.env.example`:

| משתנה | תיאור | דוגמה |
|---|---|---|
| `PORT` | הפורט של השרת | `5000` |
| `MONGO_URI` | מחרוזת חיבור ל-MongoDB | `mongodb://localhost:27017/meetup` |
| `JWT_SECRET` | מפתח סודי לחתימת Access Token | מחרוזת אקראית ארוכה |
| `JWT_EXPIRES` | תוקף ה-Access Token | `30m` |
| `JWT_REFRESH_SECRET` | מפתח סודי ל-Refresh Token | מחרוזת אקראית ארוכה |
| `JWT_REFRESH_EXPIRES` | תוקף ה-Refresh Token | `7d` |
| `CLIENT_URL` | כתובות Frontend מורשות ב-CORS (מופרד בפסיקים) | `http://localhost:5173` |

בצד הלקוח (אופציונלי — יש ברירת מחדל): `client/.env` על בסיס `client/.env.example` עם `VITE_API_URL`.

### 3. הרצה

```bash
# טרמינל 1 — השרת (פורט 5000)
cd server && npm run dev

# טרמינל 2 — הלקוח (פורט 5173)
cd client && npm run dev
```

פתח בדפדפן: http://localhost:5173

### נתוני דוגמה (אופציונלי)

```bash
cd server && npm run seed
```

יוצר משתמשי דמו ומפגשים לדוגמה:

| חשבון | אימייל | סיסמה |
|---|---|---|
| מנהל (admin) | `admin@meetup.com` | `admin123` |
| משתמש רגיל | `demo@meetup.com` | `demo123` |

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | תיאור | הרשאה |
|---|---|---|---|
| `POST` | `/auth/register` | הרשמת משתמש חדש (bcrypt) | ציבורי |
| `POST` | `/auth/login` | התחברות — מחזיר `{ user, token }` | ציבורי |
| `POST` | `/auth/refresh` | חידוש Access Token מה-Refresh cookie | cookie |
| `POST` | `/auth/logout` | ניתוק — blacklist לטוקן + ניקוי cookie | JWT |
| `GET` | `/auth/users` | רשימת כל המשתמשים | admin |
| `DELETE` | `/auth/users/:id` | מחיקת משתמש + המפגשים שלו | admin |

### Meetups

| Method | Endpoint | תיאור | הרשאה |
|---|---|---|---|
| `GET` | `/meetups` | כל המפגשים (ממוינים לפי תאריך) | ציבורי |
| `POST` | `/meetups` | יצירת מפגש חדש | JWT |
| `PUT` | `/meetups/:id` | עדכון מפגש | JWT + בעלים/admin |
| `DELETE` | `/meetups/:id` | מחיקת מפגש | JWT + בעלים/admin |
| `POST` | `/meetups/:id/join` | הצטרפות למפגש | JWT |
| `DELETE` | `/meetups/:id/join` | ביטול רישום למפגש | JWT |

**קודי סטטוס:** `200` הצלחה · `201` נוצר · `400` נתונים שגויים · `401` לא מחובר / טוקן פג · `403` אין הרשאה · `404` לא נמצא · `500` שגיאת שרת

## אבטחה

- סיסמאות מוצפנות עם **bcrypt** (salt rounds = 10), לעולם לא מוחזרות ללקוח (`select: false`)
- **JWT** דו-שכבתי: Access Token קצר (30 דק') ב-header, ו-Refresh Token (7 ימים) ב-**httpOnly cookie** לחידוש אוטומטי
- **Roles** (`user` / `admin`) — הרשאות לפי תפקיד עם middleware `restrictTo`
- **Rate Limiting** על נתיבי ההזדהות (10 ניסיונות / 15 דק') + **Logging** (Morgan + Winston)
- **CORS** מוגבל לכתובות ה-Frontend המורשות; Logout מבטל טוקן דרך blacklist (TTL)

## צוות

- Oshri Magnezi

---
*פרויקט גמר — קורס פיתוח Full Stack*
