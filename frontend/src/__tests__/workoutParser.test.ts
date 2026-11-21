import { describe, it, expect } from 'vitest';
import { parseExerciseLine, parseBulkWorkoutText } from '../utils/workoutParser';

describe('Workout Text Parser (AR/EN)', () => {
  it('parses pipe-delimited Arabic and English exercise lines accurately', () => {
    const ar = parseExerciseLine('- بنش برس بالبار | 4 | 10-12 | صدر', 0);
    expect(ar).not.toBeNull();
    expect(ar?.name).toContain('بنش برس بالبار');
    expect(ar?.sets).toBe(4);
    expect(ar?.reps).toBe('10-12');

    const en = parseExerciseLine('1. Barbell Squat | 5 | 5 | Quads', 1);
    expect(en).not.toBeNull();
    expect(en?.name).toBe('Barbell Squat');
    expect(en?.sets).toBe(5);
    expect(en?.reps).toBe('5');
  });

  it('ignores comments and empty lines', () => {
    expect(parseExerciseLine('', 0)).toBeNull();
    expect(parseExerciseLine('# comment line', 0)).toBeNull();
    expect(parseExerciseLine('// another comment', 0)).toBeNull();
  });

  it('parses a multi-day bilingual workout plan including rest days', () => {
    const raw = `
Day 1: Push Day
- Bench Press | 4 | 8-10 | Chest
- Overhead Press | 3 | 10-12 | Shoulders

Day 2: Rest Day
Rest
    `;
    const parsed = parseBulkWorkoutText(raw, 'en');
    expect(parsed.dayWorkouts.length).toBeGreaterThanOrEqual(2);
    expect(parsed.dayWorkouts[0].exercises.length).toBe(2);
    expect(parsed.dayWorkouts[1].isRestDay).toBe(true);
  });
});
