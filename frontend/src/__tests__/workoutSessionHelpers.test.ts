import { describe, it, expect } from 'vitest';
import { formatWorkoutTime } from '../context/WorkoutSessionContext';

describe('WorkoutSession Time Formatting & Helpers', () => {
  it('formats seconds into M:SS cleanly and clamps negative/NaN values', () => {
    expect(formatWorkoutTime(0)).toBe('0:00');
    expect(formatWorkoutTime(5)).toBe('0:05');
    expect(formatWorkoutTime(65)).toBe('1:05');
    expect(formatWorkoutTime(3600)).toBe('60:00');
    expect(formatWorkoutTime(-12)).toBe('0:00');
    expect(formatWorkoutTime(Number.NaN)).toBe('0:00');
  });
});
