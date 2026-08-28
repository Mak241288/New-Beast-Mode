import fs from 'fs';
import path from 'path';

/**
 * BeastMode Exercise Database Snapshot Exporter
 * Exports the complete 4,200+ enriched exercise dataset to a formatted, timestamped JSON snapshot.
 */

const CATALOG_JSON_PATH = path.resolve(__dirname, '../../../frontend/public/exercises_catalog.json');
const EXISTING_BACKUP_PATH = path.resolve(__dirname, '../../exercises_backup.json');
const OUTPUT_BACKUP_PATH = path.resolve(__dirname, '../../exercises_backup.json');

export async function exportExercisesSnapshot(): Promise<{ success: boolean; count: number; outputPath: string; sizeMb: string; error?: string }> {
  console.log('=== Starting Exercise Database Snapshot Export ===');
  
  try {
    let exercises: any[] = [];

    // Strategy 1: Read from bundled Catalog JSON
    if (fs.existsSync(CATALOG_JSON_PATH)) {
      console.log(`[Snapshot Source] Reading from bundled Catalog JSON: ${CATALOG_JSON_PATH}`);
      const raw = fs.readFileSync(CATALOG_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      exercises = Array.isArray(parsed) ? parsed : (parsed.exercises || []);
    } else if (fs.existsSync(EXISTING_BACKUP_PATH)) {
      console.log(`[Snapshot Source] Reading from existing Backup JSON: ${EXISTING_BACKUP_PATH}`);
      const raw = fs.readFileSync(EXISTING_BACKUP_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      exercises = Array.isArray(parsed) ? parsed : (parsed.exercises || []);
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
