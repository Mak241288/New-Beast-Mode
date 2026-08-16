export interface PlateDefinition {
  weight: number;
  color: string;
  textColor: string;
  diameter: number; // in px for visual scale
}

export const AVAILABLE_PLATES: PlateDefinition[] = [
  { weight: 25, color: '#dc2626', textColor: '#ffffff', diameter: 140 }, // Red
  { weight: 20, color: '#2563eb', textColor: '#ffffff', diameter: 135 }, // Blue
  { weight: 15, color: '#eab308', textColor: '#000000', diameter: 120 }, // Yellow
  { weight: 10, color: '#16a34a', textColor: '#ffffff', diameter: 105 }, // Green
  { weight: 5, color: '#f8fafc', textColor: '#0f172a', diameter: 90 },  // White
  { weight: 2.5, color: '#475569', textColor: '#ffffff', diameter: 75 }, // Slate/Black
  { weight: 1.25, color: '#94a3b8', textColor: '#0f172a', diameter: 60 }, // Silver
];

export interface PlateCount {
  plate: PlateDefinition;
  countPerSide: number;
  totalCount: number;
}

export interface PlateCalculationResult {
  targetWeight: number;
  barWeight: number;
  actualWeight: number;
  weightPerSide: number;
  platesPerSide: PlateCount[];
  remainder: number;
}

export function calculateBarbellPlates(
  targetTotalWeight: number,
  barWeight: number = 20,
  availablePlates: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]
): PlateCalculationResult {
  if (targetTotalWeight <= barWeight) {
    return {
      targetWeight: targetTotalWeight,
      barWeight,
      actualWeight: barWeight,
      weightPerSide: 0,
      platesPerSide: [],
      remainder: 0,
    };
  }

  let remainingPerSide = (targetTotalWeight - barWeight) / 2;
  const platesPerSide: PlateCount[] = [];

  for (const p of AVAILABLE_PLATES) {
    if (!availablePlates.includes(p.weight)) continue;
    if (remainingPerSide >= p.weight) {
      const count = Math.floor(remainingPerSide / p.weight);
      if (count > 0) {
        platesPerSide.push({
          plate: p,
          countPerSide: count,
          totalCount: count * 2,
        });
        remainingPerSide = Number((remainingPerSide - count * p.weight).toFixed(2));
      }
    }
  }

  const actualPerSide = platesPerSide.reduce(
    (sum, item) => sum + item.plate.weight * item.countPerSide,
    0
  );
  const actualWeight = Number((barWeight + actualPerSide * 2).toFixed(2));

  return {
    targetWeight: targetTotalWeight,
    barWeight,
    actualWeight,
    weightPerSide: actualPerSide,
    platesPerSide,
    remainder: Number((targetTotalWeight - actualWeight).toFixed(2)),
  };
}

export interface OneRepMaxResult {
  inputWeight: number;
  inputReps: number;
  estimated1RM: number;
  epley: number;
  brzycki: number;
  lombardi: number;
  percentages: {
    percent: number;
    weight: number;
    estimatedReps: number;
    trainingZone_en: string;
    trainingZone_ar: string;
  }[];
}

export function calculate1RM(weight: number, reps: number): OneRepMaxResult {
  const w = Math.max(1, weight);
  const r = Math.max(1, Math.min(30, reps));

  if (r === 1) {
    const percentages = buildPercentageTable(w);
    return {
      inputWeight: w,
      inputReps: 1,
      estimated1RM: w,
      epley: w,
      brzycki: w,
      lombardi: w,
      percentages,
    };
  }

  const epley = Math.round(w * (1 + r / 30));
  const brzycki = Math.round(w * (36 / (37 - r)));
  const lombardi = Math.round(w * Math.pow(r, 0.1));

  const estimated1RM = Math.round((epley + brzycki + lombardi) / 3);
  const percentages = buildPercentageTable(estimated1RM);

  return {
    inputWeight: w,
    inputReps: r,
    estimated1RM,
    epley,
    brzycki,
    lombardi,
    percentages,
  };
}

function buildPercentageTable(oneRepMax: number) {
  const table = [
    { percent: 100, estimatedReps: 1, trainingZone_en: 'Maximal Strength / 1RM', trainingZone_ar: 'القوة القصوى (1RM)' },
    { percent: 95, estimatedReps: 2, trainingZone_en: 'Peak Neural Load', trainingZone_ar: 'تحفيز عصبي عالي' },
    { percent: 90, estimatedReps: 3, trainingZone_en: 'Heavy Strength', trainingZone_ar: 'قوة بدنية ثقيلة' },
    { percent: 85, estimatedReps: 5, trainingZone_en: 'Powerbuilding Working Set', trainingZone_ar: 'جولات البناء والقوة' },
    { percent: 80, estimatedReps: 8, trainingZone_en: 'Optimal Hypertrophy Zone', trainingZone_ar: 'نطاق التضخيم المثالي' },
    { percent: 75, estimatedReps: 10, trainingZone_en: 'Volume Hypertrophy', trainingZone_ar: 'تضخيم عضلي بالحجم' },
    { percent: 70, estimatedReps: 12, trainingZone_en: 'Muscle Endurance & Pump', trainingZone_ar: 'تحمل عضلي وضخ دم' },
    { percent: 65, estimatedReps: 15, trainingZone_en: 'Metabolic Conditioning', trainingZone_ar: 'تحمل وهوائي عالي' },
    { percent: 60, estimatedReps: 20, trainingZone_en: 'Warm-up / Burnout', trainingZone_ar: 'إحماء وجولات حرق' },
  ];

  return table.map((item) => ({
    ...item,
    weight: Math.round((oneRepMax * item.percent) / 100 * 2) / 2, // round to nearest 0.5kg
  }));
}
