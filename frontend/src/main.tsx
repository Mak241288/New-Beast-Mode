import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

import { WorkoutSessionProvider } from './context/WorkoutSessionContext.tsx'
import { registerAutoUpdateServiceWorker } from './utils/pwaUpdate.ts'

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

