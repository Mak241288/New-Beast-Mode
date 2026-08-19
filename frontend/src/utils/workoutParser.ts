/**
 * BeastMode AI Workout Plan Text Parser
 * High-accuracy multi-day workout routine parser supporting rich Arabic & English formats.
 */

export interface ParsedExercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  targetMuscle: string;
  notes?: string;
  isTimed?: boolean;
}

export interface ParsedDayWorkout {
  id: number;
  dayIndex: number;
  title: string;
  focusArea: string;
  isRestDay: boolean;
  exercises: ParsedExercise[];
}

export interface ParsedWorkoutPlan {
  id: number;
  title: string;
  active: boolean;
  durationWeeks: number;
  startDate: string;
  weeklyTips: string;
  dayWorkouts: ParsedDayWorkout[];
  days: ParsedDayWorkout[];
}

function generateRandomId(): number {
  return Math.floor(Date.now() + Math.random() * 10000);
}

// Regex to identify Day Headers (Arabic & English)
export const DAY_HEADER_REGEX = /^(?:[#*•\-–—\d.)\]\s]*)(?:(?:اليوم\s*(?:الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|\d+))|(?:day\s*\d+)|(?:يوم\s*(?:الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة|السبت|\d+))|(?:الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة|السبت)|(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday))[:\-–—\s]*(.*)$/i;

// Regex to identify Rest Days
export const REST_KEYWORDS_REGEX = /(?:راحة|استراحة|استشفاء|عطلة|rest|recovery|off\s*day|day\s*off)/i;

/**
 * Infer primary muscle group from text (Arabic / English)
 */
export function inferMuscleGroup(text: string): string {
  const lower = (text || '').toLowerCase().trim();

  if (/صدر|بنش|chest|bench|pec|fly|pushup|press/i.test(lower)) return 'Chest';
  if (/ظهر|سحب|تجديف|لاتس|عقلة|back|lat|row|pullup|pulldown/i.test(lower)) return 'Back';
  if (/كتف|أكتاف|اكتاف|رفرفة|shoulder|deltoid|overhead|raise/i.test(lower)) return 'Shoulders';
  if (/ترابيس|شراجز|رقبة|traps|shrug/i.test(lower)) return 'Traps';
  if (/سكوات|رجل|أرجل|ارجل|أفخاذ|افخاذ|طعن|squat|leg|quad|lunge/i.test(lower)) return 'Quadriceps';
  if (/ديدليفت|خلفي|همسترنج|hamstring|deadlift|rdl/i.test(lower)) return 'Hamstrings';
  if (/أرداف|ارداف|مؤخرة|glute|hip|thrust|bridge/i.test(lower)) return 'Glutes';
  if (/بطات|سمانة|calf|calves/i.test(lower)) return 'Calves';
  if (/باي|بايسبس|ذراع|bicep|curl/i.test(lower)) return 'Biceps';
  if (/تراي|ترايسبس|ترايسب|tricep|dip|skullcrusher|pushdown/i.test(lower)) return 'Triceps';
  if (/ساعد|سواعد|قبضة|forearm|wrist/i.test(lower)) return 'Forearms';
  if (/بطن|بلانك|معدة|جذع|abs|core|plank|crunch|situp/i.test(lower)) return 'Abs';
  if (/كارديو|جري|دراجة|مشي|cardio|run|hiit|jump|bike/i.test(lower)) return 'Cardio';

  return 'General';
}

/**
 * Clean and normalize exercise name
 */
function cleanExerciseName(name: string): string {
  return name
    .replace(/^[\s\d.\-*•#()>\[\]]+/, '') // Remove leading numbers/bullets
    .replace(/[:：]/g, '') // Remove colons
    .replace(/\b(?:\d+\s*)?(?:جولات|مجموعات|sets|set)\b/gi, '') // Remove trailing "جولات" or "sets"
    .trim();
}

/**
 * Parse an individual exercise line with rich regex heuristics
 */
export function parseExerciseLine(rawLine: string, index: number): ParsedExercise | null {
  const trimmed = rawLine.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return null;

  // Clean leading bullets, numbers, hyphens, stars, checkboxes
  const cleanLine = trimmed.replace(/^[\s\d.\-*•#()>\[\]]+/, '').trim();
  if (!cleanLine) return null;

  let name = cleanLine;
  let sets = 3;
  let reps = '10-12';
  let targetMuscle = 'General';
  let isTimed = false;

  // Case A: Pipe delimited syntax
  // Examples:
  // "اسم التمرين: 2 جولات | 10-12 | Chest"
  // "بنش برس بالبار | 4 | 10-12 | صدر"
  // "بلانك | 3 | 45 ثانية | بطن"
  if (cleanLine.includes('|')) {
    const parts = cleanLine.split('|').map((p) => p.trim());

    // 1. Part 0: Exercise Name (which may optionally have sets like "بنش برس: 3 جولات")
    const rawName = parts[0];
    const nameSetsMatch = rawName.match(/^(.*?)(?:[:：]\s*|\s+)(\d+)\s*(?:جولات|مجموعات|sets|set)$/i);
    if (nameSetsMatch) {
      name = cleanExerciseName(nameSetsMatch[1]);
      sets = parseInt(nameSetsMatch[2], 10) || 3;
    } else {
      name = cleanExerciseName(rawName);
    }

    // 2. Part 1: Sets or Reps
    if (parts.length >= 2 && parts[1]) {
      const part1 = parts[1];
      const part1SetsMatch = part1.match(/(\d+)\s*(?:جولات|مجموعات|sets|set)?/i);
      const isPart1Reps = /(\d+(?:-\d+)?)\s*(?:تكرار|تكرارات|عدات|عدّة|عدة|ثانية|دقيقة|s|sec|min|reps|rep)/i.test(part1) || part1.includes('-');

      if (isPart1Reps) {
        reps = part1.trim();
        if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
      } else if (part1SetsMatch) {
        const parsedSets = parseInt(part1SetsMatch[1], 10);
        if (!isNaN(parsedSets) && parsedSets > 0) sets = parsedSets;
      }
    }

    // 3. Part 2: Reps / Time
    if (parts.length >= 3 && parts[2]) {
      reps = parts[2].trim();
      if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
    }

    // 4. Part 3: Muscle / Category
    if (parts.length >= 4 && parts[3]) {
      targetMuscle = inferMuscleGroup(parts[3]);
    } else {
      targetMuscle = inferMuscleGroup(name);
    }

    return {
      id: generateRandomId() + index,
      name: name || 'Exercise',
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // Case B: Colon / Natural syntax
  // Examples:
  // "سكوات بالبار: 4 جولات 10-12 تكرار"
  // "بنش مستوي: 3x12"
  // "بلانك: 3 جولات 45 ثانية"
  // "Bench Press: 3 sets of 10-12 reps"
  const colonMatch = cleanLine.match(/^([^:：]+)[:：]\s*(.+)$/);
  if (colonMatch) {
    name = cleanExerciseName(colonMatch[1]);
    const details = colonMatch[2].trim();

    // Check for "4x10-12" or "3 × 12" or "3*15" (preserving ranges like 10-12 without merging)
    const multMatch = details.match(/(\d+)\s*[x×*]\s*(\d+(?:-\d+)?\s*(?:ثانية|دقيقة|s|sec|min|تكرار|عدات|عدّة|عدة|reps|rep)?)/i);
    if (multMatch) {
      sets = parseInt(multMatch[1], 10) || sets;
      reps = multMatch[2].trim() || reps;
      if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
    } else {
      // Check for "4 جولات 10-12 تكرار" or "3 sets 12 reps"
      const setsMatch = details.match(/(\d+)\s*(?:جولات|مجموعات|sets|set)/i);
      const repsMatch = details.match(/(\d+(?:-\d+)?)\s*(?:تكرار|تكرارات|عدات|عدّة|عدة|ثانية|دقيقة|s|sec|min|reps|rep)/i);

      if (setsMatch) sets = parseInt(setsMatch[1], 10) || sets;
      if (repsMatch) {
        reps = repsMatch[1].trim();
        if (/ثانية|دقيقة|s|sec|min/i.test(details)) isTimed = true;
      }
    }

    targetMuscle = inferMuscleGroup(name + ' ' + details);
    return {
      id: generateRandomId() + index,
      name: name || 'Exercise',
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // Case C: Multiplier syntax without colon
  // Examples: "Squat 4x10-12", "بنش برس 3 × 12", "Dumbbell Curl 3x10"
  const inlineMultMatch = cleanLine.match(/^(.+?)\s+(\d+)\s*[x×*]\s*(\d+(?:-\d+)?\s*(?:ثانية|دقيقة|s|sec|min|تكرار|عدات|reps|rep)?)$/i);
  if (inlineMultMatch) {
    name = cleanExerciseName(inlineMultMatch[1]);
    sets = parseInt(inlineMultMatch[2], 10) || 3;
    reps = inlineMultMatch[3].trim() || '10-12';
    if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
    targetMuscle = inferMuscleGroup(name);

    return {
      id: generateRandomId() + index,
      name: name || 'Exercise',
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // Case D: Descriptive Arabic syntax
  // Example: "بنش برس 4 جولات 10-12 تكرار"
  const arabicDescMatch = cleanLine.match(/^(.+?)\s+(\d+)\s*(?:جولات|مجموعات)\s*(?:و)?\s*(\d+(?:-\d+)?\s*(?:تكرار|عدات|ثانية|دقيقة)?)$/i);
  if (arabicDescMatch) {
    name = cleanExerciseName(arabicDescMatch[1]);
    sets = parseInt(arabicDescMatch[2], 10) || 3;
    reps = arabicDescMatch[3].trim() || '10-12';
    if (/ثانية|دقيقة/i.test(reps)) isTimed = true;
    targetMuscle = inferMuscleGroup(name);

    return {
      id: generateRandomId() + index,
      name: name || 'Exercise',
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // Case E: Simple exercise line fallback
  name = cleanExerciseName(cleanLine);
  targetMuscle = inferMuscleGroup(name);
  return {
    id: generateRandomId() + index,
    name: name || 'Exercise',
    sets: 3,
    reps: '10-12',
    weight: 'Bodyweight',
    targetMuscle,
    isTimed: /بلانك|plank|جري|run|cardio|ثبات/i.test(name),
  };
}

/**
 * Main Workout Parser: converts raw multi-day text into a complete 7-day structured WorkoutPlan
 */
export function parseBulkWorkoutText(rawText: string, lang: 'ar' | 'en' = 'ar'): ParsedWorkoutPlan {
  const lines = (rawText || '').split('\n').map((l) => l.trim()).filter(Boolean);

  interface DayBucket {
    header: string;
    explicitIndex?: number;
    lines: string[];
    isRest: boolean;
  }

  const dayBuckets: DayBucket[] = [];
  let currentBucket: DayBucket | null = null;

  for (const line of lines) {
    const isDayHeader = DAY_HEADER_REGEX.test(line);

    if (isDayHeader) {
      // Check if explicit day index exists (e.g. "اليوم 2" or "Day 3")
      const numMatch = line.match(/(?:اليوم|day)\s*(\d+)/i);
      const explicitIndex = numMatch ? parseInt(numMatch[1], 10) : undefined;
      const isRest = REST_KEYWORDS_REGEX.test(line);

      currentBucket = {
        header: line,
        explicitIndex,
        lines: [],
        isRest,
      };
      dayBuckets.push(currentBucket);
    } else {
      if (!currentBucket) {
        // If lines start before any Day Header, create Day 1 automatically
        currentBucket = {
          header: lang === 'en' ? 'Day 1: Workout' : 'اليوم 1: تمارين الجدول',
          explicitIndex: 1,
          lines: [],
          isRest: false,
        };
        dayBuckets.push(currentBucket);
      }
      currentBucket.lines.push(line);
    }
  }

  // Convert buckets into ParsedDayWorkout objects
  const parsedDayWorkouts: ParsedDayWorkout[] = dayBuckets.map((bucket, bIdx) => {
    const dayIndex = bucket.explicitIndex || (bIdx + 1);
    const isRestDay = bucket.isRest || (bucket.lines.length > 0 && bucket.lines.every((l) => REST_KEYWORDS_REGEX.test(l)));

    // Clean title
    let title = bucket.header
      .replace(/^[\s\d.\-*•#()>\[\]]+/, '')
      .replace(/[:：]$/, '')
      .trim();

    if (!title) {
      title = lang === 'en' ? `Day ${dayIndex}` : `اليوم ${dayIndex}`;
    }

    if (isRestDay) {
      return {
        id: generateRandomId() + dayIndex,
        dayIndex,
        title: title.includes('راحة') || title.toLowerCase().includes('rest') ? title : `${title} (${lang === 'en' ? 'Rest Day' : 'يوم راحة'})`,
        focusArea: lang === 'en' ? 'Rest & Recovery' : 'راحة واستشفاء',
        isRestDay: true,
        exercises: [],
      };
    }

    const exercises: ParsedExercise[] = [];
    bucket.lines.forEach((line, lIdx) => {
      // If line is just "راحة", skip adding as an exercise
      if (REST_KEYWORDS_REGEX.test(line) && line.length < 25) return;

      const parsed = parseExerciseLine(line, lIdx);
      if (parsed) {
        exercises.push(parsed);
      }
    });

    // Derive focus area from parsed exercises
    const musclesCount: Record<string, number> = {};
    exercises.forEach((ex) => {
      musclesCount[ex.targetMuscle] = (musclesCount[ex.targetMuscle] || 0) + 1;
    });

    const topMuscles = Object.entries(musclesCount)
      .sort((a, b) => b[1] - a[1])
      .map(([m]) => m)
      .filter((m) => m !== 'General');

    const focusArea = topMuscles.length > 0 ? topMuscles.slice(0, 2).join(' & ') : 'Full Body';

    return {
      id: generateRandomId() + dayIndex,
      dayIndex,
      title,
      focusArea,
      isRestDay: exercises.length === 0,
      exercises,
    };
  });

  // Ensure full 7-day array (Days 1 to 7)
  const full7Days: ParsedDayWorkout[] = [];
  for (let i = 1; i <= 7; i++) {
    const existing = parsedDayWorkouts.find((d) => d.dayIndex === i) || parsedDayWorkouts[i - 1];
    if (existing && !full7Days.some((d) => d.dayIndex === i)) {
      full7Days.push({
        ...existing,
        dayIndex: i,
      });
    } else {
      // Fill missing days up to 7 as Rest Days
      full7Days.push({
        id: generateRandomId() + i,
        dayIndex: i,
        title: lang === 'en' ? `Day ${i}: Rest Day` : `اليوم ${i}: يوم راحة واستشفاء`,
        focusArea: lang === 'en' ? 'Rest & Recovery' : 'راحة واستشفاء',
        isRestDay: true,
        exercises: [],
      });
    }
  }

  // Sort strictly by dayIndex 1..7
  full7Days.sort((a, b) => a.dayIndex - b.dayIndex);

  const parsedPlan: ParsedWorkoutPlan = {
    id: generateRandomId(),
    title: lang === 'en' ? 'Custom Imported Plan' : 'جدول تدريب مستورد ومخصص',
    active: true,
    durationWeeks: 4,
    startDate: new Date().toISOString(),
    weeklyTips: lang === 'en' ? 'Smartly parsed across 7 structured days' : 'تم تجزئة هذا الجدول وتوزيعه بدقة على 7 أيام تدريب واستشفاء.',
    dayWorkouts: full7Days,
    days: full7Days,
  };

  return parsedPlan;
}
