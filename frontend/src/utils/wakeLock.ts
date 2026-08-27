/**
 * BeastMode Screen Wake Lock Manager
 * Prevents screen auto-lock during active gym sessions on supported mobile & desktop devices.
 * Gracefully falls back to no-op on unsupported browsers/environments without throwing errors.
 */

class ScreenWakeLockManager {
  private sentinel: any = null;
  private isActiveSession: boolean = false;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      this.isSupported = 'wakeLock' in navigator;

      // Auto re-acquire wake lock if athlete switches back to the tab while session is still active
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.isActiveSession) {
            this.requestLock();
          }
        });
      }
    }
  }

  /**
   * Request screen wake lock
   */
  public async requestLock(): Promise<boolean> {
    this.isActiveSession = true;
    if (!this.isSupported) return false;

    try {
      if (!this.sentinel || this.sentinel.released) {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        if (this.sentinel) {
          this.sentinel.addEventListener('release', () => {
            this.sentinel = null;
          });
        }
      }
      return true;
    } catch {
      // Permission denied or low battery saver mode — non-fatal
      return false;
    }
  }

  /**
   * Release screen wake lock
   */
  public async releaseLock(): Promise<void> {
    this.isActiveSession = false;
    if (!this.isSupported || !this.sentinel) return;

    try {
      await this.sentinel.release();
      this.sentinel = null;
    } catch {
      // Non-fatal
    }
  }
}

export const wakeLockManager = new ScreenWakeLockManager();
