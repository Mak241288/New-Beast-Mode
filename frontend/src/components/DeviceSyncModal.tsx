import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cloudSyncService } from '../services/cloudSyncService';
import { cacheStore } from '../utils/cacheStore';
import { QrCode, Smartphone, Copy, Check, Download, Upload, X, ShieldCheck, ArrowRightLeft, KeyRound } from 'lucide-react';

interface DeviceSyncModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  onClose: () => void;
  onSyncComplete?: () => void;
}

// Bulletproof UTF-8 to Base64 Encoder & Decoder using standard TextEncoder
function bytesToBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  } catch {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  }
}

function base64ToBytes(b64: string): string {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return decodeURIComponent(Array.prototype.map.call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }
}

// Clean Ultra-Short Plan Compressor (< 150 chars, 100% QR compatible)
export function cleanPack(plan: any, profile: any, exp: number): string {
  const t = (plan?.title || 'Plan').slice(0, 30).replace(/[~|;/:,]/g, ' ');
  const days = (plan?.days || plan?.dayWorkouts || []).slice(0, 7);
  const dStr = days.map((d: any, i: number) => {
    if (d.isRestDay) return `${d.dayIndex ?? i}:R`;
    const exs = (d.exercises || []).slice(0, 8).map((e: any) => [
      (e.name || 'Exercise').slice(0, 25).replace(/[~|;/:,]/g, ' '),
      e.sets || 3,
      String(e.reps || '10').replace(/[~|;/:,]/g, ' ')
    ].join(',')).join(';');
    return `${d.dayIndex ?? i}:${exs}`;
  }).join('/');
  const pName = (profile?.name || '').slice(0, 20).replace(/[~|;/:,]/g, ' ');
  const raw = `BM~${t}~${exp}~${dStr}~${pName}`;
  return bytesToBase64(raw);
}

