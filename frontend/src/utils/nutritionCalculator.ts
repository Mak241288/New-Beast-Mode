export interface NutritionProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  fitnessGoal: 'HYPERTROPHY' | 'LOSE_WEIGHT' | 'STRENGTH' | 'ENDURANCE' | 'MAINTENANCE' | string;
  daysPerWeek: number;
  proteinPerKg?: number; // default 2.0 - 2.2 g/kg
}

export interface MacroDayPlan {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  proteinCalories: number;
  carbsCalories: number;
  fatsCalories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatsPercent: number;
}

export interface MealDistribution {
  name_en: string;
  name_ar: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  time_en: string;
  time_ar: string;
  tips_en: string;
  tips_ar: string;
}

export interface FoodSource {
  category_en: string;
  category_ar: string;
  items: {
    name_en: string;
    name_ar: string;
    portion_en: string;
    portion_ar: string;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }[];
}

export interface NutritionResult {
  bmr: number;
  tdee: number;
  targetDailyCalories: number;
  workoutDay: MacroDayPlan;
  restDay: MacroDayPlan;
  waterIntakeLiters: number;
  meals: MealDistribution[];
  foodSources: FoodSource[];
}

export function calculateNutrition(profile: NutritionProfile): NutritionResult {
  const { weightKg, heightCm, age, gender, fitnessGoal, daysPerWeek, proteinPerKg = 2.0 } = profile;

  // 1. Calculate BMR (Mifflin-St Jeor)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  bmr = Math.round(bmr);

  // 2. Activity Multiplier based on daysPerWeek
  let activityMultiplier = 1.2;
  if (daysPerWeek >= 5) activityMultiplier = 1.6;
  else if (daysPerWeek >= 4) activityMultiplier = 1.5;
  else if (daysPerWeek >= 3) activityMultiplier = 1.375;
  else if (daysPerWeek >= 1) activityMultiplier = 1.275;

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Goal Adjustment
  let goalMultiplier = 1.0;
  const g = (fitnessGoal || '').toUpperCase();
  if (g.includes('HYPERTROPHY') || g.includes('BULK') || g.includes('MUSCLE')) {
    goalMultiplier = 1.12; // +12% surplus
  } else if (g.includes('LOSE') || g.includes('CUT') || g.includes('FAT')) {
    goalMultiplier = 0.80; // -20% deficit
  } else if (g.includes('STRENGTH')) {
    goalMultiplier = 1.08; // +8% surplus
  } else if (g.includes('ENDURANCE')) {
    goalMultiplier = 1.05;
  } else {
    goalMultiplier = 1.0; // maintenance
  }

  const targetDailyCalories = Math.round(tdee * goalMultiplier);

  // 4. Workout Day vs Rest Day Calorie Cycling (+8% on workout, -8% on rest)
  const workoutCalories = Math.round(targetDailyCalories * 1.06);
  const restCalories = Math.round(targetDailyCalories * 0.94);

  // Protein is kept stable around target (2.0 - 2.2 g/kg)
  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinCals = proteinG * 4;

  // WORKOUT DAY MACROS: Higher Carbs (for glycogen replenishing and performance), Moderate Fats
  const workoutRemainingCals = Math.max(0, workoutCalories - proteinCals);
  const workoutFatsCals = Math.round(workoutCalories * 0.22); // 22% fats
  const workoutFatsG = Math.round(workoutFatsCals / 9);
  const workoutCarbsCals = Math.max(0, workoutRemainingCals - workoutFatsCals);
  const workoutCarbsG = Math.round(workoutCarbsCals / 4);

  const workoutDay: MacroDayPlan = {
    calories: workoutCalories,
    proteinGrams: proteinG,
    carbsGrams: workoutCarbsG,
    fatsGrams: workoutFatsG,
    proteinCalories: proteinCals,
    carbsCalories: workoutCarbsCals,
    fatsCalories: workoutFatsCals,
    proteinPercent: Math.round((proteinCals / workoutCalories) * 100),
    carbsPercent: Math.round((workoutCarbsCals / workoutCalories) * 100),
    fatsPercent: Math.round((workoutFatsCals / workoutCalories) * 100),
  };

  // REST DAY MACROS: Lower Carbs, Higher Healthy Fats (for hormonal support and joint recovery)
  const restRemainingCals = Math.max(0, restCalories - proteinCals);
  const restFatsCals = Math.round(restCalories * 0.32); // 32% fats
  const restFatsG = Math.round(restFatsCals / 9);
  const restCarbsCals = Math.max(0, restRemainingCals - restFatsCals);
  const restCarbsG = Math.round(restCarbsCals / 4);

  const restDay: MacroDayPlan = {
    calories: restCalories,
    proteinGrams: proteinG,
    carbsGrams: restCarbsG,
    fatsGrams: restFatsG,
    proteinCalories: proteinCals,
    carbsCalories: restCarbsCals,
    fatsCalories: restFatsCals,
    proteinPercent: Math.round((proteinCals / restCalories) * 100),
    carbsPercent: Math.round((restCarbsCals / restCalories) * 100),
    fatsPercent: Math.round((restFatsCals / restCalories) * 100),
  };

  // 5. Water Intake Recommendation (35-40 ml per kg + extra 500ml for active days)
  const waterIntakeLiters = Number(((weightKg * 0.038) + 0.5).toFixed(1));

  // 6. Ideal 4-Meal Distribution
  const meals: MealDistribution[] = [
    {
      name_en: 'Breakfast & Morning Fuel 🌅',
      name_ar: 'وجبة الإفطار وبدء النشاط 🌅',
      calories: Math.round(workoutCalories * 0.25),
      proteinG: Math.round(proteinG * 0.25),
      carbsG: Math.round(workoutCarbsG * 0.28),
      fatsG: Math.round(workoutFatsG * 0.25),
      time_en: 'Within 1-2 hours of waking',
      time_ar: 'خلال ساعة إلى ساعتين من الاستيقاظ',
      tips_en: 'Focus on complex carbs (oats) and bioavailable protein (eggs).',
      tips_ar: 'ركز على الكارب المعقد (الشوفان) والبروتين عالي الامتصاص (البيض).',
    },
    {
      name_en: 'Pre-Workout Energizer ⚡',
      name_ar: 'وجبة ما قبل التمرين (طاقة القوة) ⚡',
      calories: Math.round(workoutCalories * 0.28),
      proteinG: Math.round(proteinG * 0.25),
      carbsG: Math.round(workoutCarbsG * 0.35),
      fatsG: Math.round(workoutFatsG * 0.15),
      time_en: '90-120 minutes before training',
      time_ar: 'قبل التمرين بساعة ونصف إلى ساعتين',
      tips_en: 'High carb, low fat for rapid gastric emptying and sustained ATP.',
      tips_ar: 'كارب غني وسريع الهضم مع دهون منخفضة لتوفير طاقة تفجيرية.',
    },
    {
      name_en: 'Post-Workout Anabolic Window 🥩',
      name_ar: 'وجبة ما بعد التمرين (البناء والاستشفاء) 🥩',
      calories: Math.round(workoutCalories * 0.32),
      proteinG: Math.round(proteinG * 0.35),
      carbsG: Math.round(workoutCarbsG * 0.28),
      fatsG: Math.round(workoutFatsG * 0.25),
      time_en: 'Within 60-90 minutes post-training',
      time_ar: 'خلال ساعة بعد انتهاء التدريب',
      tips_en: 'Leucine-rich protein (chicken/whey/fish) with rice or sweet potato.',
      tips_ar: 'بروتين غني بالليوسين (دجاج/واي/سمك) مع الأرز أو البطاطا الحلوة.',
    },
    {
      name_en: 'Night Recovery & Sleep 🌙',
      name_ar: 'وجبة العشاء والاستشفاء الليلي 🌙',
      calories: Math.round(workoutCalories * 0.15),
      proteinG: Math.round(proteinG * 0.15),
      carbsG: Math.round(workoutCarbsG * 0.09),
      fatsG: Math.round(workoutFatsG * 0.35),
      time_en: '1-2 hours before sleeping',
      time_ar: 'قبل النوم بساعة إلى ساعتين',
      tips_en: 'Slow-digesting protein (cottage cheese / casein) with healthy fats (almonds).',
      tips_ar: 'بروتين بطيء الهضم (جبن قريش / زبادي يوناني) مع دهون صحية (مكسرات).',
    },
  ];

  // 7. Clean Food Sources
  const foodSources: FoodSource[] = [
    {
      category_en: 'Clean Protein Sources 🥩',
      category_ar: 'مصادر البروتين النقي 🥩',
      items: [
        { name_en: 'Chicken Breast (cooked)', name_ar: 'صدر دجاج مشوي', portion_en: '150g', portion_ar: '150 غرام', protein: 46, carbs: 0, fats: 5, calories: 247 },
        { name_en: 'Whole Eggs & Egg Whites', name_ar: 'بيض كامل + بياض بيض', portion_en: '2 whole + 2 whites', portion_ar: '2 بيضة كاملة + 2 بياض', protein: 20, carbs: 1, fats: 10, calories: 180 },
        { name_en: 'Greek Yogurt (0% fat)', name_ar: 'زبادي يوناني قليل الدسم', portion_en: '200g', portion_ar: '200 غرام', protein: 20, carbs: 7, fats: 0, calories: 118 },
        { name_en: 'Salmon Fillet', name_ar: 'فيليه سمك السلمون', portion_en: '150g', portion_ar: '150 غرام', protein: 34, carbs: 0, fats: 18, calories: 310 },
        { name_en: 'Cottage Cheese (القريش)', name_ar: 'جبن القريش البلدي', portion_en: '150g', portion_ar: '150 غرام', protein: 18, carbs: 5, fats: 3, calories: 120 },
      ]
    },
    {
      category_en: 'Complex Energy Carbs 🌾',
      category_ar: 'الكربوهيدرات المعقدة والطاقة 🌾',
      items: [
        { name_en: 'Rolled Oats (dry)', name_ar: 'شوفان الحبة الكاملة', portion_en: '60g', portion_ar: '60 غرام', protein: 8, carbs: 40, fats: 4, calories: 230 },
        { name_en: 'Basmati White/Brown Rice (cooked)', name_ar: 'أرز بسمتي أبيض أو بني مطبوخ', portion_en: '180g', portion_ar: '180 غرام', protein: 4, carbs: 45, fats: 1, calories: 210 },
        { name_en: 'Baked Sweet Potato', name_ar: 'بطاطا حلوة مشوية', portion_en: '200g', portion_ar: '200 غرام', protein: 3, carbs: 42, fats: 0, calories: 180 },
        { name_en: 'Banana', name_ar: 'موزة طازجة', portion_en: '1 medium', portion_ar: '1 حبة متوسطة', protein: 1, carbs: 27, fats: 0, calories: 105 },
      ]
    },
    {
      category_en: 'Essential Healthy Fats 🥑',
      category_ar: 'الدهون الصحية الأساسية 🥑',
      items: [
        { name_en: 'Extra Virgin Olive Oil', name_ar: 'زيت زيتون بكر ممتاز', portion_en: '1 tbsp (15ml)', portion_ar: 'ملعقة طعام (15 مل)', protein: 0, carbs: 0, fats: 14, calories: 120 },
        { name_en: 'Raw Almonds & Walnuts', name_ar: 'لوز وجوز نيء', portion_en: '30g', portion_ar: '30 غرام', protein: 6, carbs: 6, fats: 15, calories: 180 },
        { name_en: 'Fresh Avocado', name_ar: 'أفوكادو طازج', portion_en: '1/2 medium', portion_ar: 'نصف حبة متوسطة', protein: 1, carbs: 4, fats: 11, calories: 120 },
        { name_en: 'Natural Peanut Butter', name_ar: 'زبدة فول سوداني طبيعية', portion_en: '1 tbsp (16g)', portion_ar: 'ملعقة طعام (16 غرام)', protein: 4, carbs: 3, fats: 8, calories: 95 },
      ]
    }
  ];

  return {
    bmr,
    tdee,
    targetDailyCalories,
    workoutDay,
    restDay,
    waterIntakeLiters,
    meals,
    foodSources,
  };
}
