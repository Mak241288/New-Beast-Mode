import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, WifiOff, CheckCircle2, Bookmark, Trash2, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface CloudSyncStatusBadgeProps {
  lang: 'ar' | 'en';
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({ lang }) => {
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncedText, setLastSyncedText] = useState<string>('');
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<number>(Date.now());
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  
  // Snapshots State
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState<string>('');
  const [savingSnapshot, setSavingSnapshot] = useState<boolean>(false);
  const [showSnapshotView, setShowSnapshotView] = useState<boolean>(false);

  const isEn = lang === 'en';

  const formatLastSynced = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 10) return isEn ? 'Just now' : 'الآن';
    if (diffSec < 60) return isEn ? `${diffSec}s ago` : `منذ ${diffSec} ثانية`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isEn ? `${diffMin}m ago` : `منذ ${diffMin} دقيقة`;
    return isEn ? 'Today' : 'اليوم';
  };

  const showSyncNotification = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  const triggerSmartSync = async (_manual: boolean = false) => {
    if (!navigator.onLine) {
      setSyncState('offline');
      return;
    }

    if (_manual) {
      setSyncState('syncing');
    }

    try {
      await api.syncUserDataFromCloud();
      setLastSyncedTimestamp(Date.now());
      setSyncState('synced');
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
      if (_manual) {
        showSyncNotification(isEn ? '⚡ Cloud data synced successfully!' : '⚡ تمت المزامنة السحابية بنجاح!');
      }
    } catch {
      if (!navigator.onLine) {
        setSyncState('offline');
      } else {
        setSyncState('synced');
      }
    }
  };

  const loadSnapshots = async () => {
    try {
      const data = await api.getCloudSnapshots();
      setSnapshots(data);
    } catch {
      // Non-fatal
    }
  };

  const handleCreateSnapshot = async () => {
    if (!newSnapshotName.trim()) return;
    setSavingSnapshot(true);
    try {
      await api.createCloudSnapshot(newSnapshotName);
      setNewSnapshotName('');
      await loadSnapshots();
      showSyncNotification(isEn ? '💾 Snapshot backup saved!' : '💾 تم حفظ النسخة الاحتياطية بنجاح!');
    } catch (err: any) {
      alert(err.message || 'فشل حفظ النسخة الاحتياطية');
    } finally {
      setSavingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = async (id: string | number, name: string) => {
    if (confirm(isEn ? `Restore backup "${name}"? Current data will be replaced.` : `هل تود استعادة النسخة الاحتياطية "${name}"؟ سيتم استبدال البيانات الحالية بها.`)) {
      try {
        await api.restoreCloudSnapshot(id);
        setShowTooltip(false);
        showSyncNotification(isEn ? `✅ Restored "${name}"!` : `✅ تمت استعادة "${name}" بنجاح!`);
      } catch (err: any) {
        alert(err.message || 'فشل استعادة النسخة الاحتياطية');
      }
    }
  };

  const handleDeleteSnapshot = async (id: string | number) => {
    try {
      await api.deleteCloudSnapshot(id);
      await loadSnapshots();
    } catch {
      // Non-fatal
    }
  };

  useEffect(() => {
    // 1. Initial timer update for "Last synced" text
    setLastSyncedText(formatLastSynced(lastSyncedTimestamp));
    const interval = setInterval(() => {
      setLastSyncedText(formatLastSynced(lastSyncedTimestamp));
    }, 30000);

    // 2. Network connection change listeners
    const handleOnline = () => {
      triggerSmartSync(false);
    };
    const handleOffline = () => {
      setSyncState('offline');
    };

    const handleLocalSyncEvent = () => {
      setLastSyncedTimestamp(Date.now());
      setSyncState('synced');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beast_cloud_synced', handleLocalSyncEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beast_cloud_synced', handleLocalSyncEvent);
    };
  }, [lastSyncedTimestamp, isEn]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={() => {
          setShowTooltip(!showTooltip);
          if (!showTooltip) loadSnapshots();
        }}
        title={isEn ? `Cloud Sync: ${lastSyncedText}` : `المزامنة السحابية: ${lastSyncedText}`}
        className="secondary-btn flex-center"
        style={{
          padding: '5px 8px',
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
          whiteSpace: 'nowrap',
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
            ? (isEn ? 'Syncing' : 'مزامنة') 
            : syncState === 'offline' 
            ? (isEn ? 'Offline' : 'أوفلاين') 
            : (isEn ? 'Synced' : 'سحابي')}
        </span>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: syncState === 'offline' ? '#ef4444' : syncState === 'syncing' ? '#f59e0b' : '#10b981',
          boxShadow: syncState === 'synced' ? '0 0 6px #10b981' : 'none',
        }} />
      </button>

      {/* FLOATING TOAST NOTIFICATION */}
      {showToast && (
        <div
          className="glass-panel animated-fade"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--primary)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px var(--primary-glow)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          <Sparkles size={16} color="var(--primary)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* QUICK SYNC POPOVER / MODAL */}
      {showTooltip && (
        <>
          <div 
            onClick={() => setShowTooltip(false)} 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              zIndex: 99998,
            }} 
          />
          <div
            className="glass-panel animated-fade"
            style={{
              position: 'fixed',
              top: '65px',
              right: '16px',
              left: '16px',
              maxWidth: '340px',
              margin: '0 auto',
              padding: '14px 16px',
              borderRadius: '16px',
              border: '1px solid var(--primary)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px var(--primary-glow)',
              backgroundColor: 'rgba(11, 15, 28, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                {isEn ? 'Cloud Sync & Backups' : 'المزامنة والنسخ الاحتياطي'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>
                <CheckCircle2 size={12} />
                <span>{lastSyncedText}</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {isEn 
                ? 'Your active routine, profile metrics, and recovery logs are synced automatically.' 
                : 'جدولك التدريبي، بياناتك الرياضية، وسجلات الاستشفاء متزامنة سحابياً.'}
            </p>

            {/* Force Sync Action */}
            <button
              onClick={() => triggerSmartSync(true)}
              disabled={syncState === 'syncing'}
              className="primary-btn flex-center"
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '11.5px',
                borderRadius: '8px',
                gap: '6px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              <RefreshCw size={12} className={syncState === 'syncing' ? 'spin-slow' : ''} />
              <span>{isEn ? 'Force Sync Now 🔄' : 'مزامنة وتحديث فوري 🔄'}</span>
            </button>

            {/* Named Cloud Snapshots Toggle */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bookmark size={12} color="var(--primary)" />
                  <span>{isEn ? 'Cloud Snapshots' : 'النسخ السحابية المحفوظة'}</span>
                </span>
                <button
                  onClick={() => setShowSnapshotView(!showSnapshotView)}
                  className="secondary-btn"
                  style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '6px' }}
                >
                  {showSnapshotView ? (isEn ? 'Close' : 'إغلاق') : (isEn ? 'Manage' : 'إدارة ⚙️')}
                </button>
              </div>

              {showSnapshotView && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {/* Create Snapshot input */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      placeholder={isEn ? 'Backup name (e.g. Cut 2026)' : 'اسم النسخة (مثال: خطة رمضان)'}
                      value={newSnapshotName}
                      onChange={(e) => setNewSnapshotName(e.target.value)}
                      className="input-field"
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px', flex: 1 }}
                    />
                    <button
                      onClick={handleCreateSnapshot}
                      disabled={savingSnapshot || !newSnapshotName.trim()}
                      className="glow-btn flex-center"
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                    >
                      <Plus size={12} />
                      <span>{isEn ? 'Save' : 'حفظ'}</span>
                    </button>
                  </div>

                  {/* List of saved snapshots */}
                  <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {snapshots.length === 0 ? (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
                        {isEn ? 'No saved snapshots yet.' : 'لا توجد نسخ احتياطية محفوظة بعد.'}
                      </span>
                    ) : (
                      snapshots.map((snap) => (
                        <div
                          key={snap.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            fontSize: '11px',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={snap.name}>
                            {snap.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              onClick={() => handleRestoreSnapshot(snap.id, snap.name)}
                              title={isEn ? 'Restore this backup' : 'استعادة هذه النسخة'}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px' }}
                            >
                              <RotateCcw size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteSnapshot(snap.id)}
                              title={isEn ? 'Delete backup' : 'حذف النسخة'}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
