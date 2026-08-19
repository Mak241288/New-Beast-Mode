/**
 * BeastMode AI Workout Plan Text Parser
 * High-accuracy parsing for multi-day workout routines in Arabic and English.
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
const DAY_HEADER_REGEX = /^(?:(?:\*{1,2}|#{1,4}|[-•])\s*)?(?:(?:اليوم\s*(?:الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|\d+))|(?:يوم\s*(?:الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة|السبت|\d+))|(?:الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة|السبت)|(?:Day\s*\d+)|(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday))[:\-–—\s]*(.*)$/i;

// Regex to identify Rest Days
const REST_KEYWORDS_REGEX = /(?:راحة|استراحة|استشفاء|عطلة|rest|recovery|off\s*day|day\s*off)/i;

/**
 * Infer primary muscle group from text
 */
export function inferMuscleGroup(text: string): string {
  const lower = (text || '').toLowerCase();

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
 * Parse an individual exercise line with rich regex heuristics
 */
export function parseExerciseLine(rawLine: string, index: number): ParsedExercise | null {
  const trimmed = rawLine.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return null;

  // Clean leading bullets, numbers, hyphens, stars
  const cleanLine = trimmed.replace(/^[\s\d.\-*•#()>]+/, '').trim();
  if (!cleanLine) return null;

  let name = cleanLine;
  let sets = 3;
  let reps = '10-12';
  let targetMuscle = 'General';
  let isTimed = false;

  // 1. Pipe delimited syntax: "اسم التمرين | عدد الجولات | التكرارات أو الوقت | الفئة/العضلة"
  if (cleanLine.includes('|')) {
    const parts = cleanLine.split('|').map((p) => p.trim());
    if (parts.length >= 1 && parts[0]) {
      name = parts[0];
    }
    if (parts.length >= 2 && parts[1]) {
      const parsedSets = parseInt(parts[1].replace(/\D/g, ''), 10);
      if (!isNaN(parsedSets) && parsedSets > 0) sets = parsedSets;
    }
    if (parts.length >= 3 && parts[2]) {
      reps = parts[2];
      if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
    }
    if (parts.length >= 4 && parts[3]) {
      targetMuscle = inferMuscleGroup(parts[3]);
    } else {
      targetMuscle = inferMuscleGroup(name);
    }

    return {
      id: generateRandomId() + index,
      name,
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // 2. Colon / Natural syntax: "بنش مستوي: 4 جولات 12 تكرار" or "Bench Press: 3x10" or "Plank: 3 sets 45s"
  const colonMatch = cleanLine.match(/^([^:：]+)[:：]\s*(.+)$/);
  if (colonMatch) {
    name = colonMatch[1].trim();
    const details = colonMatch[2].trim();

    // Check for "4x12" or "3 × 10" or "3*12"
    const multMatch = details.match(/(\d+)\s*[x×*]\s*(\d+(?:-\d+)?\s*(?:ثانية|دقيقة|s|sec|min|تكرار|عدات|عدّة|عدة|reps|rep)?)/i);
    if (multMatch) {
      sets = parseInt(multMatch[1], 10) || sets;
      reps = multMatch[2].trim() || reps;
      if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
    } else {
      // Check for "4 جولات 12 تكرار" or "3 sets of 10 reps"
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
      name,
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // 3. Multiplier syntax without colon: "Squat 4x10" or "بنش برس 3 × 12" or "بلانك 3 45s"
  const inlineMultMatch = cleanLine.match(/^(.+?)\s+(\d+)\s*[x×*]\s*(\d+(?:-\d+)?\s*(?:ثانية|دقيقة|s|sec|min|تكرار|عدات|reps|rep)?)$/i);
  if (inlineMultMatch) {
    name = inlineMultMatch[1].trim();
    sets = parseInt(inlineMultMatch[2], 10) || 3;
    reps = inlineMultMatch[3].trim() || '10-12';
    if (/ثانية|دقيقة|s|sec|min/i.test(reps)) isTimed = true;
    targetMuscle = inferMuscleGroup(name);

    return {
      id: generateRandomId() + index,
      name,
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // 4. Descriptive Arabic syntax: "بنش برس 4 مجموعات 12 تكرار"
  const arabicDescMatch = cleanLine.match(/^(.+?)\s+(\d+)\s*(?:جولات|مجموعات)\s*(?:و)?\s*(\d+(?:-\d+)?\s*(?:تكرار|عدات|ثانية)?)$/i);
  if (arabicDescMatch) {
    name = arabicDescMatch[1].trim();
    sets = parseInt(arabicDescMatch[2], 10) || 3;
    reps = arabicDescMatch[3].trim() || '10-12';
    if (/ثانية/i.test(reps)) isTimed = true;
    targetMuscle = inferMuscleGroup(name);

    return {
      id: generateRandomId() + index,
      name,
      sets,
      reps,
      weight: 'Bodyweight',
      targetMuscle,
      isTimed,
    };
  }

  // 5. Fallback: Clean line as exercise name
  targetMuscle = inferMuscleGroup(name);
  return {
    id: generateRandomId() + index,
    name,
    sets: 3,
    reps: '10-12',
    weight: 'Bodyweight',
    targetMuscle,
    isTimed: /بلانك|plank|جري|run|cardio/i.test(name),
  };
}

/**
 * Main Workout Parser: converts raw multi-day text into a complete structured WorkoutPlan
 */
export function parseBulkWorkoutText(rawText: string, lang: 'ar' | 'en' = 'ar'): ParsedWorkoutPlan {
  const lines = (rawText || '').split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    const emptyDay: ParsedDayWorkout = {
      id: generateRandomId(),
      dayIndex: 1,
      title: lang === 'en' ? 'Day 1: Full Body' : 'اليوم 1: تمرين شامل',
      focusArea: 'Full Body',
      isRestDay: false,
      exercises: [],
    };
    return {
      id: generateRandomId(),
      title: lang === 'en' ? 'Imported Workout Plan' : 'جدول تدريب مستورد',
      active: true,
      durationWeeks: 4,
      startDate: new Date().toISOString(),
      weeklyTips: lang === 'en' ? 'Imported from custom text' : 'تم استيراد هذا الجدول من نص مخصص.',
      dayWorkouts: [emptyDay],
      days: [emptyDay],
    };
  }

  interface DayBucket {
    header: string;
    subTitle?: string;
    lines: string[];
    isRest: boolean;
  }

  const dayBuckets: DayBucket[] = [];
  let currentBucket: DayBucket | null = null;

  for (const line of lines) {
    const isDayHeader = DAY_HEADER_REGEX.test(line);

    if (isDayHeader) {
      const isRest = REST_KEYWORDS_REGEX.test(line);
      currentBucket = {
        header: line,
        lines: [],
        isRest,
      };
      dayBuckets.push(currentBucket);
    } else {
      if (!currentBucket) {
        // If lines start without a Day Header, create Day 1 automatically
        currentBucket = {
          header: lang === 'en' ? 'Day 1: Workout Routine' : 'اليوم 1: تمارين الجدول',
          lines: [],
          isRest: false,
        };
        dayBuckets.push(currentBucket);
      }
      currentBucket.lines.push(line);
    }
  }

  // Convert buckets into ParsedDayWorkout objects
  const dayWorkouts: ParsedDayWorkout[] = dayBuckets.map((bucket, bIdx) => {
    const dayIndex = bIdx + 1;
    const isRestDay = bucket.isRest || (bucket.lines.length === 1 && REST_KEYWORDS_REGEX.test(bucket.lines[0]));

    // Extract clean day title
    let title = bucket.header;
    if (!title) {
      title = lang === 'en' ? `Day ${dayIndex}` : `اليوم ${dayIndex}`;
    }

    if (isRestDay) {
      return {
        id: generateRandomId() + dayIndex,
        dayIndex,
        title: title.includes('راحة') || title.toLowerCase().includes('rest') ? title : `${title} (${lang === 'en' ? 'Rest Day' : 'يوم راحة'})`,
        focusArea: 'Rest & Recovery',
        isRestDay: true,
        exercises: [],
      };
    }

    const exercises: ParsedExercise[] = [];
    bucket.lines.forEach((line, lIdx) => {
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
      isRestDay: false,
      exercises,
    };
  });

  const parsedPlan: ParsedWorkoutPlan = {
    id: generateRandomId(),
    title: lang === 'en' ? 'Custom Imported Plan' : 'جدول تدريب مستورد ومخصص',
    active: true,
    durationWeeks: 4,
    startDate: new Date().toISOString(),
    weeklyTips: lang === 'en' ? 'Smartly parsed from text bulk import' : 'تم تجزئة هذا الجدول وترتيبه بدقة من النص المستورد.',
    dayWorkouts,
    days: dayWorkouts,
  };

  return parsedPlan;
}
