import React, { useState, useEffect } from 'react';
import { X, Droplets, Moon, Award, Plus, RotateCcw, Star, CheckCircle2, Heart } from 'lucide-react';
import { getDailyRecovery, saveDailyRecovery, computeBadges, type DailyRecoveryLog, type Badge } from '../utils/recoveryTracker';

interface RecoveryTrackerModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  globalStreak: number;
  totalWorkouts: number;
  defaultWaterTargetLiters?: number;
  onClose: () => void;
  onLogUpdated?: (log: DailyRecoveryLog) => void;
}

export const RecoveryTrackerModal: React.FC<RecoveryTrackerModalProps> = ({
  isOpen,
  lang,
  globalStreak,
  totalWorkouts,
  defaultWaterTargetLiters = 3.0,
  onClose,
  onLogUpdated,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'water' | 'sleep' | 'badges'>('water');
  const [log, setLog] = useState<DailyRecoveryLog>(() => getDailyRecovery(undefined, defaultWaterTargetLiters));
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLog(getDailyRecovery(undefined, defaultWaterTargetLiters));
    }
  }, [isOpen, defaultWaterTargetLiters]);

  if (!isOpen) return null;

  const handleAddWater = (amountMl: number) => {
    const updated: DailyRecoveryLog = {
      ...log,
      waterMl: Math.max(0, log.waterMl + amountMl),
    };
    setLog(updated);
    saveDailyRecovery(updated);
    if (onLogUpdated) onLogUpdated(updated);
  };

  const handleResetWater = () => {
    const updated: DailyRecoveryLog = {
      ...log,
      waterMl: 0,
    };
    setLog(updated);
    saveDailyRecovery(updated);
    if (onLogUpdated) onLogUpdated(updated);
  };

  const handleSaveSleep = (hours: number, quality: number) => {
    const updated: DailyRecoveryLog = {
      ...log,
      sleepHours: hours,
      sleepQuality: quality,
    };
    setLog(updated);
    saveDailyRecovery(updated);
    if (onLogUpdated) onLogUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const waterPercent = Math.min(100, Math.round((log.waterMl / (log.targetWaterMl || 3000)) * 100));
  const badges: Badge[] = computeBadges(globalStreak, totalWorkouts, log);
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel animated-fade"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #111827)',
          color: 'var(--text-primary)',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '20px 26px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                color: 'var(--secondary)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <Heart size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>
                {isEn ? 'Recovery & Gamification Hub 💧' : 'مركز الاستشفاء والشارات والترطيب 💧'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isEn
                  ? 'Track hydration, sleep quality, and unlock motivational streak badges'
                  : 'متتبع شرب الماء وجودة النوم وسجل أوسمة الاستمرارية والإنجاز'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div
          style={{
            padding: '12px 26px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('water')}
              className={activeTab === 'water' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Droplets size={15} />
              <span>{isEn ? 'Hydration Tracker' : 'شرب الماء 💧'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sleep')}
              className={activeTab === 'sleep' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Moon size={15} />
              <span>{isEn ? 'Sleep & Recovery' : 'ساعات النوم 🌙'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={activeTab === 'badges' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Award size={15} />
              <span>{isEn ? `Badges (${unlockedCount}/${badges.length})` : `الشارات (${unlockedCount}/${badges.length}) 🏅`}</span>
            </button>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            📅 {new Date().toLocaleDateString(isEn ? 'en-US' : 'ar-EG')}
          </span>
        </div>

        {/* BODY */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: WATER TRACKER */}
          {activeTab === 'water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              
              {/* Main Gauge */}
              <div
                className="glass-panel"
                style={{
                  width: '100%',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08), rgba(0,0,0,0.3))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>
                  💧 {isEn ? "Today's Water Intake" : 'مستوى ترطيب العضلات اليوم'}
                </div>

                <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--secondary)', letterSpacing: '-1px' }}>
                  {(log.waterMl / 1000).toFixed(2)}{' '}
                  <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    / {(log.targetWaterMl / 1000).toFixed(1)} L
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '450px',
                    height: '14px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <div
                    style={{
                      width: `${waterPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                      borderRadius: '10px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {waterPercent >= 100 ? (
                    <span style={{ color: 'var(--primary)', fontWeight: '800' }}>
                      🎉 {isEn ? 'Daily Hydration Goal Completed!' : 'أحسنت! تم تحقيق هدف الترطيب اليومي بالكامل!'}
                    </span>
                  ) : (
                    <span>
                      {isEn ? `${waterPercent}% of target achieved` : `تم تحقيق ${waterPercent}% من الهدف اليومي`}
                    </span>
                  )}
                </div>
              </div>

              {/* QUICK ADD BUTTONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  {isEn ? 'Quick Log Water (+ml):' : 'إضافة سريعة لشرب الماء بنقرة زر:'}
                </span>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleAddWater(250)}
                    className="glow-btn"
                    style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>+250 ml (كوب 🥛)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddWater(500)}
                    className="glow-btn"
                    style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>+500 ml (زجاجة صغيرة 🧴)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddWater(1000)}
                    className="glow-btn"
                    style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>+1.0 L (قارورة لتر 💧)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetWater}
                    className="secondary-btn"
                    style={{ padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
                    title={isEn ? 'Reset Counter' : 'تصفير العداد'}
                  >
                    <RotateCcw size={14} />
                    <span>{isEn ? 'Reset' : 'تصفير'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SLEEP & RECOVERY */}
          {activeTab === 'sleep' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              <div
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {/* Sleep Hours Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '800' }}>
                      🌙 {isEn ? 'Sleep Duration (Hours):' : 'عدد ساعات النوم اليومية:'}
                    </label>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)' }}>
                      {log.sleepHours} {isEn ? 'Hours' : 'ساعات'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="0.5"
                    value={log.sleepHours}
                    onChange={(e) => handleSaveSleep(parseFloat(e.target.value), log.sleepQuality)}
                    style={{ width: '100%', accentColor: 'var(--secondary)', cursor: 'pointer' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>4h (منخفض جداً)</span>
                    <span>7.5h - 8.5h (المثالي للبناء العضلي)</span>
                    <span>12h (استشفاء طويل)</span>
                  </div>
                </div>

                {/* Sleep Quality Stars */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '800', display: 'block', marginBottom: '10px' }}>
                    ⭐ {isEn ? 'Sleep & Recovery Quality:' : 'تقييم جودة النوم والراحة:'}
                  </label>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSaveSleep(log.sleepHours, star)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          border: log.sleepQuality >= star ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                          background: log.sleepQuality >= star ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                          color: log.sleepQuality >= star ? '#f59e0b' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '800',
                          fontSize: '13px',
                        }}
                      >
                        <Star size={16} fill={log.sleepQuality >= star ? '#f59e0b' : 'transparent'} />
                        <span>{star}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {savedSuccess && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} />
                    <span>{isEn ? 'Recovery log saved successfully!' : 'تم حفظ بيانات الاستشفاء بنجاح!'}</span>
                  </div>
                )}
              </div>

              {/* Recovery Guidance Tip */}
              <div
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  background: 'rgba(16, 185, 129, 0.03)',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                💡 <strong>{isEn ? 'Scientific Insight:' : 'فائدة علمية:'}</strong>{' '}
                {isEn
                  ? '70% of human growth hormone (HGH) is secreted during deep REM slow-wave sleep. Proper sleep accelerates muscle protein synthesis and nervous system replenishment.'
                  : 'تُفرز 70% من هرمونات النمو (HGH) أثناء مراحل النوم العميق. النوم الكافي يسرع استشفاء الجهاز العصبي المركزي ويعزز تضخيم العضلات.'}
              </div>

            </div>
          )}

          {/* TAB 3: BADGES & ACHIEVEMENTS */}
          {activeTab === 'badges' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {isEn
                  ? 'Unlock achievement medals by maintaining your workout streak and staying consistent:'
                  : 'اجمع الأوسمة وحقق الشارات من خلال الاستمرار في التمرين والالتزام اليومي:'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="glass-panel"
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: badge.isUnlocked ? '2px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.06)',
                      background: badge.isUnlocked ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent)' : 'rgba(255,255,255,0.01)',
                      opacity: badge.isUnlocked ? 1 : 0.45,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '32px',
                        padding: '8px',
                        borderRadius: '12px',
                        background: badge.isUnlocked ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {badge.icon}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '14.5px', fontWeight: '800', margin: 0, color: badge.isUnlocked ? '#f59e0b' : 'inherit' }}>
                          {isEn ? badge.name_en : badge.name_ar}
                        </h4>
                        {badge.isUnlocked && (
                          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>
                            ✓ {isEn ? 'Unlocked' : 'مكتمل'}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                        {isEn ? badge.desc_en : badge.desc_ar}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
