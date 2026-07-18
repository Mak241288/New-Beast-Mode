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
  - الجنس: ${user.gender || 'غير حدد'}
  - الوزن الحالي: ${user.currentWeight || 'غير محدد'} كجم، الوزن المستهدف: ${user.targetWeight || 'غير محدد'} كجم
  - الطول: ${user.height || 'غير محدد'} سم
  - مكان التمرين المفضل: ${options.workoutLocation}
  - الأدوات المتوفرة لدى المستخدم: ${options.equipment.join(', ') || 'وزن الجسم فقط'}
  - مستوى اللياقة البدنية: ${options.level}
  - الحالة الصحية والإصابات: ${user.medicalConditions || 'سليم ولا يعاني من إصابات'}
  - تاريخ بداية الجدول: ${options.startDate.toDateString()}
  - عدد أسابيع البرنامج: ${options.durationWeeks} أسابيع.

  أعد النتيجة بصيغة JSON حصراً مطابقة تماماً للمواصفات التالية:
  {
    "title": "عنوان الجدول الرياضي الإجمالي المبتكر للأسابيع بالكامل",
    "weeklyTips": "النصيحة الأسبوعية العامة للالتزام والاستمرار",
    "days": [
      {
        "dayIndex": 1,
        "title": "مسمى اليوم الجذاب والحماسي (مثال: اليوم 1: تفجير الصدر والتراي)",
        "focusArea": "العضلات المستهدفة اليوم (مثال: الصدر، الأكتاف، الترايسبس)",
        "dayTips": "نصائح إحماء وتأهيل خاصة بهذا اليوم",
        "isRestDay": false,
        "exercises": [
          {
            "name": "اسم التمرين باللغة العربية مع الاسم الإنجليزي",
            "targetMuscle": "العضلة المستهدفة بدقة",
            "category": "تصنيف التمرين: IRON، YOGA، PILATES، HIIT، CARDIO، CALISTHENICS",
            "sets": 3,
            "reps": "تكرارات أو زمن متطور (مثال: 8-10 تكرار أو 30 ثانية)",
            "weight": "الوزن المقترح (مثال: 10 كجم أو وزن الجسم)",
            "exerciseTips": "نصائح دقيقة للأداء الصحيح للتمرين"
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
    console.error('Error generating workout plan via Groq:', error);
    throw new Error('فشل توليد الجدول الرياضي بالذكاء الاصطناعي.');
  }
};

// 2. AI Profile Adjustment Advice
export const getProfileAdviceAI = async (oldUser: any, updatedUser: any): Promise<string> => {
  const prompt = `
  أنت مدرب رياضي وطبيب علاج طبيعي بخبرة 66 عاماً.
  المستخدم قام بتحديث ملفه الشخصي كالتالي:
  - الوزن السابق: ${oldUser.currentWeight || 'غير محدد'} كجم، الوزن الجديد: ${updatedUser.currentWeight || 'غير محدد'} كجم.
  - موقع التمرين السابق: ${oldUser.workoutLocation || 'غير محدد'}، الجديد: ${updatedUser.workoutLocation || 'غير محدد'}.
  - الحالة الطبية/الإصابات السابقة: ${oldUser.medicalConditions || 'لا يوجد'}، الجديدة: ${updatedUser.medicalConditions || 'لا يوجد'}.

  بناءً على هذه التغييرات، اكتب فقرة قصيرة وجذابة باللغة العربية تشرح فيها للمستخدم:
  1. تأثير هذه التغييرات على برنامجه الرياضي الحالي.
  2. ما يقترحه الخبير الرياضي من تعديلات (مثال: إذا تغير الوزن أو مكان التمرين أو أصيب بمفصل).
  اجعل الأسلوب محفزاً ومهنياً للغاية ولا يتجاوز 150 كلمة.
  `;

  try {
    return await callGroq(prompt, false);
  } catch (error) {
    console.error('Error generating AI profile advice via Groq:', error);
    return 'بناءً على التغييرات الجديدة في ملفك الشخصي، نقترح إعادة توليد جدول التمارين ليتناسب مع موقع تمرينك وحالتك البدنية المحدثة.';
  }
};

// 3. Upgrade Workout Plan (Progressive Overload)
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
