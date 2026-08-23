import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cacheStore } from '../utils/cacheStore';
import { planService } from '../services/planService';
import { QrCode, Smartphone, Copy, Check, Download, Upload, RefreshCw, X, ShieldCheck, ArrowRightLeft, Sparkles } from 'lucide-react';

interface DeviceSyncModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, lang, onClose, onSyncComplete }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [syncPayloadString, setSyncPayloadString] = useState<string>('');
  const [syncUrl, setSyncUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Receive / Import state
  const [pasteInput, setPasteInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAr = lang === 'ar';

  // Generate payload whenever modal opens or tab changes to send
  useEffect(() => {
    if (!isOpen) return;

    try {
      const activePlan = cacheStore.get('active_plan');
      const planHistory = cacheStore.get('plan_history') || (activePlan ? [activePlan] : []);
      const userProfile = cacheStore.get('user_profile') || {};
      const userStats = cacheStore.get('user_stats') || {};
      const userRecovery = cacheStore.get('user_recovery') || {};
      const allRecoveryLogs = cacheStore.get('all_recovery_logs') || [];

      const payload = {
        version: 1,
        timestamp: Date.now(),
        activePlan,
        planHistory,
        userProfile,
        userStats,
        userRecovery,
        allRecoveryLogs,
      };

      const jsonStr = JSON.stringify(payload);
      setSyncPayloadString(jsonStr);

      // Create URL-safe compressed base64 string
      const base64Data = btoa(encodeURIComponent(jsonStr));
      const fullUrl = `${window.location.origin}/#sync=${base64Data}`;
      setSyncUrl(fullUrl);

      // Generate high-res QR code
      QRCode.toDataURL(fullUrl, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#00d2ff',
          light: '#0b1329',
        },
      }).then((url) => {
        setQrDataUrl(url);
      }).catch((err) => {
        console.warn('QR Code generation fallback:', err);
      });
    } catch (err) {
      console.error('Failed to generate sync payload:', err);
    }
  }, [isOpen, activeTab]);

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
      a.download = `BeastMode_Backup_${new Date().toISOString().split('T')[0]}.beast`;
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
        const decoded = decodeURIComponent(atob(b64));
        parsed = JSON.parse(decoded);
      } else if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        // Try base64 direct
        const decoded = decodeURIComponent(atob(trimmed));
        parsed = JSON.parse(decoded);
      }

      if (!parsed || (!parsed.activePlan && !parsed.planHistory)) {
        throw new Error(isAr ? 'بيانات المزامنة غير صالحة أو فارغة' : 'Invalid or empty sync data');
      }

      // Hydrate Cache & Storage
      if (parsed.userProfile) cacheStore.set('user_profile', parsed.userProfile);
      if (parsed.userStats) cacheStore.set('user_stats', parsed.userStats);
      if (parsed.userRecovery) cacheStore.set('user_recovery', parsed.userRecovery);
      if (parsed.allRecoveryLogs) cacheStore.set('all_recovery_logs', parsed.allRecoveryLogs);

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
                background: '#0b1329',
                padding: '16px',
                borderRadius: '20px',
                border: '2px solid rgba(0, 210, 255, 0.4)',
                boxShadow: '0 8px 30px rgba(0, 210, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Sync QR Code"
                  style={{ width: '230px', height: '230px', borderRadius: '12px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '230px', height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spin" />
                </div>
              )}
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.5px' }}>
                {isAr ? '📷 امسح الرمز بكاميرا هاتفك للفتح والمزامنة الفورية' : 'Scan with your phone camera to open and sync instantly'}
              </span>
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
