/**
 * Strict URL Protocol & Domain Validator to prevent DOM-based XSS
 * (blocks javascript:, data:, vbscript:, and untrusted origins).
 */
export const sanitizeSafeUrl = (
  rawUrl?: string,
  fallback = 'https://musclewiki.com',
  allowedHostnames?: string[]
): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return fallback;
    }
    if (allowedHostnames && allowedHostnames.length > 0) {
      const host = parsed.hostname.toLowerCase();
      const isAllowed = allowedHostnames.some((h) => host === h || host.endsWith('.' + h));
      if (!isAllowed) return fallback;
    }
    return parsed.href;
  } catch {
    return fallback;
  }
};
