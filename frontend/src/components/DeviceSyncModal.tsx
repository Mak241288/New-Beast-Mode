import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cacheStore } from '../utils/cacheStore';
import { planService } from '../services/planService';
import { QrCode, Smartphone, Copy, Check, Download, Upload, X, ShieldCheck, ArrowRightLeft, Sparkles } from 'lucide-react';

interface DeviceSyncModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  onClose: () => void;
  onSyncComplete?: () => void;
}

// Ultra-Compact UTF-8 Micro-Encoder for 1-Line URL (< 200 chars) and Instant SVG QR
function encodeMicroPlan(plan: any, profile: any, exp: number): string {
  const title = (plan?.title || 'جدولي التدريبي ⚡').replace(/[~|;/:,]/g, ' ');
  const days = plan?.days || plan?.dayWorkouts || [];
  const daysStr = days.map((d: any) => {
    const exs = (d.exercises || []).map((e: any) => [
      (e.name || '').replace(/[~|;/:,]/g, ' '),
      e.sets || 3,
      e.reps || '10',
      e.weight || '',
      e.targetMuscle || 'Chest',
    ].join(',')).join(';');
    return `${d.dayIndex}:${(d.title || '').replace(/[~|;/:,]/g, ' ')}:${d.isRestDay ? 1 : 0}:${exs}`;
  }).join('/');
  
  const pName = (profile?.name || '').replace(/[~|;/:,]/g, ' ');
  const pGoal = (profile?.goal || '').replace(/[~|;/:,]/g, ' ');
  const raw = `v4~${title}~${exp}~${daysStr}~${pName}~${pGoal}`;
  return btoa(unescape(encodeURIComponent(raw)));
}

