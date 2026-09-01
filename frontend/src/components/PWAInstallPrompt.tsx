import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface PWAInstallPromptProps {
  lang: 'ar' | 'en';
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Do not render if standalone or dismissed or no prompt on non-iOS
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  const isEn = lang === 'en';

  return (
    <div
      className="animated-fade"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '16px',
        right: '16px',
        maxWidth: '460px',
        margin: '0 auto',
        zIndex: 999999,
        background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.96), rgba(6, 10, 22, 0.98))',
        border: '1px solid rgba(0, 210, 255, 0.4)',
        borderRadius: '20px',
        padding: '14px 18px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(0, 210, 255, 0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0, 210, 255, 0.15)', border: '1px solid rgba(0, 210, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Smartphone size={22} color="#00d2ff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13.5px', fontWeight: '900', color: '#ffffff' }}>
            {isEn ? 'Install BeastMode App ⚡' : 'تثبيت تطبيق BeastMode ⚡'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isIOS
              ? (isEn ? 'Tap Share ⎋ and "Add to Home Screen ➕"' : 'اضغط زر المشاركة ⎋ ثم "إضافة للشاشة الرئيسية ➕"')
              : (isEn ? 'Fast, offline & instant gym tracking' : 'تطبيق سريع، أوفلاين، وبدون متجر')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="glow-btn"
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            <span>{isEn ? 'Install' : 'تثبيت'}</span>
          </button>
        )}

        {isIOS && (
          <div style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Share size={12} />
            <span>{isEn ? 'Share' : 'مشاركة'}</span>
          </div>
        )}

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={isEn ? 'Dismiss' : 'إغلاق'}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
