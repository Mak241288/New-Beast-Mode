import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

import { WorkoutSessionProvider } from './context/WorkoutSessionContext.tsx'
import { registerAutoUpdateServiceWorker } from './utils/pwaUpdate.ts'

Sentry.init({
  dsn: "https://d86e72394ab3886fccdeb4ec8631e6c7@o4511979386044416.ingest.us.sentry.io/4511979386306560",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Expose a helper to easily test Sentry from browser console
(window as any).triggerSentryTest = () => {
  Sentry.captureMessage('🦍 BeastMode Frontend Sentry Test: Successfully Connected!', 'info');
  console.log('✅ Sentry test message sent to your dashboard!');
  alert('تم إرسال حدث اختبار بنجاح إلى لوحة تحكم Sentry!');
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <WorkoutSessionProvider>
        <App />
      </WorkoutSessionProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Register PWA Service Worker with Auto-Update & Zero-Stale Cache
registerAutoUpdateServiceWorker();

