import React, { useState } from 'react';
import { Dumbbell, Activity, Zap, ArrowRight, ChevronDown, ChevronUp, Globe, FileText, Lock, Info, Crown, Layers, Utensils, Percent, Droplets, WifiOff, Brain } from 'lucide-react';
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVIGATION BAR */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--primary-glow)' }}>
            <Dumbbell size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>
            BEASTMODE AI
          </span>
          <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            PRO v3.0 ECOSYSTEM
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(isEn ? 'ar' : 'en')}
            className="secondary-btn"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Globe size={14} />
            <span>{isEn ? 'العربية' : 'English'}</span>
          </button>
          
          <ThemeToggle />

          <button
            onClick={onLogin}
            className="secondary-btn"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {isEn ? 'Sign In' : 'تسجيل الدخول'}
          </button>

          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            {isEn ? 'Get Started ⚡' : 'ابدأ مجاناً ⚡'}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '90px 20px 60px', maxWidth: '1150px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '26px' }}>
        
        {/* Elite Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)' }}>
          <Crown size={16} color="#f59e0b" />
          <span>{isEn ? 'All-in-One AI Fitness, Nutrition, 1RM & Physique Scanner' : 'المنظومة الرياضية المتكاملة للياقة البدنية، التغذية الذكية، وأساطير كمال الأجسام'}</span>
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: '900', lineHeight: 1.15, maxWidth: '980px', letterSpacing: '-0.5px' }}>
          {isEn ? (
            <>Sculpt Your Ultimate Physique With <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Legendary Science</span>, AI Physique Scanning & Smart Macros</>
          ) : (
            <>اصنع نسختك الأقوى.. ببرامج <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>أساطير كمال الأجسام</span>، ماسح الذكاء الاصطناعي، وتغذية دقيقة</>
          )}
        </h1>

        {/* Hero Description */}
        <p style={{ fontSize: 'clamp(15px, 2vw, 18.5px)', color: 'var(--text-secondary)', maxWidth: '840px', lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'Access certified routines (Arnold, Science PPL, Dorian Yates), calculate TDEE & macro cycling, scan your physique transformation with AI, visualize Olympic barbell plates & 1RM, and manage multiple workout programs with zero latency.'
            : 'استفد من مناهج أبطال العالم المعتمدة (آرنولد شوارزنيجر، PPL العلمي، دوريان ييتس)، احسب سعراتك وماكروزك اليومية، افحص تحولك وتناسقك العضلي بالذكاء الاصطناعي، حاكِ صفائح البار والـ 1RM، وأدر جداول تدريبية متعددة بسلاسة.'}
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '15px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px' }}
          >
            <span>{isEn ? 'Build My Complete Plan ⚡' : 'صمم خطتك الرياضية والغذائية الآن ⚡'}</span>
            <ArrowRight size={18} style={{ transform: isEn ? 'none' : 'rotate(180deg)' }} />
          </button>

          <button
            onClick={onLogin}
            className="secondary-btn"
            style={{ padding: '15px 30px', fontSize: '15px', borderRadius: '12px' }}
          >
            {isEn ? 'Existing User Login 🔑' : 'دخول المشتركين 🔑'}
          </button>

          <button
            onClick={() => onNavigateToLegal('about')}
            className="secondary-btn"
            style={{ padding: '15px 24px', fontSize: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Info size={16} />
            <span>{isEn ? 'About Platform' : 'عن المنصة ℹ️'}</span>
          </button>
        </div>

        {/* Quick Highlights / Proof Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', width: '100%', maxWidth: '1020px', marginTop: '40px' }}>
          <div className="glass-panel" style={{ padding: '20px 14px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>🥗 TDEE</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Smart Macro Cycling' : 'تدوير السعرات والماكروز'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px 14px', textAlign: 'center', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#ec4899' }}>🤖 AI Scan</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Physique & Symmetry AI' : 'ماسح التحول والتناسق'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px 14px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#f59e0b' }}>🔢 1RM</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Barbell Plate Visualizer' : 'محاكي صفائح البار والـ 1RM'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px 14px', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--secondary)' }}>💧 Recovery</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Water, Sleep & Badges' : 'متتبع الماء والنوم والأوسمة'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px 14px', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#8b5cf6' }}>4,207+</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Enriched Exercises' : 'تمرين رياضي موثق'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px 14px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>📶 PWA</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Offline Gym Mode' : 'وضع الجيم بدون نت'}</div>
          </div>
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

          {/* Card 8: Interactive Anatomy & 4,207+ Exercises */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? '4,207+ Exercises & 3D Muscle Anatomy' : 'موسوعة 4,207 تمرين وخريطة التشريح'}</h3>
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
            style={{ padding: '16px 40px', fontSize: '16.5px', borderRadius: '12px' }}
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

    </div>
  );
};
