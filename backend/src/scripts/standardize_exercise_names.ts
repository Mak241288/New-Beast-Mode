// @ts-nocheck
import path from 'path';
import fs from 'fs';

const JSON_CATALOG_PATH = path.join(__dirname, '../../../frontend/public/exercises_catalog.json');
const BACKUP_JSON_PATH = path.join(__dirname, '../../exercises_backup.json');
const MEDIA_PATCH_PATH = path.join(__dirname, '../../../workout_generator_python/database/exercise_media_patch.json');

interface PatternRule {
  en: RegExp;
  ar: string;
}

const CORE_MOVEMENTS: PatternRule[] = [
  // Bench / Push / Chest
  { en: /\bincline\s+(?:dumbbell|barbell|cable|smith|band)?\s*bench\s*press\b/i, ar: 'بنش برس مائل للأعلى' },
  { en: /\bdecline\s+(?:dumbbell|barbell|cable|smith|band)?\s*bench\s*press\b/i, ar: 'بنش برس مائل للأسفل' },
  { en: /\bclose[- ]grip\s+(?:barbell|dumbbell)?\s*bench\s*press\b/i, ar: 'بنش برس قبضة ضيقة' },
  { en: /\bbench\s*press\b/i, ar: 'بنش برس مستوي (ضغط الصدر)' },
  { en: /\bfloor\s*press\b/i, ar: 'ضغط الصدر على الأرض (فلور برس)' },
  { en: /\bchest\s*press\b/i, ar: 'ضغط الصدر' },
  { en: /\bpec\s*deck\b/i, ar: 'تجميع الصدر بجهاز الفراشة' },
  { en: /\bchest\s*fly(?:e?s)?\b/i, ar: 'تفتيح / تجميع الصدر' },
  { en: /\bcable\s*crossover\b/i, ar: 'تجميع الصدر بالكيبل (كروس أوفر)' },
  { en: /\bpush[- ]?up\b/i, ar: 'تمرين الضغط (بوش اب)' },
  { en: /\bchest\s*dip\b/i, ar: 'متوازي للصدر (دبس)' },
  { en: /\bdips?\b/i, ar: 'تمرين المتوازي (دبس)' },

  // Squats & Legs
  { en: /\bfront\s*squat\b/i, ar: 'سكوات أمامي' },
  { en: /\bgoblet\s*squat\b/i, ar: 'جوبلت سكوات' },
  { en: /\bhack\s*squat\b/i, ar: 'هاك سكوات' },
  { en: /\bzercher\s*squat\b/i, ar: 'زيرشر سكوات' },
  { en: /\bbox\s*squat\b/i, ar: 'سكوات على الصندوق' },
  { en: /\bsumo\s*squat\b/i, ar: 'سومو سكوات' },
  { en: /\bbulgarian\s*split\s*squat\b/i, ar: 'سكوات بلغاري منفصل' },
  { en: /\bsplit\s*squat\b/i, ar: 'سكوات منفصل' },
  { en: /\bpistol\s*squat\b/i, ar: 'بيستول سكوات (برجل واحدة)' },
  { en: /\bsissy\s*squat\b/i, ar: 'سيسي سكوات' },
  { en: /\bback\s*squat\b/i, ar: 'سكوات خلفي (قرفصاء)' },
  { en: /\bsquats?\b/i, ar: 'سكوات (قرفصاء)' },
  { en: /\bleg\s*press\b/i, ar: 'دفع الأرجل بالمكبس' },
  { en: /\bleg\s*extension\b/i, ar: 'فرد أرجل أمامي بالجهاز' },
  { en: /\bleg\s*curl\b/i, ar: 'ثني أرجل خلفي بالجهاز' },
  { en: /\bhamstring\s*curl\b/i, ar: 'مرجحة أوتار الركبة (أرجل خلفية)' },
  { en: /\bwalking\s*lunge\b/i, ar: 'طعن متقدم مشياً (لانجز)' },
  { en: /\breverse\s*lunge\b/i, ar: 'طعن خلفي (لانجز)' },
  { en: /\blunges?\b/i, ar: 'تمرين الطعن (لانجز)' },
  { en: /\bstep[- ]?up\b/i, ar: 'صعود على الصندوق (ستيب اب)' },
  { en: /\bhip\s*thrust\b/i, ar: 'هيب ثرست (دفع الحوض للأرداف)' },
  { en: /\bglute\s*bridge\b/i, ar: 'جسر الأرداف (جلوت بريدج)' },
  { en: /\bfrog\s*pump\b/i, ar: 'فروغ بمب للأرداف (تمرين الضفدع)' },
  { en: /\bstanding\s*calf\s*raise\b/i, ar: 'رفع السمانة واقفاً' },
  { en: /\bseated\s*calf\s*raise\b/i, ar: 'رفع السمانة جالساً' },
  { en: /\bcalf\s*raise\b/i, ar: 'رفع السمانة' },
  { en: /\btibialis\s*raise\b/i, ar: 'رفع مقدمة الساق (تيبياليس)' },

  // Deadlift & Back
  { en: /\bromanian\s*deadlift\b|\brdl\b/i, ar: 'ديدليفت روماني (أرجل خلفية)' },
  { en: /\bstiff[- ]leg(?:ged)?\s*deadlift\b/i, ar: 'ديدليفت بأرجل مستقيمة' },
  { en: /\bsumo\s*deadlift\b/i, ar: 'سومو ديدليفت' },
  { en: /\bdeadlifts?\b/i, ar: 'ديدليفت (رفعة ميتة)' },
  { en: /\brack\s*pull\b/i, ar: 'راك بول (سحب من الراك)' },
  { en: /\bgood\s*morning\b/i, ar: 'تمرين جود مورنينج للقطنية' },
  { en: /\blat\s*pulldown\b/i, ar: 'سحب عالي للظهر (لاتس)' },
  { en: /\bstraight[- ]arm\s*pulldown\b/i, ar: 'سحب مستقيم بالكيبل للظهر' },
  { en: /\bpull[- ]?up\b/i, ar: 'سحب عقلة (قبضة علوية)' },
  { en: /\bchin[- ]?up\b/i, ar: 'سحب عقلة (قبضة معكوسة)' },
  { en: /\bt[- ]bar\s*row\b/i, ar: 'تجديف تي بار للظهر' },
  { en: /\bseated\s*(?:cable)?\s*row\b/i, ar: 'سحب أرضي للظهر بالكيبل' },
  { en: /\bbent[- ]over\s*row\b/i, ar: 'تجديف منحني للظهر' },
  { en: /\bmeadows\s*row\b/i, ar: 'ميدوز رو باللاندماين للظهر' },
  { en: /\binverted\s*row\b/i, ar: 'تجديف معكوس بوزن الجسم' },
  { en: /\blandmine\s*(?:pull\s*and\s*press|press|row)\b/i, ar: 'تمرين اللاندماين' },
  { en: /\browing\b|\brows?\b/i, ar: 'تجديف للظهر (رو)' },
  { en: /\bshrugs?\b/i, ar: 'هز أكتاف للترابيس (شراجز)' },
  { en: /\bface\s*pull\b/i, ar: 'سحب حبل للوجه (فيس بول)' },
  { en: /\bhyperextension\b|\bback\s*extension\b/i, ar: 'تمديد أسفل الظهر على المقعد' },
  { en: /\bpull[- ]apart\b/i, ar: 'إبعاد الحبل للكتف الخلفي' },

  // Shoulders
  { en: /\bmilitary\s*press\b/i, ar: 'ضغط أكتاف عسكري واقفاً' },
  { en: /\barnold\s*press\b/i, ar: 'أرنولد برس للأكتاف' },
  { en: /\bshoulder\s*press\b|\boverhead\s*press\b/i, ar: 'ضغط أكتاف علوي' },
  { en: /\blateral\s*raise\b|\bside\s*raise\b/i, ar: 'رفرفة كتف جانبي' },
  { en: /\bfront\s*raise\b/i, ar: 'رفرفة كتف أمامي' },
  { en: /\brear\s*delt\s*(?:flye?s?|raise)\b|\breverse\s*flye?s?\b/i, ar: 'رفرفة كتف خلفي' },
  { en: /\bupright\s*row\b/i, ar: 'سحب عمودي للكتف والترابيس' },

  // Arms: Biceps & Triceps & Forearms
  { en: /\bhammer\s*curl\b/i, ar: 'هامر كيرل (مطرقة للباي والساعد)' },
  { en: /\bpreacher\s*curl\b/i, ar: 'كيرل بايسبس على بنش سكوت (الواعظ)' },
  { en: /\bspider\s*curl\b/i, ar: 'سبايدر كيرل بايسبس على بنش مائل' },
  { en: /\bconcentration\s*curl\b/i, ar: 'كيرل بايسبس تركيز' },
  { en: /\bincline\s*(?:dumbbell)?\s*curl\b/i, ar: 'كيرل بايسبس على بنش مائل' },
  { en: /\breverse\s*curl\b/i, ar: 'كيرل بايسبس بقبضة معكوسة' },
  { en: /\bbiceps?\s*curl\b|\bcurls?\b/i, ar: 'كيرل بايسبس' },
  { en: /\bskull\s*crushers?\b|\bskullcrushers?\b/i, ar: 'ترايسبس بار نائم (سحق الجمجمة)' },
  { en: /\brope\s*pushdown\b/i, ar: 'دفع ترايسبس بالحبل لأسفل' },
  { en: /\btriceps?\s*pushdown\b/i, ar: 'دفع ترايسبس بالكيبل لأسفل' },
  { en: /\btriceps?\s*extension\b/i, ar: 'مد ترايسبس علوي' },
  { en: /\btriceps?\s*kickback\b/i, ar: 'ترايسبس كيك باك للخلف' },
  { en: /\bwrist\s*curl\b/i, ar: 'ثني المعصم للسواعد' },

  // Core & Abs
  { en: /\bhanging\s*leg\s*raise\b/i, ar: 'رفع الأرجل على العقلة للبطن' },
  { en: /\bleg\s*raise\b/i, ar: 'رفع الأرجل للبطن' },
  { en: /\brussian\s*twist\b/i, ar: 'اللف الروسي للخواصر' },
  { en: /\bplank\s*jack\b/i, ar: 'بلانك جاك الحركي' },
  { en: /\bside\s*plank\b/i, ar: 'بلانك جانبي للخواصر' },
  { en: /\bplanks?\b/i, ar: 'تمرين البلانك ثبات' },
  { en: /\bab\s*wheel\b|\broll[- ]?out\b/i, ar: 'دحرجة عجلة البطن' },
  { en: /\bcrunche?s?\b/i, ar: 'طحن البطن (كرنش)' },
  { en: /\bsit[- ]?ups?\b/i, ar: 'تمرين الجلوس للبطن (سيت اب)' },
  { en: /\bdead\s*bug\b/i, ar: 'تمرين الحشرة الميتة للكور' },
  { en: /\bbird\s*dog\b/i, ar: 'تمرين بيرد دوج للتوازن والعمود الفقري' },
  { en: /\bmountain\s*climbers?\b/i, ar: 'تمرين تسلق الجبل' },
  { en: /\bflutter\s*kicks\b/i, ar: 'ضربات الأرجل للبطن السفلي' },
  { en: /\bside\s*bend\b/i, ar: 'انحناء جانبي للخواصر' },
  { en: /\btwists?\b/i, ar: 'تمرين دوران الجذع والخواصر' },
  { en: /\bwood\s*chop(?:per)?\b/i, ar: 'تمرين تقطيع الخشب للخواصر' },

  // Functional / Cardio / Stretch
  { en: /\bkettlebell\s*swing\b/i, ar: 'أرجحة الكتلبل' },
  { en: /\bfarmer(?:'s)?\s*walk\b|\bcarry\b/i, ar: 'مشي الفلاح بحمل الأوزان' },
  { en: /\bturkish\s*get[- ]?up\b/i, ar: 'النهوض التركي بالكتلبل' },
  { en: /\bclean\s*and\s*(?:jerk|press)\b/i, ar: 'رفعة الكلين والضغط' },
  { en: /\bsnatch\b/i, ar: 'رفعة الخطف الأولمبية' },
  { en: /\bburpees?\b/i, ar: 'تمرين البوربي الشامل' },
  { en: /\bjumping\s*jacks?\b/i, ar: 'قفز جاكس للياقة' },
  { en: /\bbox\s*jump\b/i, ar: 'القفز على الصندوق' },
  { en: /\bbattle\s*ropes?\b/i, ar: 'حبال القوة للتحمل' },
  { en: /\bstretch\b|\bmobility\b/i, ar: 'إطالة واستشفاء عضلي' },
  { en: /\bfoam\s*roll(?:er|ing)?\b/i, ar: 'مساج وتفكيك بالفوم رولر' },
];

function getEquipmentSuffix(nameEn: string, equipEn: string): string {
  const n = (nameEn || '').toLowerCase();
  const e = (equipEn || '').toLowerCase();

  if (n.includes('dumbbell') || n.includes('db ') || e === 'dumbbell' || e === 'dumbbells') return 'بالدمبلز';
  if (n.includes('barbell') || n.includes('bb ') || e === 'barbell') return 'بالبار';
  if (n.includes('ez-bar') || n.includes('ez bar')) return 'بالبار المتعرج (EZ)';
  if (n.includes('trap bar') || n.includes('hex bar')) return 'بالتراب بار';
  if (n.includes('cable') || e === 'cable' || e === 'cables') return 'بالكيبل';
  if (n.includes('band') || n.includes('banded') || e === 'band' || e === 'bands') return 'بحبل المقاومة';
  if (n.includes('kettlebell') || n.includes('kb ') || e === 'kettlebell') return 'بالكتلبل';
  if (n.includes('smith machine') || n.includes('smith')) return 'بجهاز السمث';
  if (n.includes('machine') || n.includes('lever') || e === 'machine') return 'بالجهاز';
  if (n.includes('trx') || n.includes('suspension')) return 'بأحزمة TRX';
  if (n.includes('medicine ball') || n.includes('med ball')) return 'بالكرة الطبية';
  if (n.includes('stability ball') || n.includes('swiss ball') || n.includes('exercise ball')) return 'على كرة التوازن';
  if (n.includes('landmine')) return 'باللاندماين (بار أرضي)';
  if (n.includes('bodyweight') || e === 'bodyweight' || e === 'body weight') return 'بوزن الجسم';

  return '';
}

function getModifiers(nameEn: string): string[] {
  const n = (nameEn || '').toLowerCase();
  const mods: string[] = [];

  if (n.includes('single-arm') || n.includes('one-arm') || n.includes('single arm') || n.includes('one arm')) mods.push('بذراع واحدة');
  if (n.includes('single-leg') || n.includes('one-leg') || n.includes('single leg') || n.includes('one leg')) mods.push('برجل واحدة');
  if (n.includes('seated') && !n.includes('seated calf') && !n.includes('seated row') && !n.includes('seated leg')) mods.push('جالساً');
  if (n.includes('standing') && !n.includes('standing calf')) mods.push('واقفاً');
  if (n.includes('incline') && !n.includes('incline bench') && !n.includes('incline curl') && !n.includes('incline dumbbell')) mods.push('مائل للأعلى');
  if (n.includes('decline') && !n.includes('decline bench')) mods.push('مائل للأسفل');
  if (n.includes('close-grip') || n.includes('close grip') || n.includes('narrow-grip')) mods.push('قبضة ضيقة');
  if (n.includes('wide-grip') || n.includes('wide grip')) mods.push('قبضة واسعة');
  if (n.includes('reverse-grip') || n.includes('underhand') || n.includes('supinated')) mods.push('قبضة معكوسة');
  if (n.includes('neutral-grip') || n.includes('neutral grip')) mods.push('قبضة محايدة');
  if (n.includes('alternating') || n.includes('alternate')) mods.push('بالتبادل');
  if (n.includes('pause') || n.includes('isometric') || n.includes('hold')) mods.push('مع ثبات');
  if (n.includes('elevated')) mods.push('مرتفع');
  if (n.includes('deficit')) mods.push('من منصة عجز');

  return mods;
}

function getMuscleArabic(muscleEn: string): string {
  const m = (muscleEn || '').toLowerCase();
  if (m.includes('chest') || m.includes('pectoral')) return 'الصدر';
  if (m.includes('back') || m.includes('lat') || m.includes('rhomboid') || m.includes('trapezius')) return 'الظهر';
  if (m.includes('shoulder') || m.includes('deltoid')) return 'الأكتاف';
  if (m.includes('quad') || m.includes('thigh') || m.includes('adductor')) return 'الفخذ الأمامي (الكوادس)';
  if (m.includes('hamstring') || m.includes('glute')) return 'الفخذ الخلفي والأرداف';
  if (m.includes('bicep') || m.includes('brachii')) return 'الذراعين (بايسبس)';
  if (m.includes('tricep')) return 'الذراعين (ترايسبس)';
  if (m.includes('ab') || m.includes('core') || m.includes('oblique')) return 'البطن والجذع';
  if (m.includes('calf') || m.includes('calves') || m.includes('soleus')) return 'السمانة (البطات)';
  if (m.includes('forearm')) return 'السواعد';
  return 'عضلات الجسم';
}

export function translateExerciseName(nameEn: string, muscleEn: string, equipEn: string): string {
  if (!nameEn) return 'تمرين رياضي';

  // 1. Find Core Movement Match
  let baseArabic = '';
  for (const rule of CORE_MOVEMENTS) {
    if (rule.en.test(nameEn)) {
      baseArabic = rule.ar;
      break;
    }
  }

  // Fallback base
  if (!baseArabic) {
    const muscleAr = getMuscleArabic(muscleEn);
    baseArabic = `تمرين ${muscleAr}`;
  }

  // 2. Extract Equipment & Modifiers
  const equipSuffix = getEquipmentSuffix(nameEn, equipEn);
  const mods = getModifiers(nameEn);

  // 3. Assemble fluent Arabic sentence
  let parts: string[] = [baseArabic];

  mods.forEach(mod => {
    if (!baseArabic.includes(mod)) {
      parts.push(mod);
    }
  });

  if (equipSuffix && !baseArabic.includes(equipSuffix)) {
    parts.push(equipSuffix);
  }

  const finalAr = parts.join(' ').trim();
  return finalAr;
}

// Main execution function
async function run() {
  console.log('🚀 [Terminology Normalizer] Starting standard Arabic Gym name standardization...');
  
  let rows: any[] = [];
  if (fs.existsSync(BACKUP_JSON_PATH)) {
    const raw = fs.readFileSync(BACKUP_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    rows = Array.isArray(parsed) ? parsed : (parsed.exercises || []);
  } else if (fs.existsSync(JSON_CATALOG_PATH)) {
    const raw = fs.readFileSync(JSON_CATALOG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    rows = Array.isArray(parsed) ? parsed : (parsed.exercises || []);
  }

  console.log(`📊 Processing ${rows.length} exercises with comprehensive gym nomenclature...`);

  const updatedRows = rows.map(row => {
    const standardizedAr = translateExerciseName(row.name_en, row.muscle_en, row.equipment_en);
    const standardizedMuscleAr = getMuscleArabic(row.muscle_en);
    const rawEquip = getEquipmentSuffix(row.name_en, row.equipment_en).replace(/^بـ?|^بال/, '') || row.equipment_ar || 'أدوات الجيم';

    return {
      ...row,
      name_ar: standardizedAr,
      muscle_ar: standardizedMuscleAr,
      equipment_ar: rawEquip,
    };
  });

  // Write to exercises_catalog.json
  fs.writeFileSync(JSON_CATALOG_PATH, JSON.stringify(updatedRows, null, 2));
  console.log(`✅ [Frontend JSON] Saved ${updatedRows.length} standardized exercises to exercises_catalog.json!`);

  // Write to backup JSON
  fs.writeFileSync(BACKUP_JSON_PATH, JSON.stringify({ meta: { total: updatedRows.length }, exercises: updatedRows }, null, 2));
  console.log(`✅ [Backup JSON] Saved ${updatedRows.length} standardized exercises to exercises_backup.json!`);

  // Write to exercise_media_patch.json
  try {
    const patchContent = {
      total_exercises: updatedRows.length,
      updated_at: new Date().toISOString(),
      patch_data: updatedRows,
    };
    fs.writeFileSync(MEDIA_PATCH_PATH, JSON.stringify(patchContent, null, 2));
    console.log('✅ [Media Patch] Synchronized exercise_media_patch.json!');
  } catch (e) {
    console.warn('⚠️ Media patch sync skipped:', e);
  }

  // Print Samples
  console.log('\n--- 🌟 STANDARDIZED EXAMPLES SAMPLE ---');
  updatedRows.slice(0, 15).forEach(ex => {
    console.log(`🔹 EN: "${ex.name_en}"\n   AR: "${ex.name_ar}" (${ex.muscle_ar})\n`);
  });
}

run();
