import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function applyIndexes() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  console.log('⚡ Applying composite performance indexes to Supabase database...');

  try {
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workout_plan_user_active ON "WorkoutPlan" ("userId", "active");
      CREATE INDEX IF NOT EXISTS idx_day_workout_plan_day ON "DayWorkout" ("planId", "dayIndex");
      CREATE INDEX IF NOT EXISTS idx_exercise_day_order ON "Exercise" ("dayWorkoutId", "order");
      CREATE INDEX IF NOT EXISTS idx_exercise_muscle_en ON "Exercise" ("muscle_en");
      CREATE INDEX IF NOT EXISTS idx_exercise_muscle_ar ON "Exercise" ("muscle_ar");
      CREATE INDEX IF NOT EXISTS idx_weight_log_user_date ON "WeightLog" ("userId", "date" DESC);
    `);
    console.log('✅ Composite performance indexes successfully applied to Supabase!');
  } catch (err: any) {
    console.error('Error applying indexes:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

applyIndexes();
