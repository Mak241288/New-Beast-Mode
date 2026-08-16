import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { Dumbbell, Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight, KeyRound, CheckCircle2, RefreshCw, FileText, Info } from 'lucide-react';

interface LoginProps {
  onSuccess: (token: string) => void;
  onBack?: () => void;
  onNavigateToLegal?: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onBack, onNavigateToLegal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('bm_remember_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('bm_remember_me') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password / OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [showOtpNewPassword, setShowOtpNewPassword] = useState(false);
  const [showOtpConfirmPassword, setShowOtpConfirmPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  useEffect(() => {
    if (rememberMe && email.trim()) {
      localStorage.setItem('bm_remember_email', email.trim());
      localStorage.setItem('bm_remember_me', 'true');
    } else if (!rememberMe) {
      localStorage.removeItem('bm_remember_email');
      localStorage.removeItem('bm_remember_me');
    }
  }, [rememberMe, email]);

  const validateInputs = (): boolean => {
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)');
      return false;
    }

    if (!isLogin) {
      if (name.trim().length < 2) {
        setError('يرجى إدخال اسم كامل صحيح (حرفين على الأقل)');
        return false;
      }
      if (password.length < 8) {
        setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) return;

    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (isLogin) {
        const data = await api.login({ email: cleanEmail, password: cleanPassword });
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (rememberMe) {
          localStorage.setItem('bm_remember_email', cleanEmail);
          localStorage.setItem('bm_remember_me', 'true');
        }
        onSuccess(data.token);
      } else {
        const data = await api.register({ name: name.trim(), email: cleanEmail, password: cleanPassword });
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (rememberMe) {
          localStorage.setItem('bm_remember_email', cleanEmail);
          localStorage.setItem('bm_remember_me', 'true');
        }
        onSuccess(data.token);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (targetEmail?: string) => {
    const mailToSend = (targetEmail || otpEmail || email).trim().toLowerCase();
    if (!mailToSend || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailToSend)) {
      setOtpError('يرجى كتابة بريد إلكتروني صحيح لاستلام رمز OTP');
      return;
    }

    setOtpError('');
    setOtpSuccessMsg('');
    setOtpLoading(true);

    try {
      const res = await api.requestPasswordResetOtp(mailToSend);
      setOtpEmail(mailToSend);
      setOtpStep(2);
      setOtpSuccessMsg(res.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!');
      if (res.debugOtp) {
        setOtpCode(res.debugOtp);
      }
    } catch (err: any) {
      setOtpError(err.message || 'فشل إرسال رمز التحقق، تأكد من صحة البريد الإلكتروني المسجل');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccessMsg('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    if (!otpNewPassword || otpNewPassword.length < 8) {
      setOtpError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (otpNewPassword !== otpConfirmPassword) {
      setOtpError('كلمتا المرور غير متطابقتين');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.verifyOtpAndResetPassword({
        email: otpEmail.trim().toLowerCase(),
        otp: otpCode.trim(),
        newPassword: otpNewPassword.trim(),
      });

      setOtpSuccessMsg(res.message || 'تم تعيين كلمة المرور بنجاح!');
      if (res.token) {
        localStorage.setItem('token', res.token);
      }

      setTimeout(() => {
        setShowOtpModal(false);
        if (res.token) {
          onSuccess(res.token);
        } else {
          setIsLogin(true);
          setPassword(otpNewPassword);
        }
      }, 1200);
    } catch (err: any) {
      setOtpError(err.message || 'فشل تأكيد الرمز أو إعادة التعيين');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px', background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(249, 115, 22, 0.08) 0%, transparent 40%)', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle />
        {onBack && (
          <button
            onClick={onBack}
            className="secondary-btn"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowRight size={14} />
            <span>الرئيسية</span>
          </button>
        )}
      </div>

      <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', border: '1px solid rgba(255, 255, 255, 0.08)', margin: 'auto' }}>
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '16px', borderRadius: '50%', marginBottom: '16px', boxShadow: '0 8px 24px var(--primary-glow)' }}>
            <Dumbbell size={36} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BEASTMODE
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            خبير اللياقة والتغذية بالذكاء الاصطناعي
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>الاسم الكامل</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingRight: '45px' }}
                  required
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingRight: '45px', textAlign: 'left', direction: 'ltr' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>كلمة المرور</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpEmail(email);
                    setShowOtpModal(true);
                    setOtpStep(1);
                    setOtpError('');
                    setOtpSuccessMsg('');
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  نسيت كلمة المرور؟ 🔑
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingRight: '45px', paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور للتأكد'}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showPassword ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Criteria for Registration */}
            {!isLogin && (
              <PasswordRequirements password={password} lang="ar" />
            )}
          </div>

          {/* Remember Me Option */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span>تذكرني على هذا الجهاز (Remember Me)</span>
            </label>
          </div>

          {error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600', margin: 0 }}>{error}</p>
              </div>
              
              {/* Duplicate Email Recovery Action */}
              {(error.includes('مسجل بالفعل') || error.includes('already exists')) && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpEmail(email);
                    setShowOtpModal(true);
                    setOtpStep(1);
                    setOtpError('');
                    setOtpSuccessMsg('');
                    handleSendOtp(email);
                  }}
                  className="glow-btn"
                  style={{ marginTop: '4px', padding: '8px 12px', fontSize: '12px', justifyContent: 'center', gap: '6px' }}
                >
                  <KeyRound size={14} />
                  <span>استعادة كلمة المرور عبر رمز OTP للبريد الإلكتروني 📩</span>
                </button>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="glow-btn" style={{ justifyContent: 'center', padding: '14px', fontSize: '16px' }}>
            {loading ? 'جاري التحميل...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            {isLogin ? 'لا تملك حساباً؟ أنشئ حساباً الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
          </button>
        </div>
      </div>

      {/* FOOTER LINKS */}
      {onNavigateToLegal && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', fontSize: '12px', color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => onNavigateToLegal('about')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={13} />
            <span>من نحن (About Us)</span>
          </button>
          <span>•</span>
          <button onClick={() => onNavigateToLegal('privacy')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={13} />
            <span>سياسة الخصوصية</span>
          </button>
          <span>•</span>
          <button onClick={() => onNavigateToLegal('terms')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={13} />
            <span>شروط الاستخدام</span>
          </button>
        </div>
      )}

      {/* OTP FORGOT PASSWORD & RECOVERY MODAL */}
      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '460px', padding: '32px', border: '1px solid var(--primary)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '14px', borderRadius: '50%', width: '56px', height: '56px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
              {otpStep === 1 ? 'استعادة كلمة المرور عبر رمز OTP 📩' : 'إدخال رمز التحقق وتعيين كلمة المرور 🔐'}
            </h2>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              {otpStep === 1 
                ? 'أدخل بريدك الإلكتروني المسجل لنرسل لك رمز تحقق سري (OTP) مكوّن من 6 أرقام.'
                : `تم إرسال رمز التحقق إلى (${otpEmail}). أدخل الرمز أدناه مع كلمة المرور الجديدة.`}
            </p>

            {otpError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'right' }}>
                ⚠️ {otpError}
              </div>
            )}

            {otpSuccessMsg && (
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#10b981', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {otpStep === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    📧 البريد الإلكتروني للحساب:
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="input-field"
                    style={{ textAlign: 'left', direction: 'ltr' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={() => handleSendOtp()}
                    className="glow-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                  >
                    {otpLoading ? 'جاري إرسال الرمز...' : 'إرسال رمز OTP 📩'}
                  </button>
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={() => setShowOtpModal(false)}
                    className="secondary-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right' }}>
                
                {/* OTP Code Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      🔢 رمز التحقق (OTP) المكوّن من 6 أرقام:
                    </label>
                    <button
                      type="button"
                      disabled={otpLoading}
                      onClick={() => handleSendOtp(otpEmail)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={11} />
                      <span>إعادة إرسال الرمز</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="input-field"
                    style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontWeight: '800', borderColor: 'var(--primary)' }}
                    required
                  />
                </div>

                {/* New Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    🔑 كلمة المرور الجديدة (8 خانات على الأقل):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showOtpNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={otpNewPassword}
                      onChange={(e) => setOtpNewPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtpNewPassword(!showOtpNewPassword)}
                      title={showOtpNewPassword ? 'إخفاء' : 'إظهار كلمة المرور'}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showOtpNewPassword ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {showOtpNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <PasswordRequirements password={otpNewPassword} lang="ar" />
                </div>

                {/* Confirm New Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    🔑 تأكيد كلمة المرور الجديدة:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showOtpConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={otpConfirmPassword}
                      onChange={(e) => setOtpConfirmPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '45px', textAlign: 'left', direction: 'ltr' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtpConfirmPassword(!showOtpConfirmPassword)}
                      title={showOtpConfirmPassword ? 'إخفاء' : 'إظهار كلمة المرور'}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showOtpConfirmPassword ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {showOtpConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="glow-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                  >
                    {otpLoading ? 'جاري التحقق...' : 'تأكيد وتغيير كلمة المرور 🔐'}
                  </button>
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={() => setShowOtpModal(false)}
                    className="secondary-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
