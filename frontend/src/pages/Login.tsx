import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { cacheStore } from '../utils/cacheStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { Dumbbell, Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight, KeyRound, CheckCircle2, RefreshCw, FileText, Info, X } from 'lucide-react';

interface LoginProps {
  lang?: 'ar' | 'en';
  onSuccess: (token: string) => void;
  onBack?: () => void;
  onNavigateToLegal?: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ lang = 'ar', onSuccess, onBack, onNavigateToLegal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('bm_remember_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('bm_remember_me') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
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
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Google Fast Access Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoginEmail, setGoogleLoginEmail] = useState('');
  const [googleLoginName, setGoogleLoginName] = useState('');
  const [googleModalLoading, setGoogleModalLoading] = useState(false);
  const [googleModalError, setGoogleModalError] = useState('');
  const [googleModalSuccess, setGoogleModalSuccess] = useState('');
  const [googleRequiresVerification, setGoogleRequiresVerification] = useState(false);
  const [googleVerificationPassword, setGoogleVerificationPassword] = useState('');
  const [googleVerificationOtp, setGoogleVerificationOtp] = useState('');
  const [googleOtpSent, setGoogleOtpSent] = useState(false);

  useEffect(() => {
    if (rememberMe && email.trim()) {
      localStorage.setItem('bm_remember_email', email.trim());
      localStorage.setItem('bm_remember_me', 'true');
    } else if (!rememberMe) {
      localStorage.removeItem('bm_remember_email');
      localStorage.removeItem('bm_remember_me');
    }
  }, [rememberMe, email]);

  const translateAuthError = (errMsg: string, currentLang: 'ar' | 'en'): string => {
    if (!errMsg) {
      return currentLang === 'en'
        ? 'An unexpected error occurred. Please try again.'
        : 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.';
    }
    const lower = errMsg.toLowerCase();

    if (
      lower.includes('invalid login credentials') ||
      lower.includes('invalid_grant') ||
      lower.includes('invalid_credentials') ||
      lower.includes('invalid password') ||
      lower.includes('كلمة المرور غير صحيحة')
    ) {
      return currentLang === 'en'
        ? 'Invalid email or password. Please check your credentials.'
        : 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من صحة البيانات.';
    }

    if (lower.includes('email not confirmed')) {
      return currentLang === 'en'
        ? 'Please confirm your email address via the verification link sent to your inbox before logging in.'
        : 'يرجى تأكيد بريدك الإلكتروني من خلال الرابط المرسل إلى صندوق الوارد الخاص بك أولاً.';
    }

    if (
      lower.includes('user already registered') ||
      lower.includes('already exists') ||
      lower.includes('duplicate key') ||
      lower.includes('مسجل بالفعل')
    ) {
      return currentLang === 'en'
        ? 'This email is already registered. Please sign in or reset your password.'
        : 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام خيار استعادة كلمة المرور.';
    }

    if (
      lower.includes('rate limit') ||
      lower.includes('too many requests') ||
      lower.includes('over_email_send_rate_limit') ||
      lower.includes('تم تجاوز')
    ) {
      return currentLang === 'en'
        ? 'Too many attempts. Please wait a few moments before trying again.'
        : 'تم تجاوز عدد المحاولات المسموح بها، يرجى الانتظار بضع دقائق ثم المحاولة مجدداً.';
    }

    if (
      lower.includes('failed to fetch') ||
      lower.includes('network error') ||
      lower.includes('connection refused') ||
      lower.includes('networkrequestfailed')
    ) {
      return currentLang === 'en'
        ? 'Network connection issue. Please check your internet connection and try again.'
        : 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت والمحاولة لاحقاً.';
    }

    if (lower.includes('password should be at least') || lower.includes('password length')) {
      return currentLang === 'en'
        ? 'Password must be at least 8 characters long.'
        : 'كلمة المرور يجب أن تتكون من 8 خانات على الأقل.';
    }

    return errMsg;
  };

