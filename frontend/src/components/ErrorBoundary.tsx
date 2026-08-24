import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary Captured Error]:', error, errorInfo);

    // Auto-Heal for Stale Deploys / Outdated Chunk Hashes during updates:
    const errorMsg = error?.message || '';
    const isChunkLoadFailed =
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Importing a module script failed') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('CSS_CHUNK_LOAD_FAILED');

    if (isChunkLoadFailed) {
      const lastReload = sessionStorage.getItem('bm_chunk_reload_ts');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('bm_chunk_reload_ts', now.toString());
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex-center"
          style={{
            minHeight: '100vh',
            padding: '20px',
            background: 'var(--bg-primary, #0d1117)',
            color: 'var(--text-primary, #ffffff)',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '36px 28px',
              textAlign: 'center',
              borderRadius: '20px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              background: 'rgba(239, 68, 68, 0.04)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <AlertTriangle size={36} color="#ef4444" />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#ef4444' }}>
              عذراً، حدث خطأ غير متوقع في الواجهة
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #9ca3af)', marginBottom: '24px', lineHeight: '1.6' }}>
              تم التقاط التنبيه بواسطة نظام حماية الاستقرار بدون إنهيار الصفحة. يرجى إعادة تحميل الصفحة لمتابعة استخدام تطبيق BeastMode.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#fca5a5',
                  marginBottom: '24px',
                  textAlign: 'left',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="glow-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 20px',
                fontSize: '15px',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} />
              <span>إعادة تحميل الصفحة الآن</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
