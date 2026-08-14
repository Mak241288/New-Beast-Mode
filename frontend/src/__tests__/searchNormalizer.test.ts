import { describe, it, expect } from 'vitest';
import { normalizeSearchText, getExerciseAliases } from '../utils/searchNormalizer';

describe('searchNormalizer Utilities', () => {
  it('should normalize Arabic text correctly (strip diacritics, unify alef & taa marbouta)', () => {
    expect(normalizeSearchText('أَحْمَدُ')).toBe('احمد');
    expect(normalizeSearchText('سكواتْ')).toBe('سكوات');
    expect(normalizeSearchText('عُقْلَةٌ')).toBe('عقله');
    expect(normalizeSearchText('إِكْسْتِنْشِنْ')).toBe('اكستنشن');
  });

  it('should normalize English text to lowercase', () => {
    expect(normalizeSearchText('SQUAT')).toBe('squat');
    expect(normalizeSearchText('Bench Press')).toBe('bench press');
  });

  it('should return enriched phonetic aliases for exercise terms', () => {
    const aliases = getExerciseAliases('Barbell Squat', 'سكوات باربل', 'Quadriceps');
    expect(aliases).toContain('skwat');
    expect(aliases).toContain('سقوات');
    expect(aliases).toContain('Quadriceps');
  });
});
