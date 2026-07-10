import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // --- IRON / STRENGTH (حديد جيم) ---
  // الصدر
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
    name: 'تمرين بنش بالدمبل مستوي (Flat Dumbbell Press)',
    targetMuscle: 'الصدر (Chest)',
    category: 'IRON',
    description: 'الاستلقاء مستوياً ودفع الدمبلين للأعلى، يعطي مدى حركي أكبر لعضلات الصدر.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=flat+dumbbell+press+shorts'
  },
  // الظهر
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
    name: 'تمرين التجديف بالدمبل لجهة واحدة (One Arm Dumbbell Row)',
    targetMuscle: 'الظهر (Lats & Mid Back)',
    category: 'IRON',
    description: 'تثبيت ركبة ويد على المقعد، وسحب الدمبل باليد الأخرى لأعلى بالتركيز على الظهر.',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=one+arm+dumbbell+row+shorts'
  },
  // الأرجل
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
    name: 'تمرين مرجحة الأرجل الخلفية (Leg Curl)',
    targetMuscle: 'الفخذ الخلفي (Hamstrings)',
    category: 'IRON',
    description: 'ثني الركبتين وسحب المقبض لأسفل لتفعيل وتقوية عضلات الأرجل الخلفية وعزلها.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=leg+curl+shorts'
  },
  {
    name: 'تمرين مد الأرجل الأمامية (Leg Extension)',
    targetMuscle: 'الفخذ الأمامي (Quads)',
    category: 'IRON',
    description: 'رفع الأرجل للأعلى ضد المقاومة للتركيز الكامل على عزل الفخذين الأماميين.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=leg+extension+shorts'
  },
  // الأكتاف
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
    name: 'تمرين الرفرفة الخلفية بالدمبل (Rear Delt Flyes)',
    targetMuscle: 'الكتف الخلفي (Rear Delts)',
    category: 'IRON',
    description: 'الانحناء للأمام وفتح الذراعين بالدمبلز لتفعيل عضلات الكتف الخلفية وحمايتها من الإصابات.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=rear+delt+flyes+shorts'
  },
  // الأذرع
  {
    name: 'تمرين تبادل بايسبس بالدمبل (Dumbbell Bicep Curl)',
    targetMuscle: 'بايسبس (Biceps)',
    category: 'IRON',
    description: 'ثني الذراع للأعلى مع لف المعصم لتشغيل وتقوية ذروة عضلة البايسبس.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=bicep+curl+shorts'
  },
  {
    name: 'تمرين بايسبس بالبار مطرقة (Barbell Curl)',
    targetMuscle: 'بايسبس (Biceps)',
    category: 'IRON',
    description: 'رفع بار EZ أو البار المستقيم للأعلى بكلتا اليدين لتشغيل كامل عضلات الباي والساعد.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+curl+shorts'
  },
  {
    name: 'تمرين ضغط الترايسبس بالكيبل (Tricep Pushdown)',
    targetMuscle: 'ترايسبس (Triceps)',
    category: 'IRON',
    description: 'سحب الحبل للأسفل مع تثبيت الكوعين على الجانبين لتفجير وتقوية الترايسبس.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=tricep+pushdown+shorts'
  },
  {
    name: 'تمرين سحق الجمجمة للتراي (Skull Crushers)',
    targetMuscle: 'ترايسبس (Triceps)',
    category: 'IRON',
    description: 'الاستلقاء على المقعد، ثني المرفقين ونزول الوزن خلف الرأس ثم دفعه للأعلى بالتركيز على التراي.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=skull+crushers+shorts'
  },

  // --- CALISTHENICS / BODYWEIGHT (مقاومة منزلية بوزن الجسم) ---
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
    description: 'سحب الجسم للأعلى حتى يتجاوز الذقن مستوى العارضة، لتقوية عضلات السحب الظهرية.',
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
  {
    name: 'تمرين القرفصاء بوزن الجسم (Bodyweight Squats)',
    targetMuscle: 'الأرجل (Legs)',
    category: 'CALISTHENICS',
    description: 'القرفصاء الأساسية بدون وزن إضافي، مثالية للمبتدئين وبناء مرونة المفاصل.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=bodyweight+squats+shorts'
  },
  {
    name: 'تمرين ثني البطن الكلاسيكي (Abdominal Crunches)',
    targetMuscle: 'البطن العلوي (Upper Abs)',
    category: 'CALISTHENICS',
    description: 'الاستلقاء مع ثني الركبتين، ورفع الجزء العلوي من الظهر قليلاً لعصر عضلات البطن.',
    imageUrl: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=abdominal+crunches+shorts'
  },
  {
    name: 'رفع الأرجل مستلقياً (Lying Leg Raises)',
    targetMuscle: 'البطن السفلي (Lower Abs)',
    category: 'CALISTHENICS',
    description: 'الاستلقاء على الظهر ورفع الأرجل بشكل مستقيم للأعلى بزاوية 90 درجة للتركيز على البطن السفلي.',
    imageUrl: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=lying+leg+raises+shorts'
  },
  {
    name: 'تمرين الجلوس على الحائط الثابت (Wall Sit)',
    targetMuscle: 'الفخذ الأمامي (Quads)',
    category: 'CALISTHENICS',
    description: 'إسناد الظهر على الجائط والثبات في وضعية الجلوس (زاوية 90 درجة) لبناء قوة التحمل.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=wall+sit+exercise+shorts'
  },

  // --- RESISTANCE BANDS (حبال المقاومة) ---
  {
    name: 'تمرين سحب الحبل للخارج (Band Pull-Apart)',
    targetMuscle: 'أعلى الظهر والكتف الخلفي (Upper Back)',
    category: 'CALISTHENICS',
    description: 'إمساك حبل المقاومة باليدين وسحبه للخارج بقوة لفتح الذراعين وتفعيل عضلات أعلى الظهر.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=band+pull+apart+shorts'
  },
  {
    name: 'تمرين ثني البايسبس بالحبل (Band Bicep Curl)',
    targetMuscle: 'بايسبس (Biceps)',
    category: 'CALISTHENICS',
    description: 'الوقوف على حبل المقاومة وسحب المقابض للأعلى لتمرين البايسبس بنمط تدرج الشد.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=band+bicep+curl+shorts'
  },
  {
    name: 'تمرين ضغط الكتف بحبل المقاومة (Band Shoulder Press)',
    targetMuscle: 'الأكتاف (Shoulders)',
    category: 'CALISTHENICS',
    description: 'الوقوف على الحبل ودفع المقابض لأعلى الرأس لتمرين الكتف بضغط مالي بدون أوزان.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=band+shoulder+press+shorts'
  },

  // --- HIIT (تمارين الشدة العالية) ---
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
    description: 'من وضعية الضغط، تبادل سحب الركبتين بسرعة باتجاه الصدر لمحاكاة الجري وسرعة الحركة.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=mountain+climbers+shorts'
  },
  {
    name: 'تمرين القفز المتفجر (Squat Jumps)',
    targetMuscle: 'الأرجل وحرق الدهون (Legs & Cardio)',
    category: 'HIIT',
    description: 'النزول في وضعية قرفصاء عميقة ثم القفز للأعلى بأقصى قوة والانفجار لرفع التحمل العضلي.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=squat+jumps+shorts'
  },
  {
    name: 'تمرين تبادل الطعن بالقفز (Lunge Jumps)',
    targetMuscle: 'الأرجل وحرق الدهون (Legs & Cardio)',
    category: 'HIIT',
    description: 'تبادل وضعية الطعن للأرجل بالقفز في الهواء لتقوية العضلات وعناصر التوازن وسرعة الاستجابة.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=lunge+jumps+shorts'
  },
  {
    name: 'الجري في المكان مع رفع الركبتين (High Knees)',
    targetMuscle: 'كارديو وتحمل (Cardio)',
    category: 'HIIT',
    description: 'الركض السريع في موضعك مع سحب الركبتين لأعلى مستوى ممكن لتفعيل حرق الدهون.',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=high+knees+exercise+shorts'
  },

  // --- YOGA (اليوجا والمرونة) ---
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
    description: 'وضعية استراحة وإطالة خفيفة لأسفل الظهر والعمود الفقري والتخلص من الإجهاد الجسدي.',
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
  {
    name: 'وضعية المحارب الأولى (Warrior I Pose)',
    targetMuscle: 'الأرجل والتوازن (Legs & Balance)',
    category: 'YOGA',
    description: 'الطعن بقدم للأمام ورفع الذراعين للأعلى، وضعية قوية لتقوية الجزء السفلي وتصفية الذهن.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=warrior+1+yoga+shorts'
  },
  {
    name: 'وضعية الشجرة للتركيز (Tree Pose)',
    targetMuscle: 'التوازن والركبة (Balance & Ankle)',
    category: 'YOGA',
    description: 'التوازن على قدم واحدة ووضع باطن القدم الأخرى على الفخذ، لتفعيل التوازن البصري والجسدي.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=tree+pose+yoga+shorts'
  },
  {
    name: 'وضعية القطة والبقرة للمرونة (Cat-Cow Stretch)',
    targetMuscle: 'مرونة العمود الفقري (Spine Flexibility)',
    category: 'YOGA',
    description: 'الانتقال بالتبادل بين تقويس الظهر للأعلى وللأسفل لتزييت العمود الفقري وتليين الفقرات.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=cat+cow+stretch+shorts'
  },

  // --- PILATES (البيلاتس وتقوية الجذع) ---
  {
    name: 'المئة في البيلاتس (Pilates Hundred)',
    targetMuscle: 'عضلات البطن العميقة (Core & Abs)',
    category: 'PILATES',
    description: 'الاستلقاء مع رفع الرأس والأكتاف والأرجل، وتحريك الذراعين لأعلى وأسفل مع تنفس منتظم وعميق.',
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
  },
  {
    name: 'جسر الكتف في البيلاتس (Shoulder Bridge)',
    targetMuscle: 'الأرداف والبطن الخلفي (Glutes & Hamstrings)',
    category: 'PILATES',
    description: 'الاستلقاء ورفع الحوض للأعلى وتفعيل المؤخرة وأسفل الظهر مع الحفاظ على خط مستقيم.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pilates+shoulder+bridge+shorts'
  },
  {
    name: 'تمرين الركلة الجانبية (Side Kick)',
    targetMuscle: 'عضلات الورك الجانبية (Hip Abductors)',
    category: 'PILATES',
    description: 'الاستلقاء على الجانب ورفع الرجل العليا بحركات بطيئة ودائرية لتقوية عضلات الحوض والاتزان.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=pilates+side+kick+shorts'
  },

  // --- CARDIO & STRETCHING (كارديو وتمدد استشفائي) ---
  {
    name: 'تمرين قفز الحبل (Jump Rope)',
    targetMuscle: 'لياقة هوائية وبطات الرجل (Cardio & Calves)',
    category: 'CARDIO',
    description: 'تمرين كلاسيكي رائع لزيادة التحمل وحرق السعرات وتقوية عضلات الساق والبطات وتنمية خفة الحركة.',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=jump+rope+tricks+shorts'
  },
  {
    name: 'قفز الرافعات (Jumping Jacks)',
    targetMuscle: 'كامل الجسم والكارديو (Full Body & Cardio)',
    category: 'CARDIO',
    description: 'فتح القدمين والذراعين مع القفز المتكرر لرفع حرارة الجسم وتهيئة القلب للتمرين الشاق.',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=jumping+jacks+shorts'
  },
  {
    name: 'الجري الثابت الخفيف (Steady State Jogging)',
    targetMuscle: 'تحسين نبضات القلب والتحمل (Cardio)',
    category: 'CARDIO',
    description: 'الهرولة المستمرة بشدة متوسطة لبناء السعة الهوائية ومستوى الاستشفاء القلبي.',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=running+form+tips+shorts'
  },
  {
    name: 'تمدد عضلات الفخذ الخلفية (Hamstring Stretch)',
    targetMuscle: 'الفخذ الخلفي (Flexibility)',
    category: 'CARDIO',
    description: 'مد ساق واحدة للأمام والانحناء لمد عضلات الأوتار الخلفية، ممتاز لمنع الشد العضلي.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=hamstring+stretch+shorts'
  },
  {
    name: 'تمدد الصدر والأكتاف (Chest Opener)',
    targetMuscle: 'الصدر والأكتاف (Chest Flexibility)',
    category: 'CARDIO',
    description: 'تشبيك اليدين خلف الظهر ودفعهما للخارج لفتح الصدر والأكتاف بعد تمارين الدفع الثقيلة.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/results?search_query=chest+opener+stretch+shorts'
  }
];

async function main() {
  console.log('Start seeding expanded exercise library...');
  for (const ex of exercises) {
    await prisma.exerciseLibrary.upsert({
      where: { name: ex.name },
      update: {
        targetMuscle: ex.targetMuscle,
        category: ex.category,
        description: ex.description,
        imageUrl: ex.imageUrl,
        videoUrl: ex.videoUrl,
      },
      create: ex,
    });
  }
  console.log(`Seeding completed successfully! Seeded ${exercises.length} professional exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
