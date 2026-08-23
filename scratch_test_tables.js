const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

async function testTables() {
  const tables = ['User', 'WorkoutPlan', 'Exercise', 'user_profiles', 'workout_plans'];
  for (const t of tables) {
    const res = await fetch(`https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/${t}?select=*&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log(`Table ${t} status:`, res.status);
  }
}

testTables();
