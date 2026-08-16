import React, { useState } from 'react';
import { Dumbbell, Sparkles, Activity, ShieldCheck, Zap, ArrowRight, ChevronDown, ChevronUp, Globe, FileText, Lock, Info, Flame, TrendingUp } from 'lucide-react';
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
      q: 'How does BeastMode AI craft my personalized workout plan?',
      a: 'Our dual-inference AI engine analyzes your exact body metrics, experience level, available home/gym equipment, schedule, and previous injuries. It mathematically distributes training volume with progressive overload algorithms to maximize hypertrophy and strength.'
    },
    {
      q: 'Can I train effectively at home with minimal or no equipment?',
      a: 'Yes, absolutely. You can select "Bodyweight Only" or specific tools like Dumbbells and Bands. The AI automatically designs comprehensive calisthenics or home routines with muscle-specific activation.'
    },
    {
      q: 'What makes the 4,207+ Exercise Encyclopedia unique?',
      a: 'Every single exercise features biomechanical form cues, primary and secondary muscle targeting, animated demonstrations, and our 3-tier fallback media architecture that guarantees visual guides are always accessible even offline.'
    },
    {
      q: 'How do the Dynamic Warmup & Cooldown protocols protect me?',
      a: 'Before your main lifts, BeastMode generates joint mobility and muscle pre-activation movements specific to that session\'s muscle groups. After working out, it curates targeted static stretches to accelerate recovery and minimize soreness.'
    },
    {
      q: 'Are my workout logs, weight progression, and data private?',
      a: '100% private. We enforce an uncompromising Zero-Tracker policy. We never monetize or sell your data. Your records are encrypted in Supabase cloud, and you can export full JSON archives or permanently delete your account at any moment.'
    }
  ] : [
    {
      q: 'كيف يصمم BeastMode AI خطة تدريبية مخصصة لجسمي بدقة رياضية؟',
      a: 'يقوم محرك الذكاء الاصطناعي المزدوج بتحليل قياساتك البدنية، مستوى لياقتك، المعدات المتوفرة لديك (نادي أو منزل)، وأي إصابات سابقة. ثم يوزع الأحمال والمجموعات والتكرارات بأسلوب الزيادة التدريجية (Progressive Overload) لتحقيق أقصى بناء عضلي وقوة.'
    },
    {
      q: 'هل يمكنني التدريب في المنزل بدون معدات وتحقيق نتائج حقيقية؟',
      a: 'بالتأكيد! يمكنك اختيار "وزن الجسم فقط" أو أدوات بسيطة كالدمبلز وحبال المقاومة، وسيقوم النظام بتصميم جدول متكامل من تمارين الكاليستنكس والوزن الحر لاستهداف جميع الزوايا العضلية بدقة واحترافية.'
    },
    {
      q: 'ما الذي يميز موسوعة التمارين الرياضية (4,207 تمرين)؟',
      a: 'كل تمرين موثق بالتشريح العضلي الدقيق، خطوات الأداء الصحيحة، شروحات الفيديو والرسوم المتحركة، مع تقنية عرض الصور ثلاثية الطبقات التي تضمن ظهور التمارين فورياً حتى مع بطء الاتصال.'
    },
    {
      q: 'كيف تحميني بروتوكولات الإحماء والاستشفاء اليومية من الإصابات؟',
      a: 'قبل بدء رفع الأوزان، يولد النظام تمارين إحماء حركي مخصصة فقط للعضلات والمفاصل المستهدفة في ذلك اليوم. وبعد انتهاء التمرين، يقترح إطالات استشفائية تخفف آلام العضلات وتسرع البناء العضلي.'
    },
    {
      q: 'هل بياناتي وسجلاتي الرياضية في أمان وخصوصية تامة؟',
      a: 'نعم 100%. نلتزم بسياسة انعدام التتبع التجاري (Zero-Tracker). لا نبيع ولا نشارك بياناتك مع أي طرف خارجي، وبياناتك مشفرة بالكامل ويمكنك تصديرها بملف JSON أو مسح الحساب نهائياً بنقرة واحدة.'
    }
  ];

  const steps = isEn ? [
    {
      num: '01',
      title: 'Analyze Metrics & Equipment',
      desc: 'Define your fitness goal, schedule (2-6 days), available tools (Gym, Home, Dumbbells), and physical limitations.'
    },
    {
      num: '02',
      title: 'AI Synthesis & Customization',
      desc: 'Our engine generates a periodized split with tailored warmups, exercise alternatives, and optimal rep/set schemes.'
    },
    {
      num: '03',
      title: 'Log, Overload & Progress',
      desc: 'Track weights seamlessly with 0ms instant loading, observe volume analytics, and smash your personal records.'
    }
  ] : [
    {
      num: '01',
      title: 'تحليل المعطيات والأدوات 🎯',
      desc: 'حدد هدفك الرياضي، عدد أيام تمرينك (2-6 أيام)، أدواتك المتاحة (نادي، منزل، دمبلز)، وأي إصابات يجب مراعاتها.'
    },
    {
      num: '02',
      title: 'صياغة الجدول بالذكاء الاصطناعي 🧠',
      desc: 'يبني النظام جدولك المتوازن علمياً مع بروتوكولات الإحماء المخصصة، زوايا الاستهداف، وبدائل التمارين الذكية.'
    },
    {
      num: '03',
      title: 'التتبع والتدرج المستمر 📈',
      desc: 'سجل أوزانك وجولاتك بسرعة فائقة بدون انتظار، راقب منحنى تقدمك البياني، وشاهد نتائج تحولك البدني.'
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
            PRO v2.5
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
          <Sparkles size={15} />
          <span>{isEn ? 'The Operating System for Elite Physique Transformation' : 'المنظومة الذكية الرائدة للياقة البدنية وكمال الأجسام'}</span>
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: '900', lineHeight: 1.15, maxWidth: '960px', letterSpacing: '-0.5px' }}>
          {isEn ? (
            <>Unleash Your <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Inner Beast</span> With Intelligent Sports Science</>
          ) : (
            <>اصنع نسختك الأقوى.. بذكاء اصطناعي يحلل <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>كل زاوية عضلية</span> في جسمك</>
          )}
        </h1>

        {/* Hero Description */}
        <p style={{ fontSize: 'clamp(15px, 2vw, 18.5px)', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.7, margin: 0 }}>
          {isEn
            ? 'Deterministic AI workout periodization, interactive 3D muscle anatomy with 4,207+ verified exercises, session-specific warmup & cooldown protocols, and 0ms instant cloud synchronization.'
            : 'برامج تدريبية ذكية تُصاغ علمياً لمعداتك وأهدافك، خريطة تشريح تفاعلية لـ 16 عضلة، وموسوعة شاملة تضم أكثر من 4,207 تمرين مع بروتوكولات الإحماء والاستشفاء اليومية وسرعة فائقة بدون انتظار.'}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '18px', width: '100%', maxWidth: '900px', marginTop: '40px' }}>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--primary)' }}>4,207+</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Verified Exercises' : 'تمرين رياضي موثق'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: 'var(--secondary)' }}>16</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Interactive Muscle Zones' : 'منطقة عضلية تفاعلية'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: '#f59e0b' }}>0 ms</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Instant SWR Load' : 'سرعة استجابة فائقة'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '22px 16px', textAlign: 'center', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div style={{ fontSize: '30px', fontWeight: '900', color: '#ec4899' }}>100%</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>{isEn ? 'Privacy & No Trackers' : 'خصوصية وبدون إعلانات'}</div>
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
          
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Dual AI Engine (Groq & Gemini)' : 'محرك الذكاء الاصطناعي المزدوج'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Balances training volume, distributes optimal sets and rep cadences, and automatically adapts routines when your metrics change.'
                : 'يوازن الأحمال التدريبية بدقة، يوزع المجموعات والتكرارات، ويعدل جدولك فورياً وتلقائياً عند تغير وزنك أو مكان تمرينك.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Interactive 3D/2D Muscle Anatomy' : 'خريطة التشريح العضلي التفاعلية'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Click on any muscle zone (Chest, Quads, Lats, Deltoids) to instantly discover targeted movements, biomechanical cues, and visual video guides.'
                : 'انقر على أي عضلة في الجسم لتكتشف أفضل التمارين التي تستهدفها بدقة مع نصائح التكنيك الصحيح وشروحات الفيديو والرسوم الحركية.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Dynamic Daily Warmup & Cooldown' : 'بروتوكولات الإحماء والاستشفاء اليومية'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Custom mobility routines and stretches generated per session to pre-activate stabilizers and accelerate post-workout recovery.'
                : 'إحماء حركي مخصص لكل يوم تدريبي يجهز مفاصلك قبل رفع الأوزان، مع إطالات استشفائية تخفف آلام العضلات وتسرع البناء.'}
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Smart Exercise Swaps' : 'استبدال التمارين الذكي'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Gym machine occupied or feeling shoulder soreness? Swap any exercise instantly for an anatomical alternative using your available equipment.'
                : 'الجهاز مشغول بالنادي أو تشعر بألم في المفصل؟ استبدل التمرين فورياً ببديل يستهدف نفس العضلة بالمعدات المتوفرة لديك.'}
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{isEn ? 'Volume Analytics & Printable Sheets' : 'تحليلات الحجم وطباعة الجداول'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isEn
                ? 'Export data to CSV/JSON, track weight progression curves, or print a high-contrast gym workout sheet with checkbox sets.'
                : 'قم بتصدير خطتك وسجلاتك، راقب منحنى تقدم الأوزان، أو اطبع جدول التدريب الورقي المنسق مع خانات التأشير لتسجيل أوزانك بالنادي.'}
            </p>
          </div>

          {/* Card 6 */}
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
            {isEn ? 'Everything you need to know about BeastMode AI features and training.' : 'كل ما تود معرفته عن منصة BeastMode AI وكيفية استخدامها.'}
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
              ? 'Join BeastMode AI today and get your personalized periodized workout program in seconds.'
              : 'انضم لـ BeastMode AI اليوم واحصل على خطتك التدريبية المخصصة في ثوانٍ معدودة وابدأ رحلتك الرياضية بثقة.'}
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
