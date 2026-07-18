# Workout Location Toggle & Nutrition/Chat Clean-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Gym/Home workout toggle directly on the Dashboard that regenerates the active plan, and completely remove the deleted Nutrition and Chat/Consultation features to resolve all TypeScript and compilation errors.

**Architecture:** 
1. Update database schema (`User` model) to store onboarding metadata (`equipment`, `fitnessGoal`, `fitnessLevel`) so the plan can be regenerated with the user's correct preferences.
2. Fix backend compile errors by cleaning up the deleted Nutrition/Chat references in `authController.ts`, `statsController.ts`, `workoutController.ts`, and `aiService.ts`.
3. Add backend endpoint `POST /api/workout/toggle-location` to update user location preference and invoke the local Python workout generator.
4. Update frontend (`App.tsx` and `Dashboard.tsx`) to remove Nutrition and Chat pages and add the Gym/Home location toggle and loading overlay.

**Tech Stack:** React, TypeScript, Vite, Node.js, Express, Prisma, SQLite, Python.

## Global Constraints
- Support both Arabic and English languages.
- Ensure the TypeScript compiler (`tsc`) passes successfully.
- Maintain premium visual aesthetics (electric purple theme, glassmorphic loading overlays, smooth micro-animations).

---

### Task 1: Update Prisma Schema & Database

**Files:**
- Modify: [schema.prisma](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/prisma/schema.prisma)

