import React from 'react';
import type { AppLang, WorkoutPlan } from '../../types/domain';

interface PlanHistoryModalProps {
  lang: AppLang;
  historyLoading: boolean;
  historyList: WorkoutPlan[];
  title: string;
  loadingLabel: string;
  weeksLabel: string;
  cancelLabel: string;
  onActivatePlan: (planId: string | number) => void;
  onClose: () => void;
}

export const PlanHistoryModal: React.FC<PlanHistoryModalProps> = ({
  lang,
  historyLoading,
  historyList,
  title,
  loadingLabel,
  weeksLabel,
  cancelLabel,
  onActivatePlan,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 16, 0.9)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animated-fade"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '24px',
          border: '1px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{title}</h3>

        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>{loadingLabel}</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
            {historyList.map((hPlan) => (
              <div
                key={hPlan.id}
                style={{
                  padding: '15px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{hPlan.title}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    📅 {new Date(hPlan.startDate || Date.now()).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')} ({hPlan.durationWeeks || 4} {weeksLabel})
                  </p>
                </div>
                {hPlan.active ? (
                  <span className="badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '11px' }}>
                    {lang === 'en' ? 'Active' : 'نشط'}
                  </span>
                ) : (
                  <button
                    onClick={() => onActivatePlan(hPlan.id)}
                    className="secondary-btn"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {lang === 'en' ? 'Activate' : 'تفعيل'}
                  </button>
                )}
              </div>
            ))}

            {historyList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                {lang === 'en' ? 'No plan history found.' : 'لا يوجد سجل برامج سابقة.'}
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="secondary-btn" style={{ justifyContent: 'center' }}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
};
