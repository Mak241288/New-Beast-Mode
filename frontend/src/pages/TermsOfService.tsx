import React from 'react';
import { FileText, ArrowLeft, ArrowRight, Dumbbell, Flame, ShieldAlert, HeartPulse, Scale } from 'lucide-react';

interface TermsProps {
  lang: 'ar' | 'en';
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsProps> = ({ lang, onBack }) => {
  const isEn = lang === 'en';

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', color: 'var(--text-primary)' }}>
      <button
        onClick={onBack}
        className="secondary-btn"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
      >
        {isEn ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        <span>{isEn ? 'Back to App' : 'العودة للتطبيق'}</span>
      </button>

      <div className="glass-panel" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}>
            <FileText size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isEn ? 'Terms of Service & Fitness Disclaimer' : 'شروط الاستخدام وإخلاء المسؤولية الرياضية والطبية'}
            </h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isEn ? 'Last Updated: August 2026 • Please read carefully before training' : 'آخر تحديث: أغسطس 2026 • يرجى القراءة بعناية قبل بدء التمارين'}
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Dumbbell size={18} />
            <span>{isEn ? '1. Purpose of the Platform & AI Recommendations' : '1. طبيعة المنصة وتوصيات الذكاء الاصطناعي'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'BeastMode AI is an advanced algorithmic fitness platform designed to structure, track, and optimize strength and hypertrophy workouts. All generated workout splits, exercise variations, set/rep ranges, and AI swap recommendations are intelligent fitness suggestions grounded in exercise science, but must always be executed in accordance with your personal physical capabilities.'
              : 'تعد منصة BeastMode AI نظاماً رياضياً متقدماً مصمماً لتنظيم ومتابعة وتطوير جداول كمال الأجسام واللياقة البدنية. جميع الجداول التدريبية المقترحة والمجموعات والتكرارات وبدائل التمارين الذكية هي توصيات رياضية مبنية على أسس علوم التمرين، ولكن يجب دائماً تطبيقها بما يتناسب مع طاقتك وقدرتك البدنية الشخصية.'}
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Flame size={18} />
            <span>{isEn ? '2. Warmup, Cooldown & Injury Prevention Mandate' : '2. إلزامية الإحماء والاستشفاء والوقاية من الإصابات'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'Users are strongly advised to complete the dynamic Warmup and Cooldown protocols generated specifically for each training day. Never attempt maximum load lifts without adequate joint mobility and muscular pre-activation. Proper lifting form must always supersede weight magnitude.'
              : 'يُنصح المستخدمون بشدة بإجراء بروتوكولات الإحماء الديناميكي والاستشفاء المخصصة لكل يوم تدريبي قبل البدء برفع الأوزان. تجنب تماماً رفع أوزان ثقيلة دون تهيئة المفاصل وتنشيط العضلات المستهدفة. كما أن الأداء الحركي الصحيح (Form) هو الأولوية الأولى دائماً قبل زيادة الوزن.'}
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <HeartPulse size={18} />
            <span>{isEn ? '3. Health & Medical Disclaimer' : '3. إخلاء المسؤولية الصحية والطبية'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'BeastMode AI is not a substitute for professional medical advice, clinical diagnosis, or physical therapy. If you have pre-existing cardiovascular conditions, herniated discs, chronic joint ailments, or post-surgical limitations, consult a certified physician before starting any workout program. Cease training immediately if you experience dizziness, shortness of breath, acute pain, or nausea.'
              : 'منصة BeastMode AI ليست بديلاً عن الاستشارة الطبية أو التشخيص السريري أو العلاج الطبيعي. إذا كنت تعاني من أمراض قلبية أو انزلاق غضروفي أو إصابات مزمنة، استشر طبيبك المختص قبل البدء بأي برنامج رياضي مكثف. توقف عن التمرين فوراً في حال شعرت بألم حاد في المفاصل، دوار، ضيق تنفس، أو غثيان.'}
          </p>
        </section>

        {/* Section 4 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ShieldAlert size={18} />
            <span>{isEn ? '4. Account Integrity & User Responsibility' : '4. أمان الحساب ومسؤولية المستخدم'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'You are solely responsible for maintaining the confidentiality of your account credentials, password, and OTP codes. You agree not to share your credentials or engage in unauthorized scraping or malicious disruption of the platform services.'
              : 'أنت المسؤول الوحيد عن الحفاظ على سرية بيانات تسجيل دخولك وكلمة المرور ورموز التحقق (OTP). وتوافق على عدم مشاركة بيانات حسابك أو محاولة استغلال المنصة أو إجراء أي نشاط قد يعطل استقرار وسرعة الخدمات.'}
          </p>
        </section>

        {/* Section 5 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Scale size={18} />
            <span>{isEn ? '5. Exercise Library & Intellectual Property' : '5. حقوق الملكية الفكرية ومكتبة التمارين'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'The BeastMode AI software interface, algorithmic generators, anatomical diagrams, and enriched database of 4,207 exercises are proprietary assets protected under international copyright and software intellectual property laws.'
              : 'تعتبر واجهة تطبيق BeastMode AI وخوارزميات الذكاء الاصطناعي والخرائط التشريحية ومكتبة التمارين الغنية التي تضم 4,207 تمرين أصولاً رقمية محمية بموجب قوانين الملكية الفكرية وحقوق النشر البرمجية.'}
          </p>
        </section>

      </div>
    </div>
  );
};
