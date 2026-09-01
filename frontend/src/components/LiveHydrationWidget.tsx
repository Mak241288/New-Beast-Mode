import React, { useState, useEffect } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { getDailyRecovery, saveDailyRecovery, type DailyRecoveryLog } from '../utils/recoveryTracker';
import { translations } from '../utils/translations';

interface LiveHydrationWidgetProps {
  lang: 'ar' | 'en';
  onOpenFullModal?: () => void;
}

export const LiveHydrationWidget: React.FC<LiveHydrationWidgetProps> = ({
  lang,
  onOpenFullModal,
}) => {
  const t = translations[lang] || translations.ar;
  const [log, setLog] = useState<DailyRecoveryLog>(() => getDailyRecovery());

  const refreshLog = () => {
    setLog(getDailyRecovery());
  };

  useEffect(() => {
    refreshLog();
    const handleStorage = () => refreshLog();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('beast_recovery_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('beast_recovery_updated', handleStorage);
    };
  }, []);

  const handleAddWater = (amountMl: number) => {
    const updated: DailyRecoveryLog = {
      ...log,
      waterMl: Math.max(0, log.waterMl + amountMl),
    };
    setLog(updated);
    saveDailyRecovery(updated);
    window.dispatchEvent(new CustomEvent('beast_recovery_updated'));
  };

  const targetMl = log.targetWaterMl || 3000;
  const currentLiters = (log.waterMl / 1000).toFixed(2);
  const targetLiters = (targetMl / 1000).toFixed(1);
  const percent = Math.min(100, Math.round((log.waterMl / targetMl) * 100));

  return (
    <div className="live-hydration-card glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onOpenFullModal ? 'pointer' : 'default' }} onClick={onOpenFullModal}>
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={18} color="#00d2ff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {t.hydrationTracker}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {t.waterGoal}: {targetLiters} L
            </span>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleAddWater(250)}
            className="quick-water-btn"
            title={t.addWater250}
          >
            <Plus size={13} />
            <span>250ml</span>
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="quick-water-btn"
            title={t.addWater500}
          >
            <Plus size={13} />
            <span>500ml</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Liter count */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: '#00d2ff' }}>{currentLiters} L / {targetLiters} L</span>
          <span style={{ color: percent >= 100 ? '#10b981' : 'var(--text-secondary)' }}>{percent}%</span>
        </div>
        <div style={{ width: '100%', height: '7px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              borderRadius: '4px',
              background: percent >= 100 ? 'linear-gradient(90deg, #00d2ff, #10b981)' : 'linear-gradient(90deg, #0077ff, #00d2ff)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(0, 210, 255, 0.5)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
