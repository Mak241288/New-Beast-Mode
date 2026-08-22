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
import { CloudSyncStatusBadge } from './components/CloudSyncStatusBadge';
import { GlobalWorkoutPlayer } from './components/GlobalWorkoutPlayer';
import { FloatingWorkoutBar } from './components/FloatingWorkoutBar';
import { FloatingSpeedDial } from './components/FloatingSpeedDial';

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
      const saved = localStorage.getItem('beast_last_view');
      if (saved && validViews.includes(saved)) {
        return saved;
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
      localStorage.setItem('beast_last_view', view);
      window.history.pushState({ view }, '', `#${view}`);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    // 1. Check initial active session (handles OAuth redirect callback hash/query)
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.access_token) {
          setToken(session.access_token);
          try {
            localStorage.setItem('token', session.access_token);
          } catch {
            // Ignore
          }

          if (session.user) {
            const existingProfile: any = cacheStore.get('user_profile') || {};
            const cleanEmail = session.user.email?.trim().toLowerCase() || existingProfile.email || '';
            const cleanName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || cleanEmail.split('@')[0] || existingProfile.name || 'Beast Athlete';

            const profile = {
              ...existingProfile,
              email: cleanEmail,
              name: cleanName,
              isGoogleLinked: true,
              googleEmail: cleanEmail,
              googleId: session.user.id,
              onboardingCompleted: existingProfile.onboardingCompleted ?? true,
              updatedAt: new Date().toISOString(),
            };
            cacheStore.set('user_profile', profile);
          }

          // Sync cloud data across devices silently
          await api.syncUserDataFromCloud();

          // Clean OAuth access token fragment from URL if present
          if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
            const savedView = localStorage.getItem('beast_last_view') || 'dashboard';
            window.history.replaceState({ view: savedView }, document.title, window.location.pathname + `#${savedView}`);
            setCurrentView(savedView);
          }
        }
      } catch (err) {
        console.warn('[Supabase Auth Init Error]:', err);
      }
    };

    initSession();

    // 2. Listen to Supabase auth state changes (OAuth redirects, tokens, signins)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.access_token) {
        setToken(session.access_token);
        try {
          localStorage.setItem('token', session.access_token);
        } catch {
          // Ignore
        }

        if (session.user) {
          const existingProfile: any = cacheStore.get('user_profile') || {};
          const cleanEmail = session.user.email?.trim().toLowerCase() || existingProfile.email || '';
          const cleanName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || cleanEmail.split('@')[0] || existingProfile.name || 'Beast Athlete';

          const profile = {
            ...existingProfile,
            email: cleanEmail,
            name: cleanName,
            isGoogleLinked: true,
            googleEmail: cleanEmail,
            googleId: session.user.id,
            onboardingCompleted: existingProfile.onboardingCompleted ?? true,
            updatedAt: new Date().toISOString(),
          };
          cacheStore.set('user_profile', profile);
          try {
            await supabase.from('User').upsert(profile, { onConflict: 'email' });
          } catch {
            // Non-fatal
          }
        }

        // Sync cloud data across devices
        await api.syncUserDataFromCloud();

        // Only redirect to dashboard if the user was on the login or landing page
        if (event === 'SIGNED_IN') {
          setCurrentView((prev) => {
            const validViews = ['dashboard', 'myplan', 'library', 'stats', 'profile', 'privacy', 'terms', 'about', 'onboarding'];
            if (validViews.includes(prev) && prev !== 'landing' && prev !== 'login') {
              return prev;
            }
            const hash = (window.location.hash || '').replace('#', '');
            if (validViews.includes(hash)) {
              return hash;
            }
            const saved = localStorage.getItem('beast_last_view');
            if (saved && validViews.includes(saved)) {
              return saved;
            }
            return 'dashboard';
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setToken(null);
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('beast_last_view');
        } catch {
          // Ignore
        }
        cacheStore.clearAll();
        setCurrentView('landing');
      }
    });

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        const hash = (window.location.hash || '').replace('#', '');
        const validViews = ['dashboard', 'myplan', 'library', 'stats', 'profile', 'privacy', 'terms', 'about', 'onboarding'];
        if (validViews.includes(hash)) {
          setCurrentView(hash);
        } else {
          const saved = localStorage.getItem('beast_last_view');
          if (saved && validViews.includes(saved)) {
            setCurrentView(saved);
          } else {
            setCurrentView(token ? 'dashboard' : 'landing');
          }
        }
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

  // Zero-polling Realtime Cross-Device Cloud Sync
  useEffect(() => {
    if (!token) return;
    const unsubscribe = api.subscribeToRealtimeSync();
    return () => {
      unsubscribe?.();
    };
  }, [token]);

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
        setCurrentView((prev) => {
          if (validViews.includes(prev)) return prev;
          const hash = (window.location.hash || '').replace('#', '');
          if (validViews.includes(hash)) return hash;
          const saved = localStorage.getItem('beast_last_view');
          if (saved && validViews.includes(saved)) return saved;
          return 'dashboard';
        });
      }
    } catch (err: any) {
      console.warn('[App] checkStatus warning:', err);
      if (err.status === 401) {
        handleLogout();
      } else {
        // Fallback gracefully without blocking the user
        const validViews = ['dashboard', 'myplan', 'library', 'stats', 'profile', 'privacy', 'terms', 'about'];
        setCurrentView((prev) => {
          if (validViews.includes(prev)) return prev;
          const hash = (window.location.hash || '').replace('#', '');
          if (validViews.includes(hash)) return hash;
          const saved = localStorage.getItem('beast_last_view');
          if (saved && validViews.includes(saved)) return saved;
          return 'dashboard';
        });
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
      return <Login lang={lang} onSuccess={handleLoginSuccess} onBack={() => navigateTo('landing')} onNavigateToLegal={(page) => navigateTo(page)} />;
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
          {/* Cloud Sync & Language Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
            <CloudSyncStatusBadge lang={lang} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <Globe size={14} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as 'ar' | 'en')}
                className="input-field"
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  fontSize: '11px',
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
          </div>

          {/* Theme & Sign Out Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
            <ThemeToggle placement="up" />
            <button
              onClick={handleLogout}
              className="secondary-btn"
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '8px 10px',
                fontSize: '12.5px',
                color: 'var(--danger)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <LogOut size={14} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>{lang === 'en' ? navTitles.logout.en : navTitles.logout.ar}</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Smart Cloud Sync Status Badge */}
          <CloudSyncStatusBadge lang={lang} />
          {/* Mini Language Switcher */}
          <button
            onClick={() => handleLanguageChange(lang === 'en' ? 'ar' : 'en')}
            className="secondary-btn"
            style={{ padding: '5px 8px', fontSize: '11px', borderRadius: '8px' }}
          >
            {lang === 'en' ? 'ع' : 'EN'}
          </button>
          <ThemeToggle />
          {/* Quick Mobile Sign Out */}
          <button
            onClick={handleLogout}
            title={lang === 'en' ? 'Sign Out' : 'تسجيل الخروج'}
            className="secondary-btn"
            style={{
              padding: '5px 8px',
              fontSize: '11px',
              borderRadius: '8px',
              color: 'var(--danger)',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              background: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LogOut size={13} />
            <span>{lang === 'en' ? 'Exit' : 'خروج'}</span>
          </button>
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
          <Profile lang={lang} onLanguageChange={handleLanguageChange} onNavigate={navigateTo} onLogout={handleLogout} />
        )}
      </main>

      {/* GLOBAL WORKOUT SESSION PLAYER, MINI-BAR & SPEED DIAL */}
      <GlobalWorkoutPlayer lang={lang} />
      <FloatingWorkoutBar lang={lang} />
      <FloatingSpeedDial lang={lang} />
    </div>
  );
}

export default App;
