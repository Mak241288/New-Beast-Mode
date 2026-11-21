import { describe, it, expect } from 'vitest';
import { calculateBarbellPlates, parseWeightKg } from '../utils/plateCalculator';

describe('Olympic Barbell Plate Calculator', () => {
  it('parses numeric weights from Arabic, English, and decimal strings', () => {
    expect(parseWeightKg('82.5kg')).toBe(82.5);
    expect(parseWeightKg('60 كجم')).toBe(60);
    expect(parseWeightKg('Bodyweight')).toBe(0);
    expect(parseWeightKg(100)).toBe(100);
    expect(parseWeightKg(null)).toBe(0);
  });

  it('calculates exact plates per side for 100kg on a 20kg Olympic bar', () => {
    const res = calculateBarbellPlates(100, 20);
    expect(res.perSideWeightKg).toBe(40);
    expect(res.achievableWeightKg).toBe(100);
    expect(res.remainderPerSideKg).toBe(0);
    // 40kg per side = 25 + 15
    expect(res.platesPerSide.map((p) => `${p.count}x${p.weightKg}`)).toEqual(['1x25', '1x15']);
  });

  it('handles micro-increments (82.5kg) and empty bar cleanly', () => {
    const res = calculateBarbellPlates(82.5, 20);
    // 31.25 per side = 25 + 5 + 1.25
    expect(res.perSideWeightKg).toBe(31.25);
    expect(res.achievableWeightKg).toBe(82.5);
    expect(res.platesPerSide.map((p) => `${p.count}x${p.weightKg}`)).toEqual(['1x25', '1x5', '1x1.25']);

    const empty = calculateBarbellPlates(20, 20);
    expect(empty.platesPerSide).toEqual([]);
    expect(empty.achievableWeightKg).toBe(20);
  });
});
