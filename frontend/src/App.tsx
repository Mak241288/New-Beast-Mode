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

  const checkStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch active workout plan
      try {
        await api.getActivePlan();
        setCurrentView('dashboard');
      } catch (err) {
        // No active plan -> route to onboarding
        setCurrentView('onboarding');
      }
    } catch (err) {
      // Token expired or invalid
      handleLogout();
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
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Main Application Router (State-based)
  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          onLogout={handleLogout}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {currentView === 'nutrition' && (
        <Nutrition
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'chat' && (
        <Consultation
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'stats' && (
        <Stats
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'profile' && (
        <Profile
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