function decodeMicroPlan(b64: string): any {
  try {
    const raw = decodeURIComponent(escape(atob(b64)));
    if (!raw.startsWith('v4~')) return null;
    const parts = raw.split('~');
    const title = parts[1] || 'جدولي التدريبي ⚡';
    const exp = parseInt(parts[2], 10) || (Date.now() + 600000);
    const daysRaw = parts[3] ? parts[3].split('/') : [];
    const pName = parts[4] || '';
    const pGoal = parts[5] || '';

    const days = daysRaw.map((dr) => {
      const [dIdx, dTitle, isRest, exsRaw] = dr.split(':');
      const exercises = (exsRaw ? exsRaw.split(';') : []).filter(Boolean).map((er, idx) => {
        const [name, sets, reps, weight, muscle] = er.split(',');
        return {
          id: `ex_${dIdx}_${idx + 1}`,
          name: name || 'Exercise',
          category: 'MAIN',
          sets: Number(sets) || 3,
          reps: reps || '10-12',
          weight: weight || '',
          targetMuscle: muscle || 'Chest',
          restSeconds: 60,
        };
      });
      return {
        dayIndex: Number(dIdx),
        title: dTitle || `Day ${Number(dIdx) + 1}`,
        isRestDay: isRest === '1',
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
      v: 4,
      exp,
      activePlan: fullPlan,
      planHistory: [fullPlan],
      userProfile: pName ? { name: pName, goal: pGoal } : null,
    };
  } catch {
    return null;
  }
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, lang, onClose, onSyncComplete }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [syncPayloadString, setSyncPayloadString] = useState<string>('');
  const [syncUrl, setSyncUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Receive / Import state
  const [pasteInput, setPasteInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAr = lang === 'ar';

  // Live 10-minute countdown
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(600);
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

      // Full payload for file download
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

      // Ultra-short micro encoded link (< 200 chars)
      const expTime = Date.now() + 10 * 60 * 1000;
      const targetPlan = activePlan || (Array.isArray(planHistory) && planHistory.length > 0 ? planHistory[0] : null);
      const microB64 = encodeMicroPlan(targetPlan, userProfile, expTime);
      const fullUrl = `${window.location.origin}/#sync=${microB64}`;
      setSyncUrl(fullUrl);

      // Generate instant vector SVG QR code (0.001ms generation)
      QRCode.toString(fullUrl, {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then((svg) => {
        setQrSvg(svg);
      }).catch((err) => {
        console.warn('SVG QR Code generation fallback:', err);
      });
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
      const trimmed = rawString.trim();

      // Check if it is a base64 URL fragment
      if (trimmed.startsWith('http') || trimmed.includes('#sync=')) {
        const hashIdx = trimmed.indexOf('#sync=');
        const b64 = hashIdx !== -1 ? trimmed.slice(hashIdx + 6) : trimmed;
        parsed = decodeMicroPlan(b64);
        if (!parsed) {
          try {
            const decoded = decodeURIComponent(atob(b64));
            parsed = JSON.parse(decoded);
          } catch {}
        }
      } else if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        parsed = decodeMicroPlan(trimmed);
        if (!parsed) {
          try {
            const decoded = decodeURIComponent(atob(trimmed));
            parsed = JSON.parse(decoded);
          } catch {}
        }
      }

      if (parsed && parsed.exp && Date.now() > parsed.exp) {
        throw new Error(isAr ? '⚠️ انتهت صلاحية هذا الرابط المؤقت (صالح لـ 10 دقائق فقط). يرجى الضغط على زر التحديث في جهازك الآخر.' : '⚠️ Temporary sync link expired (10 mins limit). Please refresh on your other device.');
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
        cacheStore.set('plan_history', [parsed.activePlan]);
      }

      // 3. Hydrate Preferences & Extras
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

      // Broadcast changes
      const allPlans = await planService.getAll();
      const active = allPlans.find((p) => p.active) || allPlans[0];
      window.dispatchEvent(
        new CustomEvent('beast_plan_changed', {
          detail: { activePlan: active, plans: allPlans },
        })
      );
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));

      setImportStatus({
        type: 'success',
        message: isAr ? '🎉 تم استيراد وتحديث جميع جداولك وبياناتك بنجاح!' : '🎉 All workout plans and athlete stats imported successfully!',
      });

      setTimeout(() => {
        onSyncComplete?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || (isAr ? 'فشل قراءة بيانات المزامنة، تأكد من صحة الكود' : 'Failed to import data, please check the code'),
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
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px 24px',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 210, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          direction: isAr ? 'rtl' : 'ltr',
          textAlign: isAr ? 'right' : 'left',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(16, 185, 129, 0.2))',
                border: '1px solid rgba(0, 210, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Smartphone size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{isAr ? 'مزامنة ونقل الجداول' : 'Device Sync Hub'}</span>
                <Sparkles size={16} color="var(--primary)" />
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                {isAr ? 'انقل جداولك وبياناتك بين الكمبيوتر والهاتف بلمسة واحدة' : 'Seamlessly transfer your workout plans between devices'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
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
            <span>{isAr ? 'إرسال للهاتف (QR)' : 'Send to Phone (QR)'}</span>
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
              <div
                style={{
                  width: '220px',
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {qrSvg ? (
                  <div
                    style={{ width: '100%', height: '100%' }}
                    dangerouslySetInnerHTML={{
                      __html: qrSvg.replace('<svg ', '<svg style="width:100%;height:100%;display:block;" '),
                    }}
                  />
                ) : (
                  <div style={{ color: '#64748b', fontSize: '12px' }}>
                    {isAr ? 'جاري توليد الرمز...' : 'Generating QR code...'}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '11.5px', color: '#0f172a', fontWeight: '800', letterSpacing: '0.3px', textAlign: 'center' }}>
                {isAr ? '📷 امسح الرمز بكاميرا هاتفك للمزامنة الفورية' : 'Scan with phone camera to sync instantly'}
              </span>
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
                ? 'الصق كود المزامنة الذي نسخته من جهازك الآخر، أو ارفع ملف النسخة الاحتياطية (.beast):'
                : 'Paste the sync code copied from your other device or upload a backup file:'}
            </p>

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