  const validateInputs = (): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError(
        lang === 'en'
          ? 'Please enter a valid email address (e.g. name@example.com)'
          : 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)'
      );
      return false;
    }

    if (!isLogin) {
      if (name.trim().length < 2) {
        setError(
          lang === 'en'
            ? 'Please enter a valid full name (at least 2 characters)'
            : 'يرجى إدخال اسم كامل صحيح (حرفين على الأقل)'
        );
        return false;
      }
      if (cleanPassword.length < 8) {
        setError(
          lang === 'en'
            ? 'Password must be at least 8 characters long'
            : 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل'
        );
        return false;
      }
    } else {
      if (!cleanPassword) {
        setError(
          lang === 'en'
            ? 'Please enter your password'
            : 'يرجى إدخال كلمة المرور'
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');

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
        // Auto-migrate local guest workout sessions and custom plans to user account
        await api.migrateGuestDataToUser(data.user).catch(() => null);
        onSuccess(data.token);
      } else {
        const data = await api.register({ name: name.trim(), email: cleanEmail, password: cleanPassword });
        
        // If session is null or requires email confirmation, do NOT navigate to dashboard
        if (!data.session || data.requiresEmailConfirmation || !data.token) {
          setSuccessNotice(
            data.message ||
            (lang === 'en'
              ? 'Account created successfully! Please check your email to confirm your account before logging in.'
              : 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.')
          );
          setError('');
          setIsLogin(true); // Switch to login form so user can log in after verification
          setPassword('');  // Clear password for security
          return;
        }

        if (data.token) {
          localStorage.setItem('token', data.token);
          if (rememberMe) {
            localStorage.setItem('bm_remember_email', cleanEmail);
            localStorage.setItem('bm_remember_me', 'true');
          }
          // Auto-migrate local guest workout sessions and custom plans to user account
          await api.migrateGuestDataToUser(data.user).catch(() => null);
          onSuccess(data.token);
        }
      }
    } catch (err: any) {
      setError(translateAuthError(err.message || String(err), lang));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (otpCooldown > 0) {
      interval = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCooldown]);

  const handleSendOtp = async (targetEmail?: string) => {
    if (otpCooldown > 0) return;
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
      setOtpCooldown(60);
      setOtpSuccessMsg(res.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح! يرجى فتح البريد وإدخال الرمز.');
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

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('يرجى إدخال رمز التحقق (OTP) بشكل صحيح');
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

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (!isLogin && !name.trim() && newEmail.includes('@')) {
      const prefix = newEmail.split('@')[0];
      const derivedName = prefix
        .split(/[._-]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
      if (derivedName.length >= 2) {
        setName(derivedName);
      }
    }
  };

  const handleDirectGoogleOAuth = async () => {
    setError('');
    setSuccessNotice('');
    setLoading(true);
    try {
      await api.signInWithGoogleOAuth();
    } catch (err: any) {
      console.warn('[Direct Google OAuth error]:', err);
      // Fallback to fast modal if popup/redirect is restricted
      handleOpenGoogleLoginModal();
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    const cleanMail = email.trim().toLowerCase();
    if (!cleanMail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanMail)) {
      setError(lang === 'en' ? 'Please enter a valid email address to receive the Magic Link' : 'يرجى إدخال بريد إلكتروني صحيح لإرسال رابط الدخول السريع (Magic Link)');
      return;
    }

    setError('');
    setSuccessNotice('');
    setLoading(true);
    try {
      const res = await api.signInWithMagicLink(cleanMail);
      setSuccessNotice(res.message);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال الرابط السحري');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestToken = `bm_guest_${Date.now()}`;
    const guestProfile = {
      name: lang === 'en' ? 'Guest Athlete' : 'رياضي تجريبي (ضيف)',
      email: 'guest@beastmode.ai',
      isGuest: true,
      onboardingCompleted: true,
    };
    try {
      localStorage.setItem('token', guestToken);
      localStorage.setItem('bm_is_guest', 'true');
    } catch {}
    cacheStore.set('user_profile', guestProfile);
    onSuccess(guestToken);
  };

  const handleOpenGoogleLoginModal = () => {
    const cleanMail = email.trim() || 'athlete@gmail.com';
    const prefix = cleanMail.split('@')[0];
    const derivedName = name.trim() || prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ') || 'Beast Athlete';

    setGoogleLoginEmail(cleanMail);
    setGoogleLoginName(derivedName);
    setGoogleModalError('');
    setGoogleModalSuccess('');
    setGoogleRequiresVerification(false);
    setGoogleVerificationPassword('');
    setGoogleVerificationOtp('');
    setGoogleOtpSent(false);
    setShowGoogleModal(true);
  };

  const handleSendVerificationOtpForGoogle = async () => {
    const cleanMail = googleLoginEmail.trim().toLowerCase();
    if (!cleanMail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanMail)) {
      setGoogleModalError('يرجى إدخال بريد Google صحيح');
      return;
    }

    setGoogleModalLoading(true);
    setGoogleModalError('');
    try {
      const res = await api.requestPasswordResetOtp(cleanMail);
      setGoogleOtpSent(true);
      setGoogleModalSuccess(res.message || 'تم إرسال رمز التحقق (OTP) إلى بريدك بنجاح! يرجى فتح البريد وإدخال الرمز.');
    } catch (err: any) {
      setGoogleModalError(err.message || 'فشل إرسال رمز التحقق');
    } finally {
      setGoogleModalLoading(false);
    }
  };

  const handleConfirmGoogleOAuthLogin = async () => {
    const cleanMail = googleLoginEmail.trim().toLowerCase();
    if (!cleanMail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanMail)) {
      setGoogleModalError('يرجى إدخال بريد Google صحيح بصيغة name@gmail.com');
      return;
    }

    setGoogleModalLoading(true);
    setGoogleModalError('');
    try {
      const gId = `google_${cleanMail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const payload: any = {
        email: cleanMail,
        name: googleLoginName.trim() || 'Beast Athlete',
        googleId: gId,
      };

      if (googleVerificationPassword.trim()) {
        payload.password = googleVerificationPassword.trim();
      }
      if (googleVerificationOtp.trim()) {
        payload.otp = googleVerificationOtp.trim();
      }

      const data = await api.googleAuth(payload);

      setGoogleModalSuccess('تم التحقق من الهوية وتوثيق حساب Google بنجاح! جاري توجيهك...');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (rememberMe) {
        localStorage.setItem('bm_remember_email', cleanMail);
        localStorage.setItem('bm_remember_me', 'true');
      }

      setTimeout(() => {
        setShowGoogleModal(false);
        onSuccess(data.token || 'bm_session_active');
      }, 1000);
    } catch (err: any) {
      // If backend requires verification for existing account
      if (err.requiresSecurityVerification || (err.message && err.message.includes('محمي مسبقاً'))) {
        setGoogleRequiresVerification(true);
        setGoogleModalError(err.message || 'هذا الحساب مسجل ومحمي مسبقاً. لتأكيد ملكيتك له، أدخل كلمة المرور أو اطلب رمز OTP.');
      } else {
        setGoogleModalError(err.message || 'فشل تسجيل الدخول أو ربط الحساب عبر Google');
      }
    } finally {
      setGoogleModalLoading(false);
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
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '26px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 24px var(--primary-glow)',
              flexShrink: 0,
            }}
          >
            <Dumbbell size={34} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px', margin: 0 }}>
            BEASTMODE
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px', marginBottom: 0 }}>
            {lang === 'en' ? 'AI Fitness & Nutrition Specialist' : 'خبير اللياقة والتغذية بالذكاء الاصطناعي'}
          </p>
        </div>

        {/* Account Confirmation / Success Alert */}
        {successNotice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(16, 185, 129, 0.12)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.35)', marginBottom: '20px', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: '800', color: '#10b981' }}>
                  {lang === 'en' ? 'Account Created Successfully! ✉️' : 'تم إنشاء الحساب بنجاح! ✉️'}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                  {successNotice}
                </p>
              </div>
            </div>
          </div>
        )}

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
                  autoCapitalize="words"
                  autoCorrect="off"
                  spellCheck={false}
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
                onChange={(e) => handleEmailChange(e.target.value)}
                className="input-field"
                style={{ paddingRight: '45px', textAlign: 'left', direction: 'ltr' }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
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
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
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

        {/* Google Sign-In / OAuth Action */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 16px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {lang === 'en' ? 'Or continue with' : 'أو المتابعة السريعة عبر'}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Direct Google OAuth / Account Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleDirectGoogleOAuth}
            className="secondary-btn"
            style={{
              width: '100%',
              padding: '12px 16px',
              justifyContent: 'center',
              fontSize: '13.5px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderColor: 'rgba(66, 133, 244, 0.35)',
              background: 'linear-gradient(180deg, rgba(66, 133, 244, 0.08), rgba(255, 255, 255, 0.02))',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>
              {lang === 'en'
                ? (isLogin ? 'Sign in with Google' : 'Sign up with Google')
                : (isLogin ? 'المتابعة بحساب Google' : 'إنشاء حساب عبر Google')}
            </span>
          </button>

          {/* Magic Link Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleMagicLinkLogin}
            className="secondary-btn"
            style={{
              width: '100%',
              padding: '11px 16px',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: 'rgba(168, 85, 247, 0.35)',
              background: 'rgba(168, 85, 247, 0.08)',
              color: '#c084fc',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <span>✨</span>
            <span>
              {lang === 'en'
                ? 'Send Magic Link (Passwordless)'
                : 'تسجيل دخول برابط سحري بدون كلمة مرور ✨'}
            </span>
          </button>

          {/* Instant Guest Mode Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGuestLogin}
            style={{
              width: '100%',
              padding: '11px 16px',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span>⚡</span>
            <span>
              {lang === 'en'
                ? 'Continue as Guest (Instant Trial)'
                : 'تجربة النظام كضيف فوري (Guest Mode) ⚡'}
            </span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessNotice('');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            {isLogin ? 'لا تملك حساباً؟ أنشئ حساباً الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
          </button>
        </div>

        {/* Device Sync Shortcut Button */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(0, 210, 255, 0.25)' }}>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('beast_open_sync_modal', { detail: { tab: 'receive' } }));
            }}
            className="glow-btn"
            style={{
              width: '100%',
              padding: '12px 16px',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '800',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.18), rgba(16, 185, 129, 0.18))',
              border: '1px solid rgba(0, 210, 255, 0.45)',
              color: 'var(--text-primary)',
            }}
          >
            <span>📲</span>
            <span>
              {lang === 'en' ? 'Have a Sync Code or QR from PC? Tap Here' : 'لديك كود أو رابط مزامنة من الكمبيوتر؟ اضغط هنا للدخول الفوري 📲'}
            </span>
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
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
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
                      🔢 رمز التحقق (OTP) من الإيميل:
                    </label>
                    <button
                      type="button"
                      disabled={otpLoading || otpCooldown > 0}
                      onClick={() => handleSendOtp(otpEmail)}
                      style={{ background: 'none', border: 'none', color: otpCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)', fontSize: '11px', cursor: otpCooldown > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={11} />
                      <span>{otpCooldown > 0 ? `إعادة الإرسال بعد (${otpCooldown}s)` : 'إعادة إرسال الرمز'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="أدخل رمز التحقق"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    className="input-field"
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: '800', borderColor: 'var(--primary)' }}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="numeric"
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
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
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
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
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

      {/* Google OAuth Login Modal */}
      {showGoogleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            zIndex: 10050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="glass-panel animated-fade"
            style={{
              width: '100%',
              maxWidth: '460px',
              borderRadius: '20px',
              border: '1px solid rgba(66, 133, 244, 0.4)',
              padding: '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              backgroundColor: '#0c101d',
              color: 'var(--text-primary)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(66, 133, 244, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', margin: 0 }}>
                    المتابعة بحساب Google
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    تسجيل دخول سريع أو ربط تلقائي فوري
                  </span>
                </div>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="secondary-btn" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {/* Error & Success Messages */}
            {googleModalError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} />
                <span>{googleModalError}</span>
              </div>
            )}

            {googleModalSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} />
                <span>{googleModalSuccess}</span>
              </div>
            )}

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                إذا كنت مسجلاً مسبقاً، سيتم دمج حسابك بحساب Google فورياً مع <strong>الحفاظ الكامل على كافة جداولك وسجلاتك</strong> بدون أي تغيير.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  بريدك الإلكتروني في Google:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    disabled={googleRequiresVerification}
                    value={googleLoginEmail}
                    onChange={(e) => setGoogleLoginEmail(e.target.value)}
                    placeholder="athlete@gmail.com"
                    className="input-field"
                    style={{ paddingRight: '40px', fontSize: '14px', direction: 'ltr', textAlign: 'left', opacity: googleRequiresVerification ? 0.7 : 1 }}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    required
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Mail size={16} />
                  </div>
                </div>
              </div>

              {!googleRequiresVerification ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    اسمك الرياضي (في حال كنت مستخدماً جديداً):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={googleLoginName}
                      onChange={(e) => setGoogleLoginName(e.target.value)}
                      placeholder="Beast Athlete"
                      className="input-field"
                      style={{ paddingRight: '40px', fontSize: '14px' }}
                      autoCapitalize="words"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <User size={16} />
                    </div>
                  </div>
                </div>
              ) : (
                /* SECURITY VERIFICATION STEP FOR EXISTING ACCOUNTS */
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>
                    <Lock size={15} />
                    <span>تأكيد ملكية الحساب المسجل (حماية الأمان)</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    لحماية بياناتك، يرجى إدخال كلمة مرور الحساب الحالية أو طلب رمز التحقق (OTP) المرسل إلى بريدك:
                  </span>

                  {/* Password Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>كلمة مرور الحساب الحالية:</label>
                    <input
                      type="password"
                      value={googleVerificationPassword}
                      onChange={(e) => setGoogleVerificationPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ fontSize: '13px', direction: 'ltr', textAlign: 'left' }}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '11.5px', color: 'var(--text-secondary)' }}>— أو —</div>

                  {/* OTP option */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={googleVerificationOtp}
                      onChange={(e) => setGoogleVerificationOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="رمز OTP (6 أرقام)"
                      className="input-field"
                      style={{ flex: 1, fontSize: '13px', textAlign: 'center', letterSpacing: '2px' }}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      disabled={googleModalLoading}
                      onClick={handleSendVerificationOtpForGoogle}
                      className="secondary-btn"
                      style={{ padding: '8px 12px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                    >
                      {googleOtpSent ? 'إعادة الإرسال 📩' : 'طلب رمز OTP 📩'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>توثيق مشفر وآمن 100% بنظام OAuth 2.0 Identity Token</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  disabled={googleModalLoading}
                  onClick={handleConfirmGoogleOAuthLogin}
                  className="glow-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px' }}
                >
                  {googleModalLoading ? 'جاري التحقق وتسجيل الدخول...' : googleRequiresVerification ? 'تأكيد الهوية والمتابعة ⚡' : '⚡ متابعة وتسجيل الدخول بحساب Google'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="secondary-btn"
                  style={{ padding: '12px 18px', fontSize: '13px' }}
                >
                  إلغاء
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
