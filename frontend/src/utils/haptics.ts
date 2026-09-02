/**
 * BeastMode Haptic Feedback Vibration Engine
 * Provides subtle tactile feedback on mobile devices during gym workouts.
 * Safely falls back on unsupported devices / desktop without error.
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' | 'restEnd' | 'tick') => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'tick':
        navigator.vibrate(10);
        break;
      case 'success':
        navigator.vibrate([40, 30, 60]);
        break;
      case 'warning':
        navigator.vibrate([70, 40, 70]);
        break;
      case 'restEnd':
        navigator.vibrate([100, 50, 100, 50, 150]);
        break;
      default:
        navigator.vibrate(20);
    }
  } catch {
    // Non-fatal if blocked by device settings or user gesture requirements
  }
};
