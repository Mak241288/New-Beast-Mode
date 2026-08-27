import React, { useEffect, useMemo, memo } from 'react';
import { X, Play, Dumbbell, ShieldAlert, Youtube, Activity, Globe } from 'lucide-react';
import { ExerciseImage } from './ExerciseImage';
import { YouTubeEmbedPlayer } from './YouTubeEmbedPlayer';

export interface ExerciseItem {
  id?: string | number;
  name?: string;
  name_en?: string;
  name_ar?: string;
  muscle_en?: string;
  muscle_ar?: string;
  targetMuscle?: string;
  secondary_muscles_en?: string | string[];
  secondary_muscles_ar?: string | string[];
  equipment_en?: string;
  equipment_ar?: string;
  level?: string;
  instructions_en?: string | string[];
  instructions_ar?: string | string[];
  description_en?: string;
  description_ar?: string;
  common_mistakes_en?: string | string[];
  common_mistakes_ar?: string | string[];
  youtube_url?: string;
  video_url?: string;
  musclewiki_url?: string;
  image_url?: string;
  gif_url?: string;
  sets?: number | string;
  reps?: string;
  weight?: string;
  isHomeFriendly?: boolean;
  homeCategory?: string;
}

interface MuscleWikiModalProps {
  exercise: ExerciseItem | null;
  lang: 'ar' | 'en';
  onClose: () => void;
  onAddToPlan?: (exercise: ExerciseItem) => void;
}

