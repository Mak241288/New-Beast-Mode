import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Nutrition } from './pages/Nutrition';
import { Consultation } from './pages/Consultation';
import { Stats } from './pages/Stats';
import { Profile } from './pages/Profile';

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
      setCurrentView('dashboard');
    } catch (err: any) {
      console.error('[App] checkStatus error:', err);
      if (err.status === 404) {
        setCurrentView('onboarding');
      } else if (err.status === 401) {
        handleLogout();
      } else {
        // Safe fallback for server errors (500 etc) - stay on dashboard to show existing cached state if possible
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

  // Main Application Router (State-based)
  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          lang={lang}
          onLogout={handleLogout}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {currentView === 'nutrition' && (
        <Nutrition
          lang={lang}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'chat' && (
        <Consultation
          lang={lang}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'stats' && (
        <Stats
          lang={lang}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'profile' && (
        <Profile
          lang={lang}
          onLanguageChange={handleLanguageChange}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
