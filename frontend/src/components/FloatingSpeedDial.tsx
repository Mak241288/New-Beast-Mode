import React, { useState } from 'react';
import { Plus, Droplets, Scale, Timer, X, Check } from 'lucide-react';
import { api } from '../services/api';

interface FloatingSpeedDialProps {
  lang: 'ar' | 'en';
}

export const FloatingSpeedDial: React.FC<FloatingSpeedDialProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [quickWeight, setQuickWeight] = useState('');
  const isEn = lang === 'en';

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleQuickWater = () => {
    // Dispatch water logged event or save local water intake
    const current = Number(localStorage.getItem('beast_water_today') || '0') + 250;
    localStorage.setItem('beast_water_today', String(current));
    window.dispatchEvent(new CustomEvent('beast_water_updated', { detail: { current } }));
    showNotification(isEn ? '💧 +250ml Water logged!' : '💧 تم تسجيل +250 مل ماء!');
    setIsOpen(false);
  };

  const handleQuickWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(quickWeight);
    if (!w || isNaN(w)) return;

    try {
      await api.updateProfile({ currentWeight: w });
      showNotification(isEn ? `⚖️ Weight ${w}kg logged!` : `⚖️ تم تسجيل الوزن ${w} كجم!`);
      setShowWeightInput(false);
      setQuickWeight('');
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    } catch {
      showNotification(isEn ? 'Failed to log weight' : 'فشل تسجيل الوزن');
    }
  };

  return (
    <>
      {/* Quick Action FAB Button */}
      <div className="speed-dial-fab">
        {/* Expanded Options */}
        {isOpen && (
          <div
            className="animated-fade"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '12px',
              alignItems: 'flex-start',
            }}
          >
            {/* Quick Water Button */}
            <button
              onClick={handleQuickWater}
              className="glass-panel-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <Droplets size={15} />
              <span>{isEn ? '+250ml Water 💧' : 'تسجيل ماء +250مل 💧'}</span>
            </button>

            {/* Quick Weight Button */}
            <button
              onClick={() => setShowWeightInput(true)}
              className="glass-panel-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <Scale size={15} />
              <span>{isEn ? 'Log Weight ⚖️' : 'تسجيل الوزن ⚖️'}</span>
            </button>

            {/* Quick 60s Rest Trigger */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('beast_start_rest_timer', { detail: { seconds: 60 } }));
                showNotification(isEn ? '⏱️ 60s Rest timer started!' : '⏱️ بدأ مؤقت راحة 60 ثانية!');
                setIsOpen(false);
              }}
              className="glass-panel-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(204, 255, 0, 0.15)',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <Timer size={15} />
              <span>{isEn ? '60s Rest Timer ⏱️' : 'مؤقت راحة 60 ثانية ⏱️'}</span>
            </button>
          </div>
        )}

        {/* FAB Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glow-btn"
          title={isEn ? 'Quick Speed-Dial' : 'قائمة الإجراءات السريعة'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            padding: 0,
            justifyContent: 'center',
            boxShadow: '0 8px 30px var(--primary-glow)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          {isOpen ? <X size={20} /> : <Plus size={22} />}
        </button>
      </div>

      {/* Quick Weight Input Modal */}
      {showWeightInput && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowWeightInput(false)}
        >
          <form
            onSubmit={handleQuickWeightSubmit}
            className="glass-panel animated-fade"
            style={{
              padding: '24px',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '340px',
              background: 'rgba(16, 22, 38, 0.98)',
              border: '1px solid #f59e0b',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#fff' }}>
                {isEn ? 'Quick Weight Log ⚖️' : 'تسجيل الوزن اليومي ⚖️'}
              </h3>
            </div>

            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder={isEn ? 'e.g. 78.5 kg' : 'مثال: 78.5 كجم'}
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              className="input-field num-display"
              autoFocus
              style={{ fontSize: '18px', textAlign: 'center', fontWeight: '800' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowWeightInput(false)}
                className="secondary-btn"
                style={{ flex: 1, justifyContent: 'center', borderRadius: '10px' }}
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                type="submit"
                disabled={!quickWeight}
                className="glow-btn"
                style={{ flex: 1, justifyContent: 'center', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Check size={15} />
                <span>{isEn ? 'Save' : 'حفظ'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Speed Dial Toast Notification */}
      {toast && (
        <div
          className="glass-panel animated-fade"
          style={{
            position: 'fixed',
            bottom: '150px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid var(--primary)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px var(--primary-glow)',
            zIndex: 100000,
            fontSize: '12.5px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
};
