import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface SqliteExercise {
  id: number;
  name_en: string;
  name_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  instructions_en?: string | null;
  instructions_ar?: string | null;
  muscle_en?: string | null;
  muscle_ar?: string | null;
  equipment_en?: string | null;
  equipment_ar?: string | null;
  level?: string | null;
  category?: string | null;
  rating?: number | null;
  source?: string | null;
  sanskrit_name?: string | null;
  image_url?: string | null;
  secondary_muscles_en?: string | null;
  secondary_muscles_ar?: string | null;
  common_mistakes_en?: string | null;
  common_mistakes_ar?: string | null;
  gif_url?: string | null;
  youtube_url?: string | null;
  anatomy_image_url?: string | null;
}

async function migrateToSupabase() {
  console.log('🚀 [Migration] Starting data migration from SQLite (exercises.db) to Supabase PostgreSQL...');
  
  const dbPath = path.join(__dirname, '../../../workout_generator_python/database/exercises.db');
  console.log(`📁 [Migration] Opening SQLite database at: ${dbPath}`);

  const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

  const rows = await new Promise<SqliteExercise[]>((resolve, reject) => {
    sqliteDb.all('SELECT * FROM exercises ORDER BY id ASC', (err, result: any[]) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  sqliteDb.close();
  console.log(`📊 [Migration] Successfully loaded ${rows.length} exercises from local SQLite database.`);

  // Clean existing library data before re-populating to prevent duplicates
  console.log('🧹 [Migration] Cleaning up existing records in Exercise & ExerciseLibrary tables in Supabase...');
  try {
    await (prisma.exercise as any).deleteMany({ where: { dayWorkoutId: null } });
    await (prisma.exerciseLibrary as any).deleteMany({});
  } catch (err: any) {
    console.warn('⚠️ [Migration] Clean warning (table might be fresh):', err.message);
  }

  const BATCH_SIZE = 250;
  const total = rows.length;
  let inserted = 0;

  console.log(`⚡ [Migration] Inserting records in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);

    const formattedExercises = chunk.map((r) => ({
      name: r.name_ar || r.name_en,
      name_en: r.name_en,
      name_ar: r.name_ar,
      description_en: r.description_en,
      description_ar: r.description_ar,
      instructions_en: r.instructions_en,
      instructions_ar: r.instructions_ar,
      muscle_en: r.muscle_en,
      muscle_ar: r.muscle_ar,
      targetMuscle: r.muscle_en,
      equipment_en: r.equipment_en,
      equipment_ar: r.equipment_ar,
      level: r.level,
      category: r.category || 'IRON',
      rating: typeof r.rating === 'number' ? r.rating : 0.0,
      source: r.source,
      sanskrit_name: r.sanskrit_name,
      imageUrl: r.image_url,
      image_url: r.image_url,
      secondary_muscles_en: r.secondary_muscles_en,
      secondary_muscles_ar: r.secondary_muscles_ar,
      common_mistakes_en: r.common_mistakes_en,
      common_mistakes_ar: r.common_mistakes_ar,
      gif_url: r.gif_url,
      youtube_url: r.youtube_url,
      videoUrl: r.youtube_url,
      anatomy_image_url: r.anatomy_image_url,
    }));

    // Insert into Exercise table
    await (prisma.exercise as any).createMany({
      data: formattedExercises,
      skipDuplicates: true,
    });

    // Also populate ExerciseLibrary for fast direct lookups
    await (prisma.exerciseLibrary as any).createMany({
      data: formattedExercises,
      skipDuplicates: true,
    });

    inserted += chunk.length;
    const percent = Math.round((inserted / total) * 100);
    console.log(`  ⏳ Migrated: ${inserted} / ${total} (${percent}%)`);
  }

  console.log(`\n🎉 [Migration Completed] Successfully migrated all ${inserted} records to Supabase PostgreSQL!`);

  // Final verification query: Retrieve sample records
  console.log('\n🔍 [Verification] Querying first 5 exercises directly from Supabase PostgreSQL...');
  const sample = await (prisma.exercise as any).findMany({
    take: 5,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      targetMuscle: true,
      category: true,
      rating: true,
    },
  });

  console.log('📋 [Verification Results]:');
  console.table(sample);

  const count = await prisma.exercise.count();
  console.log(`\n📈 Total Exercise records in Supabase: ${count}`);

  await prisma.$disconnect();
}

migrateToSupabase().catch(async (e) => {
  console.error('❌ [Migration Error]:', e);
  await prisma.$disconnect();
  process.exit(1);
});
