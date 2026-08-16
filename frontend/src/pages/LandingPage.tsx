import React, { useState } from 'react';
import { Dumbbell, Activity, ShieldCheck, Zap, ArrowRight, ChevronDown, ChevronUp, Globe, FileText, Lock, Info, Crown, Layers, Timer } from 'lucide-react';
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
      q: 'How does the 4,207+ Exercise Anatomy Encyclopedia work?',
      a: 'Every exercise is indexed with biomechanical form cues, primary/secondary muscle targeting, animated GIF demonstrations, YouTube video guides, and our 3-tier fallback media architecture that guarantees visual guides are always accessible instantly.'
    },
    {
      q: 'Can I design my own custom workout routine from scratch?',
      a: 'Absolutely. You can use our Interactive Manual Builder with real-time fuzzy search autocomplete, import raw workout text or documents via AI bulk parser, or apply pre-made day templates (Push/Pull/Legs, Upper/Lower) and customize sets and reps freely.'
    },
    {
      q: 'Are my logs, progressive overload records, and personal metrics secure and private?',
      a: '100% private. We enforce an uncompromising Zero-Tracker & OWASP-compliant security standard. Your data is encrypted in Supabase cloud, and you can export complete JSON archives or permanently delete your account anytime.'
    }
  ] : [
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
      q: 'كيف تعمل موسوعة التمارين الرياضية (4,207 تمرين) وخريطة التشريح؟',
      a: 'كل تمرين موثق بالتشريح العضلي الدقيق، خطوات الأداء الصحيحة، شروحات الفيديو والرسوم الحركية، مع إمكانية النقر على أي عضلة في خريطة الجسم التفاعلية لاكتشاف أفضل التمارين المستهدفة لها فورياً.'
    },
    {
      q: 'هل يمكنني تصميم وتخصيص جدولي التدريبي يدوياً من الصفر؟',
      a: 'بكل تأكيد! يوفر BeastMode مصمماً يدوياً تفاعلياً مع إكمال تلقائي ذكي للتمارين، أو استيراد الجداول من نصوص أو ملفات عبر الذكاء الاصطناعي، أو تطبيق قوالب يومية جاهزة (Push/Pull/Legs) والتعديل عليها بحرية تامة.'
    },
    {
      q: 'هل بياناتي الرياضية وسجلاتي في أمان وخصوصية تامة؟',
      a: 'نعم 100%. نلتزم بأعلى معايير الأمان (OWASP) وانعدام التتبع التجاري (Zero-Tracker). سجلاتك مشفرة بالكامل في سحابة Supabase، ويمكنك تصديرها بملف JSON أو مسح حسابك نهائياً بنقرة واحدة.'
    }
  ];

  const steps = isEn ? [
    {
      num: '01',
      title: 'Analyze Metrics & Gear',
      desc: 'Define your goal, schedule (2-6 days), available tools (Gym, Bench, Dumbbells, Mat), and physical constraints.'
    },
    {
      num: '02',
      title: 'AI Synthesis or Pro Legends',
      desc: 'Generate a periodized routine via dual AI, choose a legendary blueprint (Arnold, Nippard), or design manually.'
    },
    {
      num: '03',
      title: 'Execute, Overload & Dominate',
      desc: 'Train with the interactive session player, log weights with 0ms speed, and track your true progressive overload.'
    }
  ] : [
    {
      num: '01',
      title: 'تحليل المعطيات والأدوات 🎯',
      desc: 'حدد هدفك الرياضي، عدد أيام تمرينك (2-6 أيام)، أدواتك المتاحة (نادي، بنش، دمبلز، مات)، وأي إصابات لتفاديها.'
    },
    {
      num: '02',
      title: 'توليد ذكي أو اختيار من الأساطير 👑',
      desc: 'صِغ جدولك بالذكاء الاصطناعي المزدوج، أو اختر من مكتبة أساطير كمال الأجسام (آرنولد، PPL)، أو صمم جدولك يدوياً.'
    },
    {
      num: '03',
      title: 'التنفيذ والتدرج نحو القوة 📈',
      desc: 'تدرّب عبر مشغل الحصة التفاعلي، سجّل أوزانك بسرعة فائقة بدون انتظار، وراقب منحنى تطورك البدني بدقة.'
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
            PRO v2.6
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
          <span>{isEn ? 'Next-Gen Sports Science & Multi-Plan Periodization' : 'المنظومة الرياضية الشاملة للياقة البدنية، الجداول المتعددة، وعلوم التمرين'}</span>
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: '900', lineHeight: 1.15, maxWidth: '980px', letterSpacing: '-0.5px' }}>
          {isEn ? (
            <>Sculpt Your Ultimate Physique With <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Legendary Science</span> & Precision AI</>
          ) : (
            <>اصنع نسختك الأقوى.. ببرامج <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>أساطير كمال الأجسام</span> وذكاء اصطناعي يحلل كل عضلة</>
          )}
        </h1>

        {/* Hero Description */}
        <p style={{ fontSize: 'clamp(15px, 2vw, 18.5px)', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'Access certified routines (Arnold, Science PPL, Dorian Yates), manage multiple workout programs with one primary active plan, train with intelligent bench/floor adaptation, explore 4,207+ anatomical exercises, and track progress with zero latency.'
            : 'استفد من مناهج أبطال العالم المعتمدة (آرنولد شوارزنيجر، PPL العلمي، دوريان ييتس)، صمم وأدر جداول متعددة مع تعيين جدول أساسي، تدرّب بذكاء مع تكييف تمارين البنش والأرضية، واستكشف 4,207 تمرين موثق مع سرعة استجابة فائقة.'}
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '15px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px' }}
          >
            <span>{isEn ? 'Build My Workout Routine ⚡' : 'صمم خطتك التدريبية الآن ⚡'}</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '18px', width: '100%', maxWidth: '950px', marginTop: '40px' }}>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--primary)' }}>4,207+</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Verified Exercises' : 'تمرين رياضي موثق'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: '#f59e0b' }}>👑 Pro</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Legendary Coach Splits' : 'خطط الأساطير والعلماء'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--secondary)' }}>📑 Multi</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Multi-Plan Management' : 'إدارة الجداول المتعددة'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: '#ec4899' }}>0 ms</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Instant SWR Speed' : 'سرعة استجابة فائقة'}</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP PIPELINE) */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'How BeastMode Powers Your Transformation' : 'كيف يقودك BeastMode نحو أعلى مستويات القوة؟'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            {isEn ? 'A seamless 3-step scientific cycle designed for continuous progressive overload.' : 'منظومة تدريبية ذكية من 3 خطوات تضمن تطور عضلاتك بلا توقف.'}
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
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Engineered for Performance, Hypertrophy & Safety' : 'مزايا متقدمة صُنعت خصيصاً لتحقيق أقصى بناء بدني'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            {isEn ? 'Everything an athlete needs to train smarter, prevent injuries, and measure true progress.' : 'كل ما يحتاجه الرياضي العصري للتدريب بذكاء، تفادي الإصابات، وقياس التطور بدقة مطلقة.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Legendary Pro Plans */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
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

          {/* Card 2: Multi-Plan Management Hub */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
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

          {/* Card 3: Intelligent Equipment & Bench Adaptation */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
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

          {/* Card 4: Interactive Muscle Anatomy & Encyclopedia */}
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

          {/* Card 5: Daily Dynamic Protocols & Active Player */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Timer size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Session Player & Rest Timer' : 'مشغل الحصة التدريبية ومؤقت الراحة'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Train step-by-step with the live workout player, auto-rest countdowns with sound beeps, session warmups, and cooldown stretches.'
                : 'تدرّب خطوة بخطوة مع مشغل الحصة التفاعلي، مؤقت الراحة الذكي مع تنبيهات صوتية، وبروتوكولات الإحماء والاستشفاء اليومية.'}
            </p>
          </div>

          {/* Card 6: OWASP Security & Privacy */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'OWASP Security & Zero-Tracker' : 'أمان OWASP وخصوصية تامة'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Enterprise bcrypt hashing, OTP verification for credentials, rate limiting protection, and 1-click permanent account deletion.'
                : 'تشفير متقدم لكلمات المرور، توثيق آمن برمز OTP، حماية صارمة ضد الهجمات، مع إمكانية مسح الحساب بالكامل متى شئت.'}
            </p>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: '60px 20px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Frequently Asked Questions' : 'الأسئلة الشائعة وإجابات الخبراء'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px' }}>
            {isEn ? 'Everything you need to know about BeastMode AI features, multi-plans, and sports science.' : 'كل ما تود معرفته عن منصة BeastMode AI وإدارة الجداول والمزايا الذكية.'}
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
        <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>
            {isEn ? 'Ready to Transform Your Physique?' : 'جاهز لبدء رحلة التحول البدني وصناعة نسختك الأقوى؟'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            {isEn
              ? 'Join BeastMode AI today and get your personalized periodized workout program or legendary split in seconds.'
              : 'انضم لـ BeastMode AI اليوم واحصل على خطتك التدريبية المخصصة أو اختر من خطط الأساطير وابدأ رحلتك الرياضية بثقة.'}
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
