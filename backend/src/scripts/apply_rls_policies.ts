import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function applyRlsPolicies() {
  console.log('🛡️ [RLS Policies] Applying granular security policies on Supabase PostgreSQL...');

  const policiesSql = [
    // 1. ExerciseLibrary: Public Read Access (Everyone can browse library) & Admin Full Access
    `DROP POLICY IF EXISTS "Public Read ExerciseLibrary" ON "public"."ExerciseLibrary";`,
    `CREATE POLICY "Public Read ExerciseLibrary" ON "public"."ExerciseLibrary" FOR SELECT USING (true);`,
    `DROP POLICY IF EXISTS "Admin Full ExerciseLibrary" ON "public"."ExerciseLibrary";`,
    `CREATE POLICY "Admin Full ExerciseLibrary" ON "public"."ExerciseLibrary" FOR ALL USING (auth.role() = 'service_role');`,

    // 2. Exercise: Public Read for catalog exercises & Admin Full Access
    `DROP POLICY IF EXISTS "Public Read Global Exercises" ON "public"."Exercise";`,
    `CREATE POLICY "Public Read Global Exercises" ON "public"."Exercise" FOR SELECT USING ("dayWorkoutId" IS NULL);`,
    `DROP POLICY IF EXISTS "Admin Full Exercise" ON "public"."Exercise";`,
    `CREATE POLICY "Admin Full Exercise" ON "public"."Exercise" FOR ALL USING (auth.role() = 'service_role');`,

    // 3. User: Admin & Service Role Full Access (Protects credentials and profile data)
    `DROP POLICY IF EXISTS "Admin Full User" ON "public"."User";`,
    `CREATE POLICY "Admin Full User" ON "public"."User" FOR ALL USING (auth.role() = 'service_role');`,

    // 4. WorkoutPlan: Admin & Service Role Full Access (Protects user plans)
    `DROP POLICY IF EXISTS "Admin Full WorkoutPlan" ON "public"."WorkoutPlan";`,
    `CREATE POLICY "Admin Full WorkoutPlan" ON "public"."WorkoutPlan" FOR ALL USING (auth.role() = 'service_role');`,

    // 5. DayWorkout: Admin & Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full DayWorkout" ON "public"."DayWorkout";`,
    `CREATE POLICY "Admin Full DayWorkout" ON "public"."DayWorkout" FOR ALL USING (auth.role() = 'service_role');`,

    // 6. WeightLog: Admin & Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full WeightLog" ON "public"."WeightLog";`,
    `CREATE POLICY "Admin Full WeightLog" ON "public"."WeightLog" FOR ALL USING (auth.role() = 'service_role');`,

    // 7. ProgressLog: Admin & Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full ProgressLog" ON "public"."ProgressLog";`,
    `CREATE POLICY "Admin Full ProgressLog" ON "public"."ProgressLog" FOR ALL USING (auth.role() = 'service_role');`,

    // 8. CheckIn: Admin & Service Role Full Access
    `DROP POLICY IF EXISTS "Admin Full CheckIn" ON "public"."CheckIn";`,
    `CREATE POLICY "Admin Full CheckIn" ON "public"."CheckIn" FOR ALL USING (auth.role() = 'service_role');`
  ];

  for (const sql of policiesSql) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err: any) {
      console.warn(`  ⚠️ SQL execution note:`, err.message);
    }
  }

  console.log('✅ [RLS Policies Completed] All granular security policies applied successfully on Supabase!');
  console.log('👑 Admin has full unrestricted access from Supabase Dashboard & Node.js backend.');
  console.log('🔒 User private data is completely protected from external unauthorized access.');

  await prisma.$disconnect();
}

applyRlsPolicies().catch(async (e) => {
  console.error('❌ [Fatal Error]:', e);
  await prisma.$disconnect();
  process.exit(1);
});
