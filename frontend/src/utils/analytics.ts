/**
 * BeastMode Telemetry & User Behavior Analytics
 * Handles custom event tracking for PostHog / Vercel Analytics / Telemetry
 */

export type AnalyticsEventName =
  | 'workout_started'
  | 'exercise_completed'
  | 'workout_finished'
  | 'muscle_selected_bodymap'
  | 'exercise_searched';

export interface AnalyticsEventProps {
  [key: string]: any;
}

export const trackEvent = (eventName: AnalyticsEventName, properties?: AnalyticsEventProps): void => {
  const timestamp = new Date().toISOString();

  // Console Telemetry logger
  console.log(`[Analytics 📊] Event: ${eventName}`, {
    timestamp,
    ...properties,
  });

  // PostHog / Vercel Analytics Hook integration if window.posthog or va exists
  if (typeof window !== 'undefined') {
    if ((window as any).posthog && typeof (window as any).posthog.capture === 'function') {
      (window as any).posthog.capture(eventName, properties);
    }
    if ((window as any).va && typeof (window as any).va.track === 'function') {
      (window as any).va.track(eventName, properties);
    }
  }
};
