import fs from 'fs';
import path from 'path';

/**
 * Automated Database Backup Utility
 * Creates timestamped snapshots of SQLite databases (dev.db and exercises.db)
 * and auto-prunes backups older than 14 days.
 */

const BACKUP_DIR = path.join(__dirname, '../../backups');
const DEV_DB_PATH = path.join(__dirname, '../../prisma/dev.db');
const EXERCISES_DB_PATH = path.join(__dirname, '../../../workout_generator_python/database/exercises.db');

/**
 * Resolves and validates that a given path stays strictly inside an allowed base directory.
 */
function resolveSafePath(baseDir: string, relativeOrFileName: string): string {
  const safeBase = path.basename(relativeOrFileName);
  const resolved = path.resolve(baseDir, safeBase);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error(`[Security] Path traversal attempt detected: ${relativeOrFileName}`);
  }
  return resolved;
}

export const runDatabaseBackup = (targetBackupDir: string = BACKUP_DIR): { success: boolean; backupsCreated: string[]; error?: string } => {
  try {
    const safeTargetDir = path.resolve(targetBackupDir);
    // Ensure backups directory exists
    if (!fs.existsSync(safeTargetDir)) {
      fs.mkdirSync(safeTargetDir, { recursive: true });
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
    const backupsCreated: string[] = [];

    // Backup dev.db if exists
    if (fs.existsSync(DEV_DB_PATH)) {
      const devBackupName = `dev_backup_${timestamp}.db`;
      const devBackupDest = resolveSafePath(safeTargetDir, devBackupName);
      fs.copyFileSync(DEV_DB_PATH, devBackupDest);
      backupsCreated.push(devBackupName);
      console.log(`[Backup] Dev Database backed up -> ${devBackupName}`);
    } else {
      console.warn(`[Backup Warning] Dev database file not found at ${DEV_DB_PATH}`);
    }

    // Backup exercises.db if exists
    if (fs.existsSync(EXERCISES_DB_PATH)) {
      const exBackupName = `exercises_backup_${timestamp}.db`;
      const exBackupDest = resolveSafePath(safeTargetDir, exBackupName);
      fs.copyFileSync(EXERCISES_DB_PATH, exBackupDest);
      backupsCreated.push(exBackupName);
      console.log(`[Backup] Exercises Database backed up -> ${exBackupName}`);
    } else {
      console.warn(`[Backup Warning] Exercises database file not found at ${EXERCISES_DB_PATH}`);
    }

    // Auto-prune backups older than 14 days
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
    const files = fs.readdirSync(safeTargetDir);
    files.forEach((file) => {
      const filePath = resolveSafePath(safeTargetDir, file);
      const stat = fs.statSync(filePath);
      if (now.getTime() - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`[Backup Prune] Removed old backup -> ${file}`);
      }
    });

    return { success: true, backupsCreated };
  } catch (err: any) {
    console.error('[Backup Error] Failed to execute database backup:', err);
    return { success: false, backupsCreated: [], error: err.message };
  }
};

// Execute if invoked directly via CLI (npx ts-node src/scripts/backup_db.ts)
if (require.main === module) {
  console.log('=== Starting Database Backup Script ===');
  const result = runDatabaseBackup();
  if (result.success) {
    console.log(`[Success] Database backup completed cleanly. Created ${result.backupsCreated.length} backup file(s).`);
  } else {
    console.error(`[Failure] Database backup failed: ${result.error}`);
    process.exit(1);
  }
}
