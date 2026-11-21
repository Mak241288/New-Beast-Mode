import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { subscribeToasts, dismissToast, type ToastItem, type ToastType } from '../utils/toast';

const TOAST_STYLES: Record<ToastType, { border: string; bg: string; iconColor: string }> = {
  success: {
    border: 'rgba(16, 185, 129, 0.45)',
    bg: 'rgba(10, 28, 22, 0.92)',
    iconColor: '#10b981',
  },
  error: {
    border: 'rgba(239, 68, 68, 0.5)',
    bg: 'rgba(32, 12, 14, 0.94)',
    iconColor: '#f87171',
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.45)',
    bg: 'rgba(32, 24, 10, 0.94)',
    iconColor: '#f59e0b',
  },
  info: {
    border: 'rgba(0, 210, 255, 0.45)',
    bg: 'rgba(12, 24, 34, 0.94)',
    iconColor: '#00d2ff',
  },
};

const renderIcon = (type: ToastType, color: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={18} color={color} style={{ flexShrink: 0 }} />;
    case 'error':
      return <XCircle size={18} color={color} style={{ flexShrink: 0 }} />;
    case 'warning':
      return <AlertTriangle size={18} color={color} style={{ flexShrink: 0 }} />;
    default:
      return <Info size={18} color={color} style={{ flexShrink: 0 }} />;
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: 'min(92vw, 440px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((item) => {
        const theme = TOAST_STYLES[item.type];
        return (
          <div
            key={item.id}
            role={item.type === 'error' ? 'alert' : 'status'}
            className="animated-fade"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
              color: '#f8fafc',
              fontSize: '13.5px',
              fontWeight: 600,
              lineHeight: 1.45,
            }}
          >
            {renderIcon(item.type, theme.iconColor)}
            <span style={{ flex: 1, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              {item.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Close notification"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '8px',
                color: '#cbd5e1',
                cursor: 'pointer',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
