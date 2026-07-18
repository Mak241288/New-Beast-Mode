import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, ShieldAlert, Save, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { translations } from '../utils/translations';

interface ProfileProps {
  lang: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
  onNavigate: (view: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ lang, onLanguageChange, onNavigate }) => {
  const t = translations[lang] || translations.ar;
  const [profile, setProfile] = useState<any>({
    name: '',
    gender: 'MALE',
    birthDate: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    medicalConditions: '',
    workoutLocation: 'GYM',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Dev tools collapse state
  const [showDevTools, setShowDevTools] = useState(false);

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
      console.error('Failed to load profile:', err);
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
      setSuccessMsg(lang === 'en' ? 'Profile saved successfully!' : 'تم حفظ البيانات بنجاح!');
      fetchProfile();

      if (res.needsPlanAdjustment && res.adjustmentSuggestion) {
        setAdjustmentText(res.adjustmentSuggestion);
        setShowAdjustmentModal(true);
      }
    } catch (err) {
      alert(lang === 'en' ? 'Failed to save profile.' : 'فشل حفظ البيانات.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyAdjustment = async () => {
    setSaving(true);
    setShowAdjustmentModal(false);
    try {
      await api.generatePlan({
        durationWeeks: 4,
        startDate: new Date(),
        workoutLocation: profile.workoutLocation,
        equipment: [],
        level: 'intermediate',
        additionalQuestions: {},
      });
      alert(lang === 'en' ? 'Your workout plan has been successfully updated!' : 'تم تحديث جدول تمارينك بنجاح ليتلاءم مع ملفك الشخصي الجديد!');
      onNavigate('dashboard');
    } catch (err) {
      alert(lang === 'en' ? 'Failed to update plan.' : 'فشل تحديث الخطة الرياضية تلقائياً.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncExercises = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.syncExercises(rapidApiKey);
      setSyncMessage(lang === 'en' ? `${res.message} (Synced ${res.count} exercises)` : `${res.message} (تمت إضافة/تحديث ${res.count} تمرين)`);
    } catch (err: any) {
      setSyncMessage(lang === 'en' ? `Sync error: ${err.message}` : `حدث خطأ أثناء المزامنة: ${err.message || 'فشل الاتصال'}`);
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
      setPerformanceOutput(lang === 'en' ? `Test failed: ${err.message}` : `فشل تشغيل الاختبار: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setTestingPerformance(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>{lang === 'en' ? 'Loading Profile...' : 'جاري تحميل الملف الشخصي...'}</div>;
  }

  // Get Initials for Avatar
  const getInitials = (fullName: string) => {
    if (!fullName) return 'BM';
    return fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const isRtl = lang === 'ar';

  return (
    <div style={{ padding: '10px 0', maxWidth: '900px', margin: '0 auto' }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Success Alert Banner */}
        {successMsg && (
          <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        {/* Artistic Header Section */}
        <div className="glass-panel animated-fade" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-glow))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '900',
            color: '#fff',
            border: '2px solid #fff',
            boxShadow: '0 0 15px var(--primary-glow)',
          }}>
            {getInitials(profile.name)}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{profile.name || (isRtl ? 'بطل بيست مود' : 'BeastMode Athlete')}</h1>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              ⚡ {lang === 'en' ? 'Active Member Since 2026' : 'عضو نشط منذ 2026'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} className="glow-btn" style={{ padding: '10px 20px' }}>
              <Save size={16} />
              {saving ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : (lang === 'en' ? 'Save Changes' : 'حفظ التعديلات')}
            </button>
          </div>
        </div>

        {/* Two Column Layout: Left Column (Quick Stats Cards), Right Column (Details) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '20px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Physical metrics visual cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Height Card */}
            <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📏 {lang === 'en' ? 'Height' : 'الطول'}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleInputChange}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', fontWeight: '800', width: '90px', padding: 0 }}
                  placeholder="--"
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>cm</span>
              </div>
            </div>

            {/* Current Weight Card */}
            <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 0 10px rgba(0, 210, 255, 0.05)' }}>
              <span style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                ⚖️ {lang === 'en' ? 'Current Weight' : 'الوزن الحالي'}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <input
                  type="number"
                  name="currentWeight"
                  value={profile.currentWeight}
                  onChange={handleInputChange}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', fontWeight: '800', width: '90px', padding: 0 }}
                  placeholder="--"
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>kg</span>
              </div>
            </div>

            {/* Target Weight Card */}
            <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎯 {lang === 'en' ? 'Target Weight' : 'الوزن المستهدف'}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <input
                  type="number"
                  name="targetWeight"
                  value={profile.targetWeight}
                  onChange={handleInputChange}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', fontWeight: '800', width: '90px', padding: 0 }}
                  placeholder="--"
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>kg</span>
              </div>
            </div>

            {/* Quick Reset Questionnaire Button */}
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="secondary-btn"
              style={{ padding: '12px', justifyContent: 'center', gap: '8px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              🔄 {lang === 'en' ? 'Reset & Re-generate Plan' : 'إعادة تهيئة الاستبيان بالكامل'}
            </button>
          </div>

          {/* RIGHT COLUMN: Settings Details Form */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: '0 0 5px 0' }}>
              <User size={16} color="var(--primary)" />
              {lang === 'en' ? 'Personal Preferences & Bio' : 'التفضيلات الشخصية والبيانات العامة'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {lang === 'en' ? 'Full Name' : 'الاسم بالكامل'}
                </label>
                <input type="text" name="name" value={profile.name} onChange={handleInputChange} className="input-field" required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {lang === 'en' ? 'Gender' : 'الجنس'}
                </label>
                <select name="gender" value={profile.gender} onChange={handleInputChange} className="input-field">
                  <option value="MALE">{lang === 'en' ? 'Male' : 'ذكر'}</option>
                  <option value="FEMALE">{lang === 'en' ? 'Female' : 'أنثى'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {lang === 'en' ? 'Workout Preference' : 'مكان التمرين المفضّل'}
                </label>
                <select name="workoutLocation" value={profile.workoutLocation} onChange={handleInputChange} className="input-field">
                  <option value="GYM">{lang === 'en' ? 'Gym (النادي)' : 'النادي الرياضي (Gym)'}</option>
                  <option value="HOME">{lang === 'en' ? 'Home (البيت)' : 'المنزل (Home)'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {t.languageSetting}
                </label>
                <select
                  value={lang}
                  onChange={(e) => onLanguageChange(e.target.value as 'ar' | 'en')}
                  className="input-field"
                  style={{ borderColor: 'var(--primary)' }}
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English (الإنجليزية)</option>
                </select>
              </div>
            </div>

            {/* Health & Medical Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: 0 }}>
                <ShieldAlert size={16} color="var(--primary)" />
                {lang === 'en' ? 'Injuries & Physical Pain (To Avoid)' : 'الإصابات والآلام الجسدية (لتجنبها)'}
              </h3>
              <textarea
                name="medicalConditions"
                value={profile.medicalConditions || ''}
                onChange={handleInputChange}
                className="input-field"
                style={{ minHeight: '60px', resize: 'vertical', fontSize: '13px' }}
                placeholder={lang === 'en' ? 'E.g., Lower back pain, shoulder injury...' : 'مثال: آلام أسفل الظهر، إصابة كتف...'}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Settings & Developer Tools */}
        <div className="glass-panel" style={{ border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div
            onClick={() => setShowDevTools(!showDevTools)}
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: showDevTools ? 'rgba(255,255,255,0.02)' : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: 0 }}>
              <Settings size={16} color="var(--primary)" />
              {lang === 'en' ? 'Advanced Developer Settings' : 'إعدادات المطور المتقدمة'}
            </h3>
            {showDevTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showDevTools && (
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Sync Library */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Sync & Expand Exercise Library' : 'مزامنة وتوسيع قاعدة بيانات التمارين'}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {lang === 'en' 
                    ? 'Fetch exercises from ExerciseDB, Wger, and Yoga APIs to fill your database library.' 
                    : 'اسحب آلاف التمارين المتنوعة فورياً من ExerciseDB و Wger و Yoga API لملء مكتبة تطبيقك بالكامل.'}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {lang === 'en' ? 'RapidAPI Key (Optional, to fetch ExerciseDB)' : 'مفتاح RapidAPI Key (اختياري، لتشغيل ExerciseDB)'}
                    </label>
                    <input
                      type="text"
                      placeholder="Put your RapidAPI key here..."
                      value={rapidApiKey}
                      onChange={(e) => setRapidApiKey(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  {syncMessage && (
                    <div style={{
                      padding: '10px 15px',
                      background: syncMessage.includes('error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid ' + (syncMessage.includes('error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 210, 255, 0.2)'),
                      fontSize: '12px',
                      color: syncMessage.includes('error') ? 'var(--danger)' : 'var(--primary)',
                      fontWeight: 'bold',
                    }}>
                      {syncMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={syncing}
                    onClick={handleSyncExercises}
                    className="secondary-btn"
                    style={{ alignSelf: 'flex-start', padding: '8px 16px', gap: '8px', display: 'flex', alignItems: 'center' }}
                  >
                    <RefreshCw size={14} style={{ animation: syncing ? 'spin 1.5s linear infinite' : 'none' }} />
                    {syncing ? (lang === 'en' ? 'Syncing...' : 'جاري مزامنة التمارين...') : (lang === 'en' ? 'Start Smart Sync' : 'بدء المزامنة الذكية')}
                  </button>
                </div>
              </div>

              {/* Performance Benchmarks */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Run Performance Benchmarks' : 'تشغيل اختبارات كفاءة وسرعة قواعد البيانات'}
                </h4>
                <button
                  type="button"
                  disabled={testingPerformance}
                  onClick={handleTestPerformance}
                  className="secondary-btn"
                  style={{ padding: '8px 16px', gap: '8px', display: 'flex', alignItems: 'center' }}
                >
                  <RefreshCw size={14} style={{ animation: testingPerformance ? 'spin 1.5s linear infinite' : 'none' }} />
                  {testingPerformance ? (lang === 'en' ? 'Testing...' : 'جاري اختبار السرعة...') : (lang === 'en' ? 'Run Database Benchmarks' : 'تشغيل اختبارات الأداء')}
                </button>
                
                {performanceOutput && (
                  <pre style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#4af626',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    whiteSpace: 'pre-wrap',
                    direction: 'ltr',
                    textAlign: 'left',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {performanceOutput}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

      </form>

      {/* DYNAMIC PLAN ADJUSTMENT PROMPT MODAL */}
      {showAdjustmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.9)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', border: '1px solid var(--primary)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'var(--primary-glow)', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🔄
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px' }}>{lang === 'en' ? 'Update Workout Plan' : 'اقتراح تعديل خططك الرياضية'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: lang === 'en' ? 'left' : 'right', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {adjustmentText}
            </p>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleApplyAdjustment} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
                {lang === 'en' ? 'Update My Plan Now' : 'تحديث خطتي الرياضية الآن'}
              </button>
              <button onClick={() => setShowAdjustmentModal(false)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                {lang === 'en' ? 'Keep Old Plan' : 'إبقاء الجدول القديم'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
