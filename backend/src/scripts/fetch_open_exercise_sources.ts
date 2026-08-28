// @ts-nocheck
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const STAGING_DIR = path.join(__dirname, '../staging');
const STAGING_JSON = path.join(STAGING_DIR, 'staging_raw_exercises.json');
const STAGING_DB = path.join(STAGING_DIR, 'staging.db');

if (!fs.existsSync(STAGING_DIR)) {
  fs.mkdirSync(STAGING_DIR, { recursive: true });
}

interface RawExerciseCandidate {
  raw_source: string;
  original_id?: string | number;
  name: string;
  name_en?: string;
  name_ar?: string;
  category?: string;
  body_part?: string;
  target_muscle?: string;
  secondary_muscles?: string[];
  equipment?: string;
  level?: string;
  instructions?: string[] | string;
  description?: string;
  image_urls?: string[];
  gif_url?: string;
  video_url?: string;
  common_mistakes?: string[];
}

// Helper to fetch JSON safely
function fetchRawJson(url: string, timeoutMs = 20000): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'BeastMode-OpenData-Sync/1.0', 'Accept': 'application/json' } }, (res) => {
      // Handle redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchRawJson(res.headers.location, timeoutMs));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }

      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`JSON Parse Error for ${url}: ${e}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

// 1. Free-Exercise-DB
async function fetchFreeExerciseDB(): Promise<RawExerciseCandidate[]> {
  console.log('📡 [Source 1/3] Fetching Free-Exercise-DB (GitHub Raw)...');
  const url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

  try {
    const data = await fetchRawJson(url);
    if (Array.isArray(data)) {
      console.log(`   ✓ Free-Exercise-DB retrieved: ${data.length} exercises.`);
      return data.map((item: any) => ({
        raw_source: 'Free-Exercise-DB',
        original_id: item.id,
        name: item.name,
        name_en: item.name,
        category: item.category || 'strength',
        target_muscle: item.primaryMuscles?.[0] || '',
        secondary_muscles: item.secondaryMuscles || [],
        equipment: item.equipment || 'bodyweight',
        level: item.level || 'beginner',
        instructions: item.instructions || [],
        image_urls: (item.images || []).map((img: string) => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`),
      }));
    }
  } catch (err: any) {
    console.warn(`   ⚠️ Warning fetching Free-Exercise-DB: ${err.message}`);
  }
  return [];
}

// 2. wger Open Workout Database API
async function fetchWgerOpenData(): Promise<RawExerciseCandidate[]> {
  console.log('📡 [Source 2/3] Fetching wger Open Database (100% Free Public API)...');
  const url = 'https://wger.de/api/v2/exercise/?language=2&limit=1000';

  try {
    const data = await fetchRawJson(url);
    if (data && Array.isArray(data.results)) {
      console.log(`   ✓ wger open database retrieved: ${data.results.length} exercises.`);
      return data.results.map((item: any) => {
        // Strip HTML from description
        const cleanDesc = (item.description || '').replace(/<[^>]*>?/gm, '').trim();
        return {
          raw_source: 'wger-OpenData',
          original_id: item.id,
          name: item.name,
          name_en: item.name,
          description: cleanDesc,
          category: 'strength',
          target_muscle: String(item.category || ''),
          equipment: item.equipment?.length > 0 ? String(item.equipment[0]) : 'bodyweight',
        };
      });
    }
  } catch (err: any) {
    console.warn(`   ⚠️ wger fetch note: ${err.message}`);
  }
  return [];
}

// 3. Existing Enriched BeastMode Baseline Catalog
function loadExistingBeastModeBaseline(): RawExerciseCandidate[] {
  console.log('📡 [Source 3/3] Loading current BeastMode baseline dataset...');
  const catalogPath = path.join(__dirname, '../../../frontend/public/exercises_catalog.json');

  if (fs.existsSync(catalogPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      console.log(`   ✓ BeastMode Catalog baseline loaded: ${data.length} exercises.`);
      return data.map((item: any) => ({
        raw_source: item.source || 'BeastMode-Enriched-Baseline',
        original_id: item.id,
        name: item.name_en || item.name,
        name_en: item.name_en,
        name_ar: item.name_ar,
        target_muscle: item.muscle_en,
        secondary_muscles: typeof item.secondary_muscles_en === 'string' ? item.secondary_muscles_en.split(',') : (item.secondary_muscles_en || []),
        equipment: item.equipment_en,
        level: item.level,
        category: item.category,
        instructions: item.instructions_en || item.instructions_ar,
        image_urls: item.image_url ? [item.image_url] : [],
        gif_url: item.gif_url,
        video_url: item.youtube_url,
        common_mistakes: typeof item.common_mistakes_en === 'string' ? item.common_mistakes_en.split(',') : (item.common_mistakes_en || []),
      }));
    } catch (e) {
      console.warn('   ⚠️ Error reading catalog:', e);
    }
  }
  return [];
}

// Main Execution for Phase 1
async function runPhase1() {
  console.log('\n=============================================================');
  console.log('🚀 [PHASE 1] OPEN EXERCISE DATA EXTRACTION & STAGING AREA');
  console.log('=============================================================\n');

  const baseline = loadExistingBeastModeBaseline();
  const freeEx = await fetchFreeExerciseDB();
  const wger = await fetchWgerOpenData();

  const allStaged: RawExerciseCandidate[] = [
    ...baseline,
    ...freeEx,
    ...wger,
  ];

  console.log(`\n📦 Total Raw Candidate Records Collected: ${allStaged.length}`);

  // Summary per source
  const sourceCounts: Record<string, number> = {};
  allStaged.forEach((item) => {
    sourceCounts[item.raw_source] = (sourceCounts[item.raw_source] || 0) + 1;
  });

  console.log('\n📊 Breakdown by Open Source:');
  Object.entries(sourceCounts).forEach(([src, count]) => {
    console.log(`   - ${src.padEnd(30)}: ${count} records`);
  });

  // Save Staging JSON
  fs.writeFileSync(STAGING_JSON, JSON.stringify(allStaged, null, 2));
  console.log(`\n💾 Saved unified staging JSON: ${STAGING_JSON} (${(fs.statSync(STAGING_JSON).size / (1024 * 1024)).toFixed(2)} MB)`);

  console.log('\n✨ [PHASE 1 COMPLETE] Ready for Phase 2 (Deduplication & Intelligent Matching).');
}

runPhase1();
