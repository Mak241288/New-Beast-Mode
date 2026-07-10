import React, { useState } from 'react';
import { api } from '../services/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { Dumbbell, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSuccess: (token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login({ email, password });
        localStorage.setItem('token', data.token);
        onSuccess(data.token);
      } else {
        const data = await api.register({ name, email, password });
        localStorage.setItem('token', data.token);
        onSuccess(data.token);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px', background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(249, 115, 22, 0.08) 0%, transparent 40%)' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <ThemeToggle />
      </div>

      <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '30px' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>الاسم الكامل</label>
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
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>البريد الإلكتروني</label>
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
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingRight: '45px', textAlign: 'left', direction: 'ltr' }}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="glow-btn" style={{ justifyContent: 'center', padding: '14px', fontSize: '16px' }}>
            {loading ? 'جاري التحميل...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
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
    </div>
  );
};
