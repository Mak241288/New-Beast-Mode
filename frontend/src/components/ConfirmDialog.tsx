import React, { useEffect, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import {
  subscribeConfirmDialog,
  resolveConfirmDialog,
  type ConfirmRequest,
} from '../utils/confirmDialog';

export const ConfirmDialog: React.FC = () => {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    return subscribeConfirmDialog(setRequest);
  }, []);

  useEffect(() => {
    if (!request) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolveConfirmDialog(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [request]);

  if (!request) return null;

  const accentColor = request.danger ? '#ef4444' : 'var(--primary)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bm-confirm-title"
      onClick={() => resolveConfirmDialog(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 16, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel animated-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 420px)',
          padding: '24px',
          borderRadius: '20px',
          border: `1px solid ${request.danger ? 'rgba(239, 68, 68, 0.45)' : 'var(--border-color)'}`,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: request.danger ? 'rgba(239, 68, 68, 0.14)' : 'rgba(0, 210, 255, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {request.danger ? (
              <AlertTriangle size={20} color={accentColor} />
            ) : (
              <HelpCircle size={20} color={accentColor} />
            )}
          </div>
          <h3 id="bm-confirm-title" style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {request.title}
          </h3>
        </div>

        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
          {request.message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => resolveConfirmDialog(false)}
            style={{ padding: '10px 18px', fontSize: '13.5px', fontWeight: 700, borderRadius: '10px' }}
          >
            {request.cancelLabel}
          </button>
          <button
            type="button"
            className={request.danger ? 'secondary-btn' : 'glow-btn'}
            onClick={() => resolveConfirmDialog(true)}
            style={{
              padding: '10px 20px',
              fontSize: '13.5px',
              fontWeight: 800,
              borderRadius: '10px',
              ...(request.danger
                ? { background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }
                : {}),
            }}
          >
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
