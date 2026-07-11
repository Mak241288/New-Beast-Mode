import prisma from './db';

export interface WorkoutPlanOptions {
  durationWeeks: number;
  startDate: Date;
  workoutLocation: 'HOME' | 'GYM';
  equipment: string[];
  level: string; // beginner, intermediate, advanced
  additionalQuestions: any; // medical conditions, goals etc.
}

/**
 * Generic helper to make calls to Groq API using Llama 3.3 70B model (OpenAI compatible)
 */
export const callGroq = async (prompt: string, jsonMode: boolean = false, customMessages: any[] = []): Promise<string> => {
  const groqKey = process.env.GROQ_API_KEY || '';
  if (!groqKey) {
    throw new Error('مفتاح Groq API غير متوفر في ملف البيئة .env');
  }

  const messages = customMessages.length > 0 
    ? customMessages 
    : [{ role: 'user', content: prompt }];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const data: any = await response.json();
  if (!response.ok) {
    console.error('[Groq Error Details]:', data);
    throw new Error(data.error?.message || 'فشلت عملية التوليد عبر Groq');
  }

  return data.choices[0]?.message?.content || '';
};

// 1. Generate Workout Plan using AI (66 years experience Coach & PT)
export const generateWorkoutPlanAI = async (userId: number, options: WorkoutPlanOptions) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('المستخدم غير موجود');

  const prompt = `
  أنت مدرب رياضي وطبيب علاج طبيعي عريق جداً ولديك خبرة 66 عاماً في تدريب الأبطال وتأهيل الرياضيين.
  نريد تصميم جدول رياضي متكامل للمستخدم التالي بياناته:
  - الاسم: ${user.name}
  - الجنس: ${user.gender || 'غير محدد'}
  - الوزن الحالي: ${user.currentWeight || 'غير محدد'} كجم، الوزن المستهدف: ${user.targetWeight || 'غير محدد'} كجم
  - الطول: ${user.height || 'غير محدد'} سم
  - مكان التمرين المفضل: ${options.workoutLocation}
  - الأدوات المتوفرة لدى المستخدم: ${options.equipment.join(', ') || 'وزن الجسم فقط'}
  - مستوى اللياقة البدنية: ${options.level}
  - الحالة الصحية والإصابات: ${user.medicalConditions || 'سليم ولا يعاني من إصابات'}
  - تاريخ بداية الجدول: ${options.startDate.toDateString()}
  - عدد أسابيع البرنامج: ${options.durationWeeks} أسابيع.

  شروط تصميم الجدول الصارمة:
  1. يجب أن تكون مسميات الأسابيع والأيام حماسية، جذابة، ومحفزة جداً باللغة العربية (مثال: "الأسبوع 1: إطلاق القوة الكامنة"، "اليوم 1: تفجير الصدر والأكتاف - درع الحديد").
  2. التمارين باليوم الواحد يجب أن تكون متناسقة رياضياً وتشريحياً (مثل سحب/دفع/أرجل أو جزء علوي/سفلي).
  3. يمنع تكرار نفس التمرين بشكل مكرر وممل في نفس الأسبوع إلا بمسوغ رياضي واضح.
  4. يجب صياغة تكرارات وجولات مناسبة للمستوى والأهداف ومكان التمرين (المنزل يحتاج تكرارات أعلى أو سوبرست، الجيم يركز على زيادة الأحمال التدريجية).
  5. يجب إدراج أنواع رياضية متنوعة حسب الحالة والأدوات (مقاومة، حديد، HIIT، بيلاتس، يوجا، كارديو، تمدد).
  6. أضف نصائح دقيقة لكل تمرين لكيفية الأداء السليم (فارغ من الأخطاء)، ونصيحة إحماء وتغذية لكل يوم، ونصيحة للالتزام لكل أسبوع.

  أعد النتيجة بصيغة JSON حصراً مطابقة تماماً للمواصفات التالية:
  {
    "title": "عنوان الجدول الرياضي الإجمالي المبتكر للأسابيع بالكامل",
    "weeklyTips": "النصيحة الأسبوعية العامة للالتزام والاستمرار",
    "days": [
      {
        "dayIndex": 1, 
        "title": "مسمى اليوم الجذاب والحماسي (مثال: اليوم 1: تفجير الصدر والتراي)",
        "focusArea": "العضلات المستهدفة اليوم (مثال: الصدر، الأكتاف، الترايسبس)",
        "dayTips": "نصائح إحماء وتأهيل وتغذية خاصة بهذا اليوم فقط",
        "isRestDay": false,
        "exercises": [
          {
            "name": "اسم التمرين باللغة العربية مع الاسم الإنجليزي الشهير بين قوسين",
            "targetMuscle": "العضلة المستهدفة بدقة لهذا التمرين",
            "category": "تصنيف التمرين: IRON (حديد جيم)، YOGA (يوجا)، PILATES (بيلاتس)، HIIT (شدة عالية)، CARDIO (كارديو)، CALISTHENICS (وزن جسم ومقاومة منزلية)",
            "sets": 3,
            "reps": "عدد التكرارات أو الزمن (مثال: 12-15 أو 30 ثانية أو أقصى تكرار)",
            "weight": "الوزن المقترح أو طريقة المقاومة (مثال: وزن الجسم، 10 كجم، حبل مقاومة متوسط)",
            "exerciseTips": "نصائح الأداء السليم وتفادي الإصابة لهذا التمرين بالتحديد"
          }
        ]
      }
    ]
  }

  ملاحظة: إذا كان اليوم يوم راحة، اجعل "isRestDay": true وقائمة التمارين "exercises" فارغة. قم بتوليد جدول لـ 7 أيام تمثل أسبوعاً نموذجياً يتكرر ويتطور خلال الـ ${options.durationWeeks} أسابيع.
  `;

  try {
    const resultText = await callGroq(prompt, true);
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Error generating workout plan via Groq:', error);
    throw new Error('فشل الذكاء الاصطناعي في توليد جدول التمارين. يرجى التأكد من مفتاح الـ API وصياغة الطلب.');
  }
};

