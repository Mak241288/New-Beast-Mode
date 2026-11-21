export interface PlateSpec {
  weightKg: number;
  label: string;
  color: string;
  textColor: string;
  heightPx: number;
}

export interface PlateCalculationResult {
  targetWeightKg: number;
  barWeightKg: number;
  achievableWeightKg: number;
  perSideWeightKg: number;
  platesPerSide: Array<PlateSpec & { count: number }>;
  remainderPerSideKg: number;
}

export const OLYMPIC_PLATES: PlateSpec[] = [
  { weightKg: 25, label: '25', color: '#ef4444', textColor: '#ffffff', heightPx: 54 },
  { weightKg: 20, label: '20', color: '#2563eb', textColor: '#ffffff', heightPx: 52 },
  { weightKg: 15, label: '15', color: '#eab308', textColor: '#0f172a', heightPx: 46 },
  { weightKg: 10, label: '10', color: '#16a34a', textColor: '#ffffff', heightPx: 40 },
  { weightKg: 5, label: '5', color: '#f8fafc', textColor: '#0f172a', heightPx: 34 },
  { weightKg: 2.5, label: '2.5', color: '#334155', textColor: '#ffffff', heightPx: 28 },
  { weightKg: 1.25, label: '1.25', color: '#94a3b8', textColor: '#0f172a', heightPx: 24 },
];

export const BAR_OPTIONS = [
  { weightKg: 20, labelAr: 'بار أولمبي 20 كجم', labelEn: 'Olympic Bar 20kg' },
  { weightKg: 15, labelAr: 'بار نسائي/تكنيك 15 كجم', labelEn: "Women's Bar 15kg" },
  { weightKg: 10, labelAr: 'بار زكزاك 10 كجم', labelEn: 'EZ Curl Bar 10kg' },
];

/**
 * Parses a weight string like "82.5kg", "80 كجم", or "Bodyweight" into a numeric kg value.
 */
export function parseWeightKg(raw?: string | number | null): number {
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? raw : 0;
  if (!raw) return 0;
  const match = String(raw).replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  return Number.isFinite(val) && val > 0 ? val : 0;
}

/**
 * Computes the exact Olympic barbell plate stack per side using a greedy decomposition.
 */
export function calculateBarbellPlates(
  targetWeightKg: number,
  barWeightKg = 20
): PlateCalculationResult {
  const safeBar = Math.max(0, barWeightKg);
  const safeTarget = Math.max(0, targetWeightKg);

  if (safeTarget <= safeBar) {
    return {
      targetWeightKg: safeTarget,
      barWeightKg: safeBar,
      achievableWeightKg: safeBar,
      perSideWeightKg: 0,
      platesPerSide: [],
      remainderPerSideKg: 0,
    };
  }

  let remainingPerSide = (safeTarget - safeBar) / 2;
  const platesPerSide: Array<PlateSpec & { count: number }> = [];

  for (const plate of OLYMPIC_PLATES) {
    const count = Math.floor((remainingPerSide + 1e-6) / plate.weightKg);
    if (count > 0) {
      platesPerSide.push({ ...plate, count });
      remainingPerSide = Math.max(0, Number((remainingPerSide - count * plate.weightKg).toFixed(3)));
    }
  }

  const loadedPerSide = platesPerSide.reduce((sum, p) => sum + p.weightKg * p.count, 0);
  const achievableWeightKg = Number((safeBar + loadedPerSide * 2).toFixed(2));

  return {
    targetWeightKg: safeTarget,
    barWeightKg: safeBar,
    achievableWeightKg,
    perSideWeightKg: Number(loadedPerSide.toFixed(2)),
    platesPerSide,
    remainderPerSideKg: Number(remainingPerSide.toFixed(2)),
  };
}