function cleanUnpack(b64: string): any {
  try {
    const raw = base64ToBytes(b64.trim());
    if (!raw.startsWith('BM~')) return null;
    const parts = raw.split('~');
    const title = parts[1] || 'جدول التمرين ⚡';
    const exp = parseInt(parts[2], 10) || (Date.now() + 120000);
    const daysRaw = parts[3] ? parts[3].split('/') : [];
    const pName = parts[4] || '';

    const days = daysRaw.map((dr, idx) => {
      const colonIdx = dr.indexOf(':');
      const dIdx = colonIdx !== -1 ? Number(dr.slice(0, colonIdx)) : idx;
      const content = colonIdx !== -1 ? dr.slice(colonIdx + 1) : dr;
      if (content === 'R') {
        return { dayIndex: dIdx, title: 'يوم راحة واستشفاء', isRestDay: true, exercises: [] };
      }
      const exercises = content.split(';').filter(Boolean).map((er, eIdx) => {
        const [name, sets, reps] = er.split(',');
        return {
          id: `ex_${dIdx}_${eIdx + 1}`,
          name: name || 'Exercise',
          sets: Number(sets) || 3,
          reps: reps || '10-12',
          weight: '',
          targetMuscle: 'Chest',
          restSeconds: 60,
        };
      });
      return {
        dayIndex: dIdx,
        title: `اليوم ${dIdx + 1}`,
        isRestDay: false,
        focusArea: exercises[0]?.targetMuscle || '',
        exercises,
      };
    });

    const fullPlan = {
      id: `plan_${Date.now()}`,
      title,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days,
      dayWorkouts: days,
    };

    return {
      v: 5,
      exp,
      activePlan: fullPlan,
      planHistory: [fullPlan],
      userProfile: pName ? { name: pName } : null,
    };
  } catch {
    return null;
  }
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, lang, onClose, onSyncComplete }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [syncPayloadString, setSyncPayloadString] = useState<string>('');
  const [syncUrl, setSyncUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShortCode, setCopiedShortCode] = useState(false);
  const [shortCode, setShortCode] = useState<string>('');
  const [pinReady, setPinReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 mins
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Receive / Import state
  const [pasteInput, setPasteInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e?.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('beast_open_sync_modal', handleOpen);
    return () => window.removeEventListener('beast_open_sync_modal', handleOpen);
  }, []);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPasteInput(text.trim());
        handleImportPayload(text.trim());
      }
    } catch {
      // Fallback
    }
  };

  // Live 2-minute countdown (120 seconds)
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(120);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, refreshKey]);

  // Generate payload whenever modal opens, tab changes, or refreshed
  useEffect(() => {
    if (!isOpen) return;

    try {
      const activePlan = cacheStore.get('active_plan');
      const planHistory = cacheStore.get('plan_history') || (activePlan ? [activePlan] : []);
      const userProfile = cacheStore.get('user_profile') || {};
      const userStats = cacheStore.get('user_stats') || {};
      const userRecovery = cacheStore.get('user_recovery') || {};
      const allRecoveryLogs = cacheStore.get('all_recovery_logs') || [];
      const weightLogs = cacheStore.get('weight_logs') || [];
      const workoutLogs = cacheStore.get('workout_logs') || [];
      const customExercises = cacheStore.get('custom_exercises') || [];
      const transformationPhotos = localStorage.getItem('transformation_photos') || null;
      const timerSoundPack = localStorage.getItem('bm_timer_sound_pack') || 'BOXING_BELL';
      const timerVolume = localStorage.getItem('bm_timer_volume') || '80';
      const colorTheme = localStorage.getItem('color_theme') || 'volt';
      const waterToday = localStorage.getItem('beast_water_today') || '0';
      const activeGymSession = cacheStore.get('active_gym_session') || null;

      // Full payload for file download and Cloud PIN Sync
      const fullPayload = {
        version: 2,
        timestamp: Date.now(),
        activePlan,
        planHistory,
        userProfile,
        userStats,
        userRecovery,
        allRecoveryLogs,
        weightLogs,
        workoutLogs,
        customExercises,
        transformationPhotos,
        preferences: {
          timerSoundPack,
          timerVolume,
          colorTheme,
          waterToday,
        },
        activeGymSession,
      };
      setSyncPayloadString(JSON.stringify(fullPayload, null, 2));

      setPinReady(false);
      // Generate a 6-Digit random PIN
      const pinNumber = Math.floor(100000 + Math.random() * 900000).toString();
      setShortCode(pinNumber);

      const expTime = Date.now() + 2 * 60 * 1000;
      const fullUrl = `${window.location.origin}/#sync=${pinNumber}`;
      setSyncUrl(fullUrl);

      // Async write to Supabase temp_sync via direct high-performance REST
      cloudSyncService.uploadPin(pinNumber, fullPayload, expTime).then((ok) => {
        setPinReady(ok);
      });

      // Generate crisp vector QR for 40-character URL
      QRCode.toDataURL(
        fullUrl,
        {
          width: 260,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          } else {
            console.warn('QR DataURL generation fallback:', err);
          }
        }
      );
    } catch (err) {
      console.error('Failed to generate sync payload:', err);
    }
  }, [isOpen, activeTab, refreshKey]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(syncUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syncPayloadString);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadBackup = () => {
    try {
      const blob = new Blob([syncPayloadString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BeastMode_Complete_Backup_${new Date().toISOString().split('T')[0]}.beast`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Backup download failed:', err);
    }
  };

  const handleImportPayload = async (rawString: string) => {
    setImporting(true);
    setImportStatus(null);
    try {
      let parsed: any = null;
      let trimmed = rawString.trim();

      // Check if it is a URL with hash
      if (trimmed.includes('#sync=')) {
        const hashIdx = trimmed.indexOf('#sync=');
        trimmed = hashIdx !== -1 ? trimmed.slice(hashIdx + 6).trim() : trimmed;
      }

      // 1. Check if 6-digit PIN in Supabase temp_sync
      const pinRegex = /^\d{6}$/;
      if (pinRegex.test(trimmed)) {
        const res = await cloudSyncService.fetchPin(trimmed);
        if (res.expired) {
          throw new Error(isAr ? 'انتهت صلاحية هذا الرمز (تجاوز دقيقتين)، يرجى توليد رمز جديد من الكمبيوتر.' : 'This PIN has expired (2-minute limit).');
        }
        if (!res.success || !res.data) {
          throw new Error(isAr ? 'لم يتم العثور على رمز المزامنة هذا أو أنه انتهى.' : 'PIN not found or expired.');
        }
        parsed = res.data;
      } else if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        parsed = cleanUnpack(trimmed);
        if (!parsed) {
          try {
            const decoded = decodeURIComponent(atob(trimmed));
            parsed = JSON.parse(decoded);
          } catch {}
        }
      }

      if (parsed && parsed.exp && Date.now() > parsed.exp) {
        throw new Error(isAr ? '⚠️ انتهت صلاحية هذا الرابط المؤقت (صالح لـ دقيقتين فقط). يرجى الضغط على زر التحديث في جهازك الآخر.' : '⚠️ Temporary sync link expired (2 mins limit). Please refresh on your other device.');
      }

      if (!parsed || (!parsed.activePlan && !parsed.planHistory)) {
        throw new Error(isAr ? 'بيانات المزامنة غير صالحة أو فارغة' : 'Invalid or empty sync data');
      }

      // 1. Hydrate Core Athlete & Recovery Data
      if (parsed.userProfile) cacheStore.set('user_profile', parsed.userProfile);
      if (parsed.userStats) cacheStore.set('user_stats', parsed.userStats);
      if (parsed.userRecovery) cacheStore.set('user_recovery', parsed.userRecovery);
      if (parsed.allRecoveryLogs) cacheStore.set('all_recovery_logs', parsed.allRecoveryLogs);
      if (parsed.weightLogs) cacheStore.set('weight_logs', parsed.weightLogs);
      if (parsed.workoutLogs) cacheStore.set('workout_logs', parsed.workoutLogs);
      if (parsed.customExercises) cacheStore.set('custom_exercises', parsed.customExercises);

      // 2. Hydrate Plans
      if (Array.isArray(parsed.planHistory) && parsed.planHistory.length > 0) {
        cacheStore.set('plan_history', parsed.planHistory);
        if (parsed.activePlan) {
          cacheStore.set('active_plan', parsed.activePlan);
        } else {
          cacheStore.set('active_plan', parsed.planHistory[0]);
        }
      } else if (parsed.activePlan) {
        cacheStore.set('active_plan', parsed.activePlan);
      }

      // 3. Hydrate Preferences & Media
      if (parsed.transformationPhotos) {
        localStorage.setItem('transformation_photos', typeof parsed.transformationPhotos === 'string' ? parsed.transformationPhotos : JSON.stringify(parsed.transformationPhotos));
      }
      if (parsed.preferences) {
        if (parsed.preferences.timerSoundPack) localStorage.setItem('bm_timer_sound_pack', parsed.preferences.timerSoundPack);
        if (parsed.preferences.timerVolume) localStorage.setItem('bm_timer_volume', parsed.preferences.timerVolume);
        if (parsed.preferences.colorTheme) localStorage.setItem('color_theme', parsed.preferences.colorTheme);
        if (parsed.preferences.waterToday) localStorage.setItem('beast_water_today', parsed.preferences.waterToday);
      }
      if (parsed.activeGymSession) {
        cacheStore.set('active_gym_session', parsed.activeGymSession);
        try {
          localStorage.setItem('beastmode_active_gym_session', JSON.stringify(parsed.activeGymSession));
        } catch {}
      }



      setImportStatus({
        type: 'success',
        message: isAr ? '🎉 تم استيراد ونقل جميع الجداول والبيانات بنجاح ⚡' : 'All workouts & data synced successfully! ⚡',
      });

      setTimeout(() => {
        if (onSyncComplete) onSyncComplete();
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err?.message || (isAr ? 'فشل استيراد البيانات، تأكد من صحة الرمز' : 'Failed to import data'),
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPasteInput(content);
        handleImportPayload(content);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(0, 210, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Smartphone size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {isAr ? 'مزامنة ونقل الجداول ✨' : 'Device Sync & Transfer ✨'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isAr ? 'انقل جداولك وبياناتك بين الكمبيوتر والهاتف بلمسة واحدة' : 'Sync your plan & logs across devices'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              background: activeTab === 'send' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'send' ? '#000' : 'var(--text-secondary)',
            }}
          >
            <QrCode size={16} />
            <span>{isAr ? 'إرسال للهاتف (QR / PIN)' : 'Send to Phone (QR / PIN)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receive')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              background: activeTab === 'receive' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'receive' ? '#000' : 'var(--text-secondary)',
            }}
          >
            <ArrowRightLeft size={16} />
            <span>{isAr ? 'استلام وتحديث 📥' : 'Receive & Import 📥'}</span>
          </button>
        </div>

        {/* Tab 1: SEND / QR CODE */}
        {activeTab === 'send' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* QR Frame */}
            <div
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '20px',
                border: '3px solid var(--primary)',
                boxShadow: '0 8px 30px rgba(0, 210, 255, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <img
                src={qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(syncUrl || window.location.href)}`}
                alt="Sync QR Code"
                style={{
                  width: '220px',
                  height: '220px',
                  borderRadius: '8px',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
              <span style={{ fontSize: '11.5px', color: '#0f172a', fontWeight: '800', letterSpacing: '0.3px', textAlign: 'center' }}>
                {isAr ? '📷 امسح الرمز بكاميرا هاتفك للمزامنة الفورية' : 'Scan with phone camera to sync instantly'}
              </span>
            </div>

            {/* 6-Digit PIN Badge */}
            <div
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '16px',
                background: pinReady
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 210, 255, 0.15))'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(0, 210, 255, 0.1))',
                border: `2px solid ${pinReady ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 8px 25px rgba(0, 210, 255, 0.15)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={15} color={pinReady ? '#10b981' : '#f59e0b'} />
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {isAr ? 'رمز المزامنة السريع (6 أرقام):' : 'Quick 6-Digit PIN:'}
                  </span>
                  <span style={{ fontSize: '11px', color: pinReady ? '#10b981' : '#f59e0b', fontWeight: '800' }}>
                    {pinReady ? (isAr ? '🟢 متصل' : '🟢 Ready') : (isAr ? '🟡 جاري التجهيز...' : '🟡 Preparing...')}
                  </span>
                </div>
                <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '8px', fontFamily: 'monospace', paddingRight: isAr ? '4px' : '0' }}>
                  {shortCode || '849201'}
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shortCode);
                    setCopiedShortCode(true);
                    setTimeout(() => setCopiedShortCode(false), 2000);
                  } catch {}
                }}
                className="glow-btn"
                style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: '10px', gap: '6px' }}
              >
                {copiedShortCode ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedShortCode ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرمز' : 'Copy PIN')}</span>
              </button>
            </div>

            {/* Countdown Expiry Badge */}
            <div
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                background: timeLeft > 60 ? 'rgba(0, 210, 255, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${timeLeft > 60 ? 'rgba(0, 210, 255, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: timeLeft > 60 ? 'var(--text-primary)' : 'var(--danger)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                <span>⏱️</span>
                <span>
                  {isAr ? `صالح مؤقتاً لمدة: ${formatTime(timeLeft)} دقيقة` : `Temporary link expires in: ${formatTime(timeLeft)}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="secondary-btn"
                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title={isAr ? 'تجديد الصلاحية 10 دقائق أخرى' : 'Refresh validity'}
              >
                <span>{isAr ? 'تجديد 🔄' : 'Refresh 🔄'}</span>
              </button>
            </div>

            {/* Single-line Compact URL Preview */}
            <div
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                direction: 'ltr',
                textAlign: 'left',
              }}
            >
              {syncUrl}
            </div>

            {/* Action Buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="glow-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13.5px', gap: '8px' }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedLink ? (isAr ? 'تم نسخ الرابط المباشر بنجاح! 📋' : 'Link Copied! 📋') : (isAr ? 'نسخ رابط المزامنة المباشر (افتحه بالهاتف)' : 'Copy Direct Sync Link')}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="secondary-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '12.5px', gap: '6px' }}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? (isAr ? 'تم نسخ الكود!' : 'Code Copied!') : (isAr ? 'نسخ كود البيانات' : 'Copy Code')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="secondary-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '12.5px', gap: '6px' }}
                >
                  <Download size={14} />
                  <span>{isAr ? 'تنزيل نسخة احتياطية' : 'Export Backup'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>{isAr ? 'مزامنة مشفرة ومباشرة بين أجهزتك بدون وسيط' : 'Encrypted direct transfer between your devices'}</span>
            </div>
          </div>
        )}

        {/* Tab 2: RECEIVE / IMPORT */}
        {activeTab === 'receive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {isAr
                ? 'الصق كود أو رابط المزامنة الذي نسخته من جهازك الآخر، أو ارفع ملف النسخة الاحتياطية (.beast):'
                : 'Paste the sync code or link copied from your other device or upload a backup file:'}
            </p>

            {/* Quick Clipboard Paste Shortcut */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="secondary-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '11px',
                fontSize: '13px',
                fontWeight: '700',
                background: 'rgba(0, 210, 255, 0.1)',
                borderColor: 'rgba(0, 210, 255, 0.35)',
                color: 'var(--primary)',
                gap: '8px',
              }}
            >
              <span>📋</span>
              <span>{isAr ? 'لصق الكود من الحافظة والمزامنة الفورية' : 'Paste from Clipboard & Sync Instantly'}</span>
            </button>

            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder={isAr ? 'الصق رابط أو كود المزامنة هنا...' : 'Paste sync link or code here...'}
              className="input-field"
              rows={4}
              style={{ width: '100%', resize: 'none', fontSize: '12px', fontFamily: 'monospace' }}
            />

            {importStatus && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: importStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: importStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: importStatus.type === 'success' ? '#10b981' : '#ef4444',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {importStatus.type === 'success' ? <Check size={16} /> : <X size={16} />}
                <span>{importStatus.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                disabled={!pasteInput.trim() || importing}
                onClick={() => handleImportPayload(pasteInput)}
                className="glow-btn"
                style={{ flex: 2, justifyContent: 'center', padding: '12px', fontSize: '13.5px', gap: '6px' }}
              >
                <ArrowRightLeft size={16} />
                <span>{importing ? (isAr ? 'جاري الاستيراد...' : 'Importing...') : (isAr ? 'استيراد وتحديث التطبيق الآن ⚡' : 'Import & Sync Now ⚡')}</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json,.beast,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="secondary-btn"
                style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '12.5px', gap: '6px' }}
              >
                <Upload size={14} />
                <span>{isAr ? 'رفع ملف' : 'Upload'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