// 2. Generate Nutrition Plan using AI (50 years experience Sports Nutritionist & MD)
export const generateNutritionPlanAI = async (userId: number, workoutPlanTitle: string, isTrainingDay: boolean, dayTitle: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('المستخدم غير موجود');

  const prompt = `
  أنت دكتور استشاري وخبير تغذية علاجية ورياضية بخبرة 50 عاماً في تصميم الأنظمة الغذائية للرياضيين وأصحاب الحالات الطبية الخاصة.
  نريد تصميم نظام وجبات يومي متكامل للمستخدم التالي بياناته:
  - الاسم: ${user.name}
  - الجنس: ${user.gender || 'غير محدد'}
  - الوزن الحالي: ${user.currentWeight || 'غير محدد'} كجم، الوزن المستهدف: ${user.targetWeight || 'غير محدد'} كجم
  - الطول: ${user.height || 'غير محدد'} سم
  - تفضيلات الطعام (المحبب): ${user.foodPreferences || 'لا يوجد تفضيل محدد'}
  - الأطعمة المكروهة أو الحساسيات: ${user.foodDislikes || 'لا يوجد أطعمة مكروهة'}، الحساسية: ${user.foodAllergies || 'لا يوجد'}
  - الحالات الطبية والتحاليل المخبرية المذكورة: ${user.medicalConditions || 'سليم'}، التحاليل: ${user.labResults || 'لا يوجد'}
  
  معلومات هذا اليوم الرياضي:
  - هل هو يوم تمرين؟ ${isTrainingDay ? 'نعم، يوم تمرين' : 'لا، يوم راحة واستشفاء'}
  - عنوان اليوم الرياضي وتمارينه: ${dayTitle} (الخطة الرياضية العامة: ${workoutPlanTitle})

  شروط تصميم النظام الغذائي:
  1. يجب أن يتوافق النظام الغذائي تماماً مع حالة التمرين:
     - في أيام التمرين: وجبات غنية بالبروتين لبناء العضلات، وكربوهيدرات معقدة قبل التمرين للطاقة، ووجبة استشفاء بعد التمرين.
     - في أيام الراحة: تقليل طفيف في الكربوهيدرات، تركيز على الدهون الصحية والبروتين، ووجبات سهلة الهضم للاستشفاء.
  2. تجنب تام لأي أطعمة مكروهة أو تسبب حساسية للمستخدم.
  3. خذ بعين الاعتبار التحاليل الطبية (مثل: إذا كان يعاني من نقص فيتامين د، أو كوليسترول مرتفع، اقترح أطعمة تساعد في علاجه).
  4. حساب السعرات الحرارية المقترحة وأهداف الماكروز (بروتين، كربوهيدرات، دهون) بدقة بناءً على وزنه وطوله وحالة التمرين اليوم.

  أعد النتيجة بصيغة JSON حصراً مطابقة تماماً للمواصفات التالية:
  {
    "caloriesGoal": 2300, 
    "proteinGoal": 160, 
    "carbsGoal": 240, 
    "fatGoal": 70, 
    "breakfast": "وجبة الفطور بالتفصيل باللغة العربية مع توضيح الكميات التقريبية والفوائد",
    "lunch": "وجبة الغداء بالتفصيل باللغة العربية مع توضيح الكميات التقريبية والفوائد",
    "dinner": "وجبة العشاء بالتفصيل باللغة العربية مع توضيح الكميات التقريبية والفوائد",
    "snacks": "الوجبات الخفيفة والسناك المقترح (مثل بعد التمرين أو بين الوجبات) بالتفصيل والكميات"
  }
  `;

  try {
    const resultText = await callGroq(prompt, true);
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Error generating nutrition plan via Groq:', error);
    throw new Error('فشل الذكاء الاصطناعي في توليد نظام التغذية.');
  }
};

