import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { translateExerciseName } from './standardize_exercise_names';

const STAGING_DIR = path.join(__dirname, '../staging');
const STAGING_JSON = path.join(STAGING_DIR, 'staging_raw_exercises.json');
const DEDUPED_JSON = path.join(STAGING_DIR, 'deduplicated_master_exercises.json');
const STAGING_DB = path.join(STAGING_DIR, 'staging.db');

interface MergedExercise {
  id: number | string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  instructions_en?: string | string[];
  instructions_ar?: string | string[];
  muscle_en: string;
  muscle_ar: string;
  targetMuscle: string;
  equipment_en: string;
  equipment_ar: string;
  level: string;
  category: string;
  rating: number;
  source: string;
  image_url: string;
  gif_url?: string;
  youtube_url?: string;
  secondary_muscles_en?: string | string[];
  secondary_muscles_ar?: string | string[];
  common_mistakes_en?: string | string[];
  common_mistakes_ar?: string | string[];
  isHomeFriendly?: boolean;
}

// Canonical Key Generator for Deduplication
function generateCanonicalKey(name: string, muscle: string, equipment: string): string {
  const cleanName = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanMuscle = (muscle || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const cleanEquip = (equipment || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  return `${cleanName}__${cleanMuscle}__${cleanEquip}`;
}

// Muscle Normalizer into Project's 11 Standard Target Groups
function normalizeTargetMuscle(muscle: string): { en: string; ar: string } {
  const m = (muscle || '').toLowerCase();
  if (m.includes('chest') || m.includes('pectoral')) return { en: 'Chest', ar: 'الصدر' };
  if (m.includes('back') || m.includes('lat') || m.includes('rhomboid') || m.includes('trapezius') || m.includes('spine')) return { en: 'Back', ar: 'الظهر' };
  if (m.includes('shoulder') || m.includes('delt')) return { en: 'Shoulders', ar: 'الأكتاف' };
  if (m.includes('quad') || m.includes('thigh') || m.includes('adductor')) return { en: 'Quadriceps', ar: 'الفخذ الأمامي (الكوادس)' };
  if (m.includes('hamstring') || m.includes('glute')) return { en: 'Hamstrings', ar: 'الفخذ الخلفي والأرداف' };
  if (m.includes('bicep') || m.includes('brachii')) return { en: 'Biceps', ar: 'البايسبس' };
  if (m.includes('tricep')) return { en: 'Triceps', ar: 'الترايسبس' };
  if (m.includes('ab') || m.includes('core') || m.includes('oblique') || m.includes('waist')) return { en: 'Abs', ar: 'عضلات البطن والكور' };
  if (m.includes('calf') || m.includes('calves') || m.includes('soleus')) return { en: 'Calves', ar: 'السمانة (البطات)' };
  if (m.includes('forearm') || m.includes('wrist')) return { en: 'Forearms', ar: 'السواعد' };
  if (m.includes('cardio') || m.includes('hiit') || m.includes('aerobic')) return { en: 'Cardio', ar: 'كارديو ولياقة' };
  return { en: 'Full Body', ar: 'كامل الجسم' };
}

// Equipment Normalizer
function normalizeEquipment(equip: string): { en: string; ar: string; isHome: boolean } {
  const e = (equip || '').toLowerCase();
  if (e.includes('dumbbell') || e.includes('db')) return { en: 'Dumbbell', ar: 'دمبلز', isHome: true };
  if (e.includes('band') || e.includes('resistance')) return { en: 'Bands', ar: 'حبال مقاومة', isHome: true };
  if (e.includes('bodyweight') || e.includes('body weight') || e.includes('none') || !e) return { en: 'Bodyweight', ar: 'وزن الجسم', isHome: true };
  if (e.includes('kettlebell') || e.includes('kb')) return { en: 'Kettlebell', ar: 'كتلبل', isHome: true };
  if (e.includes('mat') || e.includes('floor')) return { en: 'Mat', ar: 'فرشة رياضية', isHome: true };
  if (e.includes('barbell') || e.includes('bb')) return { en: 'Barbell', ar: 'بار', isHome: false };
  if (e.includes('cable')) return { en: 'Cable', ar: 'كيبل', isHome: false };
  if (e.includes('machine') || e.includes('smith')) return { en: 'Machine', ar: 'جهاز', isHome: false };
  return { en: equip || 'Other', ar: 'أدوات الجيم', isHome: true };
}

async function runPhase2() {
  console.log('\n=============================================================');
  console.log('🚀 [PHASE 2] INTELLIGENT DEDUPLICATION & METRIC MERGING');
  console.log('=============================================================\n');

  if (!fs.existsSync(STAGING_JSON)) {
    console.error('❌ Staging JSON not found! Please run Phase 1 first.');
    process.exit(1);
  }

  const rawCandidates: any[] = JSON.parse(fs.readFileSync(STAGING_JSON, 'utf8'));
  console.log(`📊 Processing ${rawCandidates.length} raw candidate records for deduplication...`);

  const masterMap = new Map<string, MergedExercise>();
  let preservedBaselineCount = 0;
  let enrichedBaselineCount = 0;
  let newlyDiscoveredCount = 0;
  let duplicateSkippedCount = 0;

  // STEP 1: Insert all Baseline Exercises first (Protected Ground Truth)
  const baselineCandidates = rawCandidates.filter(c => c.raw_source === 'BeastMode-Enriched-Baseline' || !c.raw_source.includes('Open'));
  const externalCandidates = rawCandidates.filter(c => c.raw_source !== 'BeastMode-Enriched-Baseline' && c.raw_source.includes('Open'));

  console.log(`🛡️ Registering ${baselineCandidates.length} baseline exercises as protected records...`);

  baselineCandidates.forEach((item, index) => {
    const key = generateCanonicalKey(item.name_en || item.name, item.target_muscle || '', item.equipment || '');
    const normMuscle = normalizeTargetMuscle(item.target_muscle || '');
    const normEquip = normalizeEquipment(item.equipment || '');

    const mergedRecord: MergedExercise = {
      id: item.original_id || (index + 1),
      name_en: item.name_en || item.name || '',
      name_ar: item.name_ar || translateExerciseName(item.name_en || item.name, normMuscle.en, normEquip.en),
      description_en: item.description || '',
      description_ar: item.description_ar || '',
      instructions_en: item.instructions || '',
      instructions_ar: item.instructions_ar || '',
      muscle_en: normMuscle.en,
      muscle_ar: normMuscle.ar,
      targetMuscle: normMuscle.en,
      equipment_en: normEquip.en,
      equipment_ar: normEquip.ar,
      level: item.level || 'Beginner',
      category: item.category || (normEquip.isHome ? 'CALISTHENICS' : 'IRON'),
      rating: 4.8,
      source: item.raw_source || 'BeastMode-Baseline',
      image_url: item.image_urls?.[0] || item.image_url || '',
      gif_url: item.gif_url || '',
      youtube_url: item.video_url || `https://www.youtube.com/results?search_query=${encodeURIComponent((item.name_en || item.name) + ' tutorial form')}`,
      secondary_muscles_en: item.secondary_muscles || '',
      secondary_muscles_ar: item.secondary_muscles_ar || '',
      common_mistakes_en: item.common_mistakes || '',
      common_mistakes_ar: item.common_mistakes_ar || '',
      isHomeFriendly: normEquip.isHome,
    };

    masterMap.set(key, mergedRecord);
    preservedBaselineCount++;
  });

  console.log(`   ✓ ${preservedBaselineCount} protected baseline records locked in.`);

  // STEP 2: Match and Merge External Open Sources
  console.log(`🔍 Matching and merging ${externalCandidates.length} external records against baseline...`);

  externalCandidates.forEach((candidate) => {
    const key = generateCanonicalKey(candidate.name_en || candidate.name, candidate.target_muscle || candidate.body_part || '', candidate.equipment || '');

    if (masterMap.has(key)) {
      // Record already exists -> Merge missing fields / enrich media without overwriting baseline!
      const existing = masterMap.get(key)!;
      let enriched = false;

      // Enrich missing GIF
      if (!existing.gif_url && candidate.gif_url) {
        existing.gif_url = candidate.gif_url;
        enriched = true;
      }

      // Enrich missing instructions
      if ((!existing.instructions_en || existing.instructions_en.length < 5) && candidate.instructions && candidate.instructions.length > 5) {
        existing.instructions_en = candidate.instructions;
        enriched = true;
      }

      // Enrich multi-angle images
      if ((!existing.image_url || existing.image_url.includes('unsplash')) && candidate.image_urls?.length > 0) {
        existing.image_url = candidate.image_urls[0];
        enriched = true;
      }

      if (enriched) {
        enrichedBaselineCount++;
      } else {
        duplicateSkippedCount++;
      }
    } else {
      // New unique exercise -> Standardize & Add
      const normMuscle = normalizeTargetMuscle(candidate.target_muscle || candidate.body_part || '');
      const normEquip = normalizeEquipment(candidate.equipment || '');
      const standardAr = translateExerciseName(candidate.name_en || candidate.name, normMuscle.en, normEquip.en);

      const newId = masterMap.size + 1;
      const newExercise: MergedExercise = {
        id: newId,
        name_en: candidate.name_en || candidate.name || 'Exercise',
        name_ar: standardAr,
        description_en: candidate.description || '',
        instructions_en: candidate.instructions || [],
        muscle_en: normMuscle.en,
        muscle_ar: normMuscle.ar,
        targetMuscle: normMuscle.en,
        equipment_en: normEquip.en,
        equipment_ar: normEquip.ar,
        level: candidate.level || 'Beginner',
        category: normEquip.isHome ? 'CALISTHENICS' : 'IRON',
        rating: 4.7,
        source: candidate.raw_source,
        image_url: candidate.image_urls?.[0] || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
        gif_url: candidate.gif_url || '',
        youtube_url: `https://www.youtube.com/results?search_query=${encodeURIComponent((candidate.name_en || candidate.name) + ' tutorial form')}`,
        secondary_muscles_en: candidate.secondary_muscles || [],
        common_mistakes_en: candidate.common_mistakes || [],
        isHomeFriendly: normEquip.isHome,
      };

      masterMap.set(key, newExercise);
      newlyDiscoveredCount++;
    }
  });

  const finalMergedList = Array.from(masterMap.values()).map((ex, idx) => ({
    ...ex,
    id: idx + 1,
  }));

  console.log('\n=============================================================');
  console.log('📊 [PHASE 2 SUMMARY REPORT]');
  console.log('=============================================================');
  console.log(`🛡️ Baseline Exercises Preserved 100%: ${preservedBaselineCount}`);
  console.log(`✨ Baseline Exercises Enriched with New Media/Steps: ${enrichedBaselineCount}`);
  console.log(`🆕 Newly Discovered Unique Exercises Added: ${newlyDiscoveredCount}`);
  console.log(`🚫 Exact Duplicates Filtered Out: ${duplicateSkippedCount}`);
  console.log(`🏆 Final Unified Deduplicated Catalog Total: ${finalMergedList.length} exercises`);
  console.log(`🏠 Home-Friendly Exercises (Bodyweight/Bands/Dumbbells): ${finalMergedList.filter(e => e.isHomeFriendly).length}`);

  // Write Deduplicated Master JSON
  fs.writeFileSync(DEDUPED_JSON, JSON.stringify(finalMergedList, null, 2));
  console.log(`\n💾 Master deduplicated JSON saved: ${DEDUPED_JSON} (${(fs.statSync(DEDUPED_JSON).size / (1024 * 1024)).toFixed(2)} MB)`);

  // Update SQLite Staging Table
  const db = new sqlite3.Database(STAGING_DB);
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS deduplicated_exercises');
    db.run(`
      CREATE TABLE deduplicated_exercises (
        id INTEGER PRIMARY KEY,
        name_en TEXT,
        name_ar TEXT,
        description_en TEXT,
        instructions_en TEXT,
        muscle_en TEXT,
        muscle_ar TEXT,
        targetMuscle TEXT,
        equipment_en TEXT,
        equipment_ar TEXT,
        level TEXT,
        category TEXT,
        rating REAL,
        source TEXT,
        image_url TEXT,
        gif_url TEXT,
        youtube_url TEXT,
        isHomeFriendly INTEGER
      )
    `);

    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(`
      INSERT INTO deduplicated_exercises (
        id, name_en, name_ar, description_en, instructions_en, muscle_en,
        muscle_ar, targetMuscle, equipment_en, equipment_ar, level, category,
        rating, source, image_url, gif_url, youtube_url, isHomeFriendly
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    finalMergedList.forEach((e) => {
      stmt.run(
        e.id,
        e.name_en,
        e.name_ar,
        e.description_en || '',
        typeof e.instructions_en === 'object' ? JSON.stringify(e.instructions_en) : String(e.instructions_en || ''),
        e.muscle_en,
        e.muscle_ar,
        e.targetMuscle,
        e.equipment_en,
        e.equipment_ar,
        e.level,
        e.category,
        e.rating,
        e.source,
        e.image_url,
        e.gif_url || '',
        e.youtube_url || '',
        e.isHomeFriendly ? 1 : 0
      );
    });

    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('❌ Staging Commit Error:', err);
      } else {
        console.log(`✅ Staging table [deduplicated_exercises] populated in ${STAGING_DB}`);
      }
      db.close();
      console.log('\n✨ [PHASE 2 COMPLETE] Ready for Phase 3 (Media, MuscleWiki & YouTube Enrichment).');
    });
  });
}

runPhase2();
