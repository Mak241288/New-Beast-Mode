import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('backend/prisma/dev.db');
db.all("SELECT id, title, data FROM WorkoutPlan LIMIT 5", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Rows count:", rows.length);
    rows.forEach(r => {
      console.log("ID:", r.id, "Title:", r.title);
      try {
        const parsed = JSON.parse(r.data);
        console.log("Keys in plan data:", Object.keys(parsed));
        if (parsed.days) console.log("days count:", parsed.days.length, "days[0]:", parsed.days[0]);
        if (parsed.dayWorkouts) console.log("dayWorkouts count:", parsed.dayWorkouts.length);
      } catch (e) {
        console.log("JSON parse error:", e);
      }
    });
  }
  db.close();
});
