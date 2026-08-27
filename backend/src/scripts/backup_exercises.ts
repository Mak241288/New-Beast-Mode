import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

/**
 * BeastMode Exercise Database Snapshot Exporter
 * Exports the complete 4,200+ enriched exercise dataset to a formatted, timestamped JSON snapshot.
 */

const EXERCISES_DB_PATH = path.resolve(__dirname, '../../../workout_generator_python/database/exercises.db');
const CATALOG_JSON_PATH = path.resolve(__dirname, '../../../frontend/public/exercises_catalog.json');
const OUTPUT_BACKUP_PATH = path.resolve(__dirname, '../../exercises_backup.json');

export async function exportExercisesSnapshot(): Promise<{ success: boolean; count: number; outputPath: string; sizeMb: string; error?: string }> {
  console.log('=== Starting Exercise Database Snapshot Export ===');
  
  try {
    let exercises: any[] = [];

    // Strategy 1: Read directly from enriched SQLite Database if available
    if (fs.existsSync(EXERCISES_DB_PATH)) {
      console.log(`[Snapshot Source] Reading from SQLite DB: ${EXERCISES_DB_PATH}`);
      const db = new sqlite3.Database(EXERCISES_DB_PATH, sqlite3.OPEN_READONLY);

      exercises = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM exercises', (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows || []);
        });
      });
    }

    // Strategy 2: Fallback to bundled catalog JSON if SQLite isn't present
    if ((!exercises || exercises.length === 0) && fs.existsSync(CATALOG_JSON_PATH)) {
      console.log(`[Snapshot Source] Reading from bundled Catalog JSON: ${CATALOG_JSON_PATH}`);
      const raw = fs.readFileSync(CATALOG_JSON_PATH, 'utf-8');
      exercises = JSON.parse(raw);
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error('No exercises found in SQLite database or catalog JSON.');
    }

    // Format & normalize snapshot payload
    const snapshotPayload = {
      meta: {
        exportedAt: new Date().toISOString(),
        totalExercises: exercises.length,
        version: '3.0.0',
        generator: 'BeastMode Snapshot Engine',
      },
      exercises,
    };

    const jsonString = JSON.stringify(snapshotPayload, null, 2);
    fs.writeFileSync(OUTPUT_BACKUP_PATH, jsonString, 'utf-8');

    const stats = fs.statSync(OUTPUT_BACKUP_PATH);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`[Snapshot Success] Exported ${exercises.length} exercises to:`);
    console.log(`-> ${OUTPUT_BACKUP_PATH} (${sizeMb} MB)`);

    return {
      success: true,
      count: exercises.length,
      outputPath: OUTPUT_BACKUP_PATH,
      sizeMb: `${sizeMb} MB`,
    };
  } catch (err: any) {
    console.error('[Snapshot Failure] Failed to export exercises snapshot:', err);
    return {
      success: false,
      count: 0,
      outputPath: OUTPUT_BACKUP_PATH,
      sizeMb: '0 MB',
      error: err.message,
    };
  }
}

// Direct CLI execution
if (require.main === module) {
  exportExercisesSnapshot().then((res) => {
    if (!res.success) {
      process.exit(1);
    }
  });
}
