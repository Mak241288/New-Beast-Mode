import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';

const JWT_SECRET = process.env.JWT_SECRET || 'beastmode_super_secret_jwt_key_2026_fitness_nutrition';

// Generates JWT Token
const generateToken = (id: number, email: string) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال الاسم، البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id, user.email),
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id, user.email),
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        birthDate: true,
        height: true,
        currentWeight: true,
        targetWeight: true,
        medicalConditions: true,
        labResults: true,
        foodAllergies: true,
        foodPreferences: true,
        foodDislikes: true,
        workoutLocation: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الملف الشخصي' });
  }
};

// @desc    Update user profile & check for plan adjustments
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const {
    name,
    gender,
    birthDate,
    height,
    currentWeight,
    targetWeight,
    medicalConditions,
    labResults,
    foodAllergies,
    foodPreferences,
    foodDislikes,
    workoutLocation,
  } = req.body;

  try {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!oldUser) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    // Check if weight changed to log it
    const parsedWeight = currentWeight ? parseFloat(currentWeight) : null;
    if (parsedWeight && parsedWeight !== oldUser.currentWeight) {
      await prisma.weightLog.create({
        data: {
          userId: oldUser.id,
          weight: parsedWeight,
          notes: 'تحديث تلقائي من الملف الشخصي',
        },
      });
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : oldUser.name,
        gender: gender !== undefined ? gender : oldUser.gender,
        birthDate: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : oldUser.birthDate,
        height: height !== undefined ? (height ? parseFloat(height) : null) : oldUser.height,
        currentWeight: parsedWeight !== null ? parsedWeight : oldUser.currentWeight,
        targetWeight: targetWeight !== undefined ? (targetWeight ? parseFloat(targetWeight) : null) : oldUser.targetWeight,
        medicalConditions: medicalConditions !== undefined ? medicalConditions : oldUser.medicalConditions,
        labResults: labResults !== undefined ? labResults : oldUser.labResults,
        foodAllergies: foodAllergies !== undefined ? foodAllergies : oldUser.foodAllergies,
        foodPreferences: foodPreferences !== undefined ? foodPreferences : oldUser.foodPreferences,
        foodDislikes: foodDislikes !== undefined ? foodDislikes : oldUser.foodDislikes,
        workoutLocation: workoutLocation !== undefined ? workoutLocation : oldUser.workoutLocation,
      },
    });

    // Determine if AI plan adjustment is needed
    // Triggered if weight, location, medical, or food preferences change
    const isWeightChanged = parsedWeight !== null && parsedWeight !== oldUser.currentWeight;
    const isLocationChanged = workoutLocation !== undefined && workoutLocation !== oldUser.workoutLocation;
    const isMedicalChanged = medicalConditions !== undefined && medicalConditions !== oldUser.medicalConditions;
    const isFoodPreferencesChanged = foodPreferences !== undefined && foodPreferences !== oldUser.foodPreferences;
    const isFoodDislikesChanged = foodDislikes !== undefined && foodDislikes !== oldUser.foodDislikes;

    let needsPlanAdjustment = false;
    let adjustmentSuggestion = '';

    const hasActivePlans = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
    });

    if (
      hasActivePlans &&
      (isWeightChanged || isLocationChanged || isMedicalChanged || isFoodPreferencesChanged || isFoodDislikesChanged)
    ) {
      needsPlanAdjustment = true;

      // Call Gemini API to generate advice about the changes
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `
          أنت مدرب رياضي وطبيب علاج طبيعي بخبرة 66 عاماً، وخبير تغذية رياضية وصحية بخبرة 50 عاماً.
          المستخدم قام بتحديث ملفه الشخصي كالتالي:
          - الوزن السابق: ${oldUser.currentWeight} كجم، الوزن الجديد: ${updatedUser.currentWeight} كجم.
          - موقع التمرين السابق: ${oldUser.workoutLocation}، الجديد: ${updatedUser.workoutLocation}.
          - الحالة الطبية/الإصابات السابقة: ${oldUser.medicalConditions || 'لا يوجد'}، الجديدة: ${updatedUser.medicalConditions || 'لا يوجد'}.
          - تفضيلات الأكل السابقة: ${oldUser.foodPreferences || 'لا يوجد'}، الجديدة: ${updatedUser.foodPreferences || 'لا يوجد'}.
          - الأطعمة المكروهة السابقة: ${oldUser.foodDislikes || 'لا يوجد'}، الجديدة: ${updatedUser.foodDislikes || 'لا يوجد'}.

          بناءً على هذه التغييرات، اكتب فقرة قصيرة وجذابة باللغة العربية تشرح فيها للمستخدم:
          1. تأثير هذه التغييرات على برنامجه الرياضي والغذائي الحالي.
          2. ما يقترحه الخبير الرياضي والغذائي من تعديلات (مثال: إذا تغير الوزن أو مكان التمرين أو أصيب بمفصل أو غير تفضيل طعام).
          اجعل الأسلوب محفزاً ومهنياً للغاية ولا يتجاوز 150 كلمة.
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
          });

          adjustmentSuggestion = response.text || '';
        } catch (aiErr) {
          console.error('Error generating AI profile advice:', aiErr);
          adjustmentSuggestion = 'بناءً على التغييرات الجديدة في ملفك الشخصي، نقترح إعادة توليد جدول التمارين والتغذية ليتناسب مع موقع تمرينك وحالتك البدنية والغذائية المحدثة.';
        }
      } else {
        adjustmentSuggestion = 'لقد قمنا برصد تغييرات هامة في ملفك الشخصي. نوصي بتحديث جدول التمارين ونظام التغذية ليتناسب مع البيانات الجديدة.';
      }
    }

    res.status(200).json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate,
        height: updatedUser.height,
        currentWeight: updatedUser.currentWeight,
        targetWeight: updatedUser.targetWeight,
        medicalConditions: updatedUser.medicalConditions,
        labResults: updatedUser.labResults,
        foodAllergies: updatedUser.foodAllergies,
        foodPreferences: updatedUser.foodPreferences,
        foodDislikes: updatedUser.foodDislikes,
        workoutLocation: updatedUser.workoutLocation,
      },
      needsPlanAdjustment,
      adjustmentSuggestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الملف الشخصي' });
  }
};
