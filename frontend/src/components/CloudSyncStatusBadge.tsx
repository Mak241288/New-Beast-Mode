import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface CloudSyncStatusBadgeProps {
  lang: 'ar' | 'en';
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({ lang }) => {
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncedText, setLastSyncedText] = useState<string>('');
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<number>(Date.now());
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const isEn = lang === 'en';

  const formatLastSynced = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 10) return isEn ? 'Just now' : 'الآن';
    if (diffSec < 60) return isEn ? `${diffSec}s ago` : `منذ ${diffSec} ثانية`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isEn ? `${diffMin}m ago` : `منذ ${diffMin} دقيقة`;
    return isEn ? 'Today' : 'اليوم';
  };

  const triggerSmartSync = async (_manual: boolean = false) => {
    if (!navigator.onLine) {
      setSyncState('offline');
      return;
    }

    setSyncState('syncing');
    try {
      await api.syncUserDataFromCloud();
      setLastSyncedTimestamp(Date.now());
      setSyncState('synced');
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    } catch {
      setSyncState('offline');
    }
  };

  useEffect(() => {
    // 1. Initial timer update for "Last synced" text
    setLastSyncedText(formatLastSynced(lastSyncedTimestamp));
    const interval = setInterval(() => {
      setLastSyncedText(formatLastSynced(lastSyncedTimestamp));
    }, 15000);

    // 2. Network connection change listeners
    const handleOnline = () => {
      setSyncState('syncing');
      triggerSmartSync();
    };
    const handleOffline = () => {
      setSyncState('offline');
    };

    // 3. Tab focus / Phone Unlock visibility listeners (The Golden Smart Sync)
    let lastFocusSync = Date.now();
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible' || document.hasFocus()) {
        const now = Date.now();
        // Throttle sync to at most once per 6 seconds
        if (now - lastFocusSync > 6000) {
          lastFocusSync = now;
          triggerSmartSync();
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, [lastSyncedTimestamp, isEn]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        title={isEn ? `Cloud Sync: ${lastSyncedText}` : `المزامنة السحابية: ${lastSyncedText}`}
        className="secondary-btn flex-center"
        style={{
          padding: '5px 9px',
          fontSize: '11px',
          borderRadius: '10px',
          gap: '5px',
          background: syncState === 'offline' 
            ? 'rgba(239, 68, 68, 0.1)' 
            : syncState === 'syncing' 
            ? 'rgba(245, 158, 11, 0.1)' 
            : 'rgba(16, 185, 129, 0.08)',
          borderColor: syncState === 'offline' 
            ? 'rgba(239, 68, 68, 0.3)' 
            : syncState === 'syncing' 
            ? 'rgba(245, 158, 11, 0.3)' 
            : 'rgba(16, 185, 129, 0.25)',
          color: syncState === 'offline' 
            ? 'var(--danger)' 
            : syncState === 'syncing' 
            ? '#f59e0b' 
            : 'var(--primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {syncState === 'syncing' ? (
          <RefreshCw size={13} className="spin-slow" />
        ) : syncState === 'offline' ? (
          <WifiOff size={13} />
        ) : (
          <Cloud size={13} />
        )}
        <span style={{ fontWeight: '700' }}>
          {syncState === 'syncing' 
            ? (isEn ? 'Syncing...' : 'جاري المزامنة') 
            : syncState === 'offline' 
            ? (isEn ? 'Offline' : 'أوفلاين') 
            : (isEn ? 'Synced' : 'سحابي')}
        </span>
      </button>

      {/* QUICK SYNC POPOVER / MODAL */}
      {showTooltip && (
        <>
          <div 
            onClick={() => setShowTooltip(false)} 
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }} 
          />
          <div
            className="glass-panel animated-fade"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: isEn ? 0 : 'auto',
              left: isEn ? 'auto' : 0,
              minWidth: '220px',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backgroundColor: 'var(--bg-card, #111827)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                {isEn ? 'Cloud Sync Engine' : 'محرك المزامنة السحابية'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>
                <CheckCircle2 size={12} />
                <span>{lastSyncedText}</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {isEn 
                ? 'Your profile, workout plans, and recovery logs are securely backed up in the cloud.' 
                : 'ملفك الشخصي وجداولك وسجلات الاستشفاء محفوظة ومحمية على السحابة.'}
            </p>

            <button
              onClick={() => {
                triggerSmartSync(true);
                setShowTooltip(false);
              }}
              disabled={syncState === 'syncing'}
              className="primary-btn flex-center"
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '8px',
                gap: '6px',
                marginTop: '4px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              <RefreshCw size={12} className={syncState === 'syncing' ? 'spin-slow' : ''} />
              <span>{isEn ? 'Force Sync Now' : 'مزامنة وتحديث فوري 🔄'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
