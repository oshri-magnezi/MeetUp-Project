import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Meetup from "./models/Meetup.js";

/* ─────────────────────────────────────────────
   seed.js — יצירת נתוני דוגמה לפיתוח והדגמה
   הרצה:  npm run seed

   בטוח: הסקריפט נוגע רק במשתמש הדמו ובמפגשים שהוא יצר.
   מפגשים ומשתמשים אחרים במסד לא נמחקים.
───────────────────────────────────────────── */

const DEMO_USER = {
  name: "משתמש דמו",
  email: "demo@meetup.com",
  password: "demo123",
};

const ADMIN_USER = {
  name: "מנהל המערכת",
  email: "admin@meetup.com",
  password: "admin123",
  role: "admin",
};

const DEMO_MEETUPS = [
  {
    title: "ריצת בוקר בפארק הירקון",
    description: "ריצה קלה משותפת של 5 ק\"מ לכל הרמות, כולל מתיחות בסוף.",
    date: "2026-09-05T07:00",
    location: "פארק הירקון, תל אביב",
    category: "sport",
    maxAttendees: 25,
  },
  {
    title: "טורניר כדורסל 3 על 3",
    description: "טורניר ידידותי, נרשמים כיחידים ומחלקים לקבוצות במקום.",
    date: "2026-09-15T17:00",
    location: "מגרש עירוני, רמת גן",
    category: "sport",
    maxAttendees: 24,
  },
  {
    title: "ערב משחקי קופסה",
    description: "קטאן, קרקסון ועוד. מגוון משחקים לכל הטעמים בסביבה נעימה.",
    date: "2026-09-18T20:00",
    location: "בית קפה 'הפינה', ירושלים",
    category: "leisure",
    maxAttendees: 20,
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ חסר MONGO_URI ב-.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { family: 4 });
    console.log("✅ התחברנו ל-MongoDB");

    // משתמש דמו — יוצרים רק אם לא קיים (save מפעיל הצפנת סיסמה)
    let user = await User.findOne({ email: DEMO_USER.email });
    if (!user) {
      user = await User.create(DEMO_USER);
      console.log(`👤 נוצר משתמש דמו: ${user.email} (סיסמה: ${DEMO_USER.password})`);
    } else {
      console.log(`👤 משתמש דמו כבר קיים: ${user.email}`);
    }

    // משתמש אדמין להדגמת הרשאות לפי תפקיד
    let admin = await User.findOne({ email: ADMIN_USER.email });
    if (!admin) {
      admin = await User.create(ADMIN_USER);
      console.log(`🛡️  נוצר מנהל: ${admin.email} (סיסמה: ${ADMIN_USER.password})`);
    } else {
      console.log(`🛡️  מנהל כבר קיים: ${admin.email}`);
    }

    // מרעננים רק את המפגשים של משתמש הדמו — נתונים אחרים לא נוגעים בהם
    const removed = await Meetup.deleteMany({ createdBy: user._id });
    const created = await Meetup.insertMany(
      DEMO_MEETUPS.map((m) => ({ ...m, createdBy: user._id }))
    );

    console.log(`🗑️  נמחקו ${removed.deletedCount} מפגשי דמו ישנים`);
    console.log(`🌱 נוצרו ${created.length} מפגשי דמו חדשים`);
    console.log("✨ הזריעה הושלמה בהצלחה");
  } catch (err) {
    console.error("❌ הזריעה נכשלה:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