- [ ] **Step 1: Add new fields to User model in schema.prisma**
  Modify [schema.prisma:10-27](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/prisma/schema.prisma#L10-L27) to add `equipment`, `fitnessGoal`, and `fitnessLevel` columns:
  ```prisma
  model User {
    id                Int             @id @default(autoincrement())
    email             String          @unique
    password          String
    name              String
    gender            String?
    birthDate         DateTime?
    height            Float?          // in cm
    currentWeight     Float?          // in kg
    targetWeight      Float?          // in kg
    medicalConditions String?         // text detailing injuries/ailments
    labResults        String?         // blood tests/health metrics
    workoutLocation   String?         // "HOME" or "GYM"
    equipment         String?         // comma-separated list of available equipment
    fitnessGoal       String?         // e.g. "HYPERTROPHY", "LOSE_WEIGHT"
    fitnessLevel      String?         // e.g. "beginner", "intermediate", "advanced"
    createdAt         DateTime        @default(now())
    updatedAt         DateTime        @updatedAt
    workoutPlans      WorkoutPlan[]
    weightLogs        WeightLog[]
  }
  ```

- [ ] **Step 2: Generate Prisma Client & Push Database Changes**
  Run commands to apply the new schema and update Prisma types:
  Run: `npx prisma db push`
  Expected: Successful sync with SQLite database.
  Run: `npx prisma generate`
  Expected: Prisma Client generated successfully.

- [ ] **Step 3: Commit database updates**
  Run: `git add backend/prisma/schema.prisma`
  Run: `git commit -m "db: add workout generation metadata to User schema"`

---

### Task 2: Fix Backend Compilation & Clean-up Nutrition/Chat

**Files:**
- Modify: [authController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/authController.ts)
- Modify: [statsController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/statsController.ts)
- Modify: [aiService.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/services/aiService.ts)
- Modify: [workoutController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/workoutController.ts)

- [ ] **Step 1: Clean up authController.ts**
  Remove `foodAllergies`, `foodPreferences`, and `foodDislikes` from `updateProfile` and `User` select query.
  In `updateProfile` in `authController.ts`, change:
  ```typescript
  // Remove foodAllergies, foodPreferences, foodDislikes from the destructured req.body
  // Remove them from prisma.user.update data block
  // Remove isFoodPreferencesChanged and isFoodDislikesChanged checks
  ```
  Ensure `needsPlanAdjustment` is calculated only based on weight, location, and medical condition updates.

- [ ] **Step 2: Clean up statsController.ts**
  Remove the DB call to `prisma.nutritionPlan.findMany` and its mapping.
  In `statsController.ts`, replace the nutrition fetching block with:
  ```typescript
  const nutritionStats: any[] = [];
  ```

- [ ] **Step 3: Clean up aiService.ts**
  Delete `generateNutritionPlanAI`, `parseMealTextAI`, and `chatConsultationAI` functions entirely.
  In `getProfileAdviceAI`, modify the prompt to remove food preferences, food dislikes, and food allergies:
  ```typescript
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
    ...
  }
  ```

- [ ] **Step 4: Fix workoutController.ts compilation**
  In `workoutController.ts`, change line 679 (fallback level calculation) to use the new `fitnessLevel` field or defaults:
  ```typescript
  const level = userProfile?.fitnessLevel || 'intermediate';
  ```
  Also, update the `generatePlan` function in `workoutController.ts` to save the generation metadata back to the `User` record upon generating a new plan:
  ```typescript
  // Save/Update generation metadata in User record
  await prisma.user.update({
    where: { id: userId },
    data: {
      workoutLocation: finalLocation,
      equipment: equipStr,
      fitnessGoal: finalGoal,
      fitnessLevel: level || 'intermediate',
    }
  });
  ```

- [ ] **Step 5: Verify backend builds successfully**
  Run: `npm run build` inside `backend` folder
  Expected: Command completes successfully with exit code 0.

- [ ] **Step 6: Commit backend clean-ups**
  Run: `git add backend/src/controllers/ authController.ts statsController.ts workoutController.ts`
  Run: `git add backend/src/services/aiService.ts`
  Run: `git commit -m "fix: resolve backend compilation issues and remove unused nutrition/chat functions"`

---

### Task 3: Implement Workout Location Toggle API

**Files:**
- Modify: [workoutRoutes.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/routes/workoutRoutes.ts)
- Modify: [workoutController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/workoutController.ts)

- [ ] **Step 1: Write toggleLocation controller**
  In `workoutController.ts`, implement the `toggleLocation` function.
  It updates the user's `workoutLocation` in the database, reads their saved workout metadata (`equipment`, `fitnessGoal`, `fitnessLevel`), counts `daysPerWeek` of their active plan, and calls the Python generator to create a new plan with the updated location.
  Code structure:
  ```typescript
  export const toggleLocation = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { location } = req.body; // 'HOME' or 'GYM'

    try {
      if (!userId) {
        res.status(401).json({ error: 'غير مصرح بالدخول' });
        return;
      }
      if (location !== 'HOME' && location !== 'GYM') {
        res.status(400).json({ error: 'موقع غير صالح.' });
        return;
      }

      const userProfile = await prisma.user.findUnique({ where: { id: userId } });
      if (!userProfile) {
        res.status(404).json({ error: 'المستخدم غير موجود' });
        return;
      }

      // 1. Update user location
      await prisma.user.update({
        where: { id: userId },
        data: { workoutLocation: location }
      });

      // 2. Fetch current active plan to preserve parameters (daysPerWeek, startDate, durationWeeks)
      const activePlan = await prisma.workoutPlan.findFirst({
        where: { userId, active: true },
        include: { dayWorkouts: true }
      });

      const daysPerWeek = activePlan ? activePlan.dayWorkouts.filter(d => !d.isRestDay).length : 3;
      const durationWeeks = activePlan?.durationWeeks || 4;
      const startDate = activePlan?.startDate || new Date();
      
      const finalGoal = userProfile.fitnessGoal || 'HYPERTROPHY';
      const level = userProfile.fitnessLevel || 'intermediate';
      const equipStr = userProfile.equipment || '';
      
      // We run the python generator script with the new location
      const { exec } = require('child_process');
      const path = require('path');
      const fs = require('fs').promises;
      const pythonDir = path.join(__dirname, '../../../workout_generator_python');
      
      const command = `python src/generator.py --days ${daysPerWeek} --location ${location} --equipment "${equipStr}" --level ${level} --goal ${finalGoal}`;

      console.log(`[WorkoutController ToggleLocation] Executing: ${command}`);

      exec(command, { cwd: pythonDir, env: process.env }, async (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.error('[WorkoutController ToggleLocation] Error:', error, stderr);
          res.status(500).json({ error: 'فشل إعادة توليد جدول التمارين للموقع الجديد.' });
          return;
        }

        try {
          const planFilePath = path.join(pythonDir, 'data/processed/generated_plan.json');
          const fileContent = await fs.readFile(planFilePath, 'utf-8');
          const pythonPlan = JSON.parse(fileContent);

          // Translate instructions if necessary (reusing active plan translation logic if lang is ar)
          // Deactivate previous plans
          await prisma.workoutPlan.updateMany({
            where: { userId, active: true },
            data: { active: false },
          });

          // Save the new plan
          const createdPlan = await prisma.workoutPlan.create({
            data: {
              userId,
              title: `جدول تمارين مخصص (${location === 'GYM' ? 'النادي' : 'المنزل'})`,
              durationWeeks,
              startDate,
              active: true,
              weeklyTips: `تم تكييف هذا الجدول للأداء في ${location === 'GYM' ? 'النادي الرياضي' : 'المنزل'} بنجاح.`,
              isManual: false,
              dayWorkouts: {
                create: pythonPlan.map((day: any, dIdx: number) => ({
                  dayIndex: dIdx + 1,
                  title: day.day_name_ar || day.day_name_en,
                  focusArea: day.day_name_en,
                  dayTips: day.is_rest_day ? 'يوم راحة مخصص للاستشفاء العضلي.' : 'ابدأ بالإحماء لمدة 5 دقائق قبل بدء جولتك.',
                  isRestDay: !!day.is_rest_day,
                  exercises: {
                    create: day.is_rest_day ? [] : day.exercises.map((ex: any, idx: number) => {
                      const suggestedWeight = getSuggestedWeight(ex.name_en, ex.equipment_en, userProfile.gender || 'MALE', level, userProfile.currentWeight || 75);
                      const imageUrl = ex.image_url || getMuscleImage(ex.muscle_en);
                      const displayName = `${ex.name_ar} (${ex.name_en})`;
                      
                      return {
                        name: displayName,
                        targetMuscle: ex.muscle_ar || ex.muscle_en,
                        category: ex.category || 'IRON',
                        sets: ex.sets || 3,
                        reps: ex.reps_ar || ex.reps_en || '8-12',
                        weight: suggestedWeight,
                        exerciseTips: ex.instructions_ar || ex.instructions_en || 'أداء هادئ وتركيز كامل في الحركة.',
                        order: idx,
                        imageUrl: imageUrl,
                        videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((ex.name_en || '') + ' exercise tutorial shorts')}`,
                      };
                    }),
                  },
                })),
              },
            },
            include: {
              dayWorkouts: {
                include: {
                  exercises: true,
                },
              },
            },
          });

          res.status(201).json(createdPlan);
        } catch (saveErr) {
          console.error('[WorkoutController ToggleLocation] Error saving plan:', saveErr);
          res.status(500).json({ error: 'فشل حفظ الجدول الجديد الناتج.' });
        }
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || 'حدث خطأ أثناء تبديل موقع التمرين' });
    }
  };
  ```

- [ ] **Step 2: Register route in workoutRoutes.ts**
  Add the route in `workoutRoutes.ts`:
  ```typescript
  router.post('/toggle-location', toggleLocation);
  ```

- [ ] **Step 3: Verify Compilation**
  Run: `npm run build` in `backend`
  Expected: Successful build.

- [ ] **Step 4: Commit toggle API changes**
  Run: `git add backend/src/routes/workoutRoutes.ts backend/src/controllers/workoutController.ts`
  Run: `git commit -m "feat: add toggle-location API endpoint to regenerate plans dynamically"`

---

### Task 4: Clean up Frontend Routing & Views (Remove Nutrition/Chat)

**Files:**
- Modify: [App.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/App.tsx)
- Modify: [api.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/services/api.ts)
- Delete: [Nutrition.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Nutrition.tsx)
- Delete: [Consultation.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Consultation.tsx)

- [ ] **Step 1: Delete deleted page files**
  Delete [Nutrition.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Nutrition.tsx) and [Consultation.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Consultation.tsx) from disk.

- [ ] **Step 2: Remove references in api.ts**
  In `api.ts`, delete the Nutrition and Chat API calls (lines 52-62).

- [ ] **Step 3: Update App.tsx imports and views**
  Remove imports for `Nutrition` and `Consultation`.
  In `App.tsx`, remove the nav router blocks for `currentView === 'nutrition'` and `currentView === 'chat'`.

- [ ] **Step 4: Commit frontend clean-up**
  Run: `git rm frontend/src/pages/Nutrition.tsx frontend/src/pages/Consultation.tsx`
  Run: `git add frontend/src/App.tsx frontend/src/services/api.ts`
  Run: `git commit -m "cleanup: remove Nutrition and Chat pages and service endpoints"`

---

### Task 5: Add Location Toggle & Overlay to Dashboard

**Files:**
- Modify: [Dashboard.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Dashboard.tsx)
- Modify: [api.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/services/api.ts)

- [ ] **Step 1: Register API method in api.ts**
  Add `toggleLocation` method in `frontend/src/services/api.ts`:
  ```typescript
  toggleLocation: (location: 'HOME' | 'GYM') => request('/workout/toggle-location', { method: 'POST', body: JSON.stringify({ location }) }),
  ```

- [ ] **Step 2: Remove Nutrition and Chat tabs from Dashboard.tsx**
  Remove the `Nutrition` and `Consultation` tabs from the header navigation bar in `Dashboard.tsx`.
  The navigation bar should only show: `[التمارين / Workouts, الإحصاءات / Stats, الملف الشخصي / Profile]`.

- [ ] **Step 3: Add loading overlay state and toggle logic in Dashboard.tsx**
  In `Dashboard.tsx`, declare a state for location toggle loading:
  ```typescript
  const [toggleLoading, setToggleLoading] = useState(false);
  ```
  Implement the handler function:
  ```typescript
  const handleLocationToggle = async (newLocation: 'HOME' | 'GYM') => {
    setToggleLoading(true);
    try {
      const plan = await api.toggleLocation(newLocation);
      setActivePlan(plan);
      setSelectedDayIndex(1);
      setShowDayDetail(true);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to change workout location.' : 'فشل تغيير موقع التمرين.');
    } finally {
      setToggleLoading(false);
    }
  };
  ```

- [ ] **Step 4: Render Toggle Switch and Loading Overlay**
  In the `Dashboard.tsx` JSX:
  - Add a beautiful Segmented Toggle next to "Plan Controls" (in the Actions Panel) or in the header:
    ```tsx
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
      <button 
        onClick={() => handleLocationToggle('GYM')}
        className={activePlan?.title?.includes('النادي') || activePlan?.title?.includes('Gym') || activePlan?.workoutLocation === 'GYM' ? 'glow-btn' : 'secondary-btn'}
        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
      >
        🏋️‍♂️ {lang === 'en' ? 'Gym' : 'النادي'}
      </button>
      <button 
        onClick={() => handleLocationToggle('HOME')}
        className={activePlan?.title?.includes('المنزل') || activePlan?.title?.includes('Home') || activePlan?.workoutLocation === 'HOME' ? 'glow-btn' : 'secondary-btn'}
        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
      >
        🏠 {lang === 'en' ? 'Home' : 'المنزل'}
      </button>
    </div>
    ```
  - Render a glassmorphic Loading Overlay when `toggleLoading` is true:
    ```tsx
    {toggleLoading && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid var(--border-color)', borderTop: '5px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          {lang === 'en' ? 'Adapting exercises to your location... ⚡' : 'جاري تكييف التمارين الذكية لموقعك الجديد... ⚡'}
        </h3>
      </div>
    )}
    ```

- [ ] **Step 5: Commit frontend Dashboard changes**
  Run: `git add frontend/src/pages/Dashboard.tsx frontend/src/services/api.ts`
  Run: `git commit -m "feat: add Gym/Home toggle control and glassmorphic loading overlay to Dashboard"`
