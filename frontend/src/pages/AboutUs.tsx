import React from 'react';
import { Dumbbell, ArrowLeft, ArrowRight, Zap, Target, Sparkles, ShieldCheck, Database, Layers, Flame, Award } from 'lucide-react';

interface AboutUsProps {
  lang: 'ar' | 'en';
  onBack: () => void;
  onNavigateToWorkout?: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ lang, onBack, onNavigateToWorkout }) => {
  const isEn = lang === 'en';

  const pillars = [
    {
      icon: <Sparkles size={24} color="var(--primary)" />,
      title: isEn ? 'Autonomous AI Workout Engine' : 'محرك التدريب بالذكاء الاصطناعي الفائق',
      desc: isEn 
        ? 'Next-generation algorithms (Groq Llama-3 & Google Gemini) that construct mathematically periodized workout routines adapted to individual goals, available equipment, and physical injuries.'
        : 'خوارزميات استدلال فائقة السرعة تبني برامج رياضية مخصصة ومدروسة علمياً تتوافق بدقة مع أهدافك، مستوى لياقتك، أدواتك المتاحة، وإصاباتك البدنية.'
    },
    {
      icon: <Database size={24} color="var(--secondary)" />,
      title: isEn ? '4,207+ Enriched Exercise Encyclopedia' : 'موسوعة التمارين الرياضية (4,207 تمرين)',
      desc: isEn
        ? 'Massive exercise library indexing movement mechanics, muscle targets, animated visual demos, and MuscleWiki instructions with 3-tier offline/CDN fallback resilience.'
        : 'أضخم قاعدة بيانات عربية/إنجليزية مصنفة تشريحياً، مزودة برسوم حركية متحركة وتوجيهات أداء دقيقة مع نظام بدائل مرئي ثلاثي الطبقات يضمن ظهور الصور دائماً.'
    },
    {
      icon: <Flame size={24} color="#f59e0b" />,
      title: isEn ? 'Daily Warmup & Cooldown Protocols' : 'بروتوكولات الإحماء والاستشفاء اليومية',
      desc: isEn
        ? 'Dynamic pre-workout joint activation and post-workout static stretches custom-curated for every individual training session to maximize performance and prevent injury.'
        : 'تمارين إحماء حركي مخصصة لكل يوم تدريبي لتجهيز المفاصل والعضلات قبل رفع الأوزان، مع إطالات استشفائية تخفف آلام العضلات وتسرع البناء.'
    },
    {
      icon: <Layers size={24} color="#8b5cf6" />,
      title: isEn ? 'Interactive 3D/2D Muscle Anatomy' : 'خريطة التشريح العضلي التفاعلية',
      desc: isEn
        ? 'Explore 16 major anatomical muscle groups visually to discover exact targeted exercises, biomechanics, and synergistic compound movements.'
        : 'خريطة تفاعلية فريدة تمكنك من النقر على أي عضلة في الجسم لاستكشاف تمارينها المستهدفة وفهم الميكانيكا الحيوية لأدائها بذكاء.'
    },
    {
      icon: <Zap size={24} color="#ec4899" />,
      title: isEn ? '0ms Instant SWR Cloud Sync' : 'سرعة فائقة ومزامنة سحابية (0ms Delay)',
      desc: isEn
        ? 'Stale-While-Revalidate caching paired with Supabase PostgreSQL cloud sync ensures instant page loads across devices with seamless offline resiliency.'
        : 'بنية تحتية متطورة بنظام الكاش الفوري (SWR) المتصل بسحابة Supabase ليفتح التطبيق في 0 ثانية وتظل جداولك وسجلاتك متزامنة أينما كنت.'
    },
    {
      icon: <ShieldCheck size={24} color="#10b981" />,
      title: isEn ? 'OWASP-Grade Privacy & Security' : 'أمان مشدد وخصوصية غير قابلة للمساومة',
      desc: isEn
        ? 'Zero ad trackers, bcrypt encrypted passwords, OTP verification codes, 1-click JSON export, and permanent GDPR account deletion capability.'
        : 'انعدام تام للإعلانات والتتبع التجاري، تشفير كامل لكلمات المرور، توثيق الحساب برموز OTP، مع حق تصدير بياناتك أو حذف الحساب نهائياً بنقرة واحدة.'
    }
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px', color: 'var(--text-primary)' }}>
      <button
        onClick={onBack}
        className="secondary-btn"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
      >
        {isEn ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        <span>{isEn ? 'Back to App' : 'العودة للتطبيق'}</span>
      </button>

      <div className="glass-panel animated-fade" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '30px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '18px', borderRadius: '50%', boxShadow: '0 8px 32px var(--primary-glow)' }}>
            <Dumbbell size={40} color="#ffffff" />
          </div>
          
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, background: 'linear-gradient(135deg, #ffffff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BEASTMODE AI
          </h1>
          
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.6, margin: 0 }}>
            {isEn
              ? 'The next-generation AI fitness and bodybuilding operating system, engineered to democratize elite sports science and hyper-personalized strength training for athletes worldwide.'
              : 'المنظومة الذكية الرائدة للياقة البدنية وكمال الأجسام، صُممت لتضع أحدث علوم التدريب الرياضي والذكاء الاصطناعي المخصص بين يديك لتحقيق أقصى بناء بدني وقوة.'}
          </p>
        </div>

        {/* MISSION & VISION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '16px' }}>
              <Target size={20} />
              <span>{isEn ? 'Our Mission' : 'رؤيتنا ورسالتنا'}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {isEn
                ? 'To eliminate the guesswork and cookie-cutter routines from fitness by delivering deterministic, injury-conscious, and periodized training intelligence tailored to your exact physical metrics and equipment.'
                : 'القضاء على العشوائية والجداول المنسوخة في عالم الرياضة، وتقديم جداول تدريبية ذكية تراعي صحة المفاصل، وتتطور تلقائياً مع زيادة أوزانك وقدراتك.'}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(6, 182, 212, 0.04)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: '800', fontSize: '16px' }}>
              <Award size={20} />
              <span>{isEn ? 'Our Core Philosophy' : 'فلسفتنا التدريبية'}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {isEn
                ? 'We believe that precision, consistency, and safe biomechanics form the foundation of lifelong athletic progress. BeastMode provides the tools to track every rep, discover alternatives, and achieve your peak physique.'
                : 'نؤمن بأن الالتزام، التكنيك السليم، والزيادة التدريجية المدروسة هي سر النجاح البدني. نمنحك كافة الأدوات لمتابعة كل تكرار، واستكشاف البدائل المناسبة لكل تمرين.'}
            </p>
          </div>
        </div>

        {/* 6 PILLARS OF BEASTMODE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, textAlign: isEn ? 'left' : 'right' }}>
            {isEn ? 'Why BeastMode AI Leads the Industry' : 'أركان القوة في منصة BeastMode AI'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {pillars.map((pillar, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                    {pillar.icon}
                  </div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: '800', margin: 0 }}>{pillar.title}</h3>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {onNavigateToWorkout && (
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
              {isEn ? 'Experience the Power of BeastMode AI' : 'جرّب قوة BeastMode AI التدريبية الآن'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {isEn ? 'Start tracking your workouts or build a brand-new AI routine in seconds.' : 'ابدأ تدريبك اليوم، تابع أوزانك، واصنع نسختك الأقوى والأفضل.'}
            </p>
            <button
              onClick={onNavigateToWorkout}
              className="glow-btn"
              style={{ padding: '12px 28px', fontSize: '14px' }}
            >
              {isEn ? 'Go to My Workout Plan 🗓️' : 'الانتقال إلى خطتي الرياضية 🗓️'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
