import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, ShieldAlert, Sparkles, Save, CheckCircle, RefreshCw } from 'lucide-react';

interface ProfileProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, onLogout }) => {
  const [profile, setProfile] = useState<any>({
    name: '',
    gender: 'MALE',
    birthDate: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    medicalConditions: '',
    labResults: '',
    foodAllergies: '',
    foodPreferences: 'Balanced',
    foodDislikes: '',
    workoutLocation: 'GYM',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // AI Suggestion state after profile edit
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentText, setAdjustmentText] = useState('');

  // Sync exercises state
  const [syncing, setSyncing] = useState(false);
  const [rapidApiKey, setRapidApiKey] = useState('');
  const [syncMessage, setSyncMessage] = useState('');

  // Performance test state
  const [testingPerformance, setTestingPerformance] = useState(false);
  const [performanceOutput, setPerformanceOutput] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      // Format birthdate for input fields
      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate).toISOString().split('T')[0];
      }
      setProfile({
        ...profile,
        ...data,
        height: data.height || '',
        currentWeight: data.currentWeight || '',
        targetWeight: data.targetWeight || '',
      });
    } catch (err) {
      console.error('فشل تحميل الملف الشخصي:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.updateProfile(profile);
      setSuccessMsg('تم حفظ البيانات بنجاح!');
      
      // Update weight logs history if updated
      fetchProfile();

      // Check if AI plan adjustment is suggested
      if (res.needsPlanAdjustment && res.adjustmentSuggestion) {
        setAdjustmentText(res.adjustmentSuggestion);
        setShowAdjustmentModal(true);
      }
    } catch (err) {
      alert('فشل حفظ البيانات.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyAdjustment = async () => {
    setSaving(true);
    setShowAdjustmentModal(false);
    try {
      // Regenerate plans based on new parameters
      await api.generatePlan({
        durationWeeks: 4,
        startDate: new Date(),
        workoutLocation: profile.workoutLocation,
        equipment: [], // AI will deduce from location and medical conditions
        level: 'beginner',
        additionalQuestions: {},
      });
      alert('تم تحديث جدول تمارينك وجدول التغذية بنجاح ليتلاءم مع ملفك الشخصي الجديد!');
      onNavigate('dashboard');
    } catch (err) {
      alert('فشل تحديث الخطة الرياضية تلقائياً.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncExercises = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.syncExercises(rapidApiKey || undefined);
      setSyncMessage(res.message + ` (تمت إضافة/تحديث ${res.count} تمرين)`);
    } catch (err: any) {
      setSyncMessage(`حدث خطأ أثناء المزامنة: ${err.message || 'فشل الاتصال'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestPerformance = async () => {
    setTestingPerformance(true);
    setPerformanceOutput('');
    try {
      const res = await api.testPerformance();
      setPerformanceOutput(res.output);
    } catch (err: any) {
      setPerformanceOutput(`فشل تشغيل الاختبار: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setTestingPerformance(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '0 0 20px 20px', borderTop: 'none' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BEASTMODE
        </h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => onNavigate('dashboard')} className="secondary-btn" style={{ padding: '8px 16px' }}>التمارين</button>
          <button onClick={() => onNavigate('nutrition')} className="secondary-btn" style={{ padding: '8px 16px' }}>التغذية</button>
          <button onClick={() => onNavigate('stats')} className="secondary-btn" style={{ padding: '8px 16px' }}>الإحصاءات</button>
          <button onClick={() => onNavigate('chat')} className="secondary-btn" style={{ padding: '8px 16px' }}>استشارة الذكاء الاصطناعي</button>
          <button onClick={() => onNavigate('profile')} className="glow-btn" style={{ padding: '8px 16px' }}>الملف الشخصي</button>
        </nav>
        <button onClick={onLogout} className="secondary-btn" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>تسجيل الخروج</button>
      </header>

      <main className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>جاري تحميل الملف الشخصي...</div>
        ) : (
          <form onSubmit={handleFormSubmit} className="glass-panel animated-fade" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <div>
                <h1 style={{ fontSize: '22px' }}>إدارة الملف الشخصي والبيانات الطبية ⚙️</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>حدث وزنك وحالتك الصحية وسيقوم الذكاء الاصطناعي بمزامنتها مع برامجك</p>
              </div>
              <button type="submit" disabled={saving} className="glow-btn">
                <Save size={18} />
                {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </button>
            </div>

            {successMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>
                <CheckCircle size={18} />
                {successMsg}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <User size={18} color="var(--primary)" />
                البيانات الأساسية والجسدية
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>الاسم بالكامل</label>
                  <input type="text" name="name" value={profile.name} onChange={handleInputChange} className="input-field" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>الجنس</label>
                  <select name="gender" value={profile.gender} onChange={handleInputChange} className="input-field">
                    <option value="MALE">ذكر</option>
                    <option value="FEMALE">أنثى</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>تاريخ الميلاد</label>
                  <input type="date" name="birthDate" value={profile.birthDate || ''} onChange={handleInputChange} className="input-field" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>مكان التمرين</label>
                  <select name="workoutLocation" value={profile.workoutLocation} onChange={handleInputChange} className="input-field">
                    <option value="GYM">النادي الرياضي (Gym)</option>
                    <option value="HOME">المنزل (Home)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>الطول (سم)</label>
                  <input type="number" name="height" value={profile.height} onChange={handleInputChange} className="input-field" />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label>الوزن الحالي</label>
                    <input type="number" name="currentWeight" value={profile.currentWeight} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label>الوزن المستهدف</label>
                    <input type="number" name="targetWeight" value={profile.targetWeight} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Medical */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <ShieldAlert size={18} color="var(--secondary)" />
                الحالة الصحية والطبية
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>الإصابات أو آلام المفاصل (لتفاديها في التمارين)</label>
                  <textarea name="medicalConditions" value={profile.medicalConditions || ''} onChange={handleInputChange} className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>تفاصيل التحاليل والفيتامينات (للتغذية والمكملات)</label>
                  <textarea name="labResults" value={profile.labResults || ''} onChange={handleInputChange} className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Nutrition preferences */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Sparkles size={18} color="var(--primary)" />
                تفضيلات التغذية والوجبات
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>النظام الغذائي المفضل</label>
                  <select name="foodPreferences" value={profile.foodPreferences || 'Balanced'} onChange={handleInputChange} className="input-field">
                    <option value="Balanced">متوازن (Balanced)</option>
                    <option value="High Protein">بروتين عالي (High Protein)</option>
                    <option value="Vegan">نباتي كامل (Vegan)</option>
                    <option value="Vegetarian">نباتي البيض والألبان (Vegetarian)</option>
                    <option value="Keto">كيتو (Keto)</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label>حساسية الطعام</label>
                    <input type="text" name="foodAllergies" value={profile.foodAllergies || ''} onChange={handleInputChange} className="input-field" placeholder="المكسرات، الحليب، القمح..." />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label>أطعمة تكرهها ولا تود رؤيتها في الوجبات</label>
                    <textarea name="foodDislikes" value={profile.foodDislikes || ''} onChange={handleInputChange} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="السمك، الكوسا..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Library Section (Developers) */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <RefreshCw size={18} color="var(--primary)" />
                مزامنة وتوسيع قاعدة بيانات التمارين (مطورين)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                اسحب آلاف التمارين المتنوعة فورياً من ExerciseDB و Wger و Yoga API لملء مكتبة تطبيقك بالكامل.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label>مفتاح RapidAPI Key (اختياري، لتشغيل ExerciseDB و Yoga API)</label>
                  <input
                    type="text"
                    placeholder="ضع مفتاح RapidAPI الخاص بك هنا..."
                    value={rapidApiKey}
                    onChange={(e) => setRapidApiKey(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                {syncMessage && (
                  <div style={{
                    padding: '10px 15px',
                    background: syncMessage.includes('فشل') || syncMessage.includes('خطأ') || syncMessage.includes('حدث') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid ' + (syncMessage.includes('فشل') || syncMessage.includes('خطأ') || syncMessage.includes('حدث') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                    fontSize: '13px',
                    color: syncMessage.includes('فشل') || syncMessage.includes('خطأ') || syncMessage.includes('حدث') ? 'var(--danger)' : 'var(--primary)',
                    fontWeight: 'bold',
                    textAlign: 'right'
                  }}>
                    {syncMessage}
                  </div>
                )}

                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleSyncExercises}
                  className="secondary-btn"
                  style={{ alignSelf: 'flex-start', padding: '10px 20px', gap: '8px', display: 'flex', alignItems: 'center' }}
                >
                  <RefreshCw size={16} style={{ animation: syncing ? 'spin 1.5s linear infinite' : 'none' }} />
                  {syncing ? 'جاري سحب ومزامنة التمارين...' : 'بدء المزامنة الذكية الآن'}
                </button>

                {/* Performance Test Block */}
                <div style={{ marginTop: '20px', borderTop: '1px dashed var(--border-color)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} color="var(--secondary)" />
                    اختبار سرعة وكفاءة الـ Cache والـ Resolver (للمطورين)
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    قم بقياس ومقارنة سرعة جلب التمارين من قاعدة البيانات المحلية مقابل الاتصال الخارجي والترجمة بالذكاء الاصطناعي لرصد توفير الوقت.
                  </p>
                  
                  <button
                    type="button"
                    disabled={testingPerformance}
                    onClick={handleTestPerformance}
                    className="secondary-btn"
                    style={{ padding: '8px 16px', gap: '8px', display: 'flex', alignItems: 'center' }}
                  >
                    <RefreshCw size={14} style={{ animation: testingPerformance ? 'spin 1.5s linear infinite' : 'none' }} />
                    {testingPerformance ? 'جاري فحص سرعة الاستعلام...' : 'تشغيل اختبار الأداء والسرعة'}
                  </button>
                  
                  {performanceOutput && (
                    <pre style={{
                      marginTop: '15px',
                      padding: '15px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#4af626',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      direction: 'ltr',
                      textAlign: 'left',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {performanceOutput}
                    </pre>
                  )}
                </div>
              </div>
            </div>

          </form>
        )}
      </main>

      {/* DYNAMIC PLAN ADJUSTMENT PROMPT MODAL */}
      {showAdjustmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.9)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="flex-center">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', border: '1px solid var(--primary)', textAlign: 'center' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={30} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>اقتراح تعديل خططك الرياضية والغذائية</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'right', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {adjustmentText}
            </p>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleApplyAdjustment} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
                تحديث خطتي الرياضية والغذائية الآن
              </button>
              <button onClick={() => setShowAdjustmentModal(false)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                إبقاء الجدول القديم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