// 3. AI Text Meal Parser (يحول الوجبة النصية لسعرات وماكروز)
export const parseMealTextAI = async (mealText: string) => {
  const prompt = `
  أنت خبير تغذية وحاسب سعرات حرارية ذكي.
  المستخدم كتب أنه تناول الوجبة التالية: "${mealText}".
  قم بتحليل الوجبة وتقدير كمية السعرات الحرارية (Calories)، والبروتين (Protein) بالجرام، والكربوهيدرات (Carbs) بالجرام، والدهون (Fat) بالجرام لهذه الوجبة.
  كن واقعياً ومنطقياً في التقديرات بناءً على المكونات الشائعة.
  
  أعد النتيجة بصيغة JSON حصراً مطابقة تماماً للمواصفات التالية:
  {
    "description": "وصف مبسط باللغة العربية للوجبة التي تم تحليلها مع الكميات المفترضة (مثال: صدر دجاج مشوي 150 جرام مع كوب أرز أبيض)",
    "calories": 450, 
    "protein": 40, 
    "carbs": 45, 
    "fat": 10 
  }
  `;

  try {
    const resultText = await callGroq(prompt, true);
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Error parsing meal text via Groq:', error);
    throw new Error('فشل الذكاء الاصطناعي في تحليل الوجبة.');
  }
};

// 4. AI Chat Consultation (مستشار وطبيب ومدرب عريق 66 سنة خبرة)
export const chatConsultationAI = async (userId: number, chatHistory: { sender: string; text: string }[], userMessage: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workoutPlans: {
        where: { active: true },
        include: { dayWorkouts: { include: { exercises: true } } }
      }
    }
  });

  if (!user) throw new Error('المستخدم غير موجود');

  const activePlan = user.workoutPlans[0];
  let activePlanDetails = 'لا يوجد جدول تمارين نشط حالياً.';
  if (activePlan) {
    activePlanDetails = `الجدول النشط: ${activePlan.title} (${activePlan.durationWeeks} أسابيع).\n`;
    activePlan.dayWorkouts.forEach(day => {
      if (!day.isRestDay) {
        activePlanDetails += `- ${day.title} (يستهدف: ${day.focusArea}): فيه تمارين مثل: ${day.exercises.map(e => e.name).join(', ')}\n`;
      } else {
        activePlanDetails += `- ${day.title}: يوم راحة واستشفاء\n`;
      }
    });
  }

  const systemContext = `
  أنت البروفيسور والمدرب العريق "الكابتن د. صخر". لديك خبرة 66 عاماً كمدرب أبطال أولمبيين، طبيب علاج طبيعي وإصابات ملاعب، ومستشار تغذية رياضية.
  تتحدث باللغة العربية بأسلوب وقور، محفز، دافئ ومهني للغاية. تعطي نصائح برمجية دقيقة للغاية مبنية على العلم والخبرة العملية الطويلة.
  بيانات المستخدم الحالي الذي يستشيرك:
  - الاسم: ${user.name}
  - الجنس: ${user.gender || 'غير محدد'}
  - الوزن الحالي: ${user.currentWeight || 'غير محدد'} كجم، الوزن المستهدف: ${user.targetWeight || 'غير محدد'} كجم
  - الطول: ${user.height || 'غير محدد'} سم
  - موقع التمرين الحالي: ${user.workoutLocation || 'غير محدد'}
  - المشاكل الصحية والإصابات: ${user.medicalConditions || 'سليم بالكامل'}
  - التفضيلات الغذائية والأطعمة المكروهة: التفضيل: ${user.foodPreferences || 'لا يوجد'}، المكروه: ${user.foodDislikes || 'لا يوجد'}
  - جدول تمارين المستخدم الحالي النشط:
  ${activePlanDetails}

  عندما يسألك المستخدم:
  - كن دائماً حريصاً على سلامته البدنية أولاً. إذا اشتكى من ألم حاد، انصحه ببدائل أو بزيارة الطبيب عند الضرورة.
  - إذا سألك عن استبدال تمرين صعب أو جهاز غير متوفر، اقترح فوراً بدائل ممتازة بالدمبلز أو بوزن الجسم.
  - إذا استفسر عن الوجبات، قدم حلولاً تناسب ما يحبه ويكرهه.
  - استخدم معلومات وزنه وطوله وجدوله الحالي لكي تكون الإجابة مخصصة 100% له وليست عامة.
  `;

  // Format history for Groq (OpenAI format)
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.sender === 'USER' ? 'user' : 'assistant',
    content: msg.text
  }));

  const messages = [
    { role: 'system', content: systemContext },
    ...formattedHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const reply = await callGroq('', false, messages);
    return reply || 'عذراً، لم أستطع معالجة ردك الآن. كيف يمكنني مساعدتك بطريقة أخرى؟';
  } catch (error) {
    console.error('Error in chat consultation via Groq:', error);
    throw new Error('فشل الاتصال بمستشار الذكاء الاصطناعي.');
  }
};

