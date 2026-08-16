export interface PresetExercise {
  name: string;
  targetMuscle: string;
  category?: string;
  sets: number;
  reps: string;
  weight?: string;
  exerciseTips?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface PresetDay {
  dayIndex: number;
  title: string;
  focusArea: string;
  isRestDay: boolean;
  exercises: PresetExercise[];
}

export interface PresetPlan {
  id: string;
  title_ar: string;
  title_en: string;
  coach_or_source: string;
  badge_ar: string;
  badge_en: string;
  category: 'LEGENDARY' | 'MUSCLE_FOCUS' | 'EQUIPMENT' | 'GOAL';
  daysPerWeek: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  description_ar: string;
  description_en: string;
  targetMuscles: string[];
  equipment: string[];
  days: PresetDay[];
}

export const PRESET_WORKOUT_PLANS: PresetPlan[] = [
  // ==========================================
  // 1. 👑 LEGENDARY & PRO SCIENCE PROGRAMS
  // ==========================================
  {
    id: 'arnold-golden-split',
    title_ar: 'جدول آرنولد شوارزنيجر الذهبي (Arnold Golden Blueprint)',
    title_en: "Arnold Schwarzenegger's Golden Blueprint",
    coach_or_source: 'Arnold Schwarzenegger (7x Mr. Olympia)',
    badge_ar: '👑 أساطير كمال الأجسام',
    badge_en: '👑 Golden Era Legend',
    category: 'LEGENDARY',
    daysPerWeek: 6,
    level: 'advanced',
    description_ar: 'النظام الأسطوري لتدريب العضلات المتعاكسة (صدر مع ظهر / أكتاف مع أذرع / أرجل) لتحقيق أقصى ضخ دموي وبناء عضلي كلاسيكي متناسق.',
    description_en: 'The classic antagonist superset split (Chest/Back, Shoulders/Arms, Legs) that sculpted the greatest aesthetic physique in history.',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs'],
    equipment: ['barbell', 'dumbbells', 'cables'],
    days: [
      {
        dayIndex: 1,
        title: 'صدر وظهر (Chest & Back Superset)',
        focusArea: 'Chest, Back',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Bench Press (بنش برس بالبار مستوي)', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'تركيز على التمدد الكامل والضغط العضلي للألياف الصدرية.' },
          { name: 'Wide-Grip Lat Pulldown (سحب عالي للظهر)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable', exerciseTips: 'سحب البار نحو أعلى الصدر وعصر عضلات اللاتس.' },
          { name: 'Incline Dumbbell Press (ضغط دمبلز مائل علوي)', targetMuscle: 'Chest', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'استهداف الألياف الترقوية للصدر العلوي.' },
          { name: 'Bent-Over Barbell Row (سحب بار للظهر منحني)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'الحفاظ على استقامة العمود الفقري وسحب البار باتجاه السرة.' },
          { name: 'Dumbbell Pullover (دمبل بول أوفر للصدر واللاتس)', targetMuscle: 'Chest', sets: 3, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'توسيع القفص الصدري وزيادة مرونة الكتف.' },
        ]
      },
      {
        dayIndex: 2,
        title: 'أكتاف وذراعين (Shoulders & Arms Blast)',
        focusArea: 'Shoulders, Arms',
        isRestDay: false,
        exercises: [
          { name: 'Overhead Barbell Military Press (ضغط أكتاف بالبار واقف)', targetMuscle: 'Shoulders', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'قوة وتضخيم للأكتاف الأمامية والجانبية.' },
          { name: 'Dumbbell Lateral Raise (رفرفة أكتاف جانبية بالدمبلز)', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'عزل الكتف الجانبي للحصول على المظهر العريض.' },
          { name: 'Barbell Bicep Curl (تبادل بايسبس بالبار مستقيم)', targetMuscle: 'Biceps', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'تثبيت الكوع بجانب الجسم لمنع التأرجح.' },
          { name: 'Skullcrushers EZ-Bar (ترايسبس بالبار المتعرج استلقاء)', targetMuscle: 'Triceps', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'استهداف الرأس الطويل للترايسبس.' },
          { name: 'Incline Dumbbell Curl (بايسبس دمبلز مائل للخلف)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'أقصى تمدد للرأس الخارجي للبايسبس.' },
          { name: 'Cable Tricep Pushdown (دفع كيبل ترايسبس بالحبل)', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'فتح الحبل في الأسفل لعصر ألياف الترايسبس.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'أرجل وبطن (Legs, Calves & Abs)',
        focusArea: 'Legs, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat (سكوات بالبار خلفي)', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'ملك تمارين الجزء السفلي لبناء القوة والكتلة.' },
          { name: 'Romanian Deadlift (ديدليفت روماني للأرجل الخلفية)', targetMuscle: 'Hamstrings', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'دفع الحوض للخلف والشعور بالتمدد العميق في الهامسترينغ.' },
          { name: 'Leg Press (دفع أرجل بالمكبس)', targetMuscle: 'Quadriceps', sets: 3, reps: '12-15', weight: 'Machine', exerciseTips: 'نزول عميق متحكم به بدون قفل الركبة في الأعلى.' },
          { name: 'Standing Calf Raise (رفع السمانة واقفاً)', targetMuscle: 'Calves', sets: 5, reps: '15-20', weight: 'Machine', exerciseTips: 'توقف ثانية في القمة وأخرى في القاع.' },
          { name: 'Hanging Leg Raise (رفع الأرجل على العقلة للبطن)', targetMuscle: 'Abs', sets: 4, reps: '15', weight: 'Bodyweight', exerciseTips: 'رفع الحوض للأعلى لعصر عضلات أسفل البطن.' }
        ]
      },
      {
        dayIndex: 4,
        title: 'صدر وظهر - تكرار (Chest & Back Hypertrophy)',
        focusArea: 'Chest, Back',
        isRestDay: false,
        exercises: [
          { name: 'Dumbbell Bench Press (بنش برس بالدمبلز مستوي)', targetMuscle: 'Chest', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'مدى حركي أعمق وتفعيل أكبر للألياف الداخلية.' },
          { name: 'Seated Cable Row (سحب أرضي للظهر بالكيبل)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable', exerciseTips: 'سحب المقبض لأسفل البطن وإرجاع لوحي الكتف.' },
          { name: 'Incline Cable Flyes (تفتيح كيبل مائل للصدر)', targetMuscle: 'Chest', sets: 4, reps: '12-15', weight: 'Cable', exerciseTips: 'ضغط مستمر على الصدر العلوي طوال الحركة.' },
          { name: 'T-Bar Row (سحب تي بار للظهر)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'بناء سماكة وكثافة منتصف وأسفل الظهر.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'أكتاف وذراعين - تكرار (Delts & Arms Peak)',
        focusArea: 'Shoulders, Arms',
        isRestDay: false,
        exercises: [
          { name: 'Seated Dumbbell Shoulder Press (ضغط دمبلز للأكتاف جالس)', targetMuscle: 'Shoulders', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'حركة انسيابية محكومة لعزل الأكتاف بدون مساعدة الساقين.' },
          { name: 'Face Pulls (سحب حبل للأكتاف الخلفية والترابيس)', targetMuscle: 'Shoulders', sets: 4, reps: '15', weight: 'Cable', exerciseTips: 'حماية مفصل الكتف وتطوير الدلتويد الخلفي.' },
          { name: 'Preacher Curl EZ-Bar (بايسبس على جهاز الارتكاز)', targetMuscle: 'Biceps', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'عزل تام للبايسبس دون أي حركة تعويضية.' },
          { name: 'Dips (تمرين الغطس للترايسبس)', targetMuscle: 'Triceps', sets: 4, reps: '12-15', weight: 'Bodyweight', exerciseTips: 'الحفاظ على استقامة الجذع لتركيز الضغط على الترايسبس.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'أرجل وكور (Lower Body & Core Shred)',
        focusArea: 'Legs, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Front Squat / Hack Squat (سكوات أمامي / هاك سكوات)', targetMuscle: 'Quadriceps', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'تركيز شديد على الفخذ الأمامي وقوة الجذع.' },
          { name: 'Lying Leg Curl (ثني أرجل خلفي استلقاء)', targetMuscle: 'Hamstrings', sets: 4, reps: '12-15', weight: 'Machine', exerciseTips: 'عزل أوتار الركبة والأرجل الخلفية.' },
          { name: 'Walking Dumbbell Lunges (طعنات أرجل متقدمة بالدمبلز)', targetMuscle: 'Glutes', sets: 3, reps: '12 per leg', weight: 'Dumbbells', exerciseTips: 'تطوير الاتزان وقوة عضلات الجلوتس والفخذ.' },
          { name: 'Ab Wheel Rollout / Plank (عجلة البطن / بلانك)', targetMuscle: 'Abs', sets: 4, reps: '60s', weight: 'Bodyweight', exerciseTips: 'ثبات وقوة جدار البطن الداخلي.' }
        ]
      },
      {
        dayIndex: 7,
        title: 'استشفاء وراحة تامة (Active Recovery & Rest)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },
  {
    id: 'jeff-nippard-science-ppl',
    title_ar: 'جدول جيف نيبارد العلمي (Jeff Nippard Science PPL)',
    title_en: "Jeff Nippard's Science-Based Hypertrophy PPL",
    coach_or_source: 'Jeff Nippard (BSc Biochemistry, Pro Natural Bodybuilder)',
    badge_ar: '🔬 علوم الميكانيكا الحيوية',
    badge_en: '🔬 Evidence-Based Science',
    category: 'LEGENDARY',
    daysPerWeek: 6,
    level: 'intermediate',
    description_ar: 'نظام دفع/سحب/أرجل مصمم وفق أحدث أبحاث تفعيل الألياف العضلية، منحنيات المقاومة، والتدرج بالحمل لتعظيم البناء العضلي الطبيعي.',
    description_en: 'Push/Pull/Legs periodization designed using biomechanics research, optimal resistance curves, and hypertrophy science.',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms', 'legs'],
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    days: [
      {
        dayIndex: 1,
        title: 'دفع 1: تركيز صدر وأكتاف (Push A: Chest & Delts)',
        focusArea: 'Chest, Shoulders, Triceps',
        isRestDay: false,
        exercises: [
          { name: 'Incline Dumbbell Bench Press (ضغط دمبلز مائل 30 درجة)', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'زاوية 30 درجة مثالية لتفعيل الصدر العلوي دون إجهاد مفصل الكتف.' },
          { name: 'Barbell Flat Bench Press (بنش برس بالبار مستوي)', targetMuscle: 'Chest', sets: 3, reps: '6-8', weight: 'Barbell', exerciseTips: 'توقف ثانية واحدة في الأسفل لزيادة التوتر الميكانيكي.' },
          { name: 'Cable Lateral Raise (رفرفة جانبية بالكيبل خلف الظهر)', targetMuscle: 'Shoulders', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'الكيبل يوفر مقاومة ثابتة في أسفل وأعلى الحركة.' },
          { name: 'Cross-Body Cable Tricep Extension (تمديد ترايسبس كيبل متقاطع)', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'محاذاة حركة الكوع مع مسار الألياف العضلية للترايسبس.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'سحب 1: تركيز لاتس وسماكة (Pull A: Lats & Rhomboids)',
        focusArea: 'Back, Biceps, Rear Delts',
        isRestDay: false,
        exercises: [
          { name: 'Neutral-Grip Lat Pulldown (سحب عالي قبضة متوازية)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable', exerciseTips: 'القبضة المتوازية تتيح مسار سحب أعمق وتفعيل فائق للاتس.' },
          { name: 'Chest-Supported Dumbbell Row (سحب دمبلز مع سند الصدر)', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'عزل عضلات الظهر وإلغاء أي إجهاد على أسفل الظهر.' },
          { name: 'Rear Delt Reverse Cable Fly (تفتيح خلفي بالكيبل للكتف الخلفي)', targetMuscle: 'Shoulders', sets: 3, reps: '15', weight: 'Cable', exerciseTips: 'حركة واسعة وثني خفيف في الكوع.' },
          { name: 'Incline Dumbbell Bicep Curl (تبادل بايسبس دمبلز على مقعد مائل)', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'تفعيل الرأس الطويل عبر الاستطالة الكاملة.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'أرجل 1: تركيز فخذ أمامي وسمانة (Legs A: Quad Dominant)',
        focusArea: 'Quadriceps, Calves, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat (سكوات بالبار)', targetMuscle: 'Quadriceps', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'النزول بعمق موازي للأرض والضغط بكامل باطن القدم.' },
          { name: 'Leg Extension (فرد أرجل أمامي بالجهاز)', targetMuscle: 'Quadriceps', sets: 3, reps: '12-15', weight: 'Machine', exerciseTips: 'توقف ثانية في القمة لتحقيق أقصى انقباض في عضلة Rectus Femoris.' },
          { name: 'Romanian Deadlift (ديدليفت روماني بالدمبلز)', targetMuscle: 'Hamstrings', sets: 3, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'الحفاظ على الظهر مستقيماً وثني الركبة خفيفاً جداً.' },
          { name: 'Standing Calf Raise (رفع سمانة واقفاً بالجهاز)', targetMuscle: 'Calves', sets: 4, reps: '12-15', weight: 'Machine', exerciseTips: 'إطالة كاملة في الأسفل لمدة ثانيتين.' }
        ]
      },
      {
        dayIndex: 4,
        title: 'دفع 2: تركيز أكتاف وترايسبس (Push B: Delts & Upper Pecs)',
        focusArea: 'Shoulders, Chest, Triceps',
        isRestDay: false,
        exercises: [
          { name: 'Standing Overhead Dumbbell Press (ضغط أكتاف دمبلز واقف)', targetMuscle: 'Shoulders', sets: 4, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'تفعيل عضلات التوازن والكور مع الأكتاف.' },
          { name: 'Flat Dumbbell Press (ضغط بنش دمبلز مستوي)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'ضم الدمبلز في الأعلى دون ملامستهما.' },
          { name: 'Cable Chest Flyes (تفتيح بالكيبل مستوي)', targetMuscle: 'Chest', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'عصر الصدر الأوسط والداخلي.' },
          { name: 'Overhead Cable Tricep Extension (ترايسبس كيبل فوق الرأس)', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'إطالة قصوى للرأس الطويل للترايسبس.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'سحب 2: تركيز بايسبس والترابيس (Pull B: Upper Back & Arms)',
        focusArea: 'Back, Biceps',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Bent-Over Row (سحب بار للظهر قبضة معكوسة)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'القبضة المعكوسة تزيد تفعيل اللاتس والبايسبس.' },
          { name: 'Single-Arm Cable Row (سحب فردي بالكيبل للاتس)', targetMuscle: 'Back', sets: 3, reps: '12', weight: 'Cable', exerciseTips: 'مدى حركي كامل وعصر جانبي للظهر.' },
          { name: 'Bayesian Cable Curl (بايسبس كيبل خلفي)', targetMuscle: 'Biceps', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'تمرين علمي ممتاز يمنح أقصى تمدد عضلي للبايسبس.' },
          { name: 'Hammer Curls with Dumbbells (شاكوش بالدمبلز للبايسبس والساعد)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'استهداف عضلة Brachialis لزيادة سمك الذراع.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'أرجل 2: تركيز هامسترينغ وجلوتس (Legs B: Hamstrings & Glutes)',
        focusArea: 'Hamstrings, Glutes, Quadriceps',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Romanian Deadlift (ديدليفت روماني بالبار)', targetMuscle: 'Hamstrings', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'تحميل كامل على الأرجل الخلفية وعضلات الجلوتس.' },
          { name: 'Bulgarian Split Squat (سكوات بلغاري بالدمبلز)', targetMuscle: 'Quadriceps', sets: 3, reps: '10 per leg', weight: 'Dumbbells', exerciseTips: 'بناء قوة وتناسق عالي لكل ساق بشكل منفرد.' },
          { name: 'Lying Hamstring Leg Curl (ثني أرجل خلفي بالجهاز)', targetMuscle: 'Hamstrings', sets: 3, reps: '12-15', weight: 'Machine', exerciseTips: 'عصر مستمر وعدم ترك الوزن يسقط بسرعة.' },
          { name: 'Hanging Knee/Leg Raise (رفع الركب على العقلة)', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight', exerciseTips: 'تمرين ممتاز لشد ونحت عضلات البطن.' }
        ]
      },
      {
        dayIndex: 7,
        title: 'استشفاء وإعادة شحن (Active Recovery Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },
  {
    id: 'dorian-yates-heavy-duty-hit',
    title_ar: 'نظام دوريان ييتس ومايك مينتزر (Blood & Guts HIT)',
    title_en: 'Dorian Yates & Mike Mentzer - Blood & Guts HIT',
    coach_or_source: 'Dorian Yates (6x Mr. Olympia) & Mike Mentzer',
    badge_ar: '💣 الكثافة العالية والفشل العضلي',
    badge_en: '💣 Heavy Duty Failure',
    category: 'LEGENDARY',
    daysPerWeek: 4,
    level: 'advanced',
    description_ar: 'برنامج الكثافة العالية (HIT): جولات قليلة بأقصى وزن وتركيز والوصول إلى الفشل العضلي التام (True Failure) في 45 دقيقة فقط.',
    description_en: 'High-Intensity Training protocol focusing on low volume, maximum mechanical tension, and pushing sets beyond positive failure.',
    targetMuscles: ['chest', 'biceps', 'back', 'shoulders', 'triceps', 'legs'],
    equipment: ['barbell', 'dumbbells', 'machines'],
    days: [
      {
        dayIndex: 1,
        title: 'الصدر والبايسبس (Chest & Biceps Failure)',
        focusArea: 'Chest, Biceps',
        isRestDay: false,
        exercises: [
          { name: 'Incline Barbell Bench Press (بنش مائل بالبار)', targetMuscle: 'Chest', sets: 2, reps: '6-8 (Last to Failure)', weight: 'Barbell', exerciseTips: 'جولة إحماء ثم جولة عمل واحدة بأقصى ثقل حتى الفشل التام.' },
          { name: 'Incline Dumbbell Flyes (تفتيح دمبلز مائل)', targetMuscle: 'Chest', sets: 2, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'تمدد عميق والتحكم بالوزن أثناء النزول السلبي (Negative 3s).' },
          { name: 'Preacher Curl (بايسبس جهاز ارتكاز)', targetMuscle: 'Biceps', sets: 2, reps: '6-8', weight: 'Barbell', exerciseTips: 'عصر البايسبس في الأعلى والنزول ببطء شديد.' },
          { name: 'Incline Dumbbell Bicep Curl (بايسبس مائل دمبلز)', targetMuscle: 'Biceps', sets: 2, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'الوصول للفشل مع الحفاظ على التكنيك الصارم.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'الظهر والترابيس (Back & Traps Density)',
        focusArea: 'Back',
        isRestDay: false,
        exercises: [
          { name: 'Nautilus/Cable Pullover (بول أوفر بالكيبل أو الجهاز)', targetMuscle: 'Back', sets: 2, reps: '8-10', weight: 'Cable', exerciseTips: 'تمرين دوريان المفضل لعزل اللاتس قبل السحب المركب.' },
          { name: 'Underhand Barbell Row (سحب بار منحني قبضة مقلوبة)', targetMuscle: 'Back', sets: 2, reps: '6-8 (Heavy)', weight: 'Barbell', exerciseTips: 'سحب قوي لأسفل البطن لتحفيز اللاتس السفلي.' },
          { name: 'One-Arm Dumbbell Row (سحب دمبل فردي منشار)', targetMuscle: 'Back', sets: 2, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'مدى حركي كامل دون مساعدة دوران الجذع.' },
          { name: 'Barbell Deadlift (ديدليفت بالبار من منتصف الساق)', targetMuscle: 'Back', sets: 2, reps: '6-8', weight: 'Barbell', exerciseTips: 'بناء كثافة سميكة لكامل عضلات العمود الفقري والظهر.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء عميق (Rest & Growth)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'الأكتاف والترايسبس (Deltoids & Triceps Overload)',
        focusArea: 'Shoulders, Triceps',
        isRestDay: false,
        exercises: [
          { name: 'Seated Dumbbell Shoulder Press (ضغط دمبلز للأكتاف جالس)', targetMuscle: 'Shoulders', sets: 2, reps: '6-8', weight: 'Dumbbells', exerciseTips: 'دفع للأعلى مع الثبات في القمة لثانية واحدة.' },
          { name: 'Dumbbell Lateral Raise (رفرفة أكتاف جانبية)', targetMuscle: 'Shoulders', sets: 2, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'رفع الكوع بمستوى الكتف.' },
          { name: 'Cable Tricep Pushdown (دفع كيبل ترايسبس)', targetMuscle: 'Triceps', sets: 2, reps: '8-10', weight: 'Cable', exerciseTips: 'عصر الترايسبس في الأسفل.' },
          { name: 'Lying EZ-Bar Extension (ترايسبس بار نائم للجبهة)', targetMuscle: 'Triceps', sets: 2, reps: '6-8', weight: 'Barbell', exerciseTips: 'نزول بطيء والتحكم في الوزن.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'الأرجل الشاملة (Legs Brutality)',
        focusArea: 'Legs',
        isRestDay: false,
        exercises: [
          { name: 'Leg Extension (فرد أرجل أمامي بالجهاز)', targetMuscle: 'Quadriceps', sets: 2, reps: '10-12 (Pre-Exhaust)', weight: 'Machine', exerciseTips: 'إجهاد مسبق للفخذ قبل تمارين الضغط الثقيلة.' },
          { name: 'Leg Press (مكبس الأرجل بأقصى ثقل)', targetMuscle: 'Quadriceps', sets: 2, reps: '8-10', weight: 'Machine', exerciseTips: 'نزول عميق والضغط بكعب القدم حتى الفشل.' },
          { name: 'Lying Leg Curl (ثني أرجل خلفي للجهاز)', targetMuscle: 'Hamstrings', sets: 2, reps: '8-10', weight: 'Machine', exerciseTips: 'استهداف أوتار الركبة الخلفية.' },
          { name: 'Standing Calf Raise (رفع سمانة واقفاً)', targetMuscle: 'Calves', sets: 2, reps: '10-12', weight: 'Machine', exerciseTips: 'توقف كامل في أسفل الحركة لمنع الارتداد المطاطي.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة ونمو عضلي (Rest & Recovery)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },
  {
    id: 'lyle-mcdonald-generic-bulking',
    title_ar: 'جدول إريك هيلمز ولايل مكدونالد العلمي (Generic Bulking GBR)',
    title_en: "Lyle McDonald & Dr. Eric Helms - Generic Bulking Routine",
    coach_or_source: 'Lyle McDonald & Dr. Eric Helms (PhD, Natural Pro)',
    badge_ar: '📈 البناء العضلي الطبيعي',
    badge_en: '📈 Natural Muscle Mass',
    category: 'LEGENDARY',
    daysPerWeek: 4,
    level: 'intermediate',
    description_ar: 'التقسيم العلوي/السفلي (Upper/Lower) المعتمد في أبحاث التضخيم الطبيعي لتدريب كل عضلة مرتين أسبوعياً مع أفضل معدل استشفاء.',
    description_en: 'The gold-standard 4-day Upper/Lower split scientifically structured for optimal natural muscle hypertrophy and frequency.',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms', 'legs'],
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    days: [
      {
        dayIndex: 1,
        title: 'جزء علوي 1 (Upper Body Strength & Size A)',
        focusArea: 'Chest, Back, Shoulders, Arms',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Bench Press (بنش برس بالبار مستوي)', targetMuscle: 'Chest', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'التركيز على القوة والتحميل التدريجي.' },
          { name: 'Barbell Bent-Over Row (سحب بار للظهر)', targetMuscle: 'Back', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'سحب قوي ومحكوم لزيادة كثافة الظهر.' },
          { name: 'Incline Dumbbell Press (ضغط دمبلز مائل علوي)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'استهداف ألياف الصدر العلوية.' },
          { name: 'Lat Pulldown (سحب عالي للظهر بالكيبل)', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable', exerciseTips: 'سحب كامل لتعريض اللاتس.' },
          { name: 'Dumbbell Lateral Raise (رفرفة جانبية للأكتاف)', targetMuscle: 'Shoulders', sets: 3, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'عزل الكتف الجانبي.' },
          { name: 'Barbell Bicep Curl / Cable Triceps (سوبر ست باي وتراي)', targetMuscle: 'Arms', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'إنهاء الذراعين بضخ دموي ممتاز.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'جزء سفلي 1 (Lower Body Power A)',
        focusArea: 'Quadriceps, Hamstrings, Calves, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat (سكوات بالبار)', targetMuscle: 'Quadriceps', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'بناء قوة الأرجل الأساسية.' },
          { name: 'Romanian Deadlift (ديدليفت روماني)', targetMuscle: 'Hamstrings', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'تحميل عالي على الهامسترينغ والأرداف.' },
          { name: 'Leg Press (مكبس أرجل)', targetMuscle: 'Quadriceps', sets: 3, reps: '10-12', weight: 'Machine', exerciseTips: 'زيادة الحجم التدريبي للفخذ.' },
          { name: 'Lying Leg Curl (ثني أرجل خلفي)', targetMuscle: 'Hamstrings', sets: 3, reps: '10-12', weight: 'Machine', exerciseTips: 'عزل أوتار الركبة.' },
          { name: 'Standing Calf Raise (رفع سمانة واقفاً)', targetMuscle: 'Calves', sets: 4, reps: '12-15', weight: 'Machine', exerciseTips: 'تكرارات عميقة وكاملة.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء (Rest & Recovery)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'جزء علوي 2 (Upper Body Hypertrophy B)',
        focusArea: 'Chest, Back, Shoulders, Arms',
        isRestDay: false,
        exercises: [
          { name: 'Incline Barbell Bench Press (بنش مائل بالبار)', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'تضخيم الصدر العلوي.' },
          { name: 'Seated Cable Row (سحب أرضي بالكيبل)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Cable', exerciseTips: 'سحب مريح مع الحفاظ على استقامة الظهر.' },
          { name: 'Dumbbell Flat Press (ضغط دمبلز مستوي)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'مدى حركي عميق وضخ دموي عالي.' },
          { name: 'Chin-ups / Neutral Lat Pulldown (عقلة أو سحب متوازي)', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Bodyweight', exerciseTips: 'بناء اللاتس وقوة السحب.' },
          { name: 'Face Pulls (سحب حبل للأكتاف الخلفية)', targetMuscle: 'Shoulders', sets: 3, reps: '15', weight: 'Cable', exerciseTips: 'صحة الكتف وتناسق الدلتويد الخلفي.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'جزء سفلي 2 (Lower Body Hypertrophy B)',
        focusArea: 'Quadriceps, Hamstrings, Glutes, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Bulgarian Split Squat (سكوات بلغاري بالدمبلز)', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10 per leg', weight: 'Dumbbells', exerciseTips: 'بناء تناسق وقوة كل فخذ بشكل منفصل.' },
          { name: 'Barbell Hip Thrust (هيب ثرست بالبار للأرداف)', targetMuscle: 'Glutes', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'أقوى تمرين لعزل وتقوية عضلات الجلوتس.' },
          { name: 'Leg Extension (فرد أرجل أمامي)', targetMuscle: 'Quadriceps', sets: 3, reps: '12-15', weight: 'Machine', exerciseTips: 'ضخ دموي وإنهاء الفخذ الأمامي.' },
          { name: 'Seated Leg Curl (ثني أرجل خلفي جالس)', targetMuscle: 'Hamstrings', sets: 3, reps: '12-15', weight: 'Machine', exerciseTips: 'عزل فائق للهامسترينغ في وضعية الجلوس.' },
          { name: 'Cable Woodchoppers / Plank (تمارين البطن والبلانك)', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Cable', exerciseTips: 'تقوية عضلات الخصر والكور.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة ونمو (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },

  // ==========================================
  // 2. 🎯 MUSCLE-SPECIFIC FOCUS SPLITS
  // ==========================================
  {
    id: 'chest-specialization-focus',
    title_ar: 'خطة تفجير الصدر والزوايا العلوية (Chest Hypertrophy Specialization)',
    title_en: 'Chest Hypertrophy & Upper Pecs Specialization',
    coach_or_source: 'BeastMode Sports Science Lab',
    badge_ar: '🎯 تركيز عضلة الصدر',
    badge_en: '🎯 Chest Focus',
    category: 'MUSCLE_FOCUS',
    daysPerWeek: 4,
    level: 'intermediate',
    description_ar: 'خطة مكثفة مخصصة للمتدربين الذين يعانون من ضعف أو بطء نمو عضلات الصدر العلوي والأوسط، مع توزيع ذكي لباقي عضلات الجسم.',
    description_en: 'Targeted specialization split designed to bring up lagging chest development and upper pec thickness with smart full-body maintenance.',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms', 'legs'],
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    days: [
      {
        dayIndex: 1,
        title: 'تركيز الصدر الثقيل والكتف الأمامي (Chest Overload A)',
        focusArea: 'Chest, Triceps',
        isRestDay: false,
        exercises: [
          { name: 'Incline Barbell Bench Press (بنش مائل بالبار 30 درجة)', targetMuscle: 'Chest', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'التركيز على الصدر العلوي بأوزان تصاعدية.' },
          { name: 'Flat Dumbbell Press (ضغط بنش دمبلز مستوي)', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'نزول عميق لتمديد ألياف الصدر الأوسط.' },
          { name: 'Low-to-High Cable Flyes (تفتيح كيبل من أسفل لأعلى)', targetMuscle: 'Chest', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'استهداف محدد للرأس الترقوي للصدر العلوي.' },
          { name: 'Weighted / Bodyweight Dips (غطس متوازي مع ميل للأمام)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Bodyweight', exerciseTips: 'الميل للأمام يركز الضغط على أسفل وخارج الصدر.' },
          { name: 'Skullcrushers (ترايسبس بالبار المتعرج)', targetMuscle: 'Triceps', sets: 3, reps: '10-12', weight: 'Barbell', exerciseTips: 'تقوية الترايسبس لدعم أوزان الدفع.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'الظهر والأكتاف الخلفية (Back & Rear Delts)',
        focusArea: 'Back, Shoulders',
        isRestDay: false,
        exercises: [
          { name: 'Wide Grip Pull-ups / Pulldown (عقلة واسعة أو سحب عالي)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Cable', exerciseTips: 'تعريض اللاتس وتوازن عضلات السحب مع الدفع.' },
          { name: 'Chest Supported T-Bar Row (سحب تي بار مسنود)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'سماكة منتصف الظهر والترابيس.' },
          { name: 'Face Pulls (سحب حبل للأكتاف الخلفية)', targetMuscle: 'Shoulders', sets: 4, reps: '15', weight: 'Cable', exerciseTips: 'الحفاظ على صحة الكتف واستقامته.' },
          { name: 'Dumbbell Hammer Curl (شاكوش دمبلز للبايسبس)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'تقوية الساعد والبايسبس.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء عضلات الدفع (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'تركيز الصدر العالي بالدمبلز والضخ (Chest Hypertrophy B)',
        focusArea: 'Chest, Shoulders',
        isRestDay: false,
        exercises: [
          { name: 'Incline Dumbbell Press (ضغط دمبلز مائل)', targetMuscle: 'Chest', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'تحكم عالي وثبات في قمة الحركة.' },
          { name: 'Pec Deck Machine Fly (تفتيح بجهاز الفراشة للصدر)', targetMuscle: 'Chest', sets: 4, reps: '12-15', weight: 'Machine', exerciseTips: 'عصر الصدر الداخلي لمدة ثانيتين في كل تكرار.' },
          { name: 'Decline Dumbbell Press (ضغط دمبلز مائل لأسفل)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'تحديد خط الصدر السفلي.' },
          { name: 'Dumbbell Lateral Raise (رفرفة جانبية للأكتاف)', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'تطوير الكتف الجانبي.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'الأرجل والكور الشامل (Legs & Core)',
        focusArea: 'Legs, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat (سكوات بالبار)', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'قوة الأرجل الشاملة.' },
          { name: 'Romanian Deadlift (ديدليفت روماني)', targetMuscle: 'Hamstrings', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'استهداف الأرجل الخلفية.' },
          { name: 'Standing Calf Raise (رفع سمانة)', targetMuscle: 'Calves', sets: 4, reps: '15', weight: 'Machine', exerciseTips: 'تطوير السمانة.' },
          { name: 'Hanging Leg Raise (رفع أرجل للبطن)', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight', exerciseTips: 'شد أسفل البطن.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },
  {
    id: 'back-v-taper-specialization',
    title_ar: 'خطة تعريض الظهر وسماكة اللاتس (V-Taper & Back Width)',
    title_en: 'V-Taper & Back Density Specialization',
    coach_or_source: 'BeastMode Sports Science Lab',
    badge_ar: '🎯 تركيز عضلة الظهر',
    badge_en: '🎯 Back Focus',
    category: 'MUSCLE_FOCUS',
    daysPerWeek: 4,
    level: 'intermediate',
    description_ar: 'خطة مدروسة لتعريض الظهر من أعلى وبناء شكل حرف V الكلاسيكي مع زيادة سماكة عضلات الظهر الأوسط والسفلي.',
    description_en: 'Specialized 4-day split prioritizing lat width, upper back thickness, and spinal erector strength for an elite V-taper physique.',
    targetMuscles: ['back', 'biceps', 'chest', 'shoulders', 'legs'],
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    days: [
      {
        dayIndex: 1,
        title: 'تعريض الظهر واللاتس (Back Width Dominant)',
        focusArea: 'Back, Biceps',
        isRestDay: false,
        exercises: [
          { name: 'Wide-Grip Pull-ups (عقلة قبضة واسعة)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Bodyweight', exerciseTips: 'تمرين الأساس لتعريض الظهر العلوي.' },
          { name: 'Single-Arm Neutral Cable Lat Pulldown (سحب عالي فردي بالكيبل)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable', exerciseTips: 'سحب الكوع للورك لعزل اللاتس السفلي.' },
          { name: 'Dumbbell Pullover on Bench (بول أوفر بالدمبلز)', targetMuscle: 'Back', sets: 3, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'تمدد عميق لعضلة اللاتس.' },
          { name: 'Incline Dumbbell Bicep Curl (بايسبس دمبلز مائل)', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'تطوير قمة البايسبس.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'الصدر والأكتاف (Chest & Shoulders Maintenance)',
        focusArea: 'Chest, Shoulders',
        isRestDay: false,
        exercises: [
          { name: 'Incline Barbell Bench Press (بنش مائل بالبار)', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'بناء الصدر العلوي.' },
          { name: 'Flat Dumbbell Press (ضغط دمبلز مستوي)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'الحفاظ على كتلة الصدر.' },
          { name: 'Dumbbell Lateral Raise (رفرفة جانبية للأكتاف)', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'تعريض الأكتاف لدعم شكل الـ V-Taper.' },
          { name: 'Cable Tricep Pushdown (ترايسبس كيبل)', targetMuscle: 'Triceps', sets: 3, reps: '12', weight: 'Cable', exerciseTips: 'تفعيل الترايسبس.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'سماكة الظهر والديدليفت (Back Density & Thickness)',
        focusArea: 'Back, Rear Delts',
        isRestDay: false,
        exercises: [
          { name: 'Conventional Barbell Deadlift (ديدليفت تقليدي بالبار)', targetMuscle: 'Back', sets: 4, reps: '6-8', weight: 'Barbell', exerciseTips: 'بناء سماكة وقوة لكامل العمود الفقري والترابيس.' },
          { name: 'Bent-Over Barbell Row (سحب بار للظهر قبضة عادية)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'سحب باتجاه السرة وعصر الظهر الأوسط.' },
          { name: 'Close-Grip Seated Cable Row (سحب أرضي قبضة ضيقة)', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable', exerciseTips: 'استهداف كثافة اللاتس والترابيس الوسطى.' },
          { name: 'Face Pulls (سحب حبل للأكتاف الخلفية والترابيس العليا)', targetMuscle: 'Shoulders', sets: 4, reps: '15', weight: 'Cable', exerciseTips: 'تطوير الكتف الخلفي.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'الأرجل والكور (Legs & Core Power)',
        focusArea: 'Legs, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Front / Back Squat (سكوات بالبار)', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'قوة الأرجل المتوازنة.' },
          { name: 'Lying Leg Curl (ثني أرجل خلفي بالجهاز)', targetMuscle: 'Hamstrings', sets: 4, reps: '10-12', weight: 'Machine', exerciseTips: 'عزل الهامسترينغ.' },
          { name: 'Standing Calf Raise (رفع سمانة)', targetMuscle: 'Calves', sets: 4, reps: '15', weight: 'Machine', exerciseTips: 'تقوية السمانة.' },
          { name: 'Cable Woodchopper / Plank (تمارين الكور والوسط)', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Cable', exerciseTips: 'تضييق محيط الخصر.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },
  {
    id: 'arms-blast-specialization',
    title_ar: 'خطة تفجير وتضخيم الذراعين (Arm Blast: Biceps & Triceps)',
    title_en: 'Arm Blast: Biceps Peak & Triceps Horseshoe',
    coach_or_source: 'BeastMode Sports Science Lab',
    badge_ar: '🎯 تركيز الذراعين',
    badge_en: '🎯 Arms Focus',
    category: 'MUSCLE_FOCUS',
    daysPerWeek: 4,
    level: 'intermediate',
    description_ar: 'خطة مخصصة لزيادة حجم ذراعيك عبر تدريب البايسبس والترايسبس مرتين أسبوعياً مع استهداف الرؤوس التشريحية الثلاثة للترايسبس والرأسين للبايسبس والساعد.',
    description_en: 'Dedicated 4-day routine prioritizing arm circumference, long-head bicep peaks, and tricep lateral thickness.',
    targetMuscles: ['arms', 'chest', 'back', 'shoulders', 'legs'],
    equipment: ['barbell', 'dumbbells', 'cables'],
    days: [
      {
        dayIndex: 1,
        title: 'يوم تفجير الذراعين الثقيل (Dedicated Heavy Arms Day)',
        focusArea: 'Biceps, Triceps, Forearms',
        isRestDay: false,
        exercises: [
          { name: 'Standing Barbell Bicep Curl (بايسبس بالبار مستقيم)', targetMuscle: 'Biceps', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'تثبيت الكوع والتحكم في الوزن.' },
          { name: 'Close-Grip Barbell Bench Press (بنش برس قبضة ضيقة)', targetMuscle: 'Triceps', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'ملك تمارين القوة والكتلة للترايسبس.' },
          { name: 'Incline Dumbbell Curl (بايسبس مائل دمبلز)', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'أقصى تمدد للرأس الطويل.' },
          { name: 'Skullcrushers EZ-Bar (ترايسبس بالبار المتعرج استلقاء)', targetMuscle: 'Triceps', sets: 3, reps: '10-12', weight: 'Barbell', exerciseTips: 'عزل الرأس الطويل للترايسبس.' },
          { name: 'Dumbbell Hammer Curls (شاكوش دمبلز للباي والساعد)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'تطوير عضلة Brachialis لزيادة سمك الذراع.' },
          { name: 'Cable Tricep Rope Pushdown (دفع كيبل بالحبل)', targetMuscle: 'Triceps', sets: 3, reps: '15', weight: 'Cable', exerciseTips: 'عصر الترايسبس في الأسفل.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'الأرجل والبطن (Lower Body & Core)',
        focusArea: 'Legs, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat (سكوات بالبار)', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'قوة الأرجل الشاملة.' },
          { name: 'Romanian Deadlift (ديدليفت روماني)', targetMuscle: 'Hamstrings', sets: 4, reps: '10-12', weight: 'Barbell', exerciseTips: 'استهداف الأرجل الخلفية.' },
          { name: 'Leg Extension (فرد أرجل أمامي)', targetMuscle: 'Quadriceps', sets: 3, reps: '12-15', weight: 'Machine', exerciseTips: 'ضخ دموي للفخذ.' },
          { name: 'Hanging Leg Raise (رفع أرجل للبطن)', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight', exerciseTips: 'تقوية عضلات البطن.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'الصدر والظهر (Chest & Back Hypertrophy)',
        focusArea: 'Chest, Back',
        isRestDay: false,
        exercises: [
          { name: 'Incline Barbell Bench Press (بنش مائل بالبار)', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell', exerciseTips: 'الصدر العلوي.' },
          { name: 'Lat Pulldown (سحب عالي للظهر)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable', exerciseTips: 'تعريض اللاتس.' },
          { name: 'Flat Dumbbell Press (ضغط دمبلز مستوي)', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'بناء الصدر.' },
          { name: 'Seated Cable Row (سحب أرضي بالكيبل)', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable', exerciseTips: 'كثافة الظهر.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'الأكتاف وضخ الذراعين الثاني (Shoulders & Arm Pump)',
        focusArea: 'Shoulders, Arms',
        isRestDay: false,
        exercises: [
          { name: 'Seated Dumbbell Shoulder Press (ضغط دمبلز أكتاف)', targetMuscle: 'Shoulders', sets: 4, reps: '8-10', weight: 'Dumbbells', exerciseTips: 'تطوير الأكتاف.' },
          { name: 'Dumbbell Lateral Raise (رفرفة أكتاف جانبية)', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'عزل الكتف الجانبي.' },
          { name: 'Preacher Curl Machine / Bar (بايسبس ارتكاز)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Barbell', exerciseTips: 'عزل البايسبس وضخ دموي.' },
          { name: 'Overhead Cable Tricep Extension (ترايسبس كيبل فوق الرأس)', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable', exerciseTips: 'إطالة الرأس الطويل.' },
          { name: 'Face Pulls (سحب حبل للكتف الخلفي)', targetMuscle: 'Shoulders', sets: 3, reps: '15', weight: 'Cable', exerciseTips: 'صحة الكتف.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },

  // ==========================================
  // 3. 🏠 EQUIPMENT & ENVIRONMENT SPLITS
  // ==========================================
  {
    id: 'dumbbells-only-home-split',
    title_ar: 'خطة الدمبلز المنزلية الشاملة (Dumbbells Only Home Split)',
    title_en: 'Dumbbells-Only Home Workout Split',
    coach_or_source: 'BeastMode Home Athletics',
    badge_ar: '🏠 تمارين منزلية',
    badge_en: '🏠 Dumbbells Only',
    category: 'EQUIPMENT',
    daysPerWeek: 4,
    level: 'beginner',
    description_ar: 'برنامج تدريبي متكامل لا يحتاج سوى زوج من الدمبلز (أو أوزان قابلة للتعديل) لاستهداف جميع عضلات الجسم وبناء كتلة حقيقية في المنزل.',
    description_en: 'Complete home hypertrophy program requiring nothing more than a pair of dumbbells to hit every major muscle group with progressive overload.',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs'],
    equipment: ['dumbbells'],
    days: [
      {
        dayIndex: 1,
        title: 'دفع منزلي بالدمبلز (Home Push: Chest, Delts, Triceps)',
        focusArea: 'Chest, Shoulders, Triceps',
        isRestDay: false,
        exercises: [
          { name: 'Dumbbell Floor Press (ضغط دمبلز على الأرض للصدر)', targetMuscle: 'Chest', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'بديل ممتاز للبنش برس لحماية الكتف وبناء الصدر.' },
          { name: 'Dumbbell Standing Overhead Press (ضغط أكتاف دمبلز واقف)', targetMuscle: 'Shoulders', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'تفعيل عضلات التوازن والكور مع الأكتاف.' },
          { name: 'Dumbbell Lateral Raise (رفرفة أكتاف جانبية بالدمبلز)', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'تعريض الأكتاف في المنزل.' },
          { name: 'Dumbbell Overhead Tricep Extension (ترايسبس دمبل خلف الرأس)', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Dumbbells', exerciseTips: 'عزل الترايسبس وإطالة الرأس الطويل.' },
          { name: 'Push-ups to Failure (تمرين الضغط حتى الفشل)', targetMuscle: 'Chest', sets: 2, reps: 'To Failure', weight: 'Bodyweight', exerciseTips: 'ضخ دموي كامل للصدر.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'سحب منزلي بالدمبلز (Home Pull: Back, Rear Delts, Biceps)',
        focusArea: 'Back, Biceps',
        isRestDay: false,
        exercises: [
          { name: 'Bent-Over Two-Arm Dumbbell Row (سحب دمبلز منحني للظهر)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'سحب الكوع للخلف وعصر عضلات الظهر.' },
          { name: 'Single-Arm Dumbbell Row (سحب دمبل فردي منشار على كرسي)', targetMuscle: 'Back', sets: 3, reps: '12 per arm', weight: 'Dumbbells', exerciseTips: 'مدى حركي كامل وتفعيل اللاتس.' },
          { name: 'Dumbbell Rear Delt Fly (رفرفة خلفية بالدمبلز منحني)', targetMuscle: 'Shoulders', sets: 4, reps: '15', weight: 'Dumbbells', exerciseTips: 'استهداف الكتف الخلفي والترابيس.' },
          { name: 'Standing Dumbbell Bicep Curl (تبادل بايسبس واقف)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'عصر البايسبس في الأعلى.' },
          { name: 'Dumbbell Hammer Curl (شاكوش دمبلز للباي والساعد)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'زيادة سمك الذراع.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'أرجل وبطن بالدمبلز (Home Legs & Abs)',
        focusArea: 'Legs, Abs',
        isRestDay: false,
        exercises: [
          { name: 'Dumbbell Goblet Squat (جوبلت سكوات بالدمبل للصدر)', targetMuscle: 'Quadriceps', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'مسك الدمبل أمام الصدر والنزول بعمق.' },
          { name: 'Dumbbell Romanian Deadlift (ديدليفت روماني بالدمبلز)', targetMuscle: 'Hamstrings', sets: 4, reps: '10-12', weight: 'Dumbbells', exerciseTips: 'دفع الحوض للخلف وتمديد الأرجل الخلفية.' },
          { name: 'Dumbbell Walking Lunges (طعنات أرجل بالدمبلز)', targetMuscle: 'Glutes', sets: 3, reps: '12 per leg', weight: 'Dumbbells', exerciseTips: 'تقوية الفخذ والجلوتس.' },
          { name: 'Single-Leg Dumbbell Calf Raise (رفع السمانة بالدمبل لساق واحدة)', targetMuscle: 'Calves', sets: 4, reps: '15', weight: 'Dumbbells', exerciseTips: 'تطوير السمانة.' },
          { name: 'Plank with Shoulder Taps (بلانك مع لمس الأكتاف)', targetMuscle: 'Abs', sets: 3, reps: '45s', weight: 'Bodyweight', exerciseTips: 'ثبات وقوة الكور.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'جسم علوي شامل بالدمبلز (Full Upper Body Pump)',
        focusArea: 'Chest, Back, Arms',
        isRestDay: false,
        exercises: [
          { name: 'Incline Dumbbell Floor Press / Push-ups (ضغط دمبلز مائل أو ضغط)', targetMuscle: 'Chest', sets: 4, reps: '12', weight: 'Dumbbells', exerciseTips: 'الصدر العلوي.' },
          { name: 'Dumbbell Chest Supported Row (سحب دمبلز للظهر)', targetMuscle: 'Back', sets: 4, reps: '12', weight: 'Dumbbells', exerciseTips: 'كثافة الظهر.' },
          { name: 'Dumbbell Arnold Press (ضغط أكتاف آرنولد بالدمبلز)', targetMuscle: 'Shoulders', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'تدوير الدمبل وتفعيل كافة زوايا الكتف.' },
          { name: 'Dumbbell Concentration Curl (بايسبس تركيز فردي جالس)', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells', exerciseTips: 'عزل قمة البايسبس.' },
          { name: 'Bench / Chair Dips (غطس على كرسي للترايسبس)', targetMuscle: 'Triceps', sets: 3, reps: '15', weight: 'Bodyweight', exerciseTips: 'إنهاء الترايسبس.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة ونمو (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  },
  {
    id: 'calisthenics-bodyweight-beast',
    title_ar: 'خطة الكاليستنكس ووزن الجسم الخالص (Calisthenics Beast Mode)',
    title_en: 'Calisthenics & Bodyweight Only Routine',
    coach_or_source: 'BeastMode Calisthenics Division',
    badge_ar: '🤸‍♂️ كاليستنكس ووزن الجسم',
    badge_en: '🤸‍♂️ Bodyweight Mastery',
    category: 'EQUIPMENT',
    daysPerWeek: 4,
    level: 'intermediate',
    description_ar: 'برنامج رياضي يعتمد بنسبة 100% على وزن الجسم والجاذبية والعقلة لتطوير قوة جبارة، مرونة، وتحكم عضلي فائق في أي مكان.',
    description_en: '100% bodyweight and gravity-driven calisthenics routine designed to build relative strength, shredded aesthetics, and joint mobility.',
    targetMuscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs'],
    equipment: ['pullup'],
    days: [
      {
        dayIndex: 1,
        title: 'دفع كاليستنكس (Calisthenics Push & Core)',
        focusArea: 'Chest, Shoulders, Triceps',
        isRestDay: false,
        exercises: [
          { name: 'Standard Push-ups (تمرين الضغط الكلاسيكي)', targetMuscle: 'Chest', sets: 4, reps: '15-20', weight: 'Bodyweight', exerciseTips: 'نزول كامل ولمس الصدر للأرض.' },
          { name: 'Pike Push-ups / Handstand Push-ups (ضغط بايك للأكتاف)', targetMuscle: 'Shoulders', sets: 4, reps: '8-12', weight: 'Bodyweight', exerciseTips: 'بديل جبار لضغط الأكتاف العسكري بوزن الجسم.' },
          { name: 'Parallel Bar / Chair Dips (غطس على المتوازي أو كرسي)', targetMuscle: 'Chest', sets: 4, reps: '12-15', weight: 'Bodyweight', exerciseTips: 'تطوير الصدر السفلي والترايسبس.' },
          { name: 'Diamond Push-ups (تمرين ضغط الماس للترايسبس)', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Bodyweight', exerciseTips: 'وضع اليدين على شكل مثلث لعزل الترايسبس.' },
          { name: 'Hollow Body Hold (تمرين القوس المجوف للبطن والكور)', targetMuscle: 'Abs', sets: 3, reps: '45s', weight: 'Bodyweight', exerciseTips: 'قوة أساسية لثبات الجمباز والكاليستنكس.' }
        ]
      },
      {
        dayIndex: 2,
        title: 'سحب كاليستنكس (Calisthenics Pull & Lats)',
        focusArea: 'Back, Biceps',
        isRestDay: false,
        exercises: [
          { name: 'Wide-Grip Pull-ups (عقلة قبضة واسعة للظهر)', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Bodyweight', exerciseTips: 'سحب الصدر لمستوى البار وعصر اللاتس.' },
          { name: 'Chin-ups (عقلة قبضة مقلوبة للبايسبس واللاتس)', targetMuscle: 'Biceps', sets: 4, reps: '8-10', weight: 'Bodyweight', exerciseTips: 'بناء ذراعين جبارة بوزن الجسم.' },
          { name: 'Inverted Rows / Australian Pull-ups (سحب أسترالي أفقي)', targetMuscle: 'Back', sets: 3, reps: '12-15', weight: 'Bodyweight', exerciseTips: 'كثافة الظهر الأوسط والترابيس.' },
          { name: 'Dead Hangs (التعلق الحر على العقلة)', targetMuscle: 'Back', sets: 3, reps: '60s', weight: 'Bodyweight', exerciseTips: 'تفكيك ضغط العمود الفقري وتقوية قبضة اليد.' }
        ]
      },
      {
        dayIndex: 3,
        title: 'راحة واستشفاء (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 4,
        title: 'أرجل كاليستنكس وانفجارية (Calisthenics Legs & Plyometrics)',
        focusArea: 'Quadriceps, Hamstrings, Calves',
        isRestDay: false,
        exercises: [
          { name: 'Bodyweight Air Squats (سكوات بوزن الجسم)', targetMuscle: 'Quadriceps', sets: 4, reps: '20-25', weight: 'Bodyweight', exerciseTips: 'نزول عميق متواصل لضخ الدم في الفخذ.' },
          { name: 'Pistol Squat / Assisted Pistol Squat (سكوات بساق واحدة)', targetMuscle: 'Quadriceps', sets: 3, reps: '6-8 per leg', weight: 'Bodyweight', exerciseTips: 'أعلى مستوى قوة واتزان للجزء السفلي.' },
          { name: 'Nordic Hamstring Curls (كيرل نوردي للأرجل الخلفية)', targetMuscle: 'Hamstrings', sets: 3, reps: '8-10', weight: 'Bodyweight', exerciseTips: 'أقوى تمرين وقائي لبناء أوتار الركبة.' },
          { name: 'Single-Leg Calf Raises (رفع سمانة لساق واحدة)', targetMuscle: 'Calves', sets: 4, reps: '20', weight: 'Bodyweight', exerciseTips: 'تطوير السمانة.' },
          { name: 'Jump Lunges (طعنات أرجل قفز انفجارية)', targetMuscle: 'Glutes', sets: 3, reps: '15', weight: 'Bodyweight', exerciseTips: 'قوة انفجارية ولياقة قلبية عالية.' }
        ]
      },
      {
        dayIndex: 5,
        title: 'كور متقدم ومهارات (Advanced Core & Muscle Up Prep)',
        focusArea: 'Abs, Core, Upper Body',
        isRestDay: false,
        exercises: [
          { name: 'Hanging Leg Raises to Bar (رفع الأرجل للمس البار)', targetMuscle: 'Abs', sets: 4, reps: '10-12', weight: 'Bodyweight', exerciseTips: 'قوة عضلات البطن العميقة.' },
          { name: 'L-Sit Hold / Progression (تثبيت وضعية L-Sit)', targetMuscle: 'Abs', sets: 4, reps: '20-30s', weight: 'Bodyweight', exerciseTips: 'ضغط وتثبيت عالي للكور والكتف.' },
          { name: 'Decline Push-ups (ضغط مائل مع رفع القدمين)', targetMuscle: 'Chest', sets: 3, reps: '15', weight: 'Bodyweight', exerciseTips: 'الصدر العلوي.' },
          { name: 'Plank to Push-up (بلانك متحرك لضغط)', targetMuscle: 'Abs', sets: 3, reps: '12', weight: 'Bodyweight', exerciseTips: 'تنسيق عضلي عصبي.' }
        ]
      },
      {
        dayIndex: 6,
        title: 'راحة ونمو (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      },
      {
        dayIndex: 7,
        title: 'راحة تامة (Rest Day)',
        focusArea: 'Recovery',
        isRestDay: true,
        exercises: []
      }
    ]
  }
];
