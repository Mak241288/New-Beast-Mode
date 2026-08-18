import React, { useEffect, useMemo, memo } from 'react';
import { X, Play, CheckCircle2, Dumbbell, ShieldAlert, Youtube, Activity, Globe } from 'lucide-react';
import { ExerciseImage } from './ExerciseImage';

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

// Built-in Interactive SVG Muscle Anatomy Diagram (Memoized for high performance)
const MuscleAnatomySVG: React.FC<{ muscle: string; uid: string }> = memo(({ muscle, uid }) => {
  const m = (muscle || '').toLowerCase();

  const isChest = m.includes('chest') || m.includes('صدر') || m.includes('pectoral');
  const isBack = m.includes('back') || m.includes('lat') || m.includes('ظهر') || m.includes('traps') || m.includes('ترابيس');
  const isShoulders = m.includes('shoulder') || m.includes('كتف') || m.includes('delt');
  const isArms = m.includes('bicep') || m.includes('tricep') || m.includes('arm') || m.includes('ذراع') || m.includes('بايسبس') || m.includes('ترايسبس') || m.includes('forearm') || m.includes('ساعد');
  const isBiceps = m.includes('bicep') || m.includes('باي');
  const isTriceps = m.includes('tricep') || m.includes('تراي');
  const isAbs = m.includes('ab') || m.includes('core') || m.includes('بطن') || m.includes('oblique');
  const isLegs = m.includes('leg') || m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('calves') || m.includes('رجل') || m.includes('فخذ') || m.includes('سمانة') || m.includes('مؤخرة');
  const isGlutes = m.includes('glute') || m.includes('مؤخرة') || m.includes('أرداف');

  const highlightColor = '#00d2ff';
  const secondaryColor = '#a855f7';
  const baseColor = '#1e293b';
  const bodyOutline = '#334155';

  const glowId = `glowG_${uid}`;
  const backId = `backG_${uid}`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg viewBox="0 0 200 220" style={{ width: '100%', height: '160px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
        <defs>
          <linearGradient id={glowId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>

        {/* Head */}
        <circle cx="100" cy="22" r="14" fill={baseColor} stroke={bodyOutline} strokeWidth="1.5" />

        {/* Neck / Traps */}
        <path d="M 90 34 L 110 34 L 120 44 L 80 44 Z" fill={isBack ? `url(#${backId})` : baseColor} stroke={bodyOutline} strokeWidth="1" />

        {/* Shoulders / Deltoids */}
        <path d="M 68 44 C 60 48, 56 60, 62 70 C 68 62, 74 52, 78 45 Z" fill={isShoulders ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 132 44 C 140 48, 144 60, 138 70 C 132 62, 126 52, 122 45 Z" fill={isShoulders ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

        {/* Chest (Pectorals) */}
        <path d="M 80 46 C 88 46, 98 48, 98 64 C 88 64, 76 60, 80 46 Z" fill={isChest ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 120 46 C 112 46, 102 48, 102 64 C 112 64, 124 60, 120 46 Z" fill={isChest ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

        {/* Arms - Biceps / Triceps / Forearms */}
        <path d="M 58 72 C 54 85, 52 98, 58 108 C 64 98, 66 84, 62 72 Z" fill={(isBiceps || isArms) ? highlightColor : (isTriceps ? secondaryColor : baseColor)} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 142 72 C 146 85, 148 98, 142 108 C 136 98, 134 84, 138 72 Z" fill={(isBiceps || isArms) ? highlightColor : (isTriceps ? secondaryColor : baseColor)} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 56 110 L 48 140 L 56 142 L 62 112 Z" fill={isArms ? secondaryColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 144 110 L 152 140 L 144 142 L 138 112 Z" fill={isArms ? secondaryColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

        {/* Core / Abs & Obliques */}
        <path d="M 86 68 L 114 68 L 110 110 L 90 110 Z" fill={isAbs ? highlightColor : (isBack ? `url(#${backId})` : baseColor)} stroke={bodyOutline} strokeWidth="1" />
        {isAbs && (
          <>
            <line x1="100" y1="70" x2="100" y2="108" stroke="#060814" strokeWidth="1.5" />
            <line x1="90" y1="80" x2="110" y2="80" stroke="#060814" strokeWidth="1" />
            <line x1="90" y1="92" x2="110" y2="92" stroke="#060814" strokeWidth="1" />
            <line x1="92" y1="102" x2="108" y2="102" stroke="#060814" strokeWidth="1" />
          </>
        )}

        {/* Pelvis / Hips / Glutes */}
        <path d="M 86 112 L 114 112 L 120 128 L 80 128 Z" fill={isGlutes ? secondaryColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

        {/* Legs - Quads / Hamstrings */}
        <path d="M 82 130 C 78 150, 76 170, 84 185 C 92 170, 94 150, 96 130 Z" fill={isLegs ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 118 130 C 122 150, 124 170, 116 185 C 108 170, 106 150, 104 130 Z" fill={isLegs ? highlightColor : baseColor} stroke={bodyOutline} strokeWidth="1" />

        {/* Calves */}
        <path d="M 83 188 C 80 198, 82 208, 86 215 L 91 215 C 93 206, 91 196, 88 188 Z" fill={isLegs ? secondaryColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
        <path d="M 117 188 C 120 198, 118 208, 114 215 L 109 215 C 107 206, 109 196, 112 188 Z" fill={isLegs ? secondaryColor : baseColor} stroke={bodyOutline} strokeWidth="1" />
      </svg>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: highlightColor, marginTop: '4px', textAlign: 'center' }}>
        🎯 {muscle}
      </div>
    </div>
  );
});

MuscleAnatomySVG.displayName = 'MuscleAnatomySVG';

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
    } catch {
      // fallback to regex split if not JSON
    }
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
      'اتخذ وضعية الاستلقاء أو الوقوف بثبات مع تثبيت القدمين على الأرض وسحب لوحي الكتف للخلف والأسفل.',
      'أمسك بالوزن بقبضة محكمة وثبت المرفقين بزاوية 45 درجة مع الجذع لحماية أوتار الكتف.',
      'ادفع المقاومة للأمام/للأعلى مع التركيز على اعتصار عضلات الصدر في قمة الحركة مع الزفير.',
      'انزل بالوزن ببطء وتحكم كامل خلال 2-3 ثوانٍ حتى تشعر بتمدد ألياف الصدر مع أخذ الشهيق.'
    ];
  }
  if (m.includes('back') || m.includes('lat')) {
    return [
      'ثبّت الصدر للأمام والظهر مستقيماً مع انحناء خفيف في الركبتين للحفاظ على ثبات الحوض.',
      'ابدأ حركة السحب بقيادة الكوعين للخلف باتجاه الخصر وليس بسحب اليدين أو المعصم.',
      'اعصر عضلات الظهر واللاتس بقوة لمدة ثانية في ذروة الانقباض العضلي مع الزفير.',
      'أعد الوزن ببطء إلى وضعية البداية مع تمديد عضلات الظهر تدريجياً دون انحناء العمود الفقري.'
    ];
  }
  if (m.includes('shoulder') || m.includes('trap')) {
    return [
      'قف أو اجلس باستقامة تامة مع شد عضلات الجذع والبطن لتوفير قاعدة ارتكاز صلبة.',
      'ارفع الوزن بالمسار المخصص مع إبقاء الأكتاف منخفضة وبعيدة عن الأذنين لتجنب إجهاد الرقبة.',
      'توقف لأجزاء من الثانية في قمة الحركة للتركيز على استهداف الرأس المخصص من الدالية.',
      'انزل بالوزن ببطء وتحكم تام مع الحفاظ على شد العضلة طوال مسار الحركة السلبي.'
    ];
  }
  if (m.includes('quad') || m.includes('leg') || m.includes('glute') || m.includes('hamstring')) {
    return [
      'قف مع مباعدة القدمين باتساع الكتفين وتوجيه أصابع القدم بزاوية طفيفة للخارج.',
      'انزل بالحوض للخلف والأسفل كأنك تجلس على كرسي مع إبقاء الركبتين في مسار أصابع القدم.',
      'انزل حتى تصبح الفخذين موازية للأرض مع الحفاظ على استقامة الصدر والعمود الفقري.',
      'ادفع من منتصف القدم والكعبين للعودة لوضع البداية مع عصر عضلات الأرجل في القمة.'
    ];
  }
  if (m.includes('bicep') || m.includes('arm')) {
    return [
      'ثبّت المرفقين بجانب الجذع تماماً وتجنب تحريكهما للأمام أو الخلف أثناء الرفع.',
      'اثنِ الذراعين لرفع الوزن مع التركيز الكامل على انقباض عضلة البايسبس في القمة.',
      'اعصر العضلة بقوة في أعلى نقطة مع إخراج الزفير وتجنب أرجحة الظهر أو استخدام الزخم.',
      'انزل بالوزن ببطء على مدى 3 ثوانٍ للوصول إلى التمدد العضلي الكامل.'
    ];
  }
  if (m.includes('tricep')) {
    return [
      'ثبّت الكوعين في موضع مستقر وثابت وحافظ على استقامة الجذع والرسغ.',
      'افرد الذراعين لدفع المقاومة مع التركيز على عزل واعتصار الرؤوس الثلاثية للترايسبس.',
      'اثبت للحظة عند الفرد الكامل دون قفل المفصل بشكل عنيف لحماية الأوتار.',
      'ارجع للبداية ببطء مع التحكم التام في المقاومة أثناء ثني المرفقين.'
    ];
  }
  if (m.includes('ab') || m.includes('core')) {
    return [
      'ثبّت أسفل الظهر جيداً وشد عضلات البطن للداخل لتفريغ التجاويف وحماية الفقرات.',
      'قم بثني الجذع أو رفع الساقين بالاعتماد فقط على تقلص عضلات البطن وليس بسحب الرقبة.',
      'اعصر عضلات البطن بعمق في قمة الحركة مع إخراج كامل الهواء (الزفير).',
      'عد إلى وضع البداية بهدوء مع الحفاظ على استمرار التوتر العضلي طوال الجولة.'
    ];
  }
  return [
    'اتخذ الوضعية المريحة مع استقامة الظهر وشد عضلات الجذع لتثبيت الجسم.',
    'تحرك عبر المدى الحركي الكامل للتمرين بتركيز وهدوء تام.',
    'اعصر العضلة المستهدفة في قمة الحركة لتعزيز الاتصال العصبي العضلي.',
    'تحكم في سرعة النزول ولا تدع الوزن يسقط بفعل الجاذبية.'
  ];
};

const getSmartArabicMistakes = (muscleEn: string): string[] => {
  const m = (muscleEn || '').toLowerCase();
  if (m.includes('chest')) {
    return [
      'فتح المرفقين بزاوية 90 درجة واسعة مما يضع ضغطاً هائلاً على أوتار الكتف الحساسة.',
      'الارتطام بالوزن على عظمة الصدر واستخدام الارتداد بدلاً من القوة العضلية الصافية.',
      'تقويس أسفل الظهر بشكل مفرط وفقدان ثبات الأرداف على المقعد.'
    ];
  }
  if (m.includes('back')) {
    return [
      'سحب الوزن باستخدام قوة الذراعين والرسغ بدلاً من قيادة الحركة بالمرفقين.',
      'أرجحة الجذع واستخدام قوة الدفع السريع (الزخم) لحمل الأوزان الثقيلة.',
      'تحدب أعلى وأسفل الظهر أثناء السحب مما يعرض الفقرات للإصابة.'
    ];
  }
  if (m.includes('shoulder')) {
    return [
      'رفع الكتفين نحو الأذنين (Shrugging) مما ينقل الجهد لعضلات الرقبة بدلاً من الكتف.',
      'نزول المرفقين لمستوى منخفض جداً تحت خط الكتف في تمارين الضغط العالي.',
      'الانحناء للخلف واستخدام عضلات الصدر العلوي بدلاً من عزل الأكتاف.'
    ];
  }
  if (m.includes('quad') || m.includes('leg')) {
    return [
      'سقوط الركبتين للداخل أثناء النزول أو الصعود مما يضغط على الأربطة الصليبية.',
      'رفع الكعبين عن الأرض وفقدان الاتزان والضغط على أوتار الرضفة.',
      'النزول الجزئي السطحي دون الوصول للعمق التدريبي المطلوب لتفعيل كامل الألياف.'
    ];
  }
  if (m.includes('bicep') || m.includes('arm')) {
    return [
      'تحريك المرفقين للأمام واستخدام عضلات الكتف الأمامي لحمل الوزن.',
      'أرجحة الجذع للخلف أثناء الرفع بدلاً من تثبيت الجسم.',
      'إسقاط الوزن بسرعة أثناء النزول وتفويت مرحلة التمدد السلبي.'
    ];
  }
  return [
    'استخدام أوزان ثقيلة تفوق القدرة على الأداء بالتكنيك الصحيح.',
    'حبس النفس أثناء التمرين بدلاً من التنفس المنتظم (شهيق في النزول، زفير في الدفع).',
    'إهمال التحكم في الحركة السلبية (النزول البطيء) الذي يشكل 50% من البناء العضلي.'
  ];
};

export const MuscleWikiModal: React.FC<MuscleWikiModalProps> = ({
  exercise,
  lang,
  onClose,
  onAddToPlan,
}) => {
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
          'Set up in a solid stable stance with your spine in a neutral position.',
          'Engage the target muscle group and move through the full intended range of motion.',
          'Squeeze and hold the contraction at the peak for maximum muscle fiber recruitment.',
          'Control the eccentric lowering phase for 2-3 seconds on the way back.'
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
          'Using excessive momentum and swinging the body instead of isolating the muscle.',
          'Rushing through the eccentric (lowering) phase without controlling the weight.',
          'Sacrificing proper range of motion for heavier loads.'
        ];
  }, [exercise, isAr]);

  // Video URLs extraction & Security Sanitizer (Prevents javascript: URI XSS)
  const youtubeUrl = useMemo(() => {
    if (!exercise) return '';

    const rawVideo = String(exercise.youtube_url || exercise.video_url || '').trim();
    
    // Strict URL Protocol Validation: Only allow http: and https: protocols
    const isSafeUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url, window.location.origin);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    const searchQuery = encodeURIComponent(`${exercise.name_en || name || 'exercise'} tutorial proper form`);
    const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

    if (rawVideo && isSafeUrl(rawVideo) && rawVideo.includes('watch?v=')) {
      return rawVideo;
    }

    return fallbackSearchUrl;
  }, [exercise, name]);

  const mediaSource = exercise?.gif_url || exercise?.image_url;

  if (!exercise) return null;

  const handleOpenVideo = () => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 8, 20, 0.98))',
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

        {/* Header Badges */}
        <div style={{ marginBottom: '18px', paddingRight: isAr ? '0' : '45px', paddingLeft: isAr ? '45px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 210, 255, 0.15)', color: 'var(--primary)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              <Dumbbell size={14} />
              <span>MuscleWiki Pro Guide & Media 🎬</span>
            </div>

            {/* YouTube Watch Link */}
            <button
              onClick={handleOpenVideo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              <Youtube size={16} color="#ef4444" />
              <span>{isAr ? 'مشاهدة الفيديو على YouTube 🔴' : 'Watch on YouTube 🔴'}</span>
            </button>
          </div>

          <h2 id="modal-exercise-title" style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 4px 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {name}
          </h2>

          {isAr && exercise.name_en && (
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '600' }}>
              {exercise.name_en}
            </div>
          )}

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

        {/* Media & Interactive Anatomy Split Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {/* Motion Video / GIF / Interactive Media Display */}
          <div style={{ position: 'relative', height: '220px', background: 'rgba(0,0,0,0.5)', borderRadius: '18px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ExerciseImage
              src={mediaSource}
              alt={name}
              muscle={exercise.muscle_en || exercise.muscle_ar || exercise.targetMuscle}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: isAr ? 'auto' : '8px',
                left: isAr ? '8px' : 'auto',
                display: 'flex',
                gap: '6px',
              }}
            >
              <button
                onClick={handleOpenVideo}
                style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  border: '1px solid rgba(239, 68, 68, 0.7)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
                  transition: 'all 0.2s',
                }}
                title={isAr ? 'مشاهدة شرح التكنيك الكامل على YouTube' : 'Watch full tutorial on YouTube'}
              >
                <Youtube size={14} color="#ef4444" />
                <span>{isAr ? 'فيديو التكنيك على YouTube 🔴' : 'YouTube Tutorial 🔴'}</span>
              </button>
            </div>
          </div>

          {/* Interactive SVG Muscle Anatomy Diagram */}
          <div style={{ position: 'relative', height: '220px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 210, 255, 0.2)', padding: '10px' }}>
            <div style={{ position: 'absolute', top: '8px', right: isAr ? 'auto' : '10px', left: isAr ? '10px' : 'auto', fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={12} />
              <span>{isAr ? 'خريطة التشريح العضلي' : 'Anatomy Heatmap'}</span>
            </div>
            <MuscleAnatomySVG muscle={exercise.muscle_en || exercise.targetMuscle || 'Chest'} uid={String(exercise.id || name)} />
          </div>
        </div>

        {/* Targeted Muscles Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '14px', background: 'rgba(0, 210, 255, 0.06)', borderRadius: '14px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {isAr ? '🎯 العضلة الأساسية (Primary Target)' : '🎯 Primary Target Muscle'}
            </span>
            <strong style={{ fontSize: '15px', color: '#fff' }}>{primaryMuscle || (isAr ? 'شامل' : 'General')}</strong>
          </div>

          <div style={{ padding: '14px', background: 'rgba(168, 85, 247, 0.06)', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c084fc', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {isAr ? '💪 العضلات الثانوية (Secondary Targets)' : '💪 Secondary Target Muscles'}
            </span>
            <strong style={{ fontSize: '14px', color: '#e9d5ff' }}>{secondaryMuscles || (isAr ? 'عضلات الجذع والمفاصل المساعدة' : 'Core & Stabilizers')}</strong>
          </div>
        </div>

        {/* Step-by-Step Execution Guide */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>{isAr ? 'دليل خطوات الأداء الصحيح (Execution Steps)' : 'Execution Steps & Form Guide'}</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stepsList.map((step: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Form Mistakes & Cues */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
            <ShieldAlert size={18} />
            <span>{isAr ? 'أخطاء شائعة وتنبيهات حماية المفاصل (Form Mistakes & Safety)' : 'Common Mistakes & Joint Safety'}</span>
          </h4>

          <ul style={{ margin: 0, paddingLeft: isAr ? 0 : '20px', paddingRight: isAr ? '20px' : 0, color: '#fca5a5', fontSize: '13px', lineHeight: '1.7' }}>
            {mistakesList.map((m: string, i: number) => (
              <li key={i} style={{ marginBottom: '6px' }}>{m}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
            style={{ flex: 1, minWidth: '160px', justifyContent: 'center', textDecoration: 'none', padding: '12px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={15} />
            <span>{isAr ? 'فيديو يوتيوب 🔴' : 'YouTube 🔴'}</span>
          </a>

          <a
            href={exercise.musclewiki_url || 'https://musclewiki.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
            style={{ flex: 1, minWidth: '160px', justifyContent: 'center', textDecoration: 'none', padding: '12px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(0, 210, 255, 0.3)', background: 'rgba(0, 210, 255, 0.08)', color: 'var(--primary)' }}
          >
            <Globe size={15} />
            <span>{isAr ? 'دليل MuscleWiki 🌐' : 'MuscleWiki 🌐'}</span>
          </a>

          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(exercise)}
              className="primary-btn"
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
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