// 5. AI Profile Adjustment Advice
export const getProfileAdviceAI = async (oldUser: any, updatedUser: any): Promise<string> => {
  const prompt = `
  أنت مدرب رياضي وطبيب علاج طبيعي بخبرة 66 عاماً، وخبير تغذية رياضية وصحية بخبرة 50 عاماً.
  المستخدم قام بتحديث ملفه الشخصي كالتالي:
  - الوزن السابق: ${oldUser.currentWeight || 'غير محدد'} كجم، الوزن الجديد: ${updatedUser.currentWeight || 'غير محدد'} كجم.
  - موقع التمرين السابق: ${oldUser.workoutLocation || 'غير محدد'}، الجديد: ${updatedUser.workoutLocation || 'غير محدد'}.
  - الحالة الطبية/الإصابات السابقة: ${oldUser.medicalConditions || 'لا يوجد'}، الجديدة: ${updatedUser.medicalConditions || 'لا يوجد'}.
  - تفضيلات الأكل السابقة: ${oldUser.foodPreferences || 'لا يوجد'}، الجديدة: ${updatedUser.foodPreferences || 'لا يوجد'}.
  - الأطعمة المكروهة السابقة: ${oldUser.foodDislikes || 'لا يوجد'}، الجديدة: ${updatedUser.foodDislikes || 'لا يوجد'}.

  بناءً على هذه التغييرات، اكتب فقرة قصيرة وجذابة باللغة العربية تشرح فيها للمستخدم:
  1. تأثير هذه التغييرات على برنامجه الرياضي والغذائي الحالي.
  2. ما يقترحه الخبير الرياضي والغذائي من تعديلات (مثال: إذا تغير الوزن أو مكان التمرين أو أصيب بمفصل أو غير تفضيل طعام).
  اجعل الأسلوب محفزاً ومهنياً للغاية ولا يتجاوز 150 كلمة.
  `;

  try {
    return await callGroq(prompt, false);
  } catch (error) {
    console.error('Error generating AI profile advice via Groq:', error);
    return 'بناءً على التغييرات الجديدة في ملفك الشخصي، نقترح إعادة توليد جدول التمارين والتغذية ليتناسب مع موقع تمرينك وحالتك البدنية والغذائية المحدثة.';
  }
};

