import { useState, useEffect } from 'react';
import { api } from './services/api';
import { supabase } from './services/supabase';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AboutUs } from './pages/AboutUs';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { MyPlan } from './pages/MyPlan';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { Stats } from './pages/Stats';
import { Profile } from './pages/Profile';
import { ThemeToggle } from './components/ThemeToggle';
import { Dumbbell, Calendar, BookOpen, TrendingUp, User, LogOut, Globe } from 'lucide-react';
import { initWorkoutReminderScheduler } from './utils/notifications';
import { cacheStore } from './utils/cacheStore';

import './App.css';

const getInitialToken = () => {
  try {
    const t = localStorage.getItem('token');
    if (!t || t === 'null' || t === 'undefined' || t.trim() === '') return null;
    return t;
  } catch {
    return null;
  }
};

function App() {
  const initialToken = getInitialToken();
  const [token, setToken] = useState<string | null>(initialToken);
  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const hash = (window.location.hash || '').replace('#', '');
      const validViews = ['privacy', 'terms', 'about', 'login', 'dashboard', 'myplan', 'library', 'stats', 'profile', 'onboarding'];
      if (validViews.includes(hash)) {
        return hash;
      }
    } catch {
      // fallback
    }
    return initialToken ? 'dashboard' : 'landing';
  });
  const [loading, setLoading] = useState<boolean>(() => !!initialToken);
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      return localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    try {
      localStorage.setItem('lang', newLang);
    } catch {
      // Ignore
    }
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navigateTo = (view: string) => {
    setCurrentView(view);
    try {
      window.history.pushState({ view }, '', `#${view}`);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    // Listen to Supabase auth state changes (OAuth redirects, tokens, signins)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.access_token) {
        setToken(session.access_token);
        try {
          localStorage.setItem('token', session.access_token);
        } catch {
          // Ignore
        }
      }
    });

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView(token ? 'dashboard' : 'landing');
      }
    };

    try {
      window.history.replaceState({ view: currentView }, '', `#${currentView}`);
    } catch {
      // Ignore
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      authListener?.subscription?.unsubscribe?.();
    };
  }, [token]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const [initError, setInitError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!token) {
      setLoading(false);
      setInitError(null);
      return;
    }
    
    setLoading(true);
    setInitError(null);

    try {
      // Fast single-pass profile verification with Supabase
      const profile = await api.getProfile();
      const isCompleted = profile ? !!profile.onboardingCompleted : true;
      setOnboardingCompleted(isCompleted);

      // Initialize background reminder scheduler
      if (profile?.workoutReminder && profile?.reminderTime) {
        initWorkoutReminderScheduler({
          enabled: profile.workoutReminder,
          time: profile.reminderTime,
          lang,
        });
      }

      if (!isCompleted) {
        setCurrentView('onboarding');
      } else {
        const validViews = ['dashboard', 'myplan', 'library', 'stats', 'profile', 'privacy', 'terms', 'about'];
        if (!validViews.includes(currentView)) {
          setCurrentView('dashboard');
        }
      }
    } catch (err: any) {
      console.warn('[App] checkStatus warning:', err);
      if (err.status === 401) {
        handleLogout();
      } else {
        // Fallback gracefully without blocking the user
        const validViews = ['dashboard', 'myplan', 'library', 'stats', 'profile', 'privacy', 'terms', 'about'];
        if (!validViews.includes(currentView)) {
          setCurrentView('dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem('token');
    cacheStore.clearAll();
    setToken(null);
    setCurrentView('landing');
  };

  const handleOnboardingComplete = () => {
    checkStatus();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          {lang === 'en' ? 'Loading BeastMode workspace...' : 'جاري تهيئة بيئة تدريب الوحوش...'}
        </h3>
      </div>
    );
  }

  if (initError && token) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '30px', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚡⚠️</div>
          <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>
            {lang === 'en' ? 'Connection Issue' : 'تعذر الاتصال بالخادم'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            {initError}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => checkStatus()} 
              className="primary-btn" 
              style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '8px' }}
            >
              {lang === 'en' ? 'Retry Connection 🔄' : 'إعادة المحاولة 🔄'}
            </button>
            <button 
              onClick={handleLogout} 
              className="secondary-btn" 
              style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}
            >
              {lang === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Views (Landing, Login, Privacy, Terms, About)
  if (!token) {
    if (currentView === 'about') {
      return <AboutUs lang={lang} onBack={() => navigateTo('landing')} onNavigateToWorkout={() => navigateTo('login')} />;
    }
    if (currentView === 'privacy') {
      return <PrivacyPolicy lang={lang} onBack={() => navigateTo('landing')} />;
    }
    if (currentView === 'terms') {
      return <TermsOfService lang={lang} onBack={() => navigateTo('landing')} />;
    }
    if (currentView === 'login') {
      return <Login onSuccess={handleLoginSuccess} onBack={() => navigateTo('landing')} onNavigateToLegal={(page) => navigateTo(page)} />;
    }
    return (
      <LandingPage
        lang={lang}
        onGetStarted={() => navigateTo('login')}
        onLogin={() => navigateTo('login')}
        onLanguageChange={handleLanguageChange}
        onNavigateToLegal={(page) => navigateTo(page)}
      />
    );
  }

  // Onboarding Guard
  if (currentView === 'onboarding') {
    return <Onboarding lang={lang} onComplete={handleOnboardingComplete} />;
  }

  // Authenticated Legal & About Views
  if (currentView === 'about') {
    return <AboutUs lang={lang} onBack={() => navigateTo('profile')} onNavigateToWorkout={() => navigateTo('myplan')} />;
  }
  if (currentView === 'privacy') {
    return <PrivacyPolicy lang={lang} onBack={() => navigateTo('profile')} />;
  }
  if (currentView === 'terms') {
    return <TermsOfService lang={lang} onBack={() => navigateTo('profile')} />;
  }

  // Translation mapping for navigation
  const navTitles: Record<string, { ar: string; en: string }> = {
    dashboard: { ar: 'الرئيسية ⚡', en: 'Dashboard ⚡' },
    myplan: { ar: 'جدولي الرياضي 🗓️', en: 'My Plan 🗓️' },
    library: { ar: 'مكتبة التمارين 📚', en: 'Library 📚' },
    stats: { ar: 'التقدم والتقارير 📊', en: 'Progress 📊' },
    profile: { ar: 'الملف الشخصي 👤', en: 'Profile 👤' },
    logout: { ar: 'تسجيل الخروج', en: 'Sign Out' },
  };

  const menuItems = [
    { id: 'dashboard', icon: <Dumbbell size={18} /> },
    { id: 'myplan', icon: <Calendar size={18} /> },
    { id: 'library', icon: <BookOpen size={18} /> },
    { id: 'stats', icon: <TrendingUp size={18} /> },
    { id: 'profile', icon: <User size={18} /> },
  ];

  return (
    <div className="app-layout">
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar glass-panel no-print">
        <div>
          <div className="sidebar-logo" onClick={() => navigateTo('dashboard')} style={{ cursor: 'pointer' }}>
            BEASTMODE
          </div>
          <nav className="nav-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <span>{lang === 'en' ? navTitles[item.id].en : navTitles[item.id].ar}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          {/* Language Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={lang}
              onChange={(e) => handleLanguageChange(e.target.value as 'ar' | 'en')}
              className="input-field"
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '12px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ar" style={{ background: 'var(--bg-card)', color: '#fff' }}>العربية (AR)</option>
              <option value="en" style={{ background: 'var(--bg-card)', color: '#fff' }}>English (EN)</option>
            </select>
          </div>

          {/* Theme & Sign Out Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '10px' }}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="secondary-btn"
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '8px 12px',
                fontSize: '13px',
                color: 'var(--danger)',
                borderColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LogOut size={14} />
              <span>{lang === 'en' ? navTitles.logout.en : navTitles.logout.ar}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="mobile-header glass-panel no-print">
        <span 
          onClick={() => navigateTo('dashboard')}
          style={{ fontWeight: '900', fontSize: '18px', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          BEASTMODE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mini Language Switcher */}
          <button
            onClick={() => handleLanguageChange(lang === 'en' ? 'ar' : 'en')}
            className="secondary-btn"
            style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px' }}
          >
            {lang === 'en' ? 'ع' : 'EN'}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-nav glass-panel no-print">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{lang === 'en' ? navTitles[item.id].en.replace(/ ⚡| 🗓️| 📚| 📊| 👤/, '') : navTitles[item.id].ar.replace(/ ⚡| 🗓️| 📚| 📊| 👤/, '')}</span>
          </button>
        ))}
      </nav>

      {/* MAIN VIEWPORT */}
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard lang={lang} onNavigate={navigateTo} />
        )}

        {currentView === 'myplan' && (
          <MyPlan lang={lang} onNavigate={navigateTo} onboardingCompleted={onboardingCompleted} />
        )}

        {currentView === 'library' && (
          <ExerciseLibrary lang={lang} />
        )}

        {currentView === 'stats' && (
          <Stats lang={lang} />
        )}

        {currentView === 'profile' && (
          <Profile lang={lang} onLanguageChange={handleLanguageChange} onNavigate={navigateTo} />
        )}
      </main>
    </div>
  );
}

export default App;
