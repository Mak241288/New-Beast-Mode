-- ============================================================================
-- 🚀 BeastMode AI: Supabase Trigram Indexing & Query Acceleration Script
-- ============================================================================

-- 1. Enable pg_trgm extension for substring and fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Composite B-Tree Indexes on "Exercise" Table
CREATE INDEX IF NOT EXISTS idx_exercise_muscle_equipment_en ON "Exercise" (muscle_en, equipment_en);
CREATE INDEX IF NOT EXISTS idx_exercise_muscle_equipment_ar ON "Exercise" (muscle_ar, equipment_ar);
CREATE INDEX IF NOT EXISTS idx_exercise_category_level ON "Exercise" (category, level);
CREATE INDEX IF NOT EXISTS idx_exercise_name_muscle_en ON "Exercise" (name_en, muscle_en);
CREATE INDEX IF NOT EXISTS idx_exercise_name_muscle_ar ON "Exercise" (name_ar, muscle_ar);

-- 3. GIN Trigram Indexes on "Exercise" for Ultra-Fast ILIKE / contains Queries
CREATE INDEX IF NOT EXISTS idx_exercise_name_en_trgm ON "Exercise" USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_exercise_name_ar_trgm ON "Exercise" USING gin (name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_exercise_name_trgm ON "Exercise" USING gin (name gin_trgm_ops);

-- 4. Composite B-Tree Indexes on "ExerciseLibrary" Table
CREATE INDEX IF NOT EXISTS idx_exercise_library_muscle_equipment_en ON "ExerciseLibrary" (muscle_en, equipment_en);
CREATE INDEX IF NOT EXISTS idx_exercise_library_muscle_equipment_ar ON "ExerciseLibrary" (muscle_ar, equipment_ar);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category_level ON "ExerciseLibrary" (category, level);
CREATE INDEX IF NOT EXISTS idx_exercise_library_name_muscle_en ON "ExerciseLibrary" (name_en, muscle_en);
CREATE INDEX IF NOT EXISTS idx_exercise_library_name_muscle_ar ON "ExerciseLibrary" (name_ar, muscle_ar);

-- 5. GIN Trigram Indexes on "ExerciseLibrary" Table
CREATE INDEX IF NOT EXISTS idx_exercise_library_name_en_trgm ON "ExerciseLibrary" USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_exercise_library_name_ar_trgm ON "ExerciseLibrary" USING gin (name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_exercise_library_name_trgm ON "ExerciseLibrary" USING gin (name gin_trgm_ops);