// 6. Upgrade Workout Plan (Progressive Overload)
export const upgradeWorkoutPlanAI = async (userId: number, activePlanTitle: string, completionRate: number, lang?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('المستخدم غير موجود');

  const isEn = lang === 'en';
  const prompt = isEn ? `
  You are an expert fitness coach and physical therapist with 66 years of experience.
  The user ${user.name} successfully finished the previous workout plan titled "${activePlanTitle}".
  - Adherence rate: ${completionRate.toFixed(1)}%.
  - Fitness state: ${user.currentWeight ? 'Weight: ' + user.currentWeight + ' kg' : ''}, Location: ${user.workoutLocation || 'GYM'}.

  Based on this achievement, generate a completely new, progressive workout routine representing the "next level" (Progressive Overload).
  - If adherence was high (>75%), increase difficulty, sets/reps, or weights.
  - If adherence was low, focus on building fundamentals and adapting difficult exercises.
  
  You MUST return the entire response in English.

  Format the output strictly as a JSON object matching this structure:
  {
    "title": "Title of the new progressive workout plan",
    "weeklyTips": "New weekly tips for handling the extra intensity or maintaining consistency",
    "days": [
      {
        "dayIndex": 1,
        "title": "Motivating and attractive name of the training day",
        "focusArea": "Targeted muscles",
        "dayTips": "Warm-up and recovery tips for this day",
        "isRestDay": false,
        "exercises": [
          {
            "name": "Exercise name",
            "targetMuscle": "Target muscle",
            "category": "Exercise category: IRON, YOGA, PILATES, HIIT, CARDIO, CALISTHENICS",
            "sets": 3,
            "reps": "Target reps or time (e.g. '8-10 reps' or '30s')",
            "weight": "Suggested weight (e.g. '17.5kg' or 'Bodyweight')",
            "exerciseTips": "Performance tip for correct form"
          }
        ]
      }
    ]
  }
  ` : `
  أنت مدرب رياضي وطبيب علاج طبيعي بخبرة 66 عاماً.
  المستخدم ${user.name} أنهى بنجاح جدول التمارين السابق الذي عنوانه "${activePlanTitle}".
  - نسبة الالتزام الإجمالية بإدخال التمارين وإكمالها: ${completionRate.toFixed(1)}%.
  - مستوى لياقته: ${user.currentWeight ? 'الوزن الحالي: ' + user.currentWeight + ' كجم' : ''}، موقع تمرينه: ${user.workoutLocation || 'GYM'}.

  بناءً على هذا الإنجاز، نريد توليد جدول تمارين جديد تماماً يمثل "المرحلة القادمة" المتطورة (Progressive Overload).
  - إذا كانت نسبة التزامه عالية (>75%)، زد مستوى الشدة والأوزان أو التمارين تدريجياً.
  - إذا كانت نسبة الالتزام منخفضة، ركز على بناء الأساسيات وتعديل التمارين الصعبة لجعلها أكثر إتاحة وحماساً.
  - التزم بمسميات أيام وأسابيع جذابة ومحفزة للغاية باللغة العربية.

  أعد النتيجة بصيغة JSON حصراً مطابقة تماماً للمواصفات التالية:
  {
    "title": "عنوان الجدول الرياضي الجديد المتطور لرفع الصعوبة تدريجياً",
    "weeklyTips": "نصائح الأسبوع الجديد للتعامل مع الصعوبة الإضافية أو الاستمرار",
    "days": [
      {
        "dayIndex": 1,
        "title": "مسمى اليوم الجديد الجذاب والمحفز",
        "focusArea": "العضلات المستهدفة",
        "dayTips": "نصائح إحماء واستشفاء خاصة بهذا اليوم",
        "isRestDay": false,
        "exercises": [
          {
            "name": "اسم التمرين باللغة العربية مع الاسم الإنجليزي",
            "targetMuscle": "العضلة المستهدفة بدقة",
            "category": "تصنيف التمرين: IRON، YOGA، PILATES، HIIT، CARDIO، CALISTHENICS",
            "sets": 3,
            "reps": "تكرارات أو زمن متطور (مثال: زيادة جولة أو تقليل تكرارات مع رفع أوزان)",
            "weight": "الوزن الجديد المقترح المتطور (مثال: زيادة 2.5 كجم عن السابق أو إبقاء وزن الجسم للمقاومة)",
            "exerciseTips": "نصائح دقيقة للأداء الصحيح للنسخة المطورة من التمرين"
          }
        ]
      }
    ]
  }
  `;

  try {
    const resultText = await callGroq(prompt, true);
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Error upgrading workout plan via Groq:', error);
    throw new Error('فشل ترقية الجدول الرياضي بالذكاء الاصطناعي.');
  }
};
