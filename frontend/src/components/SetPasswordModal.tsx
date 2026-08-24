import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, X, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { cacheStore } from '../utils/cacheStore';

interface SetPasswordModalProps {
  lang: 'ar' | 'en';
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SetPasswordModal: React.FC<SetPasswordModalProps> = ({
  lang,
  userEmail,
  onClose,
  onSuccess,
}) => {
  const isEn = lang === 'en';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError(isEn ? 'Password must be at least 8 characters long.' : 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError(isEn ? 'Passwords do not match.' : 'كلمتا المرور غير متطابقتين.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validatePassword()) return;

    setLoading(true);
    try {
      await api.updateAccountSecurity({
        newPassword: newPassword.trim(),
      });

      // Update local profile state
      const profile: any = cacheStore.get('user_profile') || {};
      const updatedProfile = {
        ...profile,
        hasPassword: true,
        needsPasswordSetup: false,
        updatedAt: new Date().toISOString(),
      };
      cacheStore.set('user_profile', updatedProfile);
      localStorage.setItem('bm_password_setup_done', 'true');

      setSuccessMsg(isEn ? 'Password set successfully! Your account is now fully secured 🔒' : 'تم تعيين كلمة المرور بنجاح! حسابك الآن محمي بالكامل 🔒');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || (isEn ? 'Failed to set password. Please try again.' : 'فشل تعيين كلمة المرور، يرجى المحاولة لاحقاً.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    // Record that we asked once for this session
    sessionStorage.setItem('bm_password_prompt_dismissed', 'true');
    onClose();
  };

  return (
    <div
      className="modal-backdrop animated-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid rgba(0, 210, 255, 0.4)',
          background: 'linear-gradient(180deg, rgba(13, 19, 36, 0.95), rgba(8, 12, 24, 0.98))',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '16px',
            left: isEn ? 'auto' : '16px',
            right: isEn ? '16px' : 'auto',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'rgba(0, 210, 255, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              border: '1px solid rgba(0, 210, 255, 0.3)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            {isEn ? 'Protect Your Account with a Password' : 'حماية حسابك وتعيين كلمة مرور دائمة 🔒'}
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {isEn
              ? `Your account (${userEmail || 'registered email'}) does not have a permanent password yet. Set a secure password to protect your workout plans and stats from any device.`
              : `حسابك (${userEmail || 'البريد المسجل'}) غير محمي بكلمة مرور دائمة بعد. عيّن كلمة مرور قوية الآن لضمان حفظ ومزامنة جداولك وإحصائياتك بأمان من أي جهاز.`}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              color: '#ef4444',
              fontSize: '12.5px',
              fontWeight: 'bold',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              color: '#10b981',
              fontSize: '12.5px',
              fontWeight: 'bold',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {isEn ? 'New Password (8+ characters):' : 'كلمة المرور الجديدة (8 خانات على الأقل):'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: isEn ? 'auto' : '14px', left: isEn ? '14px' : 'auto', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingRight: isEn ? '40px' : '45px', paddingLeft: isEn ? '45px' : '40px', fontSize: '14px' }}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: isEn ? 'auto' : '14px',
                  right: isEn ? '14px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {isEn ? 'Confirm Password:' : 'تأكيد كلمة المرور:'}
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', right: isEn ? 'auto' : '14px', left: isEn ? '14px' : 'auto', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingRight: isEn ? '40px' : '45px', paddingLeft: isEn ? '45px' : '40px', fontSize: '14px' }}
                required
                minLength={8}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleDismiss}
              className="secondary-btn"
              style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize: '13px' }}
            >
              {isEn ? 'Remind Me Later' : 'تذكيري لاحقاً'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{ flex: 2, padding: '12px', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}
            >
              {loading ? (isEn ? 'Saving...' : 'جاري الحفظ...') : (isEn ? 'Set Password & Protect 🔒' : 'حفظ وتأمين الحساب 🔒')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
