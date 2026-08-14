import React from 'react';
import { ShieldCheck, ArrowLeft, ArrowRight, Lock, Database, UserX } from 'lucide-react';

interface PrivacyPolicyProps {
  lang: 'ar' | 'en';
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang, onBack }) => {
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
          <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
              {isEn ? 'Privacy Policy' : 'سياسة الخصوصية وأمان البيانات'}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isEn ? 'Last Updated: August 2026' : 'آخر تحديث: أغسطس 2026'}
            </p>
          </div>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} />
            <span>{isEn ? '1. Zero-Tracker & Data Protection Commitment' : '1. التزامنا التام بحماية وسرية بياناتك'}</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {isEn
              ? 'At BeastMode AI, your privacy is our top priority. We do not sell, rent, or monetize your health metrics, weight logs, or personal information with any third-party advertisers or data brokers.'
              : 'في BeastMode AI، نعتبر خصوصيتك أولوية قصوى. لا نقوم إطلاقاً ببيع أو تأجير أو مشاركة قياساتك البدنية وسجلات أوزانك مع أي شركات إعلانية أو أطراف خارجية.'}
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} />
            <span>{isEn ? '2. Information We Collect and How It Is Used' : '2. ما نجمعه من بيانات وكيفية استخدامها'}</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {isEn
              ? 'We collect only the essential fitness variables (height, current/target weight, workout location, equipment, and injury notes) solely to generate safe, personalized workout routines via Gemini AI.'
              : 'نجمع فقط المعلومات الأساسية اللازمة للتدريب (الطول، الوزن الحالي والمستهدف، مكان التدريب، الأدوات المتاحة، وسجل الإصابات) وذلك حصرياً لتوليد برامج تدريبية مخصصة وآمنة لك عبر الذكاء الاصطناعي.'}
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserX size={16} />
            <span>{isEn ? '3. Data Portability & The Right to be Forgotten' : '3. حق تصدير البيانات والحذف الكامل للحساب'}</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {isEn
              ? 'You have complete sovereignty over your data. At any time from your Profile settings, you can export your entire workout and progress history in a standard JSON/CSV format, or permanently delete your account and all associated records from our database.'
              : 'أنت المالك الوحيد لبياناتك. يمكنك في أي وقت من صفحة الملف الشخصي تصدير نسختك الكاملة بصيغة JSON أو CSV، أو حذف حسابك نهائياً مع مسح كافة السجلات من قاعدة البيانات بدون رجعة.'}
          </p>
        </section>
      </div>
    </div>
  );
};
