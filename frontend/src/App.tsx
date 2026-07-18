import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { MyPlan } from './pages/MyPlan';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { Stats } from './pages/Stats';
import { Profile } from './pages/Profile';
import { ThemeToggle } from './components/ThemeToggle';
import { Dumbbell, Calendar, BookOpen, TrendingUp, User, LogOut, Globe } from 'lucide-react';

import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'ar' | 'en'>(localStorage.getItem('lang') === 'en' ? 'en' : 'ar');

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.history.pushState({ view }, '', `#${view}`);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView('dashboard');
      }
    };

    window.history.replaceState({ view: currentView }, '', `#${currentView}`);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const checkStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      await api.getActivePlan();
      // Keep currentView if it is already set to something valid, otherwise default to dashboard
      const validViews = ['dashboard', 'myplan', 'library', 'stats', 'profile'];
      if (!validViews.includes(currentView)) {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      console.error('[App] checkStatus error:', err);
      if (err.status === 404) {
        setCurrentView('onboarding');
      } else if (err.status === 401) {
        handleLogout();
      } else {
        setCurrentView('dashboard');
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentView('dashboard');
  };

  const handleOnboardingComplete = () => {
    checkStatus();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h3>جاري تهيئة بيئة تدريب الوحوش...</h3>
      </div>
    );
  }

  // Auth Guard
  if (!token) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  // Onboarding Guard
  if (currentView === 'onboarding') {
    return <Onboarding lang={lang} onComplete={handleOnboardingComplete} />;
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
          <div className="sidebar-logo">BEASTMODE</div>
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
        <span style={{ fontWeight: '900', fontSize: '18px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
          <MyPlan lang={lang} onNavigate={navigateTo} />
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
