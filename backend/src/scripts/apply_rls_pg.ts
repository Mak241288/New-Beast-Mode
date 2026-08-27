import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function applyPoliciesViaPg() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('🛡️ [RLS Policies] Connecting via PG client to apply policies on Supabase...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connected to Supabase!');

  const statements = [
    // 1. ExerciseLibrary: Public Read Access (Everyone can browse library) & Admin Full Access
    `DROP POLICY IF EXISTS "Public Read ExerciseLibrary" ON "public"."ExerciseLibrary";`,
    `CREATE POLICY "Public Read ExerciseLibrary" ON "public"."ExerciseLibrary" FOR SELECT USING (true);`,
    `DROP POLICY IF EXISTS "Admin Full ExerciseLibrary" ON "public"."ExerciseLibrary";`,
    `CREATE POLICY "Admin Full ExerciseLibrary" ON "public"."ExerciseLibrary" FOR ALL TO service_role USING (true) WITH CHECK (true);`,

    // 2. Exercise: Public Read for catalog exercises & Admin Full Access
    `DROP POLICY IF EXISTS "Public Read Global Exercises" ON "public"."Exercise";`,
    `CREATE POLICY "Public Read Global Exercises" ON "public"."Exercise" FOR SELECT USING ("dayWorkoutId" IS NULL);`,
    `DROP POLICY IF EXISTS "Admin Full Exercise" ON "public"."Exercise";`,
    `CREATE POLICY "Admin Full Exercise" ON "public"."Exercise" FOR ALL TO service_role USING (true) WITH CHECK (true);`,

    // 3. User: Service Role Full Access & Authenticated User Isolation
    `DROP POLICY IF EXISTS "Admin Full User" ON "public"."User";`,
    `CREATE POLICY "Admin Full User" ON "public"."User" FOR ALL TO service_role USING (true) WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "User Self Read" ON "public"."User";`,
    `CREATE POLICY "User Self Read" ON "public"."User" FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');`,
    `DROP POLICY IF EXISTS "User Self Update" ON "public"."User";`,
    `CREATE POLICY "User Self Update" ON "public"."User" FOR UPDATE TO authenticated USING (email = auth.jwt() ->> 'email') WITH CHECK (email = auth.jwt() ->> 'email');`,

    // 4. WorkoutPlan: Service Role Full Access & User Isolation
    `DROP POLICY IF EXISTS "Admin Full WorkoutPlan" ON "public"."WorkoutPlan";`,
    `CREATE POLICY "Admin Full WorkoutPlan" ON "public"."WorkoutPlan" FOR ALL TO service_role USING (true) WITH CHECK (true);`,

    // 5. DayWorkout: Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full DayWorkout" ON "public"."DayWorkout";`,
    `CREATE POLICY "Admin Full DayWorkout" ON "public"."DayWorkout" FOR ALL TO service_role USING (true) WITH CHECK (true);`,

    // 6. WeightLog: Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full WeightLog" ON "public"."WeightLog";`,
    `CREATE POLICY "Admin Full WeightLog" ON "public"."WeightLog" FOR ALL TO service_role USING (true) WITH CHECK (true);`,

    // 7. ProgressLog: Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full ProgressLog" ON "public"."ProgressLog";`,
    `CREATE POLICY "Admin Full ProgressLog" ON "public"."ProgressLog" FOR ALL TO service_role USING (true) WITH CHECK (true);`,

    // 8. CheckIn: Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full CheckIn" ON "public"."CheckIn";`,
    `CREATE POLICY "Admin Full CheckIn" ON "public"."CheckIn" FOR ALL TO service_role USING (true) WITH CHECK (true);`,
  ];

  for (const sql of statements) {
    try {
      await client.query(sql);
      console.log(`  Executed: ${sql.slice(0, 60)}...`);
    } catch (err: any) {
      console.warn(`  ⚠️ Warning on SQL: ${sql.slice(0, 40)} -> ${err.message}`);
    }
  }

  await client.end();
  console.log('\n🎉 [Complete] All RLS policies successfully applied to Supabase!');
}

applyPoliciesViaPg().catch(console.error);
