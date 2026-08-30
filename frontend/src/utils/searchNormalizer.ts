/**
 * Arabic & English Text Normalizer & Comprehensive Exercise Phonetic Dictionary
 * Handles spell tolerance, diacritics removal, prefix stripping, and Arabic/English normalization
 */

// Normalize Arabic & English text for fuzzy matching
export const normalizeSearchText = (text: string): string => {
  if (!text) return '';
  
  let str = text.trim().toLowerCase();

  // Arabic Normalization rules
  str = str
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'ء')
    .replace(/ئ/g, 'ي')
    .replace(/[\u064B-\u0652]/g, ''); // Remove Arabic Tashkeel / Diacritics

  // Strip special symbols except spaces
  str = str.replace(/[^\w\s\u0600-\u06FF]/g, '');

  return str;
};

// Exercise Phonetic & Popular Synonym Aliases Dictionary
export const EXERCISE_ALIASES_MAP: { [key: string]: string[] } = {
  squat: ['skwat', 'سكوات', 'سقوات', 'جوبلت', 'القرفصاء', 'تمرن رجل', 'ارجل', 'فخذ', 'رجلين', 'سكوات بار', 'هاك سكوات'],
  bench: ['bnch', 'بنش', 'بنش برس', 'صدر مستوى', 'صدر مستوي', 'ضغط صدر', 'بنش بار', 'بنش دمبل', 'صدر علوي', 'انكلاين'],
  chest: ['صدر', 'الصدر', 'بنش', 'تجميع', 'فراشة', 'تفتيح', 'ضغط صدر', 'بيكتشر', 'pec', 'chest press'],
  deadlift: ['ديدليفت', 'ديد لفت', 'رفعة ميتة', 'الرفعة الميتة', 'سحب ظهر', 'ديدلفت رماني', 'رومانيان'],
  back: ['ظهر', 'الظهر', 'سحب', 'لت بول داون', 'سحب عريض', 'سحب ارضي', 'سحب ضيق', 'روينج', 'تجديف', 'تي بار'],
  pullup: ['بول اب', 'عقلة', 'العقلة', 'سحب عقلة', 'عقله'],
  pushup: ['بوش اب', 'ضغط', 'تمرين ضغط', 'ضغط أرضي'],
  curl: ['كرل', 'كيرل', 'بايسبس', 'باي', 'سواعد', 'تمرين باي', 'تبادل', 'هامر', 'شاكوش', 'باي دمبل', 'باي بار'],
  biceps: ['باي', 'بايسبس', 'عضلة الباي', 'كيرل', 'كرل', 'تبادل'],
  triceps: ['تراي', 'ترايسبس', 'عضلة التراي', 'اوفر هيد', 'دبس', 'غطس', 'حبل تراي', 'بوش داون', 'سكال كراشر'],
  extension: ['اكستنشن', 'ترايسبس', 'تراي', 'امتداد', 'تمرين تراي', 'ليج اكستنشن', 'رفس'],
  lunge: ['لنجز', 'لانجز', 'طعن', 'تمرين الطعن', 'خطوات'],
  shoulder: ['شولدر', 'شولدر برس', 'ضغط اكتاف', 'كتف', 'أكتاف', 'اكتاف', 'رفرفة', 'جانبي', 'امامي', 'خلفي', 'دلتويد'],
  fly: ['فراشة', 'تجميع', 'فتحات صدر', 'تفتيح', 'فلاي'],
  abs: ['بطن', 'البطن', 'معدة', 'عضلات البطن', 'كرانش', 'بلانك', 'خواصر', 'سكس باك'],
  calves: ['سمانة', 'بطات', 'السمانة', 'ربلة'],
  legs: ['ارجل', 'رجلين', 'فخذ', 'كوادز', 'هامسترينج', 'خلفيات'],
  dumbbell: ['دمبل', 'دمبلز', 'دامبل', 'dumbbells'],
  barbell: ['بار', 'باربل', 'حديد'],
  cable: ['كيبل', 'كابل', 'حبل'],
};

// Generate enriched aliases array for an exercise item
export const getExerciseAliases = (nameEn: string, nameAr: string, muscleEn: string): string[] => {
  const aliases: string[] = [nameEn, nameAr];
  
  const normEn = normalizeSearchText(nameEn);
  const normAr = normalizeSearchText(nameAr);

  Object.entries(EXERCISE_ALIASES_MAP).forEach(([key, list]) => {
    if (normEn.includes(key) || normAr.includes(key)) {
      aliases.push(...list);
    }
  });

  if (muscleEn) {
    aliases.push(muscleEn);
    const normMuscle = normalizeSearchText(muscleEn);
    Object.entries(EXERCISE_ALIASES_MAP).forEach(([key, list]) => {
      if (normMuscle.includes(key)) {
        aliases.push(...list);
      }
    });
  }

  return Array.from(new Set(aliases));
};
