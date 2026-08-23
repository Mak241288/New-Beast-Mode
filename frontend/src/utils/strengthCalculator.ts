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
