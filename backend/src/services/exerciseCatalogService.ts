import fs from 'fs';
import path from 'path';

export interface ExerciseRecord {
  id: number | string;
  name_en: string;
  name_ar?: string;
  muscle_en?: string;
  muscle_ar?: string;
  equipment_en?: string;
  equipment_ar?: string;
  level?: string;
  category?: string;
  image_url?: string;
  gif_url?: string;
  youtube_url?: string;
  anatomy_image_url?: string;
  instructions_en?: string;
  instructions_ar?: string;
  secondary_muscles_en?: string;
  secondary_muscles_ar?: string;
  common_mistakes_en?: string;
  common_mistakes_ar?: string;
  rating?: number;
  [key: string]: any;
}

const BACKUP_JSON_PATH = path.resolve(__dirname, '../../exercises_backup.json');
const FRONTEND_CATALOG_PATH = path.resolve(__dirname, '../../../frontend/public/exercises_catalog.json');

class ExerciseCatalogService {
  private exercises: ExerciseRecord[] = [];
  private isLoaded = false;
  private cachedLibraryTree: any = null;

  constructor() {
    this.loadCatalog();
  }

  public loadCatalog(): void {
    try {
      if (fs.existsSync(BACKUP_JSON_PATH)) {
        const raw = fs.readFileSync(BACKUP_JSON_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.exercises = parsed;
        } else if (parsed && Array.isArray(parsed.exercises)) {
          this.exercises = parsed.exercises;
        }
        this.isLoaded = true;
        console.log(`[ExerciseCatalog] Loaded ${this.exercises.length} exercises from backup JSON.`);
        return;
      }

      if (fs.existsSync(FRONTEND_CATALOG_PATH)) {
        const raw = fs.readFileSync(FRONTEND_CATALOG_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.exercises = Array.isArray(parsed) ? parsed : (parsed.exercises || []);
        this.isLoaded = true;
        console.log(`[ExerciseCatalog] Loaded ${this.exercises.length} exercises from frontend catalog.`);
        return;
      }

      console.warn('[ExerciseCatalog] No local JSON catalog file found.');
    } catch (err: any) {
      console.error('[ExerciseCatalog] Failed to load exercise catalog:', err.message);
    }
  }

  public getAll(): ExerciseRecord[] {
    if (!this.isLoaded || this.exercises.length === 0) {
      this.loadCatalog();
    }
    return this.exercises;
  }

  public findMatching(name: string): ExerciseRecord | null {
    if (!name) return null;
    const cleanName = name.trim().toLowerCase();
    const all = this.getAll();

    return (
      all.find(
        (ex) =>
          (ex.name_en && ex.name_en.toLowerCase() === cleanName) ||
          (ex.name_ar && ex.name_ar.toLowerCase() === cleanName)
      ) ||
      all.find(
        (ex) =>
          (ex.name_en && ex.name_en.toLowerCase().includes(cleanName)) ||
          (ex.name_ar && ex.name_ar.toLowerCase().includes(cleanName))
      ) ||
      null
    );
  }

  public search(query: string, muscle?: string, equipment?: string, limit: number = 8): ExerciseRecord[] {
    const q = (query || '').trim().toLowerCase();
    const m = (muscle || '').trim().toLowerCase();
    const eq = (equipment || '').trim().toLowerCase();

    const all = this.getAll();

    const results = all.filter((ex) => {
      const matchQuery =
        !q ||
        (ex.name_en && ex.name_en.toLowerCase().includes(q)) ||
        (ex.name_ar && ex.name_ar.toLowerCase().includes(q)) ||
        (ex.muscle_en && ex.muscle_en.toLowerCase().includes(q)) ||
        (ex.muscle_ar && ex.muscle_ar.toLowerCase().includes(q));

      if (!matchQuery) return false;

      if (m) {
        const matchMuscle =
          (ex.muscle_en && ex.muscle_en.toLowerCase().includes(m)) ||
          (ex.muscle_ar && ex.muscle_ar.toLowerCase().includes(m));
        if (!matchMuscle) return false;
      }

      if (eq && eq !== 'all') {
        const matchEquipment =
          (ex.equipment_en && ex.equipment_en.toLowerCase().includes(eq)) ||
          (ex.equipment_ar && ex.equipment_ar.toLowerCase().includes(eq));
        if (!matchEquipment) return false;
      }

      return true;
    });

    return results.slice(0, limit);
  }

  public getAlternatives(muscle: string, limit: number = 15): ExerciseRecord[] {
    const m = (muscle || 'Chest').trim().toLowerCase();
    const all = this.getAll();

    const results = all.filter(
      (ex) =>
        (ex.muscle_en && ex.muscle_en.toLowerCase() === m) ||
        (ex.muscle_ar && ex.muscle_ar.toLowerCase() === m) ||
        (ex.muscle_en && ex.muscle_en.toLowerCase().includes(m))
    );

    return results.slice(0, limit);
  }

  public getLibraryTree(): any {
    if (this.cachedLibraryTree) {
      return this.cachedLibraryTree;
    }

    const all = this.getAll();
    const tree: { [muscle: string]: { [equipment: string]: ExerciseRecord[] } } = {};

    all.forEach((ex) => {
      const muscle = ex.muscle_en || 'Other';
      const equipment = ex.equipment_en || 'General';

      if (!tree[muscle]) tree[muscle] = {};
      if (!tree[muscle][equipment]) tree[muscle][equipment] = [];

      tree[muscle][equipment].push(ex);
    });

    this.cachedLibraryTree = {
      total: all.length,
      tree,
      muscles: Object.keys(tree),
    };

    return this.cachedLibraryTree;
  }

  public saveArabicTranslation(name_en: string, instructions_ar: string, name_ar?: string): boolean {
    try {
      if (!name_en || !instructions_ar) return false;
      const cleanName = name_en.trim().toLowerCase();
      const ex = this.exercises.find((item) => item.name_en && item.name_en.toLowerCase() === cleanName);

      if (ex) {
        ex.instructions_ar = instructions_ar;
        if (name_ar && (!ex.name_ar || ex.name_ar === ex.name_en)) {
          ex.name_ar = name_ar;
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const exerciseCatalog = new ExerciseCatalogService();
export default exerciseCatalog;
