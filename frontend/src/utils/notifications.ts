/**
 * BeastMode AI - Smart Workout Reminders & Web Push Utility
 */

export interface ReminderConfig {
  enabled: boolean;
  time: string; // e.g. "18:00"
  lang: 'ar' | 'en';
}

let reminderInterval: number | null = null;

/**
 * Checks if Notification API is supported by the browser.
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Returns current permission status ('granted', 'denied', 'default').
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
};

/**
 * Requests browser permission for notifications.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Notification API not supported.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission request error:', error);
    return false;
  }
};

/**
 * Dispatches an instant notification via ServiceWorker or Web Notification.
 */
export const dispatchNotification = async (
  title: string,
  body: string,
  tag = 'beastmode-alert'
): Promise<boolean> => {
  if (getNotificationPermission() !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag,
          vibrate: [200, 100, 200],
          data: { url: '/#myplan' }
        } as any);
        return true;
      }
    }

    // Fallback to standard Notification API
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag
    });
    return true;
  } catch (error) {
    console.error('[Notifications] Dispatch error:', error);
    return false;
  }
};

/**
 * Dispatches an instant test notification for user preview.
 */
export const triggerTestNotification = async (lang: 'ar' | 'en' = 'ar'): Promise<boolean> => {
  const isEn = lang === 'en';
  const title = isEn ? 'BeastMode AI — Workout Ready! 🏋️‍♂️' : 'BeastMode AI — تذكير الوحوش! 🏋️‍♂️';
  const body = isEn 
    ? 'Your daily training session is primed. Time to build strength and crush your goals!'
    : 'جدولك التدريبي جاهز اليوم! حان وقت الدخول إلى الحلبة وبناء قوتك البدنية.';

  return await dispatchNotification(title, body, 'test-reminder');
};

/**
 * Initializes background scheduler to check for reminder time matching.
 */
export const initWorkoutReminderScheduler = (config: ReminderConfig): void => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }

  if (!config.enabled || !config.time) return;

  const checkReminder = () => {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    // Check if we reached the preferred reminder time
    if (currentTime === config.time) {
      const lastSentKey = `last_reminder_${now.toDateString()}`;
      if (!localStorage.getItem(lastSentKey)) {
        triggerTestNotification(config.lang);
        localStorage.setItem(lastSentKey, 'sent');
      }
    }
  };

  // Check every 30 seconds
  reminderInterval = window.setInterval(checkReminder, 30000);
  checkReminder();
};
