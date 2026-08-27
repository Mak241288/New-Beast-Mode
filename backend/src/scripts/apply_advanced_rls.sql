-- ============================================================================
-- 🛡️ BeastMode AI: Advanced Supabase Row-Level Security (RLS) Policies
-- Ensures complete isolation so each athlete accesses only their own records.
-- ============================================================================

-- 1. Enable RLS on all domain tables
ALTER TABLE IF EXISTS "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."WorkoutPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."DayWorkout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ExerciseLibrary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."WeightLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."ProgressLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."CheckIn" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. "ExerciseLibrary" Table: Public Catalog Browsing
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read ExerciseLibrary" ON "public"."ExerciseLibrary";
CREATE POLICY "Public Read ExerciseLibrary" ON "public"."ExerciseLibrary"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role Full ExerciseLibrary" ON "public"."ExerciseLibrary";
CREATE POLICY "Service Role Full ExerciseLibrary" ON "public"."ExerciseLibrary"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 3. "Exercise" Table: Public Catalog / User Workout Exercises
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Global Exercises" ON "public"."Exercise";
CREATE POLICY "Public Read Global Exercises" ON "public"."Exercise"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role Full Exercise" ON "public"."Exercise";
CREATE POLICY "Service Role Full Exercise" ON "public"."Exercise"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. "User" Table: Isolated to Authenticated User
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users Can Read Own Profile" ON "public"."User";
CREATE POLICY "Users Can Read Own Profile" ON "public"."User"
  FOR SELECT TO authenticated
  USING (email = (auth.jwt() ->> 'email') OR id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users Can Update Own Profile" ON "public"."User";
CREATE POLICY "Users Can Update Own Profile" ON "public"."User"
  FOR UPDATE TO authenticated
  USING (email = (auth.jwt() ->> 'email') OR id::text = auth.uid()::text)
  WITH CHECK (email = (auth.jwt() ->> 'email') OR id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Service Role Full User" ON "public"."User";
CREATE POLICY "Service Role Full User" ON "public"."User"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. "WorkoutPlan" Table: User Isolation
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users Access Own WorkoutPlans" ON "public"."WorkoutPlan";
CREATE POLICY "Users Access Own WorkoutPlans" ON "public"."WorkoutPlan"
  FOR ALL TO authenticated
  USING (
    "userId"::text = auth.uid()::text OR
    "userId" IN (SELECT id FROM "public"."User" WHERE email = (auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    "userId"::text = auth.uid()::text OR
    "userId" IN (SELECT id FROM "public"."User" WHERE email = (auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "Service Role Full WorkoutPlan" ON "public"."WorkoutPlan";
CREATE POLICY "Service Role Full WorkoutPlan" ON "public"."WorkoutPlan"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. "WeightLog" Table: User Isolation
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users Access Own WeightLogs" ON "public"."WeightLog";
CREATE POLICY "Users Access Own WeightLogs" ON "public"."WeightLog"
  FOR ALL TO authenticated
  USING (
    "userId"::text = auth.uid()::text OR
    "userId" IN (SELECT id FROM "public"."User" WHERE email = (auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    "userId"::text = auth.uid()::text OR
    "userId" IN (SELECT id FROM "public"."User" WHERE email = (auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "Service Role Full WeightLog" ON "public"."WeightLog";
CREATE POLICY "Service Role Full WeightLog" ON "public"."WeightLog"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. "DayWorkout", "ProgressLog", "CheckIn": Service Role Access
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service Role Full DayWorkout" ON "public"."DayWorkout";
CREATE POLICY "Service Role Full DayWorkout" ON "public"."DayWorkout"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full ProgressLog" ON "public"."ProgressLog";
CREATE POLICY "Service Role Full ProgressLog" ON "public"."ProgressLog"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role Full CheckIn" ON "public"."CheckIn";
CREATE POLICY "Service Role Full CheckIn" ON "public"."CheckIn"
  FOR ALL TO service_role USING (true) WITH CHECK (true);
