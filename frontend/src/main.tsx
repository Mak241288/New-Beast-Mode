import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { WorkoutSessionProvider } from './context/WorkoutSessionContext.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { ConfirmDialog } from './components/ConfirmDialog.tsx';
import { toast } from './utils/toast.ts';
import { registerAutoUpdateServiceWorker } from './utils/pwaUpdate.ts';

// Lazy-load Sentry after initial paint so the 270KB telemetry bundle never blocks FCP/LCP
const initDeferredSentry = () => {
  import('@sentry/react')
    .then((Sentry) => {
      Sentry.init({
        dsn: 'https://d86e72394ab3886fccdeb4ec8631e6c7@o4511979386044416.ingest.us.sentry.io/4511979386306560',
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
        tracePropagationTargets: [],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      (window as unknown as { triggerSentryTest?: () => void }).triggerSentryTest = () => {
        Sentry.captureMessage('🦍 BeastMode Frontend Sentry Test: Successfully Connected!', 'info');
        toast.success('تم إرسال حدث اختبار بنجاح إلى لوحة تحكم Sentry!');
      };
    })
    .catch(() => {
      // Non-fatal if telemetry chunk is blocked by adblockers
    });
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(
      initDeferredSentry,
      { timeout: 3000 }
    );
  } else {
    setTimeout(initDeferredSentry, 1500);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <WorkoutSessionProvider>
        <App />
        <ToastContainer />
        <ConfirmDialog />
      </WorkoutSessionProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Register PWA Service Worker with Auto-Update & Zero-Stale Cache
registerAutoUpdateServiceWorker();
