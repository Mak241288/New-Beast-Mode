import sqlite3

con = sqlite3.connect('backend/prisma/dev.db')
cur = con.cursor()
cur.execute("PRAGMA table_info(WorkoutPlan)")
print("WorkoutPlan columns:", cur.fetchall())
cur.execute("SELECT * FROM WorkoutPlan LIMIT 2")
print("WorkoutPlan sample row:", cur.fetchall())
con.close()
