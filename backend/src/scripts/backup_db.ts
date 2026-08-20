import fs from 'fs';
import path from 'path';

/**
 * Automated Database Backup Utility
 * Creates timestamped snapshots of SQLite databases (dev.db and exercises.db)
 * and auto-prunes backups older than 14 days.
 */

const BACKUP_DIR = path.resolve(__dirname, '../../backups');
const DEV_DB_PATH = path.resolve(__dirname, '../../prisma/dev.db');
const EXERCISES_DB_PATH = path.resolve(__dirname, '../../../workout_generator_python/database/exercises.db');

/**
 * Resolves and validates that a given path stays strictly inside an allowed base directory.
 * Prevents File Inclusion & Path Traversal attacks.
 */
export function getSafeBackupPath(baseDir: string, filename: string): string {
  const safeFilename = path.basename(filename);
  const resolvedBase = path.resolve(baseDir);
  const safePath = path.resolve(resolvedBase, safeFilename);

  if (!safePath.startsWith(path.resolve(resolvedBase))) {
    throw new Error('Unauthorized path traversal detected');
  }

  return safePath;
}

export const runDatabaseBackup = (targetBackupDir: string = BACKUP_DIR): { success: boolean; backupsCreated: string[]; error?: string } => {
  try {
    const resolvedBase = path.resolve(BACKUP_DIR);
    const resolvedTarget = path.resolve(targetBackupDir);
    const relativePath = path.relative(resolvedBase, resolvedTarget);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new Error('Invalid backup directory');
    }
    const safeTargetDir = resolvedTarget;
    const resolvedBackupDir = safeTargetDir;

    // Ensure backups directory exists
    if (!fs.existsSync(resolvedBackupDir)) {
      fs.mkdirSync(resolvedBackupDir, { recursive: true });
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
    const backupsCreated: string[] = [];

    // 1. Backup dev.db if exists (Location 1: dev.db backup file write/copy)
    if (fs.existsSync(DEV_DB_PATH)) {
      const devBackupName = path.basename(`dev_backup_${timestamp}.db`);
      const devBackupDest = path.resolve(resolvedBackupDir, devBackupName);

      if (!devBackupDest.startsWith(path.resolve(resolvedBackupDir))) {
        throw new Error('Unauthorized path traversal detected');
      }

      fs.copyFileSync(DEV_DB_PATH, devBackupDest);
      backupsCreated.push(devBackupName);
      console.log(`[Backup] Dev Database backed up -> ${devBackupName}`);
    } else {
      console.warn(`[Backup Warning] Dev database file not found at ${DEV_DB_PATH}`);
    }

    // 2. Backup exercises.db if exists (Location 2: exercises.db backup file write/copy)
    if (fs.existsSync(EXERCISES_DB_PATH)) {
      const exBackupName = path.basename(`exercises_backup_${timestamp}.db`);
      const exBackupDest = path.resolve(resolvedBackupDir, exBackupName);

      if (!exBackupDest.startsWith(path.resolve(resolvedBackupDir))) {
        throw new Error('Unauthorized path traversal detected');
      }

      fs.copyFileSync(EXERCISES_DB_PATH, exBackupDest);
      backupsCreated.push(exBackupName);
      console.log(`[Backup] Exercises Database backed up -> ${exBackupName}`);
    } else {
      console.warn(`[Backup Warning] Exercises database file not found at ${EXERCISES_DB_PATH}`);
    }

    // 3. Auto-prune backups older than 14 days (Location 3: read/stat/unlink backup files)
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
    const files = fs.readdirSync(resolvedBackupDir);
    files.forEach((file) => {
      const safeFileName = path.basename(file);
      const safeFilePath = path.resolve(resolvedBackupDir, safeFileName);

      if (!safeFilePath.startsWith(path.resolve(resolvedBackupDir))) {
        throw new Error('Unauthorized path traversal detected');
      }

      const stat = fs.statSync(safeFilePath);
      if (now.getTime() - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(safeFilePath);
        console.log(`[Backup Prune] Removed old backup -> ${safeFileName}`);
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