// Built-in Interactive SVG Muscle Anatomy Diagram (Dual Front & Back Views)
const MuscleAnatomySVG: React.FC<{ muscle: string; uid: string; view?: 'front' | 'back' }> = memo(({ muscle, uid, view = 'front' }) => {
  const m = (muscle || '').toLowerCase();

  const isChest = m.includes('chest') || m.includes('صدر') || m.includes('pectoral');
  const isBack = m.includes('back') || m.includes('lat') || m.includes('ظهر') || m.includes('traps') || m.includes('ترابيس');
  const isLats = m.includes('lat') || m.includes('مجنص');
  const isTraps = m.includes('trap') || m.includes('ترابيس');
  const isShoulders = m.includes('shoulder') || m.includes('كتف') || m.includes('delt');
  const isArms = m.includes('bicep') || m.includes('tricep') || m.includes('arm') || m.includes('ذراع') || m.includes('بايسبس') || m.includes('ترايسبس') || m.includes('forearm') || m.includes('ساعد');
  const isBiceps = m.includes('bicep') || m.includes('باي');
  const isTriceps = m.includes('tricep') || m.includes('تراي');
  const isForearms = m.includes('forearm') || m.includes('ساعد');
  const isAbs = m.includes('ab') || m.includes('core') || m.includes('بطن') || m.includes('oblique');
  const isLegs = m.includes('leg') || m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('calves') || m.includes('رجل') || m.includes('فخذ') || m.includes('سمانة') || m.includes('مؤخرة');
  const isQuads = m.includes('quad') || m.includes('فخذ أمامي');
  const isHamstrings = m.includes('hamstring') || m.includes('فخذ خلفي');
  const isGlutes = m.includes('glute') || m.includes('مؤخرة') || m.includes('أرداف');
  const isCalves = m.includes('calf') || m.includes('calves') || m.includes('سمانة');

  const highlightColor = '#00d2ff';
  const secondaryColor = '#c084fc';
  const baseColor = '#1e293b';
  const bodyOutline = '#334155';

  const glowId = `glowG_${uid}`;
  const backId = `backG_${uid}`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg viewBox="0 0 200 230" style={{ width: '100%', height: '180px', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))' }}>
        <defs>
          <linearGradient id={glowId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>

        {view === 'front' ? (
          /* ANTERIOR (FRONT) VIEW */
          <g>
            {/* Head & Neck */}
            <circle cx="100" cy="22" r="14" fill={baseColor} stroke={bodyOutline} strokeWidth="1.5" />
            <path d="M 90 34 L 110 34 L 118 44 L 82 44 Z" fill={isTraps ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Front Shoulders (Anterior Deltoids) */}
            <path d="M 68 44 C 60 48, 56 60, 62 70 C 68 62, 74 52, 78 45 Z" fill={isShoulders ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 132 44 C 140 48, 144 60, 138 70 C 132 62, 126 52, 122 45 Z" fill={isShoulders ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Chest (Pectorals) */}
            <path d="M 80 46 C 88 46, 98 48, 98 64 C 88 64, 76 60, 80 46 Z" fill={isChest ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 120 46 C 112 46, 102 48, 102 64 C 112 64, 124 60, 120 46 Z" fill={isChest ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Biceps & Forearms */}
            <path d="M 58 72 C 54 85, 52 98, 58 108 C 64 98, 66 84, 62 72 Z" fill={(isBiceps || isArms) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 142 72 C 146 85, 148 98, 142 108 C 136 98, 134 84, 138 72 Z" fill={(isBiceps || isArms) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 56 110 L 48 140 L 56 142 L 62 112 Z" fill={isForearms ? highlightColor : (isArms ? secondaryColor : baseColor)} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 144 110 L 152 140 L 144 142 L 138 112 Z" fill={isForearms ? highlightColor : (isArms ? secondaryColor : baseColor)} stroke={bodyOutline} strokeWidth="1" />

            {/* Core / Abs & Obliques */}
            <path d="M 86 68 L 114 68 L 110 110 L 90 110 Z" fill={isAbs ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            {isAbs && (
              <>
                <line x1="100" y1="70" x2="100" y2="108" stroke="#060814" strokeWidth="1.5" />
                <line x1="90" y1="80" x2="110" y2="80" stroke="#060814" strokeWidth="1" />
                <line x1="90" y1="92" x2="110" y2="92" stroke="#060814" strokeWidth="1" />
                <line x1="92" y1="102" x2="108" y2="102" stroke="#060814" strokeWidth="1" />
              </>
            )}

            {/* Pelvis & Quads (Front Thighs) */}
            <path d="M 86 112 L 114 112 L 120 128 L 80 128 Z" fill={baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 82 130 C 78 150, 76 170, 84 185 C 92 170, 94 150, 96 130 Z" fill={(isQuads || (isLegs && !isHamstrings && !isGlutes)) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 118 130 C 122 150, 124 170, 116 185 C 108 170, 106 150, 104 130 Z" fill={(isQuads || (isLegs && !isHamstrings && !isGlutes)) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Calves (Front) */}
            <path d="M 83 188 C 80 198, 82 208, 86 215 L 91 215 C 93 206, 91 196, 88 188 Z" fill={isCalves ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 117 188 C 120 198, 118 208, 114 215 L 109 215 C 107 206, 109 196, 112 188 Z" fill={isCalves ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
          </g>
        ) : (
          /* POSTERIOR (BACK) VIEW */
          <g>
            {/* Head & Neck (Back) */}
            <circle cx="100" cy="22" r="14" fill={baseColor} stroke={bodyOutline} strokeWidth="1.5" />
            
            {/* Traps (Upper & Middle) */}
            <path d="M 100 34 L 122 44 L 112 78 L 100 86 L 88 78 L 78 44 Z" fill={(isTraps || isBack) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Posterior Shoulders (Rear Delts) */}
            <path d="M 68 44 C 58 48, 54 58, 60 68 C 66 60, 72 50, 78 44 Z" fill={isShoulders ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 132 44 C 142 48, 146 58, 140 68 C 134 60, 128 50, 122 44 Z" fill={isShoulders ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Triceps */}
            <path d="M 58 70 C 52 82, 50 96, 56 108 C 62 96, 64 82, 60 70 Z" fill={(isTriceps || isArms) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 142 70 C 148 82, 150 96, 144 108 C 138 96, 136 82, 140 70 Z" fill={(isTriceps || isArms) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 56 110 L 48 140 L 56 142 L 62 112 Z" fill={isForearms ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 144 110 L 152 140 L 144 142 L 138 112 Z" fill={isForearms ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Lats & Lower Back */}
            <path d="M 88 78 L 100 86 L 112 78 L 120 110 L 80 110 Z" fill={(isLats || isBack) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Glutes (Hips & Buttocks) */}
            <path d="M 80 112 C 80 112, 100 110, 100 132 C 100 110, 120 112, 120 112 C 124 126, 120 138, 100 142 C 80 138, 76 126, 80 112 Z" fill={isGlutes ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Hamstrings (Back of Thighs) */}
            <path d="M 82 142 C 78 160, 76 172, 84 185 C 92 172, 94 160, 96 142 Z" fill={(isHamstrings || (isLegs && !isQuads)) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 118 142 C 122 160, 124 172, 116 185 C 108 172, 106 160, 104 142 Z" fill={(isHamstrings || (isLegs && !isQuads)) ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

            {/* Calves (Back / Gastrocnemius) */}
            <path d="M 83 188 C 78 198, 80 208, 86 215 L 92 215 C 94 206, 92 196, 88 188 Z" fill={isCalves ? highlightColor : (isLegs ? secondaryColor : baseColor)} stroke={bodyOutline} strokeWidth="1" />
            <path d="M 117 188 C 122 198, 120 208, 114 215 L 108 215 C 106 206, 108 196, 112 188 Z" fill={isCalves ? highlightColor : (isLegs ? secondaryColor : baseColor)} stroke={bodyOutline} strokeWidth="1" />
          </g>
        )}
      </svg>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: highlightColor, marginTop: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🎯 {muscle}</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>({view === 'front' ? 'أمامي Anterior' : 'خلفي Posterior'})</span>
      </div>
    </div>
  );
});

MuscleAnatomySVG.displayName = 'MuscleAnatomySVG';

// Strict URL Protocol & Domain Validator to prevent DOM-based XSS (javascript: and untrusted origins)
export const sanitizeSafeUrl = (rawUrl?: string, fallback = 'https://musclewiki.com', allowedHostnames?: string[]): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return fallback;
    }
    if (allowedHostnames && allowedHostnames.length > 0) {
      const isAllowed = allowedHostnames.some(
        (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
      );
      if (!isAllowed) {
        return fallback;
      }
    }
    return parsed.toString();
  } catch {
    return fallback;
  }
};

// Helper: Safely parse array or multi-line string text
const parseInstructionsArray = (raw: string | string[] | undefined): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter((item) => item.length > 2);
  }
  const str = String(raw).trim();
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter((item) => item.length > 2);
      }
    } catch {}
  }
  return str
    .split(/[.\n]+/)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((s) => s.length > 3);
};

// Fallback Arabic Instruction Presets
const getSmartArabicInstructions = (muscleEn: string): string[] => {
  const m = (muscleEn || '').toLowerCase();

  if (m.includes('chest')) {
    return [
      '1. وضعية التجهيز (Setup): استلقِ بثبات على المقعد مع تثبيت القدمين على الأرض وسحب لوحي الكتف للخلف والأسفل (Scapular Retraction).',
      '2. القبضة والمسار: أمسك بالوزن بقبضة محكمة وثبت المرفقين بزاوية 45-60 درجة مع الجذع لحماية أوتار الكتف.',
      '3. مسار الدفع (Concentric): ادفع المقاومة للأعلى وللداخل قليلاً مع اعتصار ألياف الصدر في قمة الحركة مع إخراج الزفير 😤.',
      '4. النزول والتحكم (Eccentric): انزل بالوزن ببطء وتحكم تام خلال 2-3 ثوانٍ حتى تشعر بتمدد ألياف الصدر مع أخذ الشهيق 🫁.'
    ];
  }
  if (m.includes('back') || m.includes('lat')) {
    return [
      '1. وضعية التجهيز (Setup): ثبّت الصدر للأمام والظهر مستقيماً مع انحناء خفيف في الركبتين للحفاظ على ثبات الحوض.',
      '2. مسار الحركة (Concentric): ابدأ السحب بقيادة الكوعين للخلف باتجاه الخصر وليس بسحب اليدين أو المعصم.',
      '3. الانقباض في القمة: اعصر عضلات الظهر واللاتس بقوة لمدة ثانية كاملة في ذروة الحركة مع إخراج الزفير 😤.',
      '4. الإطالة والرجوع (Eccentric): أعد الوزن ببطء إلى وضعية البداية مع تمديد عضلات الظهر تدريجياً مع أخذ الشهيق 🫁.'
    ];
  }
  if (m.includes('shoulder') || m.includes('trap')) {
    return [
      '1. وضعية التجهيز (Setup): قف أو اجلس باستقامة تامة مع شد عضلات الجذع والبطن لتوفير قاعدة ارتكاز صلبة.',
      '2. مسار الرفع (Concentric): ارفع الوزن بالمسار المخصص مع إبقاء الأكتاف منخفضة وبعيدة عن الأذنين مع الزفير 😤.',
      '3. قمة الحركة: توقف لأجزاء من الثانية في القمة للتركيز على استهداف الرأس المخصص من الدالية دون أرجحة.',
      '4. النزول السلبي (Eccentric): انزل بالوزن ببطء على مدى ثانيتين مع الحفاظ على التوتر العضلي وأخذ الشهيق 🫁.'
    ];
  }
  if (m.includes('quad') || m.includes('leg') || m.includes('glute') || m.includes('hamstring')) {
    return [
      '1. وضعية القدمين (Stance): قف مع مباعدة القدمين باتساع الكتفين وتوجيه أصابع القدم بزاوية طفيفة للخارج.',
      '2. النزول (Eccentric): انزل بالحوض للخلف والأسفل كأنك تجلس على كرسي مع إبقاء الركبتين في مسار أصابع القدم والشهيق 🫁.',
      '3. العمق والاتزان: انزل حتى يصبح الفخذ موازياً للأرض مع الحفاظ على استقامة الصدر والعمود الفقري.',
      '4. الدفع والصعود (Concentric): ادفع من منتصف القدم والكعبين للعودة لوضع البداية مع عصر عضلات الأرجل وإخراج الزفير 😤.'
    ];
  }
  if (m.includes('bicep') || m.includes('arm')) {
    return [
      '1. وضعية التجهيز: ثبّت المرفقين بجانب الجذع تماماً وتجنب تحريكهما للأمام أو الخلف أثناء الرفع.',
      '2. الانقباض (Concentric): اثنِ الذراعين لرفع الوزن مع التركيز الكامل على اعتصار قمة البايسبس مع الزفير 😤.',
      '3. التوقف: اثبت للحظة في القمة وتجنب أرجحة الظهر أو استخدام الزخم.',
      '4. النزول البطيء (Eccentric): انزل بالوزن ببطء على مدى 3 ثوانٍ للوصول إلى التمدد العضلي الكامل مع الشهيق 🫁.'
    ];
  }
  if (m.includes('tricep')) {
    return [
      '1. وضعية التجهيز: ثبّت الكوعين في موضع مستقر وثابت وحافظ على استقامة الجذع والرسغ.',
      '2. الدفع والفرد (Concentric): افرد الذراعين لدفع المقاومة مع التركيز على عزل واعتصار رؤوس الترايسبس مع الزفير 😤.',
      '3. حماية المفاصل: اثبت للحظة عند الفرد الكامل دون قفل المفصل بشكل عنيف لحماية الأوتار.',
      '4. الرجوع المتحكم به (Eccentric): ارجع للبداية ببطء مع التحكم التام في المقاومة أثناء ثني المرفقين مع الشهيق 🫁.'
    ];
  }
  if (m.includes('ab') || m.includes('core')) {
    return [
      '1. وضعية التجهيز: ثبّت أسفل الظهر جيداً وشد عضلات البطن للداخل لتفريغ التجاويف وحماية الفقرات القطنية.',
      '2. الانقباض: قم بثني الجذع أو رفع الساقين بالاعتماد فقط على تقلص عضلات البطن وليس بسحب الرقبة.',
      '3. الاعتصار العميق: اعصر عضلات البطن بعمق في قمة الحركة مع إخراج كامل الهواء (الزفير) 😤.',
      '4. الرجوع: عد إلى وضع البداية بهدوء مع الحفاظ على استمرار التوتر العضلي وأخذ الشهيق 🫁.'
    ];
  }
  return [
    '1. اتخذ الوضعية المريحة مع استقامة الظهر وشد عضلات الجذع لتثبيت الجسم.',
    '2. تحرك عبر المدى الحركي الكامل للتمرين بتركيز وهدوء تام مع مراعاة إيقاع التنفس.',
    '3. اعصر العضلة المستهدفة في قمة الحركة لتعزيز الاتصال العصبي العضلي مع الزفير 😤.',
    '4. تحكم في سرعة النزول ولا تدع الوزن يسقط بفعل الجاذبية مع أخذ الشهيق 🫁.'
  ];
};

const getSmartArabicMistakes = (muscleEn: string): string[] => {
  const m = (muscleEn || '').toLowerCase();
  if (m.includes('chest')) {
    return [
      '⚠️ فتح المرفقين بزاوية 90 درجة واسعة مما يضع ضغطاً مفرطاً على أوتار الكتف الأمامي (Rotator Cuff).',
      '⚠️ الارتطام بالوزن على عظمة الصدر واستخدام الارتداد بدلاً من القوة العضلية الصافية.',
      '⚠️ تقويس أسفل الظهر بشكل مفرط وفقدان ثبات الأرداف على المقعد.'
    ];
  }
  if (m.includes('back')) {
    return [
      '⚠️ سحب الوزن باستخدام قوة الذراعين والرسغ بدلاً من قيادة الحركة بالمرفقين.',
      '⚠️ أرجحة الجذع واستخدام قوة الدفع السريع (الزخم) لحمل الأوزان الثقيلة.',
      '⚠️ تحدب أعلى وأسفل الظهر أثناء السحب مما يعرض الفقرات للإصابة.'
    ];
  }
  if (m.includes('shoulder')) {
    return [
      '⚠️ رفع الكتفين نحو الأذنين (Shrugging) مما ينقل الجهد لعضلات الرقبة بدلاً من الكتف.',
      '⚠️ نزول المرفقين لمستوى منخفض جداً تحت خط الكتف في تمارين الضغط العالي.',
      '⚠️ الانحناء للخلف واستخدام عضلات الصدر العلوي بدلاً من عزل الأكتاف.'
    ];
  }
  if (m.includes('quad') || m.includes('leg')) {
    return [
      '⚠️ سقوط الركبتين للداخل أثناء النزول أو الصعود (Knee Valgus) مما يضغط على الأربطة الصليبية.',
      '⚠️ رفع الكعبين عن الأرض وفقدان الاتزان والضغط على أوتار الرضفة.',
      '⚠️ النزول الجزئي السطحي دون الوصول للعمق التدريبي المطلوب لتفعيل كامل الألياف.'
    ];
  }
  if (m.includes('bicep') || m.includes('arm')) {
    return [
      '⚠️ تحريك المرفقين للأمام واستخدام عضلات الكتف الأمامي لحمل الوزن.',
      '⚠️ أرجحة الجذع للخلف أثناء الرفع بدلاً من تثبيت الجسم.',
      '⚠️ إسقاط الوزن بسرعة أثناء النزول وتفويت مرحلة التمدد السلبي.'
    ];
  }
  return [
    '⚠️ استخدام أوزان ثقيلة تفوق القدرة على الأداء بالتكنيك الصحيح.',
    '⚠️ حبس النفس أثناء التمرين بدلاً من التنفس المنتظم (شهيق في النزول، زفير في الدفع).',
    '⚠️ إهمال التحكم في الحركة السلبية (النزول البطيء) الذي يشكل 50% من البناء العضلي.'
  ];
};

export const MuscleWikiModal: React.FC<MuscleWikiModalProps> = ({
  exercise,
  lang,
  onClose,
  onAddToPlan,
}) => {
  const [activeTab, setActiveTab] = React.useState<'steps' | 'video' | 'breathing' | 'mistakes' | 'anatomy'>('steps');
  const [anatomyView, setAnatomyView] = React.useState<'front' | 'back'>('front');
  const [motionSpeed, setMotionSpeed] = React.useState<number>(1);
  const [isPlayingMotion, setIsPlayingMotion] = React.useState<boolean>(true);

  // Keyboard Accessibility: Escape key listener & Body Scroll Lock
  useEffect(() => {
    if (!exercise) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [exercise, onClose]);

  const isAr = lang === 'ar';

  const name = useMemo(() => {
    if (!exercise) return '';
    return isAr
      ? (exercise.name_ar || exercise.name_en || exercise.name || '')
      : (exercise.name_en || exercise.name || '');
  }, [exercise, isAr]);

  const primaryMuscle = useMemo(() => {
    if (!exercise) return '';
    return isAr
      ? (exercise.muscle_ar || exercise.muscle_en || exercise.targetMuscle || '')
      : (exercise.muscle_en || exercise.targetMuscle || '');
  }, [exercise, isAr]);

  const secondaryMuscles = useMemo(() => {
    if (!exercise) return '';
    const raw = isAr
      ? (exercise.secondary_muscles_ar || exercise.secondary_muscles_en)
      : (exercise.secondary_muscles_en || exercise.secondary_muscles_ar);
    if (Array.isArray(raw)) return raw.join('، ');
    return String(raw || '');
  }, [exercise, isAr]);

  const equipment = useMemo(() => {
    if (!exercise) return '';
    return isAr
      ? (exercise.equipment_ar || exercise.equipment_en || '')
      : (exercise.equipment_en || exercise.equipment_ar || '');
  }, [exercise, isAr]);

  // Steps computation
  const stepsList = useMemo(() => {
    if (!exercise) return [];
    const rawInstructions = exercise.instructions_ar || exercise.description_ar;
    const isRawEnglish = typeof rawInstructions === 'string' && /^[a-zA-Z0-9\s.,'()\-]+$/.test(rawInstructions.substring(0, 50));

    if (isAr) {
      if (rawInstructions && !isRawEnglish && String(rawInstructions).trim().length > 10) {
        return parseInstructionsArray(rawInstructions);
      }
      return getSmartArabicInstructions(exercise.muscle_en || '');
    }

    const engInstructions = exercise.instructions_en || exercise.description_en || exercise.instructions_ar;
    const parsedEng = parseInstructionsArray(engInstructions);
    return parsedEng.length > 0
      ? parsedEng
      : [
          '1. Setup & Stance: Set up in a solid stable stance with your spine in a neutral position.',
          '2. Form & Path: Engage the target muscle group and move through the full intended range of motion.',
          '3. Peak Squeeze: Squeeze and hold the contraction at the peak for maximum muscle fiber recruitment with an exhale 😤.',
          '4. Controlled Lowering: Control the eccentric lowering phase for 2-3 seconds on the way back with an inhale 🫁.'
        ];
  }, [exercise, isAr]);

  // Common Mistakes computation
  const mistakesList = useMemo(() => {
    if (!exercise) return [];
    const rawMistakes = exercise.common_mistakes_ar;
    const isMistakeEnglish = typeof rawMistakes === 'string' && /^[a-zA-Z0-9\s.,'()\-]+$/.test(rawMistakes.substring(0, 30));

    if (isAr) {
      if (rawMistakes && !isMistakeEnglish && String(rawMistakes).trim().length > 5) {
        return parseInstructionsArray(rawMistakes);
      }
      return getSmartArabicMistakes(exercise.muscle_en || '');
    }

    const engMistakes = exercise.common_mistakes_en || exercise.common_mistakes_ar;
    const parsedEng = parseInstructionsArray(engMistakes);
    return parsedEng.length > 0
      ? parsedEng
      : [
          '⚠️ Using excessive momentum and swinging the body instead of isolating the muscle.',
          '⚠️ Rushing through the eccentric (lowering) phase without controlling the weight.',
          '⚠️ Sacrificing proper range of motion for heavier loads.'
        ];
  }, [exercise, isAr]);

  // Video URLs extraction & Security Sanitizer
  const youtubeUrl = useMemo(() => {
    if (!exercise) return '';

    const rawVideo = String(exercise.youtube_url || exercise.video_url || '').trim();
    const allowedHosts = ['youtube.com', 'youtu.be', 'www.youtube.com', 'm.youtube.com'];

    const searchQuery = encodeURIComponent(`${exercise.name_en || name || 'exercise'} tutorial proper form`);
    const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

    if (rawVideo && rawVideo.includes('watch?v=')) {
      return sanitizeSafeUrl(rawVideo, fallbackSearchUrl, allowedHosts);
    }

    return fallbackSearchUrl;
  }, [exercise, name]);

  const muscleWikiSafeUrl = useMemo(() => {
    const raw = exercise?.musclewiki_url;
    return sanitizeSafeUrl(raw, 'https://musclewiki.com', ['musclewiki.com', 'www.musclewiki.com']);
  }, [exercise?.musclewiki_url]);

  const mediaSource = exercise?.gif_url || exercise?.image_url;

  if (!exercise) return null;

  const handleOpenVideo = () => {
    setActiveTab('video');
  };

  return (
    <div
      className="modal-overlay animated-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-exercise-title"
    >
      <div
        className="modal-content glass-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0, 210, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(6, 8, 20, 0.98))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          style={{
            position: 'absolute',
            top: '20px',
            left: isAr ? '20px' : 'auto',
            right: isAr ? 'auto' : '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        {/* Header Badges & Links */}
        <div style={{ marginBottom: '16px', paddingRight: isAr ? '0' : '45px', paddingLeft: isAr ? '45px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 210, 255, 0.15)', color: 'var(--primary)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              <Dumbbell size={14} />
              <span>MuscleWiki Pro Visuals & Form 🎬</span>
            </div>

            {/* Direct YouTube Tutorial Button */}
            <button
              onClick={handleOpenVideo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              <Youtube size={15} color="#ef4444" />
              <span>{isAr ? 'شرح التكنيك على YouTube 🔴' : 'YouTube Tutorial 🔴'}</span>
            </button>
          </div>

          <h2 id="modal-exercise-title" style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 4px 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {name}
          </h2>

          {isAr && exercise.name_en && (
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600' }}>
              {exercise.name_en}
            </div>
          )}

          {/* Metadata Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {equipment && (
              <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                🏋️ {equipment}
              </span>
            )}
            {exercise.level && (
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                ⚡ {exercise.level}
              </span>
            )}
            {primaryMuscle && (
              <span style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                🎯 {primaryMuscle}
              </span>
            )}
            {exercise.isHomeFriendly && (
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                🏠 {isAr ? 'تمرين منزلي' : 'Home Friendly'}
              </span>
            )}
          </div>
        </div>

        {/* Dual Split: Animated Exercise Movement Loop + Interactive Muscle Heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          
          {/* Box 1: Looping Motion Demonstration */}
          <div style={{ position: 'relative', height: '240px', background: 'rgba(0,0,0,0.6)', borderRadius: '18px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
            <ExerciseImage
              src={mediaSource}
              alt={name}
              muscle={exercise.muscle_en || exercise.muscle_ar || exercise.targetMuscle}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              autoAnimate={isPlayingMotion}
              showBadge={true}
            />

            {/* Motion Speed & Play/Pause Controls Overlay */}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsPlayingMotion(!isPlayingMotion)}
                  style={{ background: 'none', border: 'none', color: isPlayingMotion ? 'var(--primary)' : '#94a3b8', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Play size={12} fill={isPlayingMotion ? 'currentColor' : 'none'} />
                  <span>{isPlayingMotion ? (isAr ? 'حركة مستمرة' : 'Looping') : (isAr ? 'إيقاف مؤقت' : 'Paused')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {[0.5, 1, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setMotionSpeed(spd)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: motionSpeed === spd ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: motionSpeed === spd ? '#000' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Box 2: Dual Front / Back Anatomy Heatmap with Gender Switch */}
          <div style={{ position: 'relative', height: '240px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 210, 255, 0.25)', padding: '10px' }}>
            
            {/* Front / Back + Gender Selector Bar */}
            <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => setAnatomyView('front')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    border: 'none',
                    background: anatomyView === 'front' ? 'var(--primary)' : 'transparent',
                    color: anatomyView === 'front' ? '#000' : '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? 'أمامي' : 'Front'}
                </button>
                <button
                  type="button"
                  onClick={() => setAnatomyView('back')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    border: 'none',
                    background: anatomyView === 'back' ? 'var(--primary)' : 'transparent',
                    color: anatomyView === 'back' ? '#000' : '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? 'خلفي' : 'Back'}
                </button>
              </div>

              <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={13} />
                <span>{isAr ? 'التشريح العضلي' : 'Anatomy'}</span>
              </div>
            </div>

            <MuscleAnatomySVG
              muscle={exercise.muscle_en || exercise.targetMuscle || 'Chest'}
              uid={String(exercise.id || name)}
              view={anatomyView}
            />
          </div>
        </div>

        {/* MuscleWiki-Style Interactive Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '18px', overflowX: 'auto' }}>
          {[
            { id: 'steps', label: isAr ? '📋 خطوات التكنيك (Form Steps)' : '📋 Form Steps' },
            { id: 'video', label: isAr ? '🔴 فيديو الشرح (Video)' : '🔴 Video Tutorial' },
            { id: 'breathing', label: isAr ? '🫁 إيقاع التنفس (Breathing & Tempo)' : '🫁 Breathing & Tempo' },
            { id: 'mistakes', label: isAr ? '⚠️ أخطاء شائعة وحماية المفاصل' : '⚠️ Common Mistakes' },
            { id: 'anatomy', label: isAr ? '🎯 تفصيل الأحمال العضلية' : '🎯 Muscle Loads' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--primary-glow)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 0: YouTube Video Player with Fallback Resilience */}
        {activeTab === 'video' && (
          <div className="animated-fade" style={{ marginBottom: '20px' }}>
            <YouTubeEmbedPlayer
              videoUrl={youtubeUrl}
              title={name}
              lang={lang}
              autoPlay={false}
            />
          </div>
        )}

        {/* TAB 1: Step-by-Step Form & Execution Guide */}
        {activeTab === 'steps' && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {stepsList.map((step: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#000', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{step}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Breathing & Movement Tempo Rhythm */}
        {activeTab === 'breathing' && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              {/* Concentric Exhale */}
              <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>
                  <span>😤 زفير أثناء الدفع/الرفع (Exhale)</span>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {isAr ? 'أخرج الهواء بقوة عند بذل الجهد والانقباض الأقصى لزيادة الضغط داخل البطن وتثبيت العمود الفقري.' : 'Exhale forcefully during the concentric exertion phase to stabilize your core.'}
                </p>
              </div>

              {/* Eccentric Inhale */}
              <div style={{ padding: '16px', background: 'rgba(0, 210, 255, 0.08)', borderRadius: '14px', border: '1px solid rgba(0, 210, 255, 0.25)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
                  <span>🫁 شهيق أثناء النزول المقاوم (Inhale)</span>
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {isAr ? 'خذ نفساً عميقاً وتحكم في نزول الوزن ببطء على مدى ثانيتين إلى 3 ثوانٍ لتحقيق أقصى تمدد عضلي.' : 'Take a deep breath and control the weight lowering phase for 2-3 seconds.'}
                </p>
              </div>
            </div>

            {/* Tempo Card */}
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '13px', color: '#f59e0b', display: 'block' }}>⚡ إيقاع الحركة المقترح (Recommended Tempo: 2-0-1-0)</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {isAr ? '2 ثوانٍ نزول بطيء ⏱️ 0 ثانية توقف ⏱️ 1 ثانية دفع قوي ⏱️ 0 ثانية راحة' : '2s Eccentric Lowering • 0s Pause • 1s Concentric Drive • 0s Rest'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Common Mistakes & Joint Safety */}
        {activeTab === 'mistakes' && (
          <div className="animated-fade" style={{ marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <h4 style={{ fontSize: '14.5px', fontWeight: 'bold', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
              <ShieldAlert size={18} />
              <span>{isAr ? 'أخطاء شائعة وإرشادات حماية المفاصل (Joint Safety)' : 'Common Form Mistakes & Joint Safety'}</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mistakesList.map((m: string, i: number) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', lineHeight: '1.6' }}>
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Muscle Breakdown & Load Contribution */}
        {activeTab === 'anatomy' && (
          <div className="animated-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', background: 'rgba(0, 210, 255, 0.08)', borderRadius: '14px', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                {isAr ? '🎯 العضلة الأساسية (Primary Target 100%)' : '🎯 Primary Target Muscle'}
              </span>
              <strong style={{ fontSize: '15px', color: '#fff' }}>{primaryMuscle || (isAr ? 'شامل' : 'General')}</strong>
            </div>

            <div style={{ padding: '14px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c084fc', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                {isAr ? '💪 العضلات المساعدة والمثبتة (Secondary Muscles)' : '💪 Secondary Stabilizers'}
              </span>
              <strong style={{ fontSize: '14px', color: '#e9d5ff' }}>{secondaryMuscles || (isAr ? 'عضلات الجذع والمفاصل المساعدة' : 'Core & Stabilizers')}</strong>
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
            style={{ flex: 1, minWidth: '150px', justifyContent: 'center', textDecoration: 'none', padding: '12px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Youtube size={15} color="#ef4444" />
            <span>{isAr ? 'فيديو YouTube 🔴' : 'YouTube 🔴'}</span>
          </a>

          <a
            href={muscleWikiSafeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
            style={{ flex: 1, minWidth: '150px', justifyContent: 'center', textDecoration: 'none', padding: '12px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(0, 210, 255, 0.3)', background: 'rgba(0, 210, 255, 0.08)', color: 'var(--primary)' }}
          >
            <Globe size={15} />
            <span>{isAr ? 'دليل MuscleWiki 🌐' : 'MuscleWiki 🌐'}</span>
          </a>

          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(exercise)}
              className="glow-btn"
              style={{ flex: 1.5, justifyContent: 'center', padding: '12px', fontSize: '13.5px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Dumbbell size={16} />
              <span>{isAr ? 'إضافة إلى جدولي التدريبي ➕' : 'Add to Workout Plan ➕'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


