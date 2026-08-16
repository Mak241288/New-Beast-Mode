import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, ShieldAlert, Save, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Settings, Download, Trash2, Bell, Lock, AlertTriangle, Eye, EyeOff, KeyRound, CheckCircle2, Info, FileText } from 'lucide-react';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { SmartNutritionModal } from '../components/SmartNutritionModal';
import { TransformationGalleryModal } from '../components/TransformationGalleryModal';
import { translations } from '../utils/translations';
import { triggerTestNotification } from '../utils/notifications';
import { exportFullDataJSON } from '../utils/exportUtils';
import { cacheStore } from '../utils/cacheStore';

interface ProfileProps {
  lang: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
  onNavigate: (view: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ lang, onLanguageChange, onNavigate }) => {
  const t = translations[lang] || translations.ar;
  const cachedProfile = cacheStore.get<any>('user_profile');
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [profile, setProfile] = useState<any>(() => {
    if (cachedProfile) {
      return {
        ...cachedProfile,
        height: cachedProfile.height || '',
        currentWeight: cachedProfile.currentWeight || '',
        targetWeight: cachedProfile.targetWeight || '',
        fitnessGoal: cachedProfile.fitnessGoal || 'HYPERTROPHY',
        fitnessLevel: cachedProfile.fitnessLevel || 'intermediate',
        daysPerWeek: cachedProfile.daysPerWeek || '4',
        equipment: cachedProfile.equipment || '',
        age: cachedProfile.age || '',
        workoutReminder: cachedProfile.workoutReminder || false,
        reminderTime: cachedProfile.reminderTime || '08:00',
      };
    }
    return {
      name: '',
      gender: 'MALE',
      birthDate: '',
      height: '',
      currentWeight: '',
      targetWeight: '',
      medicalConditions: '',
      workoutLocation: 'GYM',
      fitnessGoal: 'HYPERTROPHY',
      fitnessLevel: 'intermediate',
      daysPerWeek: '4',
      equipment: '',
      age: '',
      workoutReminder: false,
      reminderTime: '08:00',
    };
  });

  const equipmentList = [
    { id: 'dumbbells', label: lang === 'en' ? 'Dumbbells' : 'دمبلز (Dumbbells)' },
    { id: 'barbell', label: lang === 'en' ? 'Barbell & Weights' : 'بار وأوزان (Barbell)' },
    { id: 'bench', label: lang === 'en' ? 'Workout Bench (Flat/Incline)' : 'كرسي تدريب / بنش (Workout Bench)' },
    { id: 'mat', label: lang === 'en' ? 'Yoga / Floor Mat' : 'سجادة يوجا / مات أرضية (Yoga Mat)' },
    { id: 'bands', label: lang === 'en' ? 'Resistance Bands' : 'حبال مقاومة (Resistance Bands)' },
    { id: 'pullup', label: lang === 'en' ? 'Pull-up Bar' : 'عقلة منزلية (Pull-up Bar)' },
    { id: 'cables', label: lang === 'en' ? 'Cable Machine' : 'جهاز كيبل/بكرات (Cable Machine)' },
  ];

  const [loading, setLoading] = useState(() => !cachedProfile);
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

  // Export Data & Delete Account State
  const [exportingData, setExportingData] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  // Security (Email & Password change with Authentication / OTP)
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityMode, setSecurityMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [securityCurrentPassword, setSecurityCurrentPassword] = useState('');
  const [securityNewEmail, setSecurityNewEmail] = useState('');
  const [securityNewPassword, setSecurityNewPassword] = useState('');
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState('');
  const [showSecCurrentPass, setShowSecCurrentPass] = useState(false);
  const [showSecNewPass, setShowSecNewPass] = useState(false);
  const [showSecConfirmPass, setShowSecConfirmPass] = useState(false);
  const [securityOtpCode, setSecurityOtpCode] = useState('');
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const fetchProfile = async () => {
    if (!cacheStore.get('user_profile')) {
      setLoading(true);
    }
    try {
      const data = await api.getProfile();
      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate).toISOString().split('T')[0];
      }
      const updated = {
        ...profile,
        ...data,
        height: data.height || '',
        currentWeight: data.currentWeight || '',
        targetWeight: data.targetWeight || '',
        fitnessGoal: data.fitnessGoal || 'HYPERTROPHY',
        fitnessLevel: data.fitnessLevel || 'intermediate',
        daysPerWeek: data.daysPerWeek || '4',
        equipment: data.equipment || '',
        age: data.age || '',
        workoutReminder: data.workoutReminder || false,
        reminderTime: data.reminderTime || '08:00',
      };
      setProfile(updated);
      cacheStore.set('user_profile', updated);
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

  const handleEquipmentChange = (id: string) => {
    const currentEquip = profile.equipment ? profile.equipment.split(',').filter(Boolean) : [];
    let updated: string[];
    if (currentEquip.includes(id)) {
      updated = currentEquip.filter((item: string) => item !== id);
    } else {
      updated = [...currentEquip, id];
    }
    setProfile((prev: any) => ({ ...prev, equipment: updated.join(',') }));
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

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const success = await triggerTestNotification(lang);
      if (!success) {
        alert(lang === 'en' 
          ? 'Notification permission not granted. Please allow notifications in browser settings.' 
          : 'لم يتم منح إذن الإشعارات. يرجى تفعيل الإشعارات من إعدادات المتصفح.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingNotification(false);
    }
  };

  const handleExportUserData = async () => {
    setExportingData(true);
    try {
      const data = await api.exportUserData();
      exportFullDataJSON(data);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to export user data.' : 'فشل تصدير بيانات المستخدم.');
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    const requiredConfirmation = lang === 'en' ? 'DELETE' : 'حذف';
    if (deleteConfirmText.trim() !== requiredConfirmation) {
      alert(lang === 'en' ? 'Please type "DELETE" to confirm.' : 'يرجى كتابة كلمة "حذف" للتأكيد.');
      return;
    }

    setDeletingAccount(true);
    try {
      await api.deleteAccount();
      localStorage.removeItem('token');
      alert(lang === 'en' ? 'Account and all records deleted successfully.' : 'تم حذف الحساب وكافة سجلاتك نهائياً.');
      window.location.reload();
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to delete account.' : 'فشل حذف الحساب.');
      setDeletingAccount(false);
    }
  };

  const handleUpdateSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!securityCurrentPassword) {
      setSecurityError(lang === 'en' ? 'Please enter your current password for verification.' : 'يرجى إدخال كلمة المرور الحالية لتوثيق الهوية.');
      return;
    }

    if (!securityNewEmail && !securityNewPassword) {
      setSecurityError(lang === 'en' ? 'Please provide a new email or new password.' : 'يرجى إدخال بريد إلكتروني جديد أو كلمة مرور جديدة.');
      return;
    }

    if (securityNewPassword) {
      if (securityNewPassword.length < 8) {
        setSecurityError(lang === 'en' ? 'New password must be at least 8 characters.' : 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.');
        return;
      }
      if (securityNewPassword !== securityConfirmPassword) {
        setSecurityError(lang === 'en' ? 'New passwords do not match.' : 'كلمتا المرور الجديدتان غير متطابقتين.');
        return;
      }
    }

    setSecuritySaving(true);
    try {
      const res = await api.updateAccountSecurity({
        currentPassword: securityCurrentPassword,
        newEmail: securityNewEmail.trim() || undefined,
        newPassword: securityNewPassword.trim() || undefined,
      });

      if (res.token) {
        localStorage.setItem('token', res.token);
      }

      setSecuritySuccess(lang === 'en' ? 'Security settings updated successfully!' : 'تم تحديث وتوثيق بيانات الأمان بنجاح!');
      setTimeout(() => {
        setShowSecurityModal(false);
        setSecurityCurrentPassword('');
        setSecurityNewEmail('');
        setSecurityNewPassword('');
        setSecurityConfirmPassword('');
        setSecuritySuccess('');
        fetchProfile();
      }, 1500);
    } catch (err: any) {
      setSecurityError(err.message || (lang === 'en' ? 'Failed to update security credentials.' : 'فشل تحديث بيانات الأمان.'));
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleSendSecurityOtp = async () => {
    if (!profile.email) {
      setSecurityError(lang === 'en' ? 'No registered email found.' : 'لم يتم العثور على بريد إلكتروني مسجل.');
      return;
    }

    setSecurityError('');
    setSecuritySuccess('');
    setSecuritySaving(true);

    try {
      const res = await api.requestPasswordResetOtp(profile.email);
      setSecurityMode('OTP');
      setSecuritySuccess(res.message || (lang === 'en' ? 'Verification OTP code sent to your email!' : 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!'));
      if (res.debugOtp) {
        setSecurityOtpCode(res.debugOtp);
      }
    } catch (err: any) {
      setSecurityError(err.message || (lang === 'en' ? 'Failed to send OTP code.' : 'فشل إرسال رمز التحقق.'));
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleVerifySecurityOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!securityOtpCode.trim() || securityOtpCode.trim().length !== 6) {
      setSecurityError(lang === 'en' ? 'Please enter the 6-digit OTP code.' : 'يرجى إدخال رمز التحقق المكون من 6 أرقام.');
      return;
    }

    if (!securityNewPassword || securityNewPassword.length < 8) {
      setSecurityError(lang === 'en' ? 'New password must be at least 8 characters.' : 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.');
      return;
    }

    if (securityNewPassword !== securityConfirmPassword) {
      setSecurityError(lang === 'en' ? 'New passwords do not match.' : 'كلمتا المرور غير متطابقتين.');
      return;
    }

    setSecuritySaving(true);
    try {
      const res = await api.verifyOtpAndResetPassword({
        email: profile.email,
        otp: securityOtpCode.trim(),
        newPassword: securityNewPassword.trim(),
      });

      if (res.token) {
        localStorage.setItem('token', res.token);
      }

      setSecuritySuccess(lang === 'en' ? 'Password reset successfully via OTP!' : 'تم إعادة تعيين كلمة المرور بنجاح عبر رمز OTP!');
      setTimeout(() => {
        setShowSecurityModal(false);
        setSecurityMode('PASSWORD');
        setSecurityOtpCode('');
        setSecurityNewPassword('');
        setSecurityConfirmPassword('');
        setSecuritySuccess('');
        fetchProfile();
      }, 1500);
    } catch (err: any) {
      setSecurityError(err.message || (lang === 'en' ? 'Failed to verify OTP.' : 'فشل تأكيد الرمز أو إعادة التعيين.'));
    } finally {
      setSecuritySaving(false);
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

            {/* Age Card */}
            <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎂 {lang === 'en' ? 'Age' : 'العمر'}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', fontWeight: '800', width: '90px', padding: 0 }}
                  placeholder="--"
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'years' : 'سنة'}</span>
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

            {/* Smart Nutrition Coach Shortcut */}
            <div className="glass-panel" style={{ padding: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(16, 185, 129, 0.04)' }}>
              <span style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                🥗 {lang === 'en' ? 'Nutrition & Macros' : 'التغذية والماكروز'}
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                {lang === 'en' ? 'Calculates daily BMR, TDEE, and protein split.' : 'حساب السعرات ومعدل الأيض والماكروز اليومية.'}
              </p>
              <button
                type="button"
                onClick={() => setShowNutritionModal(true)}
                className="glow-btn"
                style={{ padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
              >
                {lang === 'en' ? 'Open Macro Coach 🥗' : 'حاسبة الماكروز والتغذية 🥗'}
              </button>
            </div>

            {/* Physique Progress Photos Shortcut */}
            <div className="glass-panel" style={{ padding: '16px', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(236, 72, 153, 0.04)' }}>
              <span style={{ fontSize: '11px', color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                📷 {lang === 'en' ? 'Transformation Gallery' : 'معرض صور التحول'}
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                {lang === 'en' ? 'Compare before & after progress photos.' : 'توثيق ومقارنة صور التطور البدني قبل وبعد.'}
              </p>
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="glow-btn"
                style={{ padding: '8px 12px', fontSize: '12px', justifyContent: 'center', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none' }}
              >
                {lang === 'en' ? 'Open Photo Gallery 📷' : 'فتح معرض الصور 📷'}
              </button>
            </div>

            {/* Quick Reset Questionnaire Button */}
            {(!profile || !profile.onboardingCompleted) && (
              <button
                type="button"
                onClick={() => onNavigate('onboarding')}
                className="secondary-btn"
                style={{ padding: '12px', justifyContent: 'center', gap: '8px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                🔄 {lang === 'en' ? 'Reset & Re-generate Plan' : 'إعادة تهيئة الاستبيان بالكامل'}
              </button>
            )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {lang === 'en' ? 'Account Email' : 'البريد الإلكتروني للحساب'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityNewEmail(profile.email || '');
                      setShowSecurityModal(true);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    <Lock size={12} />
                    <span>{lang === 'en' ? 'Change Email / Password' : 'تعديل الإيميل / كلمة المرور 🔑'}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="input-field"
                    style={{ opacity: 0.8, background: 'rgba(255,255,255,0.03)', cursor: 'not-allowed', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityNewEmail(profile.email || '');
                      setShowSecurityModal(true);
                    }}
                    className="secondary-btn"
                    style={{ padding: '0 12px', fontSize: '12px' }}
                    title={lang === 'en' ? 'Edit credentials' : 'تعديل بيانات الحساب والأمان'}
                  >
                    ✏️
                  </button>
                </div>
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

            {/* Workout Program Preferences */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: 0 }}>
                🏋️‍♂️ {lang === 'en' ? 'Workout Plan Settings' : 'إعدادات البرنامج والجدول الرياضي'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {lang === 'en' ? 'Fitness Goal' : 'الهدف الرياضي'}
                  </label>
                  <select name="fitnessGoal" value={profile.fitnessGoal || 'HYPERTROPHY'} onChange={handleInputChange} className="input-field">
                    <option value="HYPERTROPHY">{lang === 'en' ? 'Build Muscle / Hypertrophy' : 'بناء عضلات / تضخيم'}</option>
                    <option value="LOSE_WEIGHT">{lang === 'en' ? 'Lose Weight / Fat Loss' : 'خسارة وزن / حرق دهون'}</option>
                    <option value="STRENGTH">{lang === 'en' ? 'Power & Strength' : 'زيادة القوة البدنية'}</option>
                    <option value="ENDURANCE">{lang === 'en' ? 'Cardio & Endurance' : 'لياقة وقوة تحمل'}</option>
                    <option value="ATHLETICISM">{lang === 'en' ? 'Athletic Performance' : 'أداء رياضي متكامل'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {lang === 'en' ? 'Fitness Level' : 'المستوى الرياضي'}
                  </label>
                  <select name="fitnessLevel" value={profile.fitnessLevel || 'intermediate'} onChange={handleInputChange} className="input-field">
                    <option value="beginner">{lang === 'en' ? 'Beginner' : 'مبتدئ'}</option>
                    <option value="intermediate">{lang === 'en' ? 'Intermediate' : 'متوسط'}</option>
                    <option value="advanced">{lang === 'en' ? 'Advanced' : 'متقدم'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {lang === 'en' ? 'Days Per Week' : 'أيام التمرين أسبوعياً'}
                  </label>
                  <select name="daysPerWeek" value={profile.daysPerWeek || '4'} onChange={handleInputChange} className="input-field">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num} {lang === 'en' ? 'days/week' : 'أيام في الأسبوع'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Equipment Preferences */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: 0 }}>
                🛠️ {lang === 'en' ? 'Available Equipment' : 'المعدات والأدوات الرياضية المتاحة لديك'}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '5px' }}>
                {equipmentList.map((equip) => {
                  const currentEquip = profile.equipment ? profile.equipment.split(',').filter(Boolean) : [];
                  const isChecked = currentEquip.includes(equip.id);
                  return (
                    <button
                      key={equip.id}
                      type="button"
                      onClick={() => handleEquipmentChange(equip.id)}
                      className={isChecked ? 'glow-btn' : 'secondary-btn'}
                      style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {equip.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', lineHeight: 1.5, marginTop: '5px' }}>
                💡 {lang === 'en'
                  ? 'Smart Equipment Adaptation: If "Workout Bench" is not selected, chest/tricep exercises automatically shift to Floor Press & bodyweight variations without requiring a bench.'
                  : 'تنويه ذكي: عند عدم تفعيل "كرسي تدريب / بنش"، يقوم النظام تلقائياً بجدولة تمارين الصدر والترايسبس بأسلوب الضغط الأرضي (Floor Press) والأوزان الحرة أو وزن الجسم دون الحاجة لبنش.'}
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

            {/* Notifications Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: 0 }}>
                🔔 {lang === 'en' ? 'Notifications' : 'الإشعارات والتنبيهات'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Workout Reminder Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>
                      {lang === 'en' ? 'Workout Web & Push Reminders' : 'تذكيرات التمارين الذكية (Web Push)'}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '11.5px', margin: '2px 0 0 0' }}>
                      {lang === 'en' ? 'Receive daily notifications on your device to stay committed to your training schedule.' : 'استلم تنبيهات يومية على متصفحك وهاتفك لتذكيرك بموعد التدريب وتحفيزك على الاستمرار.'}
                    </p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div 
                    onClick={() => setProfile((prev: any) => ({ ...prev, workoutReminder: !prev.workoutReminder }))}
                    style={{
                      width: '50px',
                      height: '26px',
                      borderRadius: '13px',
                      background: profile.workoutReminder ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: profile.workoutReminder ? 'flex-end' : 'flex-start',
                      transition: 'all 0.3s ease',
                      border: '1px solid ' + (profile.workoutReminder ? 'var(--primary)' : 'var(--border-color)')
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Time Picker and Test Button */}
                {profile.workoutReminder && (
                  <div className="animated-fade" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        ⏰ {lang === 'en' ? 'Preferred Time:' : 'وقت التذكير المفضل:'}
                      </label>
                      <input
                        type="time"
                        name="reminderTime"
                        value={profile.reminderTime || '08:00'}
                        onChange={handleInputChange}
                        className="input-field"
                        style={{ width: '120px', padding: '6px', fontSize: '13px' }}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={testingNotification}
                      onClick={handleTestNotification}
                      className="secondary-btn"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Bell size={13} color="var(--primary)" />
                      <span>{testingNotification ? (lang === 'en' ? 'Testing...' : 'جاري الاختبار...') : (lang === 'en' ? 'Test Notification' : 'اختبار التنبيه 🔔')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy & Account Control Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', margin: 0 }}>
                <Lock size={16} color="var(--primary)" />
                {lang === 'en' ? 'Data Privacy & Account Control' : 'الخصوصية وإدارة بيانات الحساب'}
              </h3>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {lang === 'en'
                  ? 'Download your full training history and health logs or permanently remove your account from our database.'
                  : 'يمكنك تصدير كافة سجلاتك الرياضية وقياساتك بملف واحد أو حذف حسابك نهائياً من قاعدة البيانات.'}
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={exportingData}
                  onClick={handleExportUserData}
                  className="secondary-btn"
                  style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={15} color="var(--primary)" />
                  <span>{exportingData ? (lang === 'en' ? 'Exporting...' : 'جاري التصدير...') : (lang === 'en' ? 'Export All My Data (JSON)' : 'تصدير كافة بياناتي 📦')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="secondary-btn"
                  style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={15} />
                  <span>{lang === 'en' ? 'Delete Account Permanently' : 'حذف الحساب نهائياً ⚠️'}</span>
                </button>
              </div>

              {/* Legal & About Us Links */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                >
                  <Info size={13} />
                  <span>{lang === 'en' ? 'About BeastMode AI' : 'من نحن (عن المنصة) ℹ️'}</span>
                </button>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                >
                  <Lock size={13} />
                  <span>{lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية والأمان'}</span>
                </button>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                >
                  <FileText size={13} />
                  <span>{lang === 'en' ? 'Terms of Service' : 'شروط الاستخدام والإخلاء'}</span>
                </button>
              </div>
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

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '30px', border: '1px solid var(--danger)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--danger)', marginBottom: '10px' }}>
              {lang === 'en' ? 'Delete Account Permanently?' : 'هل أنت متأكد من حذف الحساب نهائياً؟'}
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px', lineHeight: 1.6 }}>
              {lang === 'en'
                ? 'This action cannot be undone. All your workout routines, weight history, progress logs, and personal settings will be permanently wiped.'
                : 'هذا الإجراء لا يمكن التراجع عنه. سيتم مسح كافة جداولك الرياضية وسجلات الأوزان وسجل التقدم نهائياً من الخوادم.'}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: lang === 'en' ? 'left' : 'right' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                {lang === 'en' ? 'Type "DELETE" to confirm:' : 'اكتب كلمة "حذف" في الخانة للتأكيد:'}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={lang === 'en' ? 'DELETE' : 'حذف'}
                className="input-field"
                style={{ borderColor: 'var(--danger)', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                disabled={deletingAccount || deleteConfirmText.trim() !== (lang === 'en' ? 'DELETE' : 'حذف')}
                onClick={handleDeleteAccount}
                className="glow-btn"
                style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', borderColor: 'var(--danger)', opacity: deleteConfirmText.trim() !== (lang === 'en' ? 'DELETE' : 'حذف') ? 0.5 : 1 }}
              >
                {deletingAccount ? (lang === 'en' ? 'Deleting...' : 'جاري الحذف...') : (lang === 'en' ? 'Confirm Deletion' : 'تأكيد الحذف النهائي')}
              </button>
              <button
                type="button"
                disabled={deletingAccount}
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="secondary-btn"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {lang === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY CREDENTIALS & AUTHENTICATION MODAL */}
      {showSecurityModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '480px', padding: '30px', border: '1px solid var(--primary)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '15px', borderRadius: '50%', width: '60px', height: '60px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {securityMode === 'PASSWORD' ? <Lock size={30} /> : <KeyRound size={30} />}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
              {securityMode === 'PASSWORD' 
                ? (lang === 'en' ? 'Account Security & Credentials' : 'أمان الحساب وتعديل بيانات الدخول')
                : (lang === 'en' ? 'Reset Password via Email OTP' : 'استعادة وتغيير كلمة المرور عبر رمز OTP 📩')}
            </h2>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              {securityMode === 'PASSWORD'
                ? (lang === 'en'
                    ? 'To update your email address or password, please confirm your current password for security verification.'
                    : 'لتعديل بريدك الإلكتروني أو كلمة المرور، يرجى إدخال كلمة المرور الحالية لتوثيق ملكية الحساب.')
                : (lang === 'en'
                    ? `Enter the 6-digit OTP sent to (${profile.email || ''}) and choose your new password.`
                    : `أدخل رمز التحقق (OTP) المكوّن من 6 أرقام المرسل إلى (${profile.email || ''}) وكلمة المرور الجديدة.`)}
            </p>

            {securityError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', textAlign: lang === 'en' ? 'left' : 'right' }}>
                ⚠️ {securityError}
              </div>
            )}

            {securitySuccess && (
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', textAlign: lang === 'en' ? 'left' : 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{securitySuccess}</span>
              </div>
            )}

            {securityMode === 'PASSWORD' ? (
              <form onSubmit={handleUpdateSecuritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: lang === 'en' ? 'left' : 'right' }}>
                
                {/* Current Password (Verification) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      🔒 {lang === 'en' ? 'Current Password (Verification):' : 'كلمة المرور الحالية (مطلوبة للتوثيق):'}
                    </label>
                    <button
                      type="button"
                      onClick={handleSendSecurityOtp}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <KeyRound size={11} />
                      <span>{lang === 'en' ? 'Forgot password? Use OTP' : 'نسيت كلمة المرور؟ استعادة برمز OTP 📩'}</span>
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecCurrentPass ? 'text' : 'password'}
                      value={securityCurrentPassword}
                      onChange={(e) => setSecurityCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ borderColor: 'var(--primary)', paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecCurrentPass(!showSecCurrentPass)}
                      title={showSecCurrentPass ? 'إخفاء' : 'إظهار كلمة المرور'}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showSecCurrentPass ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {showSecCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    📧 {lang === 'en' ? 'New Email (Optional):' : 'البريد الإلكتروني الجديد (اختياري):'}
                  </label>
                  <input
                    type="email"
                    value={securityNewEmail}
                    onChange={(e) => setSecurityNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-field"
                    style={{ textAlign: 'left', direction: 'ltr' }}
                  />
                </div>

                {/* New Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    🔑 {lang === 'en' ? 'New Password (Optional, min 8 chars):' : 'كلمة المرور الجديدة (اختياري، 8 خانات كحد أدنى):'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecNewPass ? 'text' : 'password'}
                      value={securityNewPassword}
                      onChange={(e) => setSecurityNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecNewPass(!showSecNewPass)}
                      title={showSecNewPass ? 'إخفاء' : 'إظهار كلمة المرور'}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showSecNewPass ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {showSecNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {securityNewPassword && (
                    <PasswordRequirements password={securityNewPassword} lang={lang} />
                  )}
                </div>

                {/* Confirm New Password */}
                {securityNewPassword && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      🔑 {lang === 'en' ? 'Confirm New Password:' : 'تأكيد كلمة المرور الجديدة:'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSecConfirmPass ? 'text' : 'password'}
                        value={securityConfirmPassword}
                        onChange={(e) => setSecurityConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        style={{ paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecConfirmPass(!showSecConfirmPass)}
                        title={showSecConfirmPass ? 'إخفاء' : 'إظهار كلمة المرور'}
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showSecConfirmPass ? 'var(--primary)' : 'var(--text-muted)' }}
                      >
                        {showSecConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={securitySaving}
                    className="glow-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {securitySaving ? (lang === 'en' ? 'Verifying & Saving...' : 'جاري التحقق والحفظ...') : (lang === 'en' ? 'Save Credentials' : 'توثيق وحفظ التعديلات 🔐')}
                  </button>
                  <button
                    type="button"
                    disabled={securitySaving}
                    onClick={() => {
                      setShowSecurityModal(false);
                      setSecurityCurrentPassword('');
                      setSecurityNewEmail('');
                      setSecurityNewPassword('');
                      setSecurityConfirmPassword('');
                      setSecurityError('');
                      setSecuritySuccess('');
                    }}
                    className="secondary-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {lang === 'en' ? 'Cancel' : 'إلغاء'}
                  </button>
                </div>
              </form>
            ) : (
              /* OTP RESET FORM */
              <form onSubmit={handleVerifySecurityOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: lang === 'en' ? 'left' : 'right' }}>
                
                {/* 6-digit OTP code */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      🔢 {lang === 'en' ? '6-Digit OTP Verification Code:' : 'رمز التحقق (OTP) المكوّن من 6 أرقام:'}
                    </label>
                    <button
                      type="button"
                      disabled={securitySaving}
                      onClick={handleSendSecurityOtp}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={11} />
                      <span>{lang === 'en' ? 'Resend Code' : 'إعادة إرسال الرمز'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={securityOtpCode}
                    onChange={(e) => setSecurityOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="input-field"
                    style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontWeight: '800', borderColor: 'var(--primary)' }}
                    required
                  />
                </div>

                {/* New Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    🔑 {lang === 'en' ? 'New Password (min 8 chars):' : 'كلمة المرور الجديدة (8 خانات كحد أدنى):'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecNewPass ? 'text' : 'password'}
                      value={securityNewPassword}
                      onChange={(e) => setSecurityNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecNewPass(!showSecNewPass)}
                      title={showSecNewPass ? 'إخفاء' : 'إظهار كلمة المرور'}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showSecNewPass ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {showSecNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordRequirements password={securityNewPassword} lang={lang} />
                </div>

                {/* Confirm New Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    🔑 {lang === 'en' ? 'Confirm New Password:' : 'تأكيد كلمة المرور الجديدة:'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecConfirmPass ? 'text' : 'password'}
                      value={securityConfirmPassword}
                      onChange={(e) => setSecurityConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecConfirmPass(!showSecConfirmPass)}
                      title={showSecConfirmPass ? 'إخفاء' : 'إظهار كلمة المرور'}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showSecConfirmPass ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {showSecConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={securitySaving}
                    className="glow-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {securitySaving ? (lang === 'en' ? 'Verifying & Resetting...' : 'جاري التحقق وإعادة التعيين...') : (lang === 'en' ? 'Confirm & Reset Password 🔐' : 'تأكيد وتغيير كلمة المرور 🔐')}
                  </button>
                  <button
                    type="button"
                    disabled={securitySaving}
                    onClick={() => {
                      setSecurityMode('PASSWORD');
                      setSecurityError('');
                      setSecuritySuccess('');
                    }}
                    className="secondary-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {lang === 'en' ? 'Back' : 'رجوع'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Smart Nutrition & Macro Coach Modal */}
      <SmartNutritionModal
        isOpen={showNutritionModal}
        lang={lang}
        userProfile={profile}
        onClose={() => setShowNutritionModal(false)}
      />

      {/* Transformation Photo Gallery Modal */}
      <TransformationGalleryModal
        isOpen={showGalleryModal}
        lang={lang}
        currentWeight={profile?.currentWeight ? parseFloat(profile.currentWeight) : 75}
        onClose={() => setShowGalleryModal(false)}
      />
    </div>
  );
};
