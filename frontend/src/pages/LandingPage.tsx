import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Activity, 
  Zap, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  FileText, 
  Lock, 
  Info, 
  Crown, 
  Layers, 
  Utensils, 
  Percent, 
  Droplets, 
  WifiOff, 
  Brain,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Timer,
  Sparkles,
  Calculator,
  Download
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface LandingPageProps {
  lang: 'ar' | 'en';
  onGetStarted: () => void;
  onLogin: () => void;
  onLanguageChange: (lang: 'ar' | 'en') => void;
  onNavigateToLegal: (page: 'privacy' | 'terms' | 'about') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onGetStarted,
  onLogin,
  onLanguageChange,
  onNavigateToLegal
}) => {
  const isEn = lang === 'en';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'player' | 'scanner' | 'macros' | 'plates'>('player');

  // PWA Install Prompt & Mobile Sticky Bar States
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showStickyMobileBar, setShowStickyMobileBar] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowStickyMobileBar(true);
      } else {
        setShowStickyMobileBar(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      alert(isEn ? 'To install: Tap browser menu (⋮ or Share) -> "Add to Home Screen"' : 'لتثبيت التطبيق: اضغط على قائمة المتصفح (⋮ أو زر المشاركة) -> "إضافة إلى الشاشة الرئيسية"');
      return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPromptEvent(null);
  };

  // Mini-Calculator 1: Quick TDEE & Macro State
  const [tdeeWeight, setTdeeWeight] = useState<number>(75);
  const [tdeeHeight, setTdeeHeight] = useState<number>(178);
  const [tdeeGender, setTdeeGender] = useState<'male' | 'female'>('male');
  const [tdeeGoal, setTdeeGoal] = useState<'cut' | 'bulk' | 'maintain'>('bulk');
  const [tdeeCalculated, setTdeeCalculated] = useState<boolean>(false);
  const [tdeeResult, setTdeeResult] = useState<{ bmr: number; tdee: number; targetCals: number; protein: number; carbs: number; fats: number; trainingCals: number; restCals: number } | null>(null);

  // Mini-Calculator 2: Quick 1RM & Plates State
  const [oneRmWeight, setOneRmWeight] = useState<number>(100);
  const [oneRmReps, setOneRmReps] = useState<number>(5);
  const [barbellWeight, setBarbellWeight] = useState<number>(20);

  // Mini Muscle Explorer State
  const [selectedMuscle, setSelectedMuscle] = useState<string>('chest');

  // Handle Quick TDEE calculation
  const handleCalculateTdee = () => {
    // Mifflin-St Jeor Formula
    const bmr = tdeeGender === 'male'
      ? Math.round(10 * tdeeWeight + 6.25 * tdeeHeight - 5 * 25 + 5)
      : Math.round(10 * tdeeWeight + 6.25 * tdeeHeight - 5 * 25 - 161);
    
    const tdee = Math.round(bmr * 1.55); // Moderate activity multiplier
    let targetCals = tdee;
    if (tdeeGoal === 'bulk') targetCals = Math.round(tdee * 1.12);
    if (tdeeGoal === 'cut') targetCals = Math.round(tdee * 0.82);

    const protein = Math.round(tdeeWeight * 2.2); // 2.2g per kg
    const fats = Math.round((targetCals * 0.25) / 9);
    const carbs = Math.max(50, Math.round((targetCals - (protein * 4 + fats * 9)) / 4));

    const trainingCals = Math.round(targetCals * 1.06);
    const restCals = Math.round(targetCals * 0.94);

    setTdeeResult({ bmr, tdee, targetCals, protein, carbs, fats, trainingCals, restCals });
    setTdeeCalculated(true);
  };

  // Compute 1RM dynamically
  const calculated1RM = Math.round(oneRmWeight * (1 + oneRmReps / 30));
  const plateWeightPerSide = Math.max(0, (oneRmWeight - barbellWeight) / 2);

  // Muscle exercises data for mini explorer
  const muscleExercisesMap: Record<string, { nameEn: string; nameAr: string; tipsEn: string; tipsAr: string; level: string }> = {
    chest: {
      nameEn: 'Incline Dumbbell Bench Press',
      nameAr: 'تجميع دمبلز عالي مائل (Incline Press)',
      tipsEn: '30-degree incline targets upper clavicular head with 1.2x contraction.',
      tipsAr: 'زاوية 30 درجة تركز على ألياف الصدر العلوي مع ثبات لوحي الكتف.',
      level: 'Advanced Hypertrophy'
    },
    back: {
      nameEn: 'Chest-Supported T-Bar Row',
      nameAr: 'سحب تي-بار بمسند للصدر (T-Bar Row)',
      tipsEn: 'Isolates the lats and rhomboids with zero lower back strain.',
      tipsAr: 'عزل كامل للاتس والمجنص مع حماية 100% للفقرات القطنية.',
      level: 'Elite V-Taper'
    },
    shoulders: {
      nameEn: 'Cable Egyptian Lateral Raise',
      nameAr: 'رفرفة جانبي بالكيبل مع انحناء (Egyptian Raise)',
      tipsEn: 'Maintains constant mechanical tension throughout full shoulder ROM.',
      tipsAr: 'شد ميكانيكي مستمر على الرأس الجانبي للكتف طوال المدى الحركي.',
      level: '3D Delts'
    },
    legs: {
      nameEn: 'Bulgarian Split Squat',
      nameAr: 'سكوات بلغاري أحادي (Bulgarian Split Squat)',
      tipsEn: 'Maximum quad and glute hypertrophy with unilateral balance correction.',
      tipsAr: 'تضخيم مكثف للفخذ الأمامي والخلفي وعلاج الفروقات العضلية.',
      level: 'Leg Day King'
    },
    arms: {
      nameEn: 'Incline Dumbbell Biceps Curl',
      nameAr: 'تبادل بايسبس على بنش مائل (Incline Curl)',
      tipsEn: 'Places the long head under deep stretch for peak bicep building.',
      tipsAr: 'استطالة عميقة للرأس الطويل للبايسبس لبروز قمة العضلة.',
      level: 'Arm Annihilator'
    },
    core: {
      nameEn: 'Hanging Leg Raises to 90°',
      nameAr: 'رفع أرجل معلق للعقلة (Hanging Leg Raise)',
      tipsEn: 'Targets lower abs and deep core transverse stabilizers without spine shear.',
      tipsAr: 'استهداف مباشر للبطن السفلية والجذع دون ضغط على العمود الفقري.',
      level: 'Six-Pack Shred'
    }
  };

  const faqs = isEn ? [
    {
      q: 'How does the AI Physique Scanner & Transformation Photo Analysis work?',
      a: 'The AI Physique Scanner acts as an elite sports scientist and biomechanics coach. When you upload or compare your progress photos, it evaluates muscle definition (score out of 100), estimated body fat range, shoulder-to-waist V-taper symmetry, posture alignment, and generates targeted hypertrophy focus areas and calorie/macro recommendations for your next training block.'
    },
    {
      q: 'How does Google Account Linking work for existing registered users?',
      a: 'BeastMode offers seamless Google Account Integration. You can link your existing BeastMode account with your Google account directly from your Profile settings or log in via Google with your registered email. All your existing workout plans, logs, and metrics remain 100% safe and intact.'
    },
    {
      q: 'How does the Smart Nutrition & Macro Coach (TDEE & Macro Cycling) work?',
      a: 'The coach applies the Mifflin-St Jeor scientific formula to compute your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). It features intelligent Macro Cycling: higher calories and complex carbs on training days for glycogen fullness (+6%), and lower calories with elevated healthy fats on rest days (-6%) for cellular recovery. It also provides meal timing across 4 biological windows and an interactive protein slider (1.6 to 2.6 g/kg).'
    },
    {
      q: 'What is the Barbell Plate & 1RM Calculator?',
      a: 'A visual Olympic barbell simulator (20kg, 15kg, 10kg) that renders standard Olympic color plates (25kg Red, 20kg Blue, 15kg Yellow, 10kg Green, 5kg White, 2.5kg Black, 1.25kg Chrome) and calculates the exact plate stack per side. The 1RM engine computes your 1-Rep Max using Epley and Brzycki equations, generating working set percentages (100% to 60%) for optimal hypertrophy and strength training.'
    },
    {
      q: 'Can I manage multiple workout routines at once (e.g. Gym split, Home routine, Travel plan)?',
      a: 'Yes! Our Multi-Plan Management Hub lets you build and maintain multiple complete workout programs simultaneously. You can set one as your Primary Active Plan, rename them, duplicate routines, and switch between them instantly with 0ms delay.'
    },
    {
      q: 'What are the Curated Pro & Legendary Workout Plans included in the library?',
      a: 'BeastMode includes gold-standard routines designed by bodybuilding legends and sports scientists: Arnold Schwarzenegger Golden Blueprint, Jeff Nippard Science Hypertrophy PPL, Dorian Yates Blood & Guts HIT, Lyle McDonald Generic Bulking, muscle focus splits (Chest, V-Taper Back, Arms), and dedicated home dumbbell & calisthenics programs.'
    },
    {
      q: 'What if I train at home without a workout bench or only have a floor yoga mat?',
      a: 'Our AI engine features intelligent equipment adaptation. If you do not have a workout bench, chest and triceps presses automatically convert to Floor Dumbbell Presses, Floor Flyes, and biomechanical push-up progressions. If you only have a mat or bodyweight, it optimizes for calisthenics, core stability, and functional mobility.'
    },
    {
      q: 'How does the Recovery Tracker, Water Counter & Streak Badges Hub work?',
      a: 'It includes a 1-tap quick water logger (+250ml, +500ml, +1L) towards your scientific hydration goal, daily sleep duration and quality logging, and unlocks motivational medals (Bronze, Silver, Gold, Diamond Beast, Hydration Master) as your workout consistency grows.'
    },
    {
      q: 'Does BeastMode work offline in underground gyms without internet connection?',
      a: 'Yes! BeastMode includes a dedicated PWA Service Worker caching engine with synthesized audio sound packs. Your active routine, exercise database, and session player run smoothly in gym basements even if your cellular connection drops.'
    },
    {
      q: 'Are my logs, progressive overload records, and personal metrics secure and private?',
      a: '100% private. We enforce an uncompromising Zero-Tracker & OWASP-compliant security standard. Your data is encrypted in Supabase cloud, and you can export complete JSON archives or permanently delete your account anytime.'
    }
  ] : [
    {
      q: 'كيف يعمل ماسح التحول البدني وتحليل الصور بالذكاء الاصطناعي (AI Physique Scanner)؟',
      a: 'يعمل ماسح الذكاء الاصطناعي كخبير تشريح عضلي ومحكم كمال أجسام دولي؛ حيث يحلل صور تقدمك البدني أو مقارنة قبل وبعد، ليعطيك تقييماً علمياً للبروز العضلي (من 100)، النطاق التقديري لنسبة الدهون، تناسق عرض الظهر V-Taper، نقاط القوة، والعضلات المستهدفة للتطوير مع توصية غذائية دقيقة للسعرات والماكروز.'
    },
    {
      q: 'كيف تعمل ميزة ربط الحساب المسجل سابقاً بحساب Google؟',
      a: 'يتيح BeastMode ربطاً آمناً ومباشراً بحساب Google؛ يمكنك ربط حسابك بضغطة زر من صفحة الملف الشخصي، أو تسجيل الدخول ببريدك عبر Google ليدمج الحساب تلقائياً مع الحفاظ الكامل 100% على كافة جداولك الرياضية، سجلات أوزانك، وصورك.'
    },
    {
      q: 'كيف يعمل مدرب التغذية والماكروز الذكي (Smart Nutrition & Macro Coach)؟',
      a: 'يعتمد النظام على معادلة Mifflin-St Jeor العلمية لحساب معدل الأيض (BMR) والحرق اليومي (TDEE). ويتميز بتدوير السعرات والماكروز (Macro Cycling): سعرات أعلى وكاربوهيدرات معقدة في أيام التمرين لشحن مخازن الجلايكوجين (+6%)، وسعرات أقل مع دهون صحية أعلى في أيام الراحة للاستشفاء العضلي (-6%)، بالإضافة لتوزيع الوجبات عبر 4 نوافذ حيوية وسلايدر بروتين مخصص (1.6 إلى 2.6 غ/كغ).'
    },
    {
      q: 'ما هي حاسبة صفائح البار الأولمبي والـ 1RM (Barbell Plate & 1RM Calculator)؟',
      a: 'محاكي بصري تفاعلي للبار الأولمبي (بار 20 كغ رجالي، 15 كغ سيدات/تكنيك، 10 كغ زكزاك) يوضح ألوان وصفائح البار الملونة بدقة وعددها لكل جهة. كما يحسب أقصى وزن لتكرار واحد (1RM) بأدق المعادلات (Epley & Brzycki) مع جدول النسب المئوية (100% إلى 60%) لتحديد أوزان جولات التضخيم والقوة.'
    },
    {
      q: 'هل يمكنني تصميم والاحتفاظ بأكثر من جدول تدريبي في نفس الوقت (نادي، منزل، سفر)؟',
      a: 'نعم بالتأكيد! عبر "مركز إدارة الجداول المتعددة (Multi-Plan Hub)" يمكنك إنشاء والاحتفاظ بعدة برامج تدريبية كاملة، وتعيين جدول واحد كأساسي نشط، مع إمكانية التبديل، النسخ والمضاعفة، وإعادة التسمية بضغطة زر وبسرعة فائقة.'
    },
    {
      q: 'ما هي خطط الأساطير والبرامج المعتمدة عالمياً المتوفرة في المنصة؟',
      a: 'تتضمن المنصة مناهج تدريبية عريقة مثل: جدول آرنولد شوارزنيجر الذهبي، نظام جيف نيبارد العلمي PPL، كثافة دوريان ييتس ومايك مينتزر HIT، جدول إريك هيلمز ولايل مكدونالد GBR، بالإضافة لجداول تضخيم الصدر، تعريض الظهر V-Taper، تفجير الذراعين، وخطط الدمبلز والكاليستنكس.'
    },
    {
      q: 'ماذا لو كنت أتدرب في المنزل بدون كرسي تدريب (بنش) أو امتلك سجادة يوجا فقط؟',
      a: 'يتميز النظام بالتكييف الذكي للأدوات؛ فعند عدم توفر بنش، تتحول تمارين الصدر والترايسبس تلقائياً إلى تمارين الضغط الأرضي بالدمبلز (Floor Dumbbell Press)، التجميع الأرضي (Floor Flyes)، وتنويعات الضغط بوزن الجسم. وإذا كان لديك مات فقط، يتم التركيز على الكاليستنكس وعضلات الجذع والوسط.'
    },
    {
      q: 'كيف يعمل متتبع الاستشفاء وشرب الماء ونظام الشارات والأوسمة؟',
      a: 'يتضمن التطبيق عداداً سريعاً لشرب الماء بنقرة زر (+250 مل، +500 مل، +1.0 لتر) ومتابعة ساعات وجودة النوم، مع نظام أوسمة تحفيزي يفتح لك شارات الإنجاز (3 أيام، 7 أيام، 14 يوماً، 30 يوماً، وبطل الترطيب) مع استمرارية التزامك الرياضي.'
    },
    {
      q: 'هل يعمل التطبيق في قاعات الجيم السفلية بدون شبكة إنترنت (Offline)؟',
      a: 'نعم! يدعم BeastMode تقنية PWA Service Worker للتخزين المؤقت؛ حيث يمكنك فتح جدولك التدريبي، تشغيل مشغل الحصة، ومؤقت الراحة والأصوات التفاعلية بدون انقطاع حتى لو كانت تغطية الجوال ضعيفة داخل الجيم.'
    },
    {
      q: 'هل بياناتي الرياضية وسجلاتي في أمان وخصوصية تامة؟',
      a: 'نعم 100%. نلتزم بأعلى معايير الأمان (OWASP) وانعدام التتبع التجاري (Zero-Tracker). سجلاتك مشفرة بالكامل في سحابة Supabase، ويمكنك تصديرها بملف JSON أو مسح حسابك نهائياً بنقرة واحدة.'
    }
  ];

  const steps = isEn ? [
    {
      num: '01',
      title: 'Analyze Metrics, Gear & Nutrition',
      desc: 'Set your target, schedule (2-6 days), available tools (Gym, Bench, Dumbbells, Mat), and compute your TDEE & macro split.'
    },
    {
      num: '02',
      title: 'AI Synthesis or Pro Legends',
      desc: 'Generate a periodized routine via dual AI, choose a legendary blueprint (Arnold, Nippard), or design multiple custom routines.'
    },
    {
      num: '03',
      title: 'Execute, Overload, Scan & Recover',
      desc: 'Train with the interactive player, calculate barbell plate loading & 1RM, scan physique with AI, and track deep recovery.'
    }
  ] : [
    {
      num: '01',
      title: 'تحليل المعطيات والأدوات والتغذية 🎯',
      desc: 'حدد هدفك الرياضي، أيام تمرينك (2-6 أيام)، أدواتك المتاحة (نادي، بنش، دمبلز، مات)، واحسب سعراتك وماكروزك بدقة.'
    },
    {
      num: '02',
      title: 'توليد ذكي أو اختيار من الأساطير 👑',
      desc: 'صِغ جدولك بالذكاء الاصطناعي المزدوج، أو اختر من مكتبة أساطير كمال الأجسام (آرنولد، PPL)، أو صمم وأدر جداول متعددة.'
    },
    {
      num: '03',
      title: 'التنفيذ، فحص AI والاستشفاء 📈',
      desc: 'تدرّب مع مشغل الحصة، احسب صفائح البار والـ 1RM، افحص تحولك البدني بماسح الذكاء الاصطناعي، وتابع نومك وترطيبك.'
    }
  ];

  // Comparison Table Data
  const comparisonItems = isEn ? [
    { feature: 'AI Workout Plan Customization', traditional: 'Static repetitive templates', beastmode: 'Dual AI (Groq + Gemini) tailored to equipment & goals' },
    { feature: 'Exercise Library Depth', traditional: '200 - 500 basic exercises', beastmode: '4,298+ Enriched Exercises + MuscleWiki + YouTube Form' },
    { feature: 'Offline Gym Execution', traditional: 'Fails in gym basements (Requires internet)', beastmode: 'Full PWA Offline Support with synthesized audio timer' },
    { feature: 'AI Physique & Symmetry Scanner', traditional: 'Not available or expensive subscription', beastmode: 'Built-in biomechanical analysis & V-Taper index' },
    { feature: 'Barbell Plates & 1RM Simulator', traditional: 'External calculator required', beastmode: 'Visual Olympic plate loader with working set %' },
    { feature: 'Pricing & Ads', traditional: 'Monthly subscriptions ($15-$30/mo) + ads', beastmode: '100% Free & Open Community Edition • Zero Ads' },
  ] : [
    { feature: 'تخصيص الجداول بالذكاء الاصطناعي', traditional: 'قوالب ثابتة ومكررة بدون فهم حقيقي', beastmode: 'ذكاء اصطناعي مزدوج (Groq + Gemini) يتكيف مع أدواتك' },
    { feature: 'حجم وعمق مكتبة التمارين', traditional: '200 إلى 500 تمرين فقط', beastmode: '4,298+ تمرين مفصل + صور تشريح + فيديوهات التكنيك' },
    { feature: 'العمل داخل صالات الجيم السفلية', traditional: 'يتوقف عن العمل عند انقطاع الإنترنت', beastmode: 'PWA أوفلاين كامل مع أصوات ومؤقتات بدون نت' },
    { feature: 'ماسح التحول والتناسق العضلي', traditional: 'غير متوفر أو باشتراكات مكلفة جداً', beastmode: 'تحليل بيوميكانيكي مجاني للدهون ومؤشر الـ V-Taper' },
    { feature: 'محاكي صفائح البار والـ 1RM', traditional: 'تحتاج تطبيقات خارجية منفصلة', beastmode: 'محاكي بصري ملون للبار وحساب الجولات بنقرة واحدة' },
    { feature: 'الاشتراكات والإعلانات', traditional: 'اشتراكات شهرية مدفوعة وإعلانات مزعجة', beastmode: 'مجاني بالكامل للمجتمع الرياضي • بدون أي إعلانات' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      
      {/* NAVIGATION BAR */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--primary-glow)' }}>
            <Dumbbell size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>
            BEASTMODE AI
          </span>
          <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            PRO v3.0
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(isEn ? 'ar' : 'en')}
            className="secondary-btn"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px' }}
          >
            <Globe size={14} />
            <span>{isEn ? 'العربية' : 'English'}</span>
          </button>
          
          <ThemeToggle />

          <button
            onClick={onLogin}
            className="secondary-btn"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
          >
            {isEn ? 'Sign In' : 'تسجيل الدخول'}
          </button>

          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '8px' }}
          >
            {isEn ? 'Get Started ⚡' : 'ابدأ مجاناً ⚡'}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '70px 20px 40px', maxWidth: '1180px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
        
        {/* Elite Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)' }}>
          <Crown size={16} color="#f59e0b" />
          <span>{isEn ? 'The All-in-One AI Fitness & Bodybuilding Ecosystem' : 'المنظومة الرياضية الشاملة للياقة البدنية، التغذية، وأساطير كمال الأجسام'}</span>
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 'clamp(32px, 5.2vw, 56px)', fontWeight: '900', lineHeight: 1.18, maxWidth: '1000px', letterSpacing: '-0.5px' }}>
          {isEn ? (
            <>Train Like A Pro With <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dual AI Intelligence</span>, 4,298+ Exercises & Smart Nutrition 🦍🔥</>
          ) : (
            <>درّب جسمك كالمحترفين.. بذكاء اصطناعي <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>يحلل عضلاتك</span>، يبني جدولك، ويحسب جرامات طعامك بدقة 🦍🔥</>
          )}
        </h1>

        {/* Hero Description */}
        <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'var(--text-secondary)', maxWidth: '880px', lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'Access certified routines (Arnold, Science PPL, Dorian Yates), calculate TDEE & macro cycling, scan your physique transformation with AI, visualize Olympic barbell plates & 1RM, and run seamless offline gym sessions with zero latency.'
            : 'استفد من مناهج أبطال العالم المعتمدة (آرنولد شوارزنيجر، PPL العلمي، دوريان ييتس)، احسب سعراتك وماكروزك اليومية، افحص تحولك وتناسقك العضلي بالذكاء الاصطناعي، حاكِ صفائح البار والـ 1RM، وتدرب أوفلاين في الجيم بلا انقطاع.'}
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '16px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px', fontWeight: '800' }}
          >
            <span>{isEn ? 'Build My Plan in 60s ⏱️⚡' : 'صمم خطتك المخصصة في 60 ثانية ⏱️⚡'}</span>
            <ArrowRight size={18} style={{ transform: isEn ? 'none' : 'rotate(180deg)' }} />
          </button>

          <button
            onClick={onLogin}
            className="secondary-btn"
            style={{ padding: '16px 30px', fontSize: '15px', borderRadius: '12px', fontWeight: '700' }}
          >
            {isEn ? 'Existing Athlete Sign In 🔑' : 'دخول الرياضيين المشتركين 🔑'}
          </button>

          <button
            onClick={() => onNavigateToLegal('about')}
            className="secondary-btn"
            style={{ padding: '16px 22px', fontSize: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Info size={16} />
            <span>{isEn ? 'About Platform' : 'عن المنصة ℹ️'}</span>
          </button>

          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="secondary-btn"
              style={{
                padding: '16px 22px',
                fontSize: '15px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: 'var(--primary)',
                background: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              <Download size={16} />
              <span>{isEn ? '📱 Install App on Mobile' : '📱 تثبيت التطبيق على هاتفك'}</span>
            </button>
          )}
        </div>

        {/* Trust Badges Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px', marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            {isEn ? '100% Private & OWASP Certified' : '100% خصوصية وأمان معتمد'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={16} color="#f59e0b" />
            {isEn ? 'Zero Ads & Instant Access' : 'بدون إعلانات تجارية'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <WifiOff size={16} color="var(--secondary)" />
            {isEn ? 'Works 100% Offline (PWA)' : 'يعمل أوفلاين في الجيم بدون نت'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={16} color="#ec4899" />
            {isEn ? '100% Free Community Edition' : 'مجاني بالكامل للمجتمع الرياضي'}
          </span>
        </div>

        {/* Interactive App Mockup Showcase */}
        <div className="glass-panel" style={{ width: '100%', maxWidth: '1080px', marginTop: '30px', padding: '24px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04), rgba(15, 23, 42, 0.6))' }}>
          
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
            {[
              { id: 'player', labelEn: '⏱️ Workout Player & Timer', labelAr: '⏱️ مشغل الحصة ومؤقت الراحة' },
              { id: 'scanner', labelEn: '🤖 AI Physique Scanner', labelAr: '🤖 ماسح التحول بالذكاء الاصطناعي' },
              { id: 'macros', labelEn: '🥗 Smart Macro Cycling', labelAr: '🥗 تدوير السعرات والماكروز' },
              { id: 'plates', labelEn: '🔢 Barbell Plate Simulator', labelAr: '🔢 محاكي صفائح البار والـ 1RM' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={activePreviewTab === tab.id ? 'primary-btn' : 'secondary-btn'}
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', cursor: 'pointer' }}
              >
                {isEn ? tab.labelEn : tab.labelAr}
              </button>
            ))}
          </div>

          {/* Active Preview Content */}
          <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            
            {activePreviewTab === 'player' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ textAlign: isEn ? 'left' : 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>EXERCISE 1 OF 6</span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800' }}>Incline Dumbbell Chest Press</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 14px', borderRadius: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '14px' }}>
                    <Timer size={16} />
                    <span>REST: 01:30 🔔</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', width: '100%' }}>
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SET 1</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>32 kg × 12 reps ✅</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SET 2</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>34 kg × 10 reps ✅</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#f59e0b' }}>SET 3 (ACTIVE)</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>36 kg × 8 reps 🔥</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'scanner' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: isEn ? 'left' : 'right' }}>
                <div style={{ padding: '14px', background: 'rgba(236, 72, 153, 0.08)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: 'bold' }}>{isEn ? 'MUSCLE DEFINITION' : 'مؤشر البروز العضلي'}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#ec4899' }}>88 / 100 🏆</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Sharp deltoid & chest separation' : 'بروز وتحديد عالي لألياف الصدر والأكتاف'}</div>
                </div>
                <div style={{ padding: '14px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 'bold' }}>{isEn ? 'ESTIMATED BODY FAT' : 'الدهون التقديرية'}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--secondary)' }}>12.4% 🔥</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Optimal athletic lean mass range' : 'نطاق كتلة عضلية صافية ممتاز'}</div>
                </div>
                <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>{isEn ? 'V-TAPER SYMMETRY' : 'تناسق الظهر والخصر'}</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>92% 📐</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Target upper lats for next block' : 'يوصى بالتركيز على المجنص العلوي'}</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'macros' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>🏋️ {isEn ? 'TRAINING DAY (HYPERTROPHY)' : 'يوم التمرين (تغذية البناء)'}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0' }}>2,850 kcal (+6%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Protein: 180g | Carbs: 360g | Fats: 65g</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary)' }}>🛌 {isEn ? 'REST DAY (DEEP RECOVERY)' : 'يوم الراحة (الاستشفاء العميق)'}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', margin: '6px 0' }}>2,450 kcal (-6%)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Protein: 180g | Carbs: 260g | Fats: 75g</div>
                </div>
              </div>
            )}

            {activePreviewTab === 'plates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {isEn ? 'Target Barbell Load: 120 kg (20 kg Bar + 50 kg per side)' : 'الوزن الإجمالي على البار: 120 كغ (بار 20 كغ + 50 كغ لكل جهة)'}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>25 kg Red</span>
                  <span style={{ padding: '4px 10px', background: '#2563eb', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>20 kg Blue</span>
                  <span style={{ padding: '4px 10px', background: '#ffffff', color: '#000', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>5 kg White</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>= 1RM Est: 138 kg 💥</span>
                </div>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* INTERACTIVE MINI TOOLS SECTION */}
      <section style={{ padding: '60px 20px', maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
            <Calculator size={16} />
            <span>{isEn ? 'Instant Free Micro-Tools' : 'أدوات تفاعلية وتجريبية فورية بدون تسجيل'}</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Try Our Scientific Engines Right Now' : 'جرّب محركاتنا العلمية فوراً بنقرة واحدة'}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Tool 1: Instant Mini-TDEE & Macro Calculator */}
          <div className="glass-panel" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)' }}>
                <Utensils size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {isEn ? 'Instant TDEE & Macro Split Calculator' : 'حاسبة السعرات والماكروز الفورية'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Weight (kg)' : 'الوزن (كغ)'}</label>
                <input 
                  type="number" 
                  value={tdeeWeight} 
                  onChange={(e) => setTdeeWeight(Number(e.target.value))} 
                  className="input-field" 
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Height (cm)' : 'الطول (سم)'}</label>
                <input 
                  type="number" 
                  value={tdeeHeight} 
                  onChange={(e) => setTdeeHeight(Number(e.target.value))} 
                  className="input-field" 
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Gender' : 'الجنس'}</label>
                <select 
                  value={tdeeGender} 
                  onChange={(e) => setTdeeGender(e.target.value as any)}
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', marginTop: '4px' }}
                >
                  <option value="male">{isEn ? 'Male 👨' : 'ذكر 👨'}</option>
                  <option value="female">{isEn ? 'Female 👩' : 'أنثى 👩'}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Target Goal' : 'الهدف'}</label>
                <select 
                  value={tdeeGoal} 
                  onChange={(e) => setTdeeGoal(e.target.value as any)}
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', marginTop: '4px' }}
                >
                  <option value="bulk">{isEn ? 'Lean Bulk (تضخيم)' : 'تضخيم عضلي (Lean Bulk)'}</option>
                  <option value="cut">{isEn ? 'Fat Loss (تنشيف)' : 'حرق دهون (Fat Loss)'}</option>
                  <option value="maintain">{isEn ? 'Maintain (محافظة)' : 'محافظة وتثبيت'}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateTdee}
              className="primary-btn"
              style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', fontWeight: 'bold' }}
            >
              {isEn ? 'Calculate Macros Now ⚡' : 'احسب السعرات والماكروز الآن ⚡'}
            </button>

            {tdeeCalculated && tdeeResult && (
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
                  <span>{isEn ? 'Target Calories:' : 'السعرات المستهدفة:'}</span>
                  <span style={{ color: 'var(--primary)' }}>{tdeeResult.targetCals} kcal</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  🍗 {isEn ? 'Protein:' : 'بروتين:'} <b>{tdeeResult.protein}g</b> | 🍚 {isEn ? 'Carbs:' : 'كارب:'} <b>{tdeeResult.carbs}g</b> | 🥑 {isEn ? 'Fats:' : 'دهون:'} <b>{tdeeResult.fats}g</b>
                </div>
                <button
                  onClick={onGetStarted}
                  className="glow-btn"
                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', marginTop: '4px' }}
                >
                  {isEn ? 'Get Training Plan For These Macros 🚀' : 'اصنع جدول تمرين متناسق مع هذه السعرات 🚀'}
                </button>
              </div>
            )}
          </div>

          {/* Tool 2: Quick Barbell & 1RM Calculator */}
          <div className="glass-panel" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Percent size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {isEn ? '1RM Strength & Barbell Simulator' : 'حاسبة الـ 1RM وصفائح البار'}
              </h3>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Barbell Type' : 'نوع البار المستخدم'}</label>
              <select
                value={barbellWeight}
                onChange={(e) => setBarbellWeight(Number(e.target.value))}
                className="input-field"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', marginTop: '4px' }}
              >
                <option value={20}>{isEn ? 'Olympic Standard (20 kg)' : 'بار أولمبي قياسي (20 كغ)'}</option>
                <option value={15}>{isEn ? 'Women / Technique Bar (15 kg)' : 'بار تكنيك / سيدات (15 كغ)'}</option>
                <option value={10}>{isEn ? 'EZ-Curl / Short Bar (10 kg)' : 'بار متعرج EZ قصير (10 كغ)'}</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Lifted Weight (kg)' : 'الوزن المرفوع (كغ)'}</label>
                <input 
                  type="number" 
                  value={oneRmWeight} 
                  onChange={(e) => setOneRmWeight(Number(e.target.value))} 
                  className="input-field" 
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{isEn ? 'Reps (تكرارات)' : 'التكرارات (Reps)'}</label>
                <input 
                  type="number" 
                  value={oneRmReps} 
                  onChange={(e) => setOneRmReps(Number(e.target.value))} 
                  className="input-field" 
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{isEn ? 'Calculated 1-Rep Max (1RM):' : 'أقصى وزن لتكرار واحد (1RM):'}</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#f59e0b' }}>{calculated1RM} kg</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11.5px', marginTop: '4px' }}>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                  🔥 Hypertrophy 80%: <b>{Math.round(calculated1RM * 0.8)} kg</b>
                </div>
                <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                  ⚡ Strength 90%: <b>{Math.round(calculated1RM * 0.9)} kg</b>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isEn ? `Loading on 20kg bar: ${plateWeightPerSide} kg per side` : `تحميل البار 20 كغ: يحتاج ${plateWeightPerSide} كغ لكل جهة`}
              </div>
            </div>
          </div>

          {/* Tool 3: Mini Muscle & Exercise Explorer */}
          <div className="glass-panel" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <Activity size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {isEn ? 'Interactive Muscle Exercise Preview' : 'مستكشف التمارين العضلية السريع'}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'chest', en: 'Chest', ar: 'الصدر' },
                { id: 'back', en: 'Back', ar: 'الظهر' },
                { id: 'shoulders', en: 'Shoulders', ar: 'الأكتاف' },
                { id: 'legs', en: 'Legs', ar: 'الأرجل' },
                { id: 'arms', en: 'Arms', ar: 'الذراعين' },
                { id: 'core', en: 'Core', ar: 'البطن' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMuscle(m.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: selectedMuscle === m.id ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedMuscle === m.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.02)',
                    color: selectedMuscle === m.id ? '#8b5cf6' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: selectedMuscle === m.id ? 'bold' : 'normal'
                  }}
                >
                  {isEn ? m.en : m.ar}
                </button>
              ))}
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 'bold' }}>
                ⭐ {muscleExercisesMap[selectedMuscle].level}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                {isEn ? muscleExercisesMap[selectedMuscle].nameEn : muscleExercisesMap[selectedMuscle].nameAr}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {isEn ? muscleExercisesMap[selectedMuscle].tipsEn : muscleExercisesMap[selectedMuscle].tipsAr}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SMART COMPARISON TABLE SECTION */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Why Athletes Choose BeastMode AI' : 'لماذا يفضل الرياضيون والمحترفون BeastMode AI؟'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            {isEn ? 'Compare BeastMode AI against traditional gym apps and expensive cookie-cutter subscriptions.' : 'مقارنة مباشرة توضح تفوق منظومة BeastMode مقابل تطبيقات الجيم التقليدية.'}
          </p>
        </div>

        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isEn ? 'left' : 'right', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '800' }}>{isEn ? 'Feature / Capability' : 'الميزة / الخاصية'}</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: '#ef4444' }}>{isEn ? 'Traditional Gym Apps ❌' : 'التطبيقات التقليدية ❌'}</th>
                <th style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--primary)' }}>{isEn ? 'BeastMode AI Ecosystem 🦍🔥' : 'منظومة BeastMode AI 🦍🔥'}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 'bold' }}>{item.feature}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                      <span>{item.traditional}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span>{item.beastmode}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP PIPELINE) */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'How BeastMode Powers Your Complete Transformation' : 'كيف يقودك BeastMode نحو أعلى مستويات القوة واللياقة؟'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            {isEn ? 'A seamless 3-step scientific cycle designed for progressive overload, nutrition mastery, and full recovery.' : 'منظومة تدريبية وتغذوية متكاملة من 3 خطوات تضمن تطور عضلاتك واستشفائك بلا توقف.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {steps.map((step, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--secondary)' : '#f59e0b', opacity: 0.8 }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section style={{ padding: '60px 20px', maxWidth: '1150px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
            {isEn ? '10 Elite Pillars Engineered For Total Athletic Dominance' : '10 ركائز احترافية صُنعت خصيصاً لتحقيق أقصى بناء بدني واستشفاء'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            {isEn ? 'Everything you need: workouts, nutrition, AI physique scanning, recovery, offline gym access, and Google integration.' : 'كل ما يحتاجه الرياضي العصري: الجداول، الماكروز، فحص التحول بالذكاء الاصطناعي، تتبع النوم والماء، والعمل بدون إنترنت.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Smart Nutrition & Macro Coach */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Smart Nutrition & Macro Coach' : 'مدرب التغذية والماكروز وتدوير السعرات'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Scientific BMR & TDEE calculation (Mifflin-St Jeor) with Workout vs Rest Day macro cycling (+6% cals & carbs on lift days, -6% cals on recovery days), meal timing, and clean foods reference.'
                : 'حساب علمي للسعرات والـ TDEE مع تدوير الماكروز (أيام التمرين كربوهيدرات وسعرات أعلى لشحن العضلات، وأيام الراحة دهون صحية للاستشفاء) ودليل الأغذية النظيفة.'}
            </p>
          </div>

          {/* Card 2: AI Physique Scanner & Transformation Gallery */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(236, 72, 153, 0.3)', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), transparent)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'AI Physique Scanner & Progress Gallery' : 'ماسح التحول والتناسق العضلي بالذكاء الاصطناعي'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Automated biomechanical scan of your transformation photos: estimates body fat %, scores muscle definition (1-100), evaluates V-taper symmetry, and suggests targeted hypertrophy adjustments.'
                : 'فحص بيوميكانيكي لصور تطورك البدني: تقدير نسبة الدهون، حساب مؤشر البروز العضلي (من 100)، تقييم تناسق الظهر والخصر، واقتراح العضلات المستهدفة للجدول القادم.'}
            </p>
          </div>

          {/* Card 3: Barbell Plate & 1RM Calculator */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Olympic Barbell Plate & 1RM Simulator' : 'محاكي صفائح البار وحاسبة الـ 1RM'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Visual Olympic barbell plate loader (20kg/15kg bar with colored 25/20/15/10/5/2.5/1.25kg plates) plus 1RM Epley/Brzycki calculation and full percentage working set tables.'
                : 'محاكي بصري ملون لصفائح البار الأولمبي وحساب الأوزان الدقيقة لكل جهة، مع حاسبة أقصى تكرار (1RM) وجدول النسب المئوية لجولات التضخيم والقوة.'}
            </p>
          </div>

          {/* Card 4: Recovery Tracker & Gamification Badges */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(6, 182, 212, 0.3)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), transparent)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Recovery, Hydration & Streak Badges' : 'مركز الاستشفاء وشرب الماء وأوسمة الإنجاز'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? '1-tap water logger, sleep hours and quality tracking for MPS recovery, and motivational unlockable badges for consistency streaks (3, 7, 14, 30 days).'
                : 'عداد سريع لشرب الماء بنقرة زر، متتبع ساعات وجودة النوم لتعزيز هرمون النمو، وشارات وأوسمة تحفيزية متصلة بأيام الالتزام والاستمرارية.'}
            </p>
          </div>

          {/* Card 5: Legendary Pro Plans */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Curated Legendary & Pro Splits' : 'مكتبة خطط الأساطير والمدربين المعتمدين'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Directly apply certified workout routines: Arnold Schwarzenegger Golden Blueprint, Jeff Nippard Science PPL, Dorian Yates HIT, and muscle focus routines.'
                : 'طبّق برامج أساطير كمال الأجسام بضغطة زر: جدول آرنولد شوارزنيجر الذهبي، نظام جيف نيبارد العلمي PPL، كثافة دوريان ييتس، وبرامج التركيز العضلي.'}
            </p>
          </div>

          {/* Card 6: Multi-Plan Management Hub */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Multi-Plan Management Hub' : 'إدارة وتصميم الجداول المتعددة'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Create and keep multiple routines (Gym, Home, Travel) with 1 primary active routine. Duplicate, rename, edit, and switch active plans effortlessly.'
                : 'احتفظ بعدة جداول في حسابك (جدول النادي، المنزل، السفر) مع تعيين جدول أساسي نشط. يمكنك نسخ الجداول وتعديلها والتبديل بينها فورياً.'}
            </p>
          </div>

          {/* Card 7: Intelligent Equipment & Bench Adaptation */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Intelligent Equipment & Bench Adaptation' : 'التكييف الذكي للأدوات ومقعد التمرين'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'No workout bench? The AI automatically converts chest routines to Floor Dumbbell Press, Floor Flyes, and push-up progressions without requiring a bench.'
                : 'لا تملك كرسي تدريب (بنش)؟ يقوم النظام تلقائياً بتكييف تمارين الصدر لتعتمد على الضغط الأرضي (Floor Press) والوزن الحر بأمان تام.'}
            </p>
          </div>

          {/* Card 8: Interactive Anatomy & 4,298+ Exercises */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? '4,298+ Exercises & 3D Muscle Anatomy' : 'موسوعة 4,298 تمرين وخريطة التشريح'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Click any muscle zone to discover targeted exercises with biomechanical cues, common mistakes, and 3-tier reliable animated demonstrations.'
                : 'انقر على أي عضلة في الجسم لتكتشف أفضل التمارين التي تستهدفها بدقة مع نصائح التكنيك الصحيح وشروحات الفيديو والرسوم الحركية.'}
            </p>
          </div>

          {/* Card 9: Session Player, Audio Packs & Offline PWA */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WifiOff size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'PWA Gym Offline Mode & Audio Packs' : 'وضع الجيم بدون نت وباقات الأصوات'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Zero-latency live workout player with boxing bell & whistle rest timer sound packs, volume controls, and offline PWA caching for gym basements.'
                : 'مشغل حصة تفاعلي بدون تأخير، باقات أصوات مؤقت الراحة (جرس ملاكمة وصافرة مدرب)، وتخزين مؤقت كامل للعمل في الجيم بدون اتصال بالإنترنت.'}
            </p>
          </div>

          {/* Card 10: Seamless Google Auth & OWASP Security */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Google Account Sync & OWASP Shield' : 'ربط Google السلس وحصن أمان OWASP'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Instant 1-click Google account linking with zero data loss, email OTP password recovery, and enterprise database protection.'
                : 'ربط الحساب بحساب Google بضغطة زر مع الحفاظ على كافة البيانات، استعادة الحساب برموز OTP، وحماية أمنية مشددة وفق معايير OWASP.'}
            </p>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: '60px 20px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Frequently Asked Questions' : 'الأسئلة الشائعة وإجابات الخبراء'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px' }}>
            {isEn ? 'Everything you need to know about BeastMode AI features, AI physique scanning, nutrition, 1RM, and Google linking.' : 'كل ما تود معرفته عن منصة BeastMode AI، ماسح التحول العضلي، التغذية، وحاسبة الأوزان.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-panel" style={{ padding: '18px 22px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }} onClick={() => setOpenFaq(isOpen ? null : idx)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '15px' }}>
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} />}
                </div>
                {isOpen && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '14px', lineHeight: 1.7 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: '70px 20px', textAlign: 'center', background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Ready to Transform Your Physique & Scan Your Progress with AI?' : 'جاهز لبدء رحلة التحول البدني وفحص تقدمك بالذكاء الاصطناعي؟'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            {isEn
              ? 'Join BeastMode AI today and get your personalized workout program, AI physique scanning, macro targets, and legendary splits in seconds.'
              : 'انضم لـ BeastMode AI اليوم واحصل على خطتك التدريبية، ماسح التحول بالذكاء الاصطناعي، وتغذيتك الدقيقة وابدأ فوراً.'}
          </p>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '16px 40px', fontSize: '16.5px', borderRadius: '12px', fontWeight: '800' }}
          >
            {isEn ? 'Get Started For Free ⚡' : 'ابدأ مجاناً الآن ⚡'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '26px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', maxWidth: '1100px', margin: '0 auto', width: '100%', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div>
          © {new Date().getFullYear()} BeastMode AI Fitness. {isEn ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigateToLegal('about')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={13} />
            <span>{isEn ? 'About BeastMode' : 'من نحن (About Us)'}</span>
          </button>
          <button onClick={() => onNavigateToLegal('privacy')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={13} />
            <span>{isEn ? 'Privacy Policy' : 'سياسة الخصوصية والأمان'}</span>
          </button>
          <button onClick={() => onNavigateToLegal('terms')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={13} />
            <span>{isEn ? 'Terms of Service' : 'شروط الاستخدام والإخلاء'}</span>
          </button>
        </div>
      </footer>

      {/* STICKY MOBILE QUICK ACTION BAR (Visible upon scroll) */}
      {showStickyMobileBar && (
        <div
          className="animated-fade"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', borderRadius: '8px' }}>
              <Dumbbell size={16} />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '800' }}>BEASTMODE AI</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                {isEn ? 'Dual AI • 4,298+ Exercises' : 'ذكاء اصطناعي • 4,298 تمرين'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onGetStarted}
              className="glow-btn"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{isEn ? 'Build Plan ⚡' : 'صمم خطتك ⚡'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
