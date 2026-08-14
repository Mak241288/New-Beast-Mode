import React, { useState } from 'react';
import { Dumbbell, Sparkles, Activity, ShieldCheck, Zap, ArrowRight, ChevronDown, ChevronUp, Globe, FileText, Lock } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface LandingPageProps {
  lang: 'ar' | 'en';
  onGetStarted: () => void;
  onLogin: () => void;
  onLanguageChange: (lang: 'ar' | 'en') => void;
  onNavigateToLegal: (page: 'privacy' | 'terms') => void;
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
      q: 'How does BeastMode AI customize my workout routine?',
      a: 'BeastMode analyzes your specific fitness level, available gym/home equipment, injuries, and target weight to generate periodized routines with progressive overload.'
    },
    {
      q: 'Can I use the app at home without any equipment?',
      a: 'Yes! You can specify Bodyweight only, and BeastMode AI will select optimal calisthenics and bodyweight exercises targeting every muscle group.'
    },
    {
      q: 'How accurate is the 4,200+ exercise library?',
      a: 'Every exercise is verified with target anatomy, category, primary & secondary muscle groups, execution form cues, and YouTube instructional videos.'
    },
    {
      q: 'Is my personal health and workout data secure?',
      a: 'Absolutely. We follow strict privacy standards. Your data is encrypted, never sold to third parties, and you can export or delete your account at any time.'
    }
  ] : [
    {
      q: 'كيف يصمم BeastMode AI جدول تمارين مخصص لي بدقة؟',
      a: 'يحلل المحرك الذكي مستواك البدني، الأدوات المتوفرة لديك (نادي أو منزل)، الإصابات السابقة، وهدفك، لتوزيع التمارين والأوزان والتكرارات بأسلوب التدرج بالحمل (Progressive Overload).'
    },
    {
      q: 'هل يمكنني التدريب في المنزل بدون أي أدوات أو أوزان؟',
      a: 'بالتأكيد! يمكنك اختيار "وزن الجسم فقط"، وسيقوم النظام بتصميم جدول متكامل من تمارين الكاليستنكس والوزن الحر لاستهداف جميع العضلات بفعالية.'
    },
    {
      q: 'ما الذي يميز مكتبة التمارين (4,200+ تمرين)؟',
      a: 'كل تمرين موثق بالتشريح العضلي الدقيق، خطوات الأداء الصحيحة، شورتس فيديو توضيحي، وبدائل ذكية فورية في حال عدم توفر الجهاز أو الشعور بألم.'
    },
    {
      q: 'هل بياناتي الصحية وسجلاتي في أمان وخصوصية؟',
      a: 'نعم 100%. نلتزم بأعلى معايير الخصوصية والتشفير. بياناتك ملكك وحدك ويمكنك تصديرها بملف كامل أو حذف حسابك نهائياً بضغطة زر.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVIGATION BAR */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BEASTMODE AI
          </span>
          <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
            v2.5 FLASH
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
            {isEn ? 'Get Started' : 'ابدأ الآن مجاناً ⚡'}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '80px 20px 60px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span>{isEn ? 'Next-Gen AI Fitness & Muscle Wiki Platform' : 'الجيل القادم لتدريب اللياقة وتشريح العضلات بالذكاء الاصطناعي'}</span>
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: '900', lineHeight: 1.15, maxWidth: '900px' }}>
          {isEn ? (
            <>Unleash Your <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Inner Beast</span> With Intelligent Sports Science</>
          ) : (
            <>فجّر <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>طاقتك البدنية</span> بخبرة 66 عاماً في علوم التدريب الذكي</>
          )}
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', maxWidth: '750px', lineHeight: 1.6 }}>
          {isEn
            ? 'Personalized AI workout schedules tailored to your available equipment, interactive 3D muscle anatomy map, 4,200+ verified exercises with form videos, and automated progressive overload.'
            : 'جداول تدريبية ذكية مصممة خصيصاً لمعداتك، خريطة تفاعلية لتشريح 16 منطقة عضلية، مكتبة ضخمة تضم أكثر من 4,200 تمرين موثق بالفيديو، ونظام تتبع ذكي يضمن تقدمك المستمر.'}
        </p>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '14px 32px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>{isEn ? 'Build My Routine Now' : 'صمم خطتك التدريبية الآن'}</span>
            <ArrowRight size={18} style={{ transform: isEn ? 'none' : 'rotate(180deg)' }} />
          </button>

          <button
            onClick={onLogin}
            className="secondary-btn"
            style={{ padding: '14px 28px', fontSize: '15px' }}
          >
            {isEn ? 'Existing User Login' : 'دخول المشتركين'}
          </button>
        </div>

        {/* Quick Highlights Counter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', width: '100%', maxWidth: '850px', marginTop: '40px' }}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>4,207+</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Verified Exercises' : 'تمرين رياضي موثق'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--secondary)' }}>16</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Target Muscle Zones' : 'منطقة عضلية تفاعلية'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#f59e0b' }}>0 ms</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Instant DB Caching' : 'سرعة استجابة فائقة'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#ec4899' }}>100%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{isEn ? 'Privacy & Data Export' : 'خصوصية وتصدير البيانات'}</div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800' }}>
            {isEn ? 'Engineered for Performance & Aesthetics' : 'مميزات مصممة لتحقيق أقصى بناء بدني'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            {isEn ? 'Everything you need to train smarter, avoid injuries, and measure progress.' : 'كل ما تحتاجه للتدريب بذكاء، وتجنب الإصابات، وقياس التطور بدقة.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{isEn ? 'Gemini 2.5 AI Engine' : 'محرك الذكاء الاصطناعي Gemini'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isEn
                ? 'Balances training volume, calculates progressive overload, and adapts routines automatically when your weight or location changes.'
                : 'يوازن الأحمال التدريبية، يوزع المجموعات والتكرارات، ويعدل جدولك فورياً عند تغير وزنك أو مكان تمرينك.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{isEn ? 'Interactive Body Anatomy' : 'خريطة تشريح العضلات التفاعلية'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isEn
                ? 'Click on any muscle zone (Chest, Quads, Lats, Shoulders) to instantly view targeted exercises, form tips, and video tutorials.'
                : 'اضغط على أي عضلة بالخريطة التفاعلية لتكتشف أفضل التمارين التي تستهدفها مع نصائح التكنيك الصحيح وشرح الفيديو.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{isEn ? 'Smart Exercise Swaps' : 'استبدال التمارين الذكي'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isEn
                ? 'Device occupied or feeling shoulder pain? Request a smart swap that matches the same muscle using only your available gear.'
                : 'الجهاز مشغول بالنادي أو تشعر بألم في المفصل؟ استبدل التمرين فورياً ببديل يستهدف نفس العضلة بالمعدات المتوفرة لديك.'}
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{isEn ? 'Printable Sheets & CSV Export' : 'تصدير وطباعة الجداول الورقية'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isEn
                ? 'Export your workouts and weight progression to CSV / Excel, or print a high-contrast gym workout sheet with sets checkboxes.'
                : 'قم بتصدير خطتك وسجلاتك لملف إكسل، أو اطبع جدول التدريب الورقي المنسق مع خانات التأشير لتسجيل أوزانك بالصالة الرياضية.'}
            </p>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: '60px 20px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{isEn ? 'Frequently Asked Questions' : 'الأسئلة الشائعة'}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-panel" style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setOpenFaq(isOpen ? null : idx)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '15px' }}>
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} />}
                </div>
                {isOpen && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900' }}>
            {isEn ? 'Ready to Transform Your Physique?' : 'جاهز لبدء رحلة التحول البدني الآن؟'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isEn ? 'Join BeastMode AI today and get your personalized periodized workout program in seconds.' : 'انضم لـ BeastMode AI اليوم واحصل على خطتك التدريبية المخصصة في ثوانٍ معدودة.'}
          </p>
          <button
            onClick={onGetStarted}
            className="glow-btn"
            style={{ padding: '14px 36px', fontSize: '16px' }}
          >
            {isEn ? 'Get Started For Free' : 'ابدأ مجاناً الآن ⚡'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', maxWidth: '1100px', margin: '0 auto', width: '100%', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div>
          © {new Date().getFullYear()} BeastMode AI Fitness. {isEn ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => onNavigateToLegal('privacy')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} />
            <span>{isEn ? 'Privacy Policy' : 'سياسة الخصوصية'}</span>
          </button>
          <button onClick={() => onNavigateToLegal('terms')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} />
            <span>{isEn ? 'Terms of Service' : 'شروط الاستخدام'}</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
