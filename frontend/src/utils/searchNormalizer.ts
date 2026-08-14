/**
 * Arabic & English Text Normalizer & Phonetic Aliases Helper
 * Handles spell tolerance, diacritics removal, and Arabic/English normalization
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
  squat: ['skwat', 'سكوات', 'سقوات', 'جوبلت', 'القرفصاء', 'تمرن رجل', 'ارجل'],
  bench: ['bnch', 'بنش', 'بنش برس', 'صدر مستوى', 'صدر مستوي', 'ضغط صدر'],
  deadlift: ['ديدليفت', 'ديد لفت', 'رفعة ميتة', 'الرفعة الميتة', 'سحب ظهر'],
  pullup: ['بول اب', 'عقلة', 'العقلة', 'سحب عقلة'],
  pushup: ['بوش اب', 'ضغط', 'تمرين ضغط', 'ضغط أرضي'],
  curl: ['كرل', 'بايسبس', 'باي', 'سواعد', 'تمرين باي'],
  extension: ['اكستنشن', 'ترايسبس', 'تراي', 'امتداد', 'تمرين تراي'],
  lunge: ['لنجز', 'لانجز', 'طعن', 'تمرين الطعن'],
  shoulder: ['شولدر', 'شولدر برس', 'ضغط اكتاف', 'كتف', 'أكتاف'],
  fly: ['فراشة', 'تجميع', 'فتحات صدر'],
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
  }

  return Array.from(new Set(aliases));
};
