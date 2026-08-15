/**
 * Security & Input Validation Utilities
 * Prevents Type Coercion, NaN exceptions, Buffer Overflow, and LIKE Wildcard ReDoS
 */

// Validates numeric route and query parameters
export const validateNumericId = (paramValue: unknown): number | null => {
  if (paramValue === null || paramValue === undefined) return null;
  const num = parseInt(String(paramValue), 10);
  return Number.isInteger(num) && num > 0 ? num : null;
};

// Sanitizes and bounds arbitrary user string inputs
export const sanitizeString = (val: unknown, maxLen = 250, defaultVal = ''): string => {
  if (typeof val !== 'string') return defaultVal;
  return val.trim().slice(0, maxLen);
};

// Sanitizes integer inputs with min/max clamps
export const sanitizeInt = (val: unknown, defaultVal = 3, min = 1, max = 100): number => {
  if (val === null || val === undefined) return defaultVal;
  const num = parseInt(String(val), 10);
  if (isNaN(num)) return defaultVal;
  return Math.min(Math.max(num, min), max);
};

// Escapes special SQL LIKE wildcard characters (%, _, \)
export const escapeLikeQuery = (str: string): string => {
  if (!str) return '';
  return str.replace(/[%_\\]/g, '\\$&');
};
