import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // --- IRON / STRENGTH (حديد ومقاومة بالوزن) ---
  {
    name: 'تمرين بنش بريس بالبار (Barbell Bench Press)',
    targetMuscle: 'الصدر (Chest)',
    category: 'IRON',
    description: 'الاستلقاء على المقعد، ودفع البار لأعلى لتشغيل عضلات الصدر الرئيسية والأكتاف والتراي.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+bench+press+tutorial+shorts'
  },
  {
    name: 'تمرين بنش بالدمبل مائل لأعلى (Incline Dumbbell Press)',
    targetMuscle: 'الصدر العلوي (Upper Chest)',
    category: 'IRON',
    description: 'رفع المقعد لزاوية 30-45 درجة، ودفع الدمبل لأعلى للتركيز على عضلات الصدر العلوية.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=incline+dumbbell+press+shorts'
  },
  {
    name: 'تمرين الرفرفة للصدر بالدمبل (Dumbbell Flyes)',
    targetMuscle: 'الصدر (Chest)',
    category: 'IRON',
    description: 'تمرين عزل للصدر، فتح الذراعين جانباً بشكل نصف دائري ثم ضمهما للداخل.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+flyes+shorts'
  },
  {
    name: 'تمرين الرفع المميت (Deadlift)',
    targetMuscle: 'الظهر السفلي والأرداف (Back & Glutes)',
    category: 'IRON',
    description: 'رفع البار من الأرض مع الحفاظ على استقامة الظهر، لتشغيل عضلات الجسم الخلفية بأكملها.',
    imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=deadlift+tutorial+shorts'
  },
  {
    name: 'تمرين سحب لأسفل للظهر (Lat Pulldown)',
    targetMuscle: 'الظهر العلوي (Lats)',
    category: 'IRON',
    description: 'باستخدام جهاز الكيبل، سحب المقبض لأسفل الصدر لتوسيع عضلة الظهر العريضة.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=lat+pulldown+shorts'
  },
  {
    name: 'تمرين التجديف بالبار (Barbell Row)',
    targetMuscle: 'منتصف الظهر (Mid Back)',
    category: 'IRON',
    description: 'الانحناء للأمام بزاوية 45 درجة وسحب البار باتجاه البطن لزيادة سمك عضلات الظهر.',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+row+shorts'
  },
  {
    name: 'تمرين القرفصاء بالبار (Barbell Squat)',
    targetMuscle: 'الفخذ الأمامي والأرداف (Quads & Glutes)',
    category: 'IRON',
    description: 'وضع البار على الأكتاف، والنزول لأسفل كأنك تجلس على كرسي ثم الصعود لتشغيل الأرجل.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+squat+shorts'
  },
  {
    name: 'تمرين مكبس الأرجل (Leg Press)',
    targetMuscle: 'الأرجل (Legs)',
    category: 'IRON',
    description: 'الجلوس على مقعد الجهاز ودفع المنصة الثقيلة بالقدمين بأمان لتقوية عضلات الفخذين.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=leg+press+shorts'
  },
  {
    name: 'تمرين الرفرفة الجانبية للكتف (Dumbbell Lateral Raise)',
    targetMuscle: 'الكتف الجانبي (Side Delts)',
    category: 'IRON',
    description: 'رفع الدمبلز جانباً لتشكيل الكتف وإعطاء مظهر عريض وجذاب للجسم.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=lateral+raise+shorts'
  },
  {
    name: 'تمرين ضغط الأكتاف بالدمبل (Dumbbell Shoulder Press)',
    targetMuscle: 'الأكتاف (Shoulders)',
    category: 'IRON',
    description: 'دفع الدمبلز لأعلى من مستوى الأذن لتقوية عضلات الكتف الأمامية والجانبية.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+shoulder+press+shorts'
  },
  {
    name: 'تمرين تبادل بايسبس بالدمبل (Dumbbell Bicep Curl)',
    targetMuscle: 'بايسبس (Biceps)',
    category: 'IRON',
    description: 'ثني الذراع للأعلى مع لف المعصم لتشغيل وتقوية ذروة عضلة البايسبس.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=bicep+curl+shorts'
  },
  {
    name: 'تمرين ضغط الترايسبس بالكيبل (Tricep Pushdown)',
    targetMuscle: 'ترايسبس (Triceps)',
    category: 'IRON',
    description: 'سحب الحبل للأسفل مع تثبيت الكوعين على الجانبين لتفجير وتقوية الترايسبس.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=tricep+pushdown+shorts'
  },

  // --- CALISTHENICS / BODYWEIGHT (تمارين المقاومة ووزن الجسم) ---
  {
    name: 'تمرين الضغط الكلاسيكي (Push-ups)',
    targetMuscle: 'الصدر والتراي (Chest & Triceps)',
    category: 'CALISTHENICS',
    description: 'النزول ورفع الجسم باستخدام الذراعين من وضعية اللوح المستوي لتقوية الجزء العلوي.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pushups+form+shorts'
  },
  {
    name: 'تمرين العقلة (Pull-ups)',
    targetMuscle: 'الظهر والبايسبس (Back & Biceps)',
    category: 'CALISTHENICS',
    description: 'سحب الجسم للأعلى حتى يتجاوز الذقن مستوى العارضة، لتقوية عضلات السحب.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pullups+form+shorts'
  },
  {
    name: 'تمرين المتوازي (Dips)',
    targetMuscle: 'الصدر السفلي والتراي (Triceps & Lower Chest)',
    category: 'CALISTHENICS',
    description: 'رفع الجسم فوق قضبان المتوازي ثم النزول والصعود بالتركيز على التراي والكتف الأمامي.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=dips+exercise+shorts'
  },
  {
    name: 'تمرين اللوح الخشبي الكلاسيكي (Plank)',
    targetMuscle: 'عضلات الجذع والبطن (Core)',
    category: 'CALISTHENICS',
    description: 'التوازن على الساعدين وأطراف القدمين مع الحفاظ على استقامة الجسم لتفعيل الجذع كاملاً.',
    imageUrl: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=plank+how+to+do+shorts'
  },
  {
    name: 'تمرين الطعن بوزن الجسم (Bodyweight Lunges)',
    targetMuscle: 'الأرجل والأرداف (Legs & Glutes)',
    category: 'CALISTHENICS',
    description: 'التقدم بخطوة للأمام والنزول بالركبة بزاوية 90 درجة لتطوير قوة واستقرار الجزء السفلي.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=lunges+form+shorts'
  },

  // --- HIIT / CARDIO (كارديو وتمارين الشدة العالية) ---
  {
    name: 'تمرين بيربي القاتل (Burpees)',
    targetMuscle: 'كامل الجسم وحرق الدهون (Full Body & Cardio)',
    category: 'HIIT',
    description: 'النزول لوضعية الضغط، ثم القفز للأعلى بشكل متفجر لرفع نبضات القلب بأقصى سرعة.',
    imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=burpees+exercise+shorts'
  },
  {
    name: 'تمرين متسلق الجبال (Mountain Climbers)',
    targetMuscle: 'البطن واللياقة الهوائية (Abs & Cardio)',
    category: 'HIIT',
    description: 'من وضعية الضغط، تبادل سحب الركبتين بسرعة باتجاه الصدر لمحاكاة الجري.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=mountain+climbers+shorts'
  },
  {
    name: 'تمرين قفز الحبل (Jump Rope)',
    targetMuscle: 'لياقة هوائية وبطات الرجل (Cardio & Calves)',
    category: 'CARDIO',
    description: 'تمرين كلاسيكي رائع لزيادة التحمل وحرق السعرات وتقوية عضلات الساق والبطات.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=jump+rope+tricks+shorts'
  },
  {
    name: 'قفز الرافعات (Jumping Jacks)',
    targetMuscle: 'كامل الجسم والكارديو (Full Body & Cardio)',
    category: 'CARDIO',
    description: 'فتح القدمين والذراعين مع القفز المتكرر لرفع حرارة الجسم وتهيئة القلب للتمرين.',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=jumping+jacks+shorts'
  },

  // --- YOGA (اليوجا والاستشفاء) ---
  {
    name: 'وضعية الكلب المتجه لأسفل (Downward-Facing Dog)',
    targetMuscle: 'كامل الجسم وإطالة العمود الفقري (Full Body Stretch)',
    category: 'YOGA',
    description: 'اتخاذ شكل حرف V مقلوب بالجسم للتركيز على إطالة عضلات الأكتاف، والأوتار الخلفية للأرجل.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=downward+dog+shorts'
  },
  {
    name: 'وضعية الطفل المريحة (Child’s Pose)',
    targetMuscle: 'الظهر والاسترخاء (Back & Recovery)',
    category: 'YOGA',
    description: 'وضعية استراحة وإطالة خفيفة لأسفل الظهر والعمود الفقري والتخلص من الإجهاد.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=childs+pose+shorts'
  },
  {
    name: 'وضعية الكوبرا للظهر (Cobra Pose)',
    targetMuscle: 'الظهر والصدر (Spine & Chest)',
    category: 'YOGA',
    description: 'رفع الجزء العلوي من الجسم للأعلى أثناء الاستلقاء على البطن لتقوية العمود الفقري وفتح الصدر.',
    imageUrl: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=cobra+pose+shorts'
  },

  // --- PILATES (البيلاتس وتقوية الجذع) ---
  {
    name: 'المئة في البيلاتس (Pilates Hundred)',
    targetMuscle: 'عضلات البطن العميقة (Core & Abs)',
    category: 'PILATES',
    description: 'الاستلقاء مع رفع الرأس والأكتاف والأرجل، وتحريك الذراعين لأعلى وأسفل مع تنفس منتظم.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pilates+hundred+shorts'
  },
  {
    name: 'تمرين لف العمود الفقري (Pilates Roll Up)',
    targetMuscle: 'مرونة الجذع والبطن (Core Flexibility)',
    category: 'PILATES',
    description: 'الصعود التدريجي للجذع للوصول إلى القدمين ببطء وتركيز لتفعيل البطن وزيادة مرونة الظهر.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pilates+roll+up+shorts'
  },
  {
    name: 'تمرين السباحة في البيلاتس (Pilates Swimming)',
    targetMuscle: 'السلسلة الخلفية للجسم (Posterior Chain)',
    category: 'PILATES',
    description: 'الاستلقاء على البطن ورفع الذراعين والأرجل بالتبادل بحركات سريعة ومنتظمة كأنك تسبح.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pilates+swimming+exercise+shorts'
  }
];

async function main() {
  console.log('Start seeding exercise library...');
  for (const ex of exercises) {
    await prisma.exerciseLibrary.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
