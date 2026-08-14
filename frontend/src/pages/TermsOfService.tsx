import React from 'react';
import { FileText, ArrowLeft, ArrowRight, AlertTriangle, Dumbbell } from 'lucide-react';

interface TermsProps {
  lang: 'ar' | 'en';
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsProps> = ({ lang, onBack }) => {
  const isEn = lang === 'en';

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', color: 'var(--text-primary)' }}>
      <button
        onClick={onBack}
        className="secondary-btn"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
      >
        {isEn ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        <span>{isEn ? 'Back to App' : 'العودة للتطبيق'}</span>
      </button>

      <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)' }}>
            <FileText size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
              {isEn ? 'Terms of Service' : 'شروط الاستخدام وإخلاء المسؤولية الرياضية'}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isEn ? 'Last Updated: August 2026' : 'آخر تحديث: أغسطس 2026'}
            </p>
          </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell size={16} />
            <span>{isEn ? '1. App Purpose & Fitness Guidance' : '1. طبيعة المنصة والتوجيه التدريبي'}</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {isEn
              ? 'BeastMode AI is an intelligent fitness training and exercise tracking software. All generated routines, sets, reps, and exercise swaps are suggestions based on sports science algorithms.'
              : 'منصة BeastMode AI هي أداة رياضية ذكية لمساعدة الرياضيين في تنظيم تمارينهم. جميع الجداول والأوزان والمجموعات المقترحة هي توصيات مبنية على خوارزميات علوم الرياضة.'}
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{isEn ? '2. Physical Safety & Medical Disclaimer' : '2. السلامة البدنية وإخلاء المسؤولية الطبية'}</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {isEn
              ? 'Always perform proper warm-ups and use weights within your safe capacity. If you experience severe joint pain, dizziness, or sharp discomfort, cease the exercise immediately. Consult a certified medical professional before beginning any intense physical regimen if you have underlying conditions.'
              : 'احرص دائماً على الإحماء السليم وعدم رفع أوزان تفوق قدرتك الآمنة. في حال شعورك بأي ألم حاد في المفاصل أو دوار، أوقف التمرين فوراً. استشر طبيبك المختص قبل بدء برامج بدنية مكثفة إذا كانت لديك حالات صحية سابقة.'}
          </p>
        </section>
      </div>
    </div>
  );
};
