import { describe, it, expect } from 'vitest';
import { sanitizeSafeUrl } from '../utils/urlSanitizer';

describe('sanitizeSafeUrl (DOM XSS & Open Redirect Protection)', () => {
  it('blocks javascript:, data:, vbscript:, and insecure http: protocols', () => {
    const fb = 'https://musclewiki.com';
    expect(sanitizeSafeUrl('javascript:alert(1)', fb)).toBe(fb);
    expect(sanitizeSafeUrl('JAVASCRIPT:void(0)', fb)).toBe(fb);
    expect(sanitizeSafeUrl('data:text/html,<script>alert(1)</script>', fb)).toBe(fb);
    expect(sanitizeSafeUrl('vbscript:msgbox(1)', fb)).toBe(fb);
    expect(sanitizeSafeUrl('http://musclewiki.com/chest', fb)).toBe(fb);
  });

  it('allows valid https URLs and enforces hostname allowlists strictly', () => {
    const fb = 'https://musclewiki.com';
    expect(sanitizeSafeUrl('https://musclewiki.com/exercises/chest', fb, ['musclewiki.com'])).toBe(
      'https://musclewiki.com/exercises/chest'
    );
    expect(sanitizeSafeUrl('https://cdn.musclewiki.com/video.mp4', fb, ['musclewiki.com'])).toBe(
      'https://cdn.musclewiki.com/video.mp4'
    );
    // Spoofed domain must be rejected
    expect(sanitizeSafeUrl('https://evil-musclewiki.com/phish', fb, ['musclewiki.com'])).toBe(fb);
    expect(sanitizeSafeUrl('https://musclewiki.com.attacker.io/phish', fb, ['musclewiki.com'])).toBe(fb);
  });

  it('returns fallback on malformed or empty inputs', () => {
    const fb = 'https://musclewiki.com';
    expect(sanitizeSafeUrl(undefined, fb)).toBe(fb);
    expect(sanitizeSafeUrl('', fb)).toBe(fb);
    expect(sanitizeSafeUrl('not-a-valid-url', fb)).toBe(fb);
  });
});
