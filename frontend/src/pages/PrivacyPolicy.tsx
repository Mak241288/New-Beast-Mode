import React from 'react';
import { ShieldCheck, ArrowLeft, ArrowRight, Lock, UserX, Cpu, Server, KeyRound, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  lang: 'ar' | 'en';
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang, onBack }) => {
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
          <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isEn ? 'Privacy Policy & Data Security' : 'سياسة الخصوصية وأمان وحماية البيانات'}
            </h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {isEn ? 'Last Updated: August 2026 • Full Compliance with OWASP & GDPR Standards' : 'آخر تحديث: أغسطس 2026 • متوافق بالكامل مع معايير الأمان العالمية OWASP و GDPR'}
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Lock size={18} />
            <span>{isEn ? '1. Zero-Tracker & Data Sovereignty Guarantee' : '1. التزام تام بانعدام التتبع والسيادة المطلقة على بياناتك'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'At BeastMode AI, your fitness and health privacy is sacred. We enforce a zero-tracker policy: we do not sell, rent, monetize, or disclose your physical dimensions, workout history, weight logs, or biometric inputs to third-party ad networks, data brokers, or marketing syndicates.'
              : 'في منصة BeastMode AI، نعتبر خصوصيتك البدنية والرياضية خطاً أحمر لا مساس به. نلتزم بسياسة انعدام التتبع (Zero-Tracker): لا نقوم إطلاقاً ببيع أو تأجير أو مشاركة أو استغلال قياساتك البدنية، جداولك التدريبية، سجلات أوزانك، أو بياناتك الشخصية مع أي شبكات إعلانية أو وسطاء بيانات خارجيين.'}
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Cpu size={18} />
            <span>{isEn ? '2. Artificial Intelligence Processing & Safety' : '2. معالجة وتوليد البرامج بالذكاء الاصطناعي'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'Our AI workout engine utilizes cutting-edge inference models (Groq Llama-3 & Google Gemini) purely to synthesize safe, personalized workout routines based on your fitness goals, target muscle groups, injury notes, and available equipment. Your sensitive personal identifiers (such as emails and hashed passwords) are NEVER forwarded to external AI model training pipelines.'
              : 'يعتمد محركنا الذكي على أحدث نماذج الاستدلال الفائق (Groq Llama-3 و Google Gemini) حصرياً لابتكار برامج تدريبية آمنة ومخصصة لأهدافك، عضلاتك المستهدفة، إصاباتك ومعداتك المتوفرة. ولا يتم إطلاقاً إرسال بيانات هويتك الحساسة (كالبريد الإلكتروني وكلمات المرور) لتدريب أي نماذج ذكاء اصطناعي.'}
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Server size={18} />
            <span>{isEn ? '3. Cloud Storage, SWR Offline Caching & Encryption' : '3. التخزين السحابي المشفر والتخزين المحلي الفوري (SWR)'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'Your data is securely persisted in enterprise PostgreSQL clusters hosted on Supabase with TLS encryption at rest and in transit. For blazing 0ms instant loading, we implement Stale-While-Revalidate (SWR) client caching within your browser localStorage. Logging out instantly purges all local cached data from your device.'
              : 'يتم حفظ بياناتك بأمان في قواعد بيانات PostgreSQL سحابية عالية الموثوقية (Supabase) مع تشفير كامل أثناء الإرسال والتخزين (TLS/SSL). ولتحقيق سرعة تحميل فائقة (0ms)، يتم حفظ كاش محلي بنمط SWR في متصفحك. وعند تسجيل الخروج، يتم مسح كافة البيانات المؤقتة فورياً من جهازك.'}
          </p>
        </section>

        {/* Section 4 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <KeyRound size={18} />
            <span>{isEn ? '4. Authentication, Passwords & OTP Security' : '4. أمان كلمات المرور ورموز التحقق (OTP)'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'Passwords are cryptographically salted and hashed using industry-standard bcrypt algorithms (10 salt rounds) and cannot be read by anyone, including our engineers. Account recovery and password modifications are secured with 6-digit cryptographic OTP codes with 10-minute expiry windows and strict rate limiting.'
              : 'يتم تشفير كلمات المرور باستخدام خوارزميات bcrypt الرياضية المتقدمة مع 10 جولات تمليح (Salt)، ولا يمكن قراءتها من أي شخص بما في ذلك مهندسونا. ويتم تأمين استعادة الحساب وتعديل البيانات برموز OTP مشفرة تنتهي بعد 10 دقائق مع حماية صارمة ضد التخمين والهجمات.'}
          </p>
        </section>

        {/* Section 5 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <UserX size={18} />
            <span>{isEn ? '5. Data Portability & GDPR Right to be Forgotten' : '5. حق تصدير البيانات والحذف النهائي الفوري (GDPR)'}</span>
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {isEn
              ? 'You maintain 100% control over your training records. You can download an unencrypted, complete JSON export of all your routines, weight history, and logs at any time from your Profile. Additionally, you have the right to delete your account permanently, which instantly cascades and purges all records, workouts, and credentials from all server databases without retention.'
              : 'أنت المالك الوحيد لكافة سجلاتك. يمكنك في أي وقت من الملف الشخصي تصدير ملف JSON كامل يحتوي على كل جداولك وأوزانك وتاريخ تدريبك. كما يحق لك حذف حسابك نهائياً بنقرة واحدة، حيث يتم فورياً مسح كافة جداولك وسجلاتك وبياناتك من الخوادم السحابية بلا رجعة وفق لوائح الخصوصية الأوروبية (GDPR).'}
          </p>
        </section>

        {/* Footer Note */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {isEn
              ? 'If you have any questions regarding your data privacy or wish to request an administrative audit, reach out directly through our BeastMode platform support.'
              : 'إذا كان لديك أي استفسار حول خصوصية بياناتك أو ترغب في مراجعة أي تفاصيل، يمكنك التواصل معنا مباشرة من خلال منصة BeastMode.'}
          </p>
        </div>

      </div>
    </div>
  );
};
