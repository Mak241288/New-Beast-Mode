/**
 * Global Memory Preloader for Today's Workout Routine
 * Pre-fetches and caches all 2-phase motion frames in RAM for instant 0ms rendering.
 */
const GLOBAL_PRELOADED_URLS = new Set<string>();

export function preloadWorkoutImages(exercises: any[]) {
  if (typeof window === 'undefined' || !Array.isArray(exercises) || exercises.length === 0) return;

  exercises.forEach((ex) => {
    const urlsToPreload: string[] = [];
    if (ex.image_url) urlsToPreload.push(ex.image_url);
    if (ex.gif_url) urlsToPreload.push(ex.gif_url);
    if (ex.step2_url) urlsToPreload.push(ex.step2_url);

    // If it has a 0.jpg, also preload 1.jpg
    const primaryUrl = ex.gif_url || ex.image_url || '';
    if (primaryUrl.includes('/0.jpg')) {
      urlsToPreload.push(primaryUrl.replace('/0.jpg', '/1.jpg'));
    }

    urlsToPreload.forEach((url) => {
      const cleanUrl = url.replace('raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/', 'cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/');
      if (cleanUrl && !GLOBAL_PRELOADED_URLS.has(cleanUrl)) {
        GLOBAL_PRELOADED_URLS.add(cleanUrl);
        const img = new Image();
        img.src = cleanUrl;
      }
    });
  });
}
