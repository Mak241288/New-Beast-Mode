import db from './db';
import { logger } from './logger';

export const syncService = {
  /**
   * Syncs exercises from ExerciseDB, Wger API, and Yoga API into local database
   */
  async syncAllExercises(rapidApiKey?: string): Promise<{
    success: boolean;
    count: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let totalSynced = 0;
    const apiKey = rapidApiKey || process.env.RAPIDAPI_KEY || '';

    // --- 1. ExerciseDB Sync (via RapidAPI) ---
    if (apiKey && apiKey !== 'YOUR_RAPIDAPI_KEY_HERE') {
      try {
        logger.info('[SyncService] Fetching from ExerciseDB (RapidAPI)...');
        const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=300', {
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
          },
        });

        if (!response.ok) {
          throw new Error(`ExerciseDB API responded with HTTP ${response.status}`);
        }

        const data: any = await response.json();
        if (Array.isArray(data)) {
          logger.info(`[SyncService] Fetched ${data.length} exercises from ExerciseDB. Syncing...`);
          for (const item of data) {
            try {
              const category = item.equipment?.toLowerCase() === 'body weight' ? 'CALISTHENICS' : 'IRON';
              const name = `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} (ExerciseDB)`;
              const instructions = Array.isArray(item.instructions)
                ? item.instructions.join('\n')
                : item.description || '';

              const payload = {
                targetMuscle: `${item.target} (Bodypart: ${item.bodyPart})`,
                category,
                description: instructions,
                imageUrl: item.gifUrl || null,
                videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.name)}+shorts`,
              };

              const existing = await db.exerciseLibrary.findFirst({ where: { name } });
              if (existing) {
                await db.exerciseLibrary.update({ where: { id: existing.id }, data: payload });
              } else {
                await db.exerciseLibrary.create({ data: { name, ...payload } });
              }
              totalSynced++;
            } catch (err: any) {
              logger.warn(`[SyncService] ExerciseDB Item sync error: ${item.name}`, err.message);
            }
          }
        }
      } catch (err: any) {
        errors.push(`ExerciseDB Sync Error: ${err.message}`);
        logger.error('[SyncService] ExerciseDB Sync Error:', err);
      }
    } else {
      logger.info('[SyncService] Skipping ExerciseDB sync: RAPIDAPI_KEY is not provided.');
    }

    // --- 2. Wger Workout Manager API Sync ---
    try {
      logger.info('[SyncService] Fetching from Wger Workout API...');
      const response = await fetch('https://wger.de/api/v2/exercise/?language=2&limit=40');
      if (response.ok) {
        const data: any = await response.json();
        if (data && Array.isArray(data.results)) {
          logger.info(`[SyncService] Fetched ${data.results.length} exercises from Wger API. Syncing...`);
          for (const item of data.results) {
            try {
              const name = `${item.name} (Wger)`;
              const descClean = item.description
                ? item.description.replace(/<[^>]*>/g, '').trim()
                : 'No description provided.';

              const payload = {
                targetMuscle: 'General Strength',
                category: 'IRON',
                description: descClean,
                imageUrl: null,
                videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.name)}+shorts`,
              };

              const existing = await db.exerciseLibrary.findFirst({ where: { name } });
              if (existing) {
                await db.exerciseLibrary.update({ where: { id: existing.id }, data: payload });
              } else {
                await db.exerciseLibrary.create({ data: { name, ...payload } });
              }
              totalSynced++;
            } catch (err: any) {
              logger.warn(`[SyncService] Wger Item sync error: ${item.name}`, err.message);
            }
          }
        }
      } else {
        throw new Error(`Wger API responded with HTTP ${response.status}`);
      }
    } catch (err: any) {
      errors.push(`Wger API Sync Error: ${err.message}`);
      logger.error('[SyncService] Wger Sync Error:', err);
    }

    // --- 3. Yoga API Sync ---
    // Try both: free Vercel Yoga API and RapidAPI Yoga API if keys exist
    let yogaFetched = false;

    // A. Free Yoga API first
    try {
      logger.info('[SyncService] Fetching from public Yoga API...');
      const response = await fetch('https://yoga-api-nrizg5byf-gullspoint.vercel.app/api/v1/poses');
      if (response.ok) {
        const data: any = await response.json();
        if (Array.isArray(data)) {
          logger.info(`[SyncService] Fetched ${data.length} poses from public Yoga API. Syncing...`);
          for (const pose of data) {
            try {
              const name = `${pose.english_name} - ${pose.sanskrit_name} (Yoga)`;
              const payload = {
                targetMuscle: 'Flexibility & Core',
                category: 'YOGA',
                description: pose.pose_description || pose.pose_benefits || 'Yoga pose for flexibility.',
                imageUrl: pose.url_png || pose.url_svg || null,
                videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(pose.english_name)}+yoga+shorts`,
              };

              const existing = await db.exerciseLibrary.findFirst({ where: { name } });
              if (existing) {
                await db.exerciseLibrary.update({ where: { id: existing.id }, data: payload });
              } else {
                await db.exerciseLibrary.create({ data: { name, ...payload } });
              }
              totalSynced++;
            } catch (err: any) {
              logger.warn(`[SyncService] Yoga Pose sync error: ${pose.english_name}`, err.message);
            }
          }
          yogaFetched = true;
        }
      }
    } catch (err: any) {
      logger.info('[SyncService] Public Yoga API failed, trying RapidAPI fallback...', err.message);
    }

    // B. RapidAPI Yoga Fallback (if public failed and we have key)
    if (!yogaFetched && apiKey && apiKey !== 'YOUR_RAPIDAPI_KEY_HERE') {
      try {
        logger.info('[SyncService] Fetching from Yoga API via RapidAPI...');
        const response = await fetch('https://yoga-poses8.p.rapidapi.com/poses', {
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'yoga-poses8.p.rapidapi.com',
          },
        });

        if (response.ok) {
          const data: any = await response.json();
          if (Array.isArray(data)) {
            logger.info(`[SyncService] Fetched ${data.length} poses from RapidAPI Yoga API. Syncing...`);
            for (const pose of data) {
              try {
                const name = `${pose.name} (Yoga)`;
                const payload = {
                  targetMuscle: 'Flexibility & Core',
                  category: 'YOGA',
                  description: pose.description || 'Yoga pose for stability and breathing.',
                  imageUrl: pose.image_url || null,
                  videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(pose.name)}+yoga+shorts`,
                };

                const existing = await db.exerciseLibrary.findFirst({ where: { name } });
                if (existing) {
                  await db.exerciseLibrary.update({ where: { id: existing.id }, data: payload });
                } else {
                  await db.exerciseLibrary.create({ data: { name, ...payload } });
                }
                totalSynced++;
              } catch (err: any) {
                logger.warn(`[SyncService] RapidAPI Yoga Pose sync error: ${pose.name}`, err.message);
              }
            }
            yogaFetched = true;
          }
        } else {
          throw new Error(`RapidAPI Yoga API responded with HTTP ${response.status}`);
        }
      } catch (err: any) {
        errors.push(`RapidAPI Yoga Sync Error: ${err.message}`);
        logger.error('[SyncService] RapidAPI Yoga Sync Error:', err);
      }
    }

    return {
      success: errors.length === 0,
      count: totalSynced,
      errors,
    };
  },
};
