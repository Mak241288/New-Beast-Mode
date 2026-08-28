// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { FullyEnrichedExercise } from './enrich_media_and_musclewiki_links';

const STAGING_DIR = path.join(__dirname, '../staging');
const ENRICHED_JSON = path.join(STAGING_DIR, 'enriched_master_exercises.json');

const BACKUP_JSON_PATH = path.join(__dirname, '../../exercises_backup.json');
const FRONTEND_CATALOG_PATH = path.join(__dirname, '../../../frontend/public/exercises_catalog.json');
const MEDIA_PATCH_PATH = path.join(__dirname, '../../../workout_generator_python/database/exercise_media_patch.json');
const SUPABASE_SQL_PATH = path.join(__dirname, '../../prisma/supabase_exercise_library_seed.sql');

async function syncLocalJSON(exercises: FullyEnrichedExercise[]): Promise<void> {
  console.log(`📦 [1/4] Syncing ${exercises.length} exercises into local JSON backup: ${BACKUP_JSON_PATH}...`);
  fs.writeFileSync(BACKUP_JSON_PATH, JSON.stringify({ meta: { total: exercises.length }, exercises }, null, 2));
  console.log(`   ✓ Local backup JSON updated successfully with ${exercises.length} exercises!`);
}

function syncFrontendCatalogAndPatches(exercises: FullyEnrichedExercise[]) {
  console.log(`📦 [2/4] Updating frontend static catalog & patches...`);

  // 1. Frontend public catalog
  fs.writeFileSync(FRONTEND_CATALOG_PATH, JSON.stringify(exercises, null, 2));
  console.log(`   ✓ Saved frontend public catalog: ${FRONTEND_CATALOG_PATH} (${(fs.statSync(FRONTEND_CATALOG_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);

  // 2. Python engine media patch
  try {
    const patchData = {
      total_exercises: exercises.length,
      updated_at: new Date().toISOString(),
      patch_data: exercises,
    };
    fs.writeFileSync(MEDIA_PATCH_PATH, JSON.stringify(patchData, null, 2));
    console.log(`   ✓ Saved Python media patch: ${MEDIA_PATCH_PATH}`);
  } catch (e) {
    console.warn('   ⚠️ Note on media patch:', e);
  }
}

function generateSupabaseSqlScript(exercises: FullyEnrichedExercise[]) {
  console.log(`📦 [3/4] Generating Supabase SQL seed file: ${SUPABASE_SQL_PATH}...`);

  const escapeSql = (val: any): string => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') {
      return Number.isFinite(val) ? String(val) : '0';
    }
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `'${s.replace(/'/g, "''")}'`;
  };

  const sqlHeader = `-- =============================================================
-- BEASTMODE MASTER EXERCISE LIBRARY SEED FOR SUPABASE
-- Total Exercises: ${exercises.length}
-- Generated at: ${new Date().toISOString()}
-- Safe Upsert into "ExerciseLibrary" without deleting user data
-- =============================================================

CREATE TABLE IF NOT EXISTS "ExerciseLibrary" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT,
  "name_en" TEXT,
  "name_ar" TEXT,
  "description" TEXT,
  "description_en" TEXT,
  "description_ar" TEXT,
  "instructions_en" TEXT,
  "instructions_ar" TEXT,
  "muscle_en" TEXT,
  "muscle_ar" TEXT,
  "targetMuscle" TEXT,
  "equipment_en" TEXT,
  "equipment_ar" TEXT,
  "level" TEXT,
  "category" TEXT,
  "rating" DOUBLE PRECISION DEFAULT 0.0,
  "source" TEXT,
  "sanskrit_name" TEXT,
  "imageUrl" TEXT,
  "image_url" TEXT,
  "secondary_muscles_en" TEXT,
  "secondary_muscles_ar" TEXT,
  "common_mistakes_en" TEXT,
  "common_mistakes_ar" TEXT,
  "gif_url" TEXT,
  "youtube_url" TEXT,
  "videoUrl" TEXT,
  "anatomy_image_url" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Batch Upsert Statements
`;

  const rowsSql = exercises.map(ex => {
    return `INSERT INTO "ExerciseLibrary" (
      "id", "name", "name_en", "name_ar", "description", "description_en", "description_ar",
      "instructions_en", "instructions_ar", "muscle_en", "muscle_ar", "targetMuscle",
      "equipment_en", "equipment_ar", "level", "category", "rating", "source",
      "imageUrl", "image_url", "gif_url", "youtube_url", "videoUrl", "anatomy_image_url",
      "secondary_muscles_en", "secondary_muscles_ar", "common_mistakes_en", "common_mistakes_ar",
      "updatedAt"
    ) VALUES (
      ${escapeSql(ex.id)}, ${escapeSql(ex.name_en)}, ${escapeSql(ex.name_en)}, ${escapeSql(ex.name_ar)},
      ${escapeSql(ex.description_en)}, ${escapeSql(ex.description_en)}, ${escapeSql(ex.description_ar)},
      ${escapeSql(ex.instructions_en)}, ${escapeSql(ex.instructions_ar)}, ${escapeSql(ex.muscle_en)},
      ${escapeSql(ex.muscle_ar)}, ${escapeSql(ex.targetMuscle)}, ${escapeSql(ex.equipment_en)},
      ${escapeSql(ex.equipment_ar)}, ${escapeSql(ex.level)}, ${escapeSql(ex.category)},
      ${escapeSql(ex.rating)}, ${escapeSql(ex.source)}, ${escapeSql(ex.image_url)}, ${escapeSql(ex.image_url)},
      ${escapeSql(ex.gif_url)}, ${escapeSql(ex.youtube_url)}, ${escapeSql(ex.youtube_url)},
      ${escapeSql(ex.anatomy_image_url || '')}, ${escapeSql(ex.secondary_muscles_en)},
      ${escapeSql(ex.secondary_muscles_ar)}, ${escapeSql(ex.common_mistakes_en)},
      ${escapeSql(ex.common_mistakes_ar)}, CURRENT_TIMESTAMP
    ) ON CONFLICT ("id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "name_en" = EXCLUDED."name_en",
      "name_ar" = EXCLUDED."name_ar",
      "description_en" = EXCLUDED."description_en",
      "description_ar" = EXCLUDED."description_ar",
      "instructions_en" = EXCLUDED."instructions_en",
      "instructions_ar" = EXCLUDED."instructions_ar",
      "muscle_en" = EXCLUDED."muscle_en",
      "muscle_ar" = EXCLUDED."muscle_ar",
      "targetMuscle" = EXCLUDED."targetMuscle",
      "equipment_en" = EXCLUDED."equipment_en",
      "equipment_ar" = EXCLUDED."equipment_ar",
      "level" = EXCLUDED."level",
      "category" = EXCLUDED."category",
      "rating" = EXCLUDED."rating",
      "image_url" = EXCLUDED."image_url",
      "gif_url" = EXCLUDED."gif_url",
      "youtube_url" = EXCLUDED."youtube_url",
      "updatedAt" = CURRENT_TIMESTAMP;`;
  }).join('\n');

  fs.writeFileSync(SUPABASE_SQL_PATH, sqlHeader + rowsSql);
  console.log(`   ✓ Saved Supabase SQL seed: ${SUPABASE_SQL_PATH} (${(fs.statSync(SUPABASE_SQL_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);
}

async function syncToSupabasePrisma(exercises: FullyEnrichedExercise[]) {
  console.log(`📦 [4/4] Connecting to Supabase via Prisma for live batch upsert...`);

  const prisma = new PrismaClient();
  try {
    const CHUNK_SIZE = 100;
    let syncedCount = 0;

    for (let i = 0; i < exercises.length; i += CHUNK_SIZE) {
      const chunk = exercises.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(ex => {
        return prisma.exerciseLibrary.upsert({
          where: { id: ex.id },
          update: {
            name: ex.name_en,
            name_en: ex.name_en,
            name_ar: ex.name_ar,
            description_en: ex.description_en,
            description_ar: ex.description_ar,
            instructions_en: JSON.stringify(ex.instructions_en),
            instructions_ar: JSON.stringify(ex.instructions_ar),
            muscle_en: ex.muscle_en,
            muscle_ar: ex.muscle_ar,
            targetMuscle: ex.targetMuscle,
            equipment_en: ex.equipment_en,
            equipment_ar: ex.equipment_ar,
            level: ex.level,
            category: ex.category,
            rating: ex.rating,
            source: ex.source,
            image_url: ex.image_url,
            imageUrl: ex.image_url,
            gif_url: ex.gif_url,
            youtube_url: ex.youtube_url,
            videoUrl: ex.youtube_url,
            anatomy_image_url: ex.anatomy_image_url || '',
            secondary_muscles_en: JSON.stringify(ex.secondary_muscles_en),
            secondary_muscles_ar: JSON.stringify(ex.secondary_muscles_ar),
            common_mistakes_en: JSON.stringify(ex.common_mistakes_en),
            common_mistakes_ar: JSON.stringify(ex.common_mistakes_ar),
          },
          create: {
            id: ex.id,
            name: ex.name_en,
            name_en: ex.name_en,
            name_ar: ex.name_ar,
            description_en: ex.description_en,
            description_ar: ex.description_ar,
            instructions_en: JSON.stringify(ex.instructions_en),
            instructions_ar: JSON.stringify(ex.instructions_ar),
            muscle_en: ex.muscle_en,
            muscle_ar: ex.muscle_ar,
            targetMuscle: ex.targetMuscle,
            equipment_en: ex.equipment_en,
            equipment_ar: ex.equipment_ar,
            level: ex.level,
            category: ex.category,
            rating: ex.rating,
            source: ex.source,
            image_url: ex.image_url,
            imageUrl: ex.image_url,
            gif_url: ex.gif_url,
            youtube_url: ex.youtube_url,
            videoUrl: ex.youtube_url,
            anatomy_image_url: ex.anatomy_image_url || '',
            secondary_muscles_en: JSON.stringify(ex.secondary_muscles_en),
            secondary_muscles_ar: JSON.stringify(ex.secondary_muscles_ar),
            common_mistakes_en: JSON.stringify(ex.common_mistakes_en),
            common_mistakes_ar: JSON.stringify(ex.common_mistakes_ar),
          }
        });
      }));

      syncedCount += chunk.length;
      process.stdout.write(`   ↳ Synced ${syncedCount}/${exercises.length} records to Supabase...\r`);
    }

    console.log(`\n   ✓ Supabase live sync completed for ${syncedCount} records!`);
  } catch (err: any) {
    console.warn(`\n   ⚠️ Direct Supabase Prisma network note: ${err.message}`);
    console.log('   ℹ️ A standalone SQL file (supabase_exercise_library_seed.sql) is available for direct import if connection times out.');
  } finally {
    await prisma.$disconnect();
  }
}

async function runPhase4() {
  console.log('\n=============================================================');
  console.log('🚀 [PHASE 4] SAFE SYNCHRONIZATION WITH SQLITE & SUPABASE');
  console.log('=============================================================\n');

  if (!fs.existsSync(ENRICHED_JSON)) {
    console.error('❌ Enriched JSON not found! Please run Phase 3 first.');
    process.exit(1);
  }

  const enrichedList: FullyEnrichedExercise[] = JSON.parse(fs.readFileSync(ENRICHED_JSON, 'utf8'));

  // 1. Sync Local JSON Backup
  await syncLocalJSON(enrichedList);

  // 2. Sync Frontend public JSON & Python patch
  syncFrontendCatalogAndPatches(enrichedList);

  // 3. Generate Supabase SQL seed file
  generateSupabaseSqlScript(enrichedList);

  // 4. Perform Supabase Prisma Upsert
  await syncToSupabasePrisma(enrichedList);

  console.log('\n✨ [PHASE 4 COMPLETE] Ready for Phase 5 (TypeScript Interfaces & UI Updates).');
}

runPhase4();
