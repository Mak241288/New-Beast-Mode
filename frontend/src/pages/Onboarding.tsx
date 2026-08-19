import React, { useState } from 'react';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight, Activity, Calendar, Compass, ShieldAlert, Check, Sparkles, PenTool, Crown } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { translations } from '../utils/translations';
import { PresetPlansModal } from '../components/PresetPlansModal';
import { PRESET_WORKOUT_PLANS } from '../utils/presetWorkoutPlans';
import type { PresetPlan } from '../utils/presetWorkoutPlans';

interface OnboardingProps {
  lang: 'ar' | 'en';
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ lang, onComplete }) => {
  const t = translations[lang] || translations.ar;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [gender, setGender] = useState('MALE');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Step 2: Fitness settings
  const [workoutLocation, setWorkoutLocation] = useState<'HOME' | 'GYM'>('GYM');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [level, setLevel] = useState('intermediate');
  const [workoutGoal, setWorkoutGoal] = useState('HYPERTROPHY');
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [exercisesPerDay, setExercisesPerDay] = useState(5);
  const [restDays, setRestDays] = useState<string[]>([]);

  // Step 3: Health / Medical
  const [medicalConditions, setMedicalConditions] = useState('');

  // Step 4: Plan duration & Start Date
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [creationMethod, setCreationMethod] = useState<'AI' | 'PRESET' | 'MANUAL'>('AI');
  const [selectedPresetPlan, setSelectedPresetPlan] = useState<PresetPlan | null>(() => PRESET_WORKOUT_PLANS[0]);
  const [showPresetModal, setShowPresetModal] = useState(false);

  const equipmentList = [
    { id: 'dumbbells', label: lang === 'en' ? 'Dumbbells' : 'دمبلز (Dumbbells)' },
    { id: 'barbell', label: lang === 'en' ? 'Barbell & Weights' : 'بار وأوزان (Barbell)' },
    { id: 'bench', label: lang === 'en' ? 'Workout Bench (Flat/Incline)' : 'كرسي تدريب / بنش (Workout Bench)' },
    { id: 'mat', label: lang === 'en' ? 'Yoga / Floor Mat' : 'سجادة يوجا / مات أرضية (Yoga Mat)' },
    { id: 'bands', label: lang === 'en' ? 'Resistance Bands' : 'حبال مقاومة (Resistance Bands)' },
    { id: 'pullup', label: lang === 'en' ? 'Pull-up Bar' : 'عقلة منزلية (Pull-up Bar)' },
    { id: 'cables', label: lang === 'en' ? 'Cable Machine' : 'جهاز كيبل/بكرات (Cable Machine)' },
    { id: 'kettlebells', label: lang === 'en' ? 'Kettlebells' : 'كتلبل (Kettlebells)' },
    { id: 'trx', label: lang === 'en' ? 'Suspension / TRX Straps' : 'أحزمة تعليق TRX' },
    { id: 'swiss_ball', label: lang === 'en' ? 'Exercise / Swiss Ball' : 'كرة التوازن السويسرية' },
    { id: 'medicine_ball', label: lang === 'en' ? 'Medicine Ball' : 'الكرة الطبية (Medicine Ball)' },
    { id: 'foam_roller', label: lang === 'en' ? 'Foam Roller & Recovery' : 'فوم رولر واستشفاء' },
  ];

  const muscleGroups = [
    { id: 'chest', label: lang === 'en' ? 'Chest' : 'الصدر' },
    { id: 'back', label: lang === 'en' ? 'Back & Lats' : 'الظهر واللاتس' },
    { id: 'shoulders', label: lang === 'en' ? 'Shoulders' : 'الأكتاف' },
    { id: 'traps', label: lang === 'en' ? 'Traps & Neck' : 'الترابيس والرقبة' },
    { id: 'arms', label: lang === 'en' ? 'Arms (Biceps/Triceps)' : 'الذراعين (باي وتراي)' },
    { id: 'forearms', label: lang === 'en' ? 'Forearms & Grip' : 'السواعد والقبضة' },
    { id: 'abs', label: lang === 'en' ? 'Abs & Core' : 'البطن والجذع' },
    { id: 'legs', label: lang === 'en' ? 'Legs (Quads/Hamstrings)' : 'الأرجل (أفخاذ)' },
    { id: 'glutes', label: lang === 'en' ? 'Glutes & Hips' : 'الأرداف والمؤخرة' },
    { id: 'calves', label: lang === 'en' ? 'Calves' : 'السمانة والبطات' },
  ];

  const handleMuscleChange = (id: string) => {
    if (targetMuscles.includes(id)) {
      setTargetMuscles(targetMuscles.filter((m) => m !== id));
    } else {
      setTargetMuscles([...targetMuscles, id]);
    }
  };

  const weekdaysList = [
    { id: 'sunday', label: lang === 'en' ? 'Sun' : 'الأحد' },
    { id: 'monday', label: lang === 'en' ? 'Mon' : 'الإثنين' },
    { id: 'tuesday', label: lang === 'en' ? 'Tue' : 'الثلاثاء' },
    { id: 'wednesday', label: lang === 'en' ? 'Wed' : 'الأربعاء' },
    { id: 'thursday', label: lang === 'en' ? 'Thu' : 'الخميس' },
    { id: 'friday', label: lang === 'en' ? 'Fri' : 'الجمعة' },
    { id: 'saturday', label: lang === 'en' ? 'Sat' : 'السبت' },
  ];

  const handleRestDayChange = (id: string) => {
    if (restDays.includes(id)) {
      setRestDays(restDays.filter((d) => d !== id));
    } else {
      setRestDays([...restDays, id]);
    }
  };

  const handleEquipmentChange = (id: string) => {
    if (equipment.includes(id)) {
      setEquipment(equipment.filter((item) => item !== id));
    } else {
      setEquipment([...equipment, id]);
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Save Profile info
      await api.updateProfile({
        gender,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        age: age ? parseInt(age) : undefined,
        height: height ? parseFloat(height) : undefined,
        currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        medicalConditions,
        workoutLocation,
        fitnessGoal: workoutGoal,
        fitnessLevel: level,
        equipment,
        onboardingCompleted: true,
      });

      // 2. Either Generate AI plan, Save Preset plan, or Create Manual Plan
      if (creationMethod === 'AI') {
        await api.generatePlan({
          durationWeeks,
          startDate: new Date(startDate),
          workoutLocation,
          equipment,
          level,
          targetMuscles,
          goal: workoutGoal,
          restDays,
          exercisesPerDay,
          daysPerWeek: 7 - restDays.length,
          lang,
        });
      } else if (creationMethod === 'PRESET' && selectedPresetPlan) {
        const structuredPlan = {
          title: lang === 'en' ? selectedPresetPlan.title_en : selectedPresetPlan.title_ar,
          durationWeeks,
          startDate,
          days: selectedPresetPlan.days.map((d) => ({
            dayIndex: d.dayIndex,
            title: d.title,
            focusArea: d.focusArea,
            isRestDay: d.isRestDay,
            exercises: d.exercises.map((ex) => ({
              name: ex.name,
              targetMuscle: ex.targetMuscle,
              category: ex.category || 'IRON',
              sets: ex.sets || 3,
              reps: ex.reps || '10-12',
              weight: ex.weight || 'Bodyweight',
              exerciseTips: ex.exerciseTips || '',
              imageUrl: ex.imageUrl || null,
              videoUrl: ex.videoUrl || null,
            })),
          })),
        };
        await api.saveStructuredPlan(structuredPlan, lang);
      } else {
        await api.createManualPlan({
          durationWeeks,
          startDate: new Date(startDate),
          title: lang === 'en' ? 'My Custom Workout Routine' : 'جدولي التدريبي اليدوي',
        });
        localStorage.setItem('open_manual_builder', 'true');
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || (lang === 'en' ? 'Failed to create plan. Please check inputs.' : 'فشل إنشاء الجدول، يرجى التحقق من المدخلات.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '30px 16px', background: 'radial-gradient(circle at 80% 20%, rgba(0, 210, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '35px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
              {t.stepOf(step, 5)}
            </span>
            <ThemeToggle />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  width: '32px',
                  height: '6px',
                  borderRadius: '3px',
                  background: s <= step ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--border-color)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '20px', fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {/* STEP 1: Basic Bio Details */}
        {step === 1 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Activity size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                {lang === 'en' ? 'Basic Bio Details' : 'البيانات الشخصية الأساسية'}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.gender}</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                  <option value="MALE">{lang === 'en' ? 'Male' : 'ذكر'}</option>
                  <option value="FEMALE">{lang === 'en' ? 'Female' : 'أنثى'}</option>
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.birthDate}</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Fitness Setup */}
        {step === 2 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Compass size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                {lang === 'en' ? 'Workout Preference & Settings' : 'خيارات التدريب الرياضي'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.workoutLocation}</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => setWorkoutLocation('GYM')}
                  className={workoutLocation === 'GYM' ? 'glow-btn' : 'secondary-btn'}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t.gym}
                </button>
                <button
                  type="button"
                  onClick={() => setWorkoutLocation('HOME')}
                  className={workoutLocation === 'HOME' ? 'glow-btn' : 'secondary-btn'}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t.home}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'en' ? 'Fitness Level' : 'مستوى اللياقة'}</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
                  <option value="beginner">{lang === 'en' ? 'Beginner' : 'مبتدئ'}</option>
                  <option value="intermediate">{lang === 'en' ? 'Intermediate' : 'متوسط'}</option>
                  <option value="advanced">{lang === 'en' ? 'Advanced' : 'متقدم'}</option>
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.workoutGoal}</label>
                <select value={workoutGoal} onChange={(e) => setWorkoutGoal(e.target.value)} className="input-field">
                  <option value="HYPERTROPHY">{lang === 'en' ? 'Hypertrophy (Muscle Gain)' : 'ضخامة عضلية'}</option>
                  <option value="STRENGTH">{lang === 'en' ? 'Strength & Power' : 'قوة بدنية وعصبية'}</option>
                  <option value="FAT_LOSS">{lang === 'en' ? 'Fat Loss / Cutting' : 'تنشيف وخسارة دهون'}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.equipment}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {equipmentList.map((item) => (
                  <label
                    key={item.id}
                    className="flex-center"
                    style={{
                      justifyContent: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: equipment.includes(item.id) ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={equipment.includes(item.id)}
                      onChange={() => handleEquipmentChange(item.id)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', lineHeight: 1.5, marginTop: '4px' }}>
                💡 {lang === 'en'
                  ? 'Smart Adaptation: If you do not have a "Workout Bench", the system automatically adapts chest & triceps exercises to Floor Press (ضغط الدمبلز على الأرض) and bodyweight variations.'
                  : 'تنويه ذكي: إذا لم تحدد "كرسي تدريب / بنش"، سيقوم النظام تلقائياً بتكييف تمارين الصدر والترايسبس لتعتمد على الضغط الأرضي (Floor Press) وتمارين وزن الجسم دون الحاجة لبنش.'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.targetMuscles}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {muscleGroups.map((item) => (
                  <label
                    key={item.id}
                    className="flex-center"
                    style={{
                      justifyContent: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: targetMuscles.includes(item.id) ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={targetMuscles.includes(item.id)}
                      onChange={() => handleMuscleChange(item.id)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.restDays}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {weekdaysList.map((day) => (
                  <label
                    key={day.id}
                    className="flex-center"
                    style={{
                      justifyContent: 'flex-start',
                      gap: '8px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: restDays.includes(day.id) ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={restDays.includes(day.id)}
                      onChange={() => handleRestDayChange(day.id)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.exercisesPerDay}</label>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                  {exercisesPerDay === 0 ? (lang === 'en' ? 'Open / Dynamic (AI Recommended)' : 'مفتوح / تلقائي (موصى به 🧠)') : `${exercisesPerDay} ${t.exercises}`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={exercisesPerDay === 0 ? 5 : exercisesPerDay}
                  disabled={exercisesPerDay === 0}
                  onChange={(e) => setExercisesPerDay(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)', opacity: exercisesPerDay === 0 ? 0.3 : 1 }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={exercisesPerDay === 0}
                    onChange={(e) => setExercisesPerDay(e.target.checked ? 0 : 5)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  {lang === 'en' ? 'Let AI Decide' : 'دع الذكاء الاصطناعي يقرر'}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Medical / Injuries */}
        {step === 3 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <ShieldAlert size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{t.medicalTitle}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.medicalInjuries}</label>
              <textarea
                placeholder={lang === 'en' ? 'E.g., Left knee pain when squatting, lower back tightness, shoulder impingement...' : 'ألم في الركبة اليسرى عند القرفصاء، إصابة سابقة في الكتف الأيمن، إلخ...'}
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                className="input-field"
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Body Stats Collection */}
        {step === 4 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Activity size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                {lang === 'en' ? 'Body Stats & Metrics' : 'مقاييس وإحصائيات الجسم'}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'en' ? 'Age' : 'العمر'}</label>
                <input
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'en' ? 'Height (cm)' : 'الطول (سم)'}</label>
                <input
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'en' ? 'Current Weight (kg)' : 'الوزن الحالي (كجم)'}</label>
                <input
                  type="number"
                  placeholder="80"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'en' ? 'Goal Weight (kg, optional)' : 'الوزن المستهدف (كجم، اختياري)'}</label>
                <input
                  type="number"
                  placeholder="75"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Plan Length & Start Date & Creation Method */}
        {step === 5 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <Calendar size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{lang === 'en' ? 'Program Duration & Design Mode' : 'مدة البرنامج وطريقة التصميم'}</h3>
            </div>

            {/* Creation Method Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>
                {lang === 'en' ? 'How would you like to build your plan?' : 'كيف تفضل بناء وتصميم جدولك الرياضي؟'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreationMethod('AI')}
                  className={creationMethod === 'AI' ? 'glow-btn' : 'secondary-btn'}
                  style={{
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '12px',
                    border: creationMethod === 'AI' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={22} color={creationMethod === 'AI' ? '#ffffff' : 'var(--primary)'} />
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>
                    {lang === 'en' ? 'AI Generator' : 'توليد بالذكاء الاصطناعي ⚡'}
                  </span>
                  <span style={{ fontSize: '10.5px', opacity: 0.8, lineHeight: 1.3 }}>
                    {lang === 'en' ? 'Smart algorithm synthesis' : 'صياغة ذكية مخصصة لمعطياتك'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreationMethod('PRESET');
                    setShowPresetModal(true);
                  }}
                  className={creationMethod === 'PRESET' ? 'glow-btn' : 'secondary-btn'}
                  style={{
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '12px',
                    border: creationMethod === 'PRESET' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: creationMethod === 'PRESET' ? 'linear-gradient(135deg, #f59e0b, #ec4899)' : undefined
                  }}
                >
                  <Crown size={22} color={creationMethod === 'PRESET' ? '#ffffff' : '#f59e0b'} />
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>
                    {lang === 'en' ? 'Curated Pro Plans' : 'الخطط الجاهزة والأساطير 👑'}
                  </span>
                  <span style={{ fontSize: '10.5px', opacity: 0.8, lineHeight: 1.3 }}>
                    {lang === 'en' ? 'Arnold, PPL, Science Splits' : 'آرنولد، PPL، جداول مركزة'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMethod('MANUAL')}
                  className={creationMethod === 'MANUAL' ? 'glow-btn' : 'secondary-btn'}
                  style={{
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '12px',
                    border: creationMethod === 'MANUAL' ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <PenTool size={22} color={creationMethod === 'MANUAL' ? '#ffffff' : 'var(--secondary)'} />
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>
                    {lang === 'en' ? 'Manual Builder' : 'تصميم يدوي ✏️'}
                  </span>
                  <span style={{ fontSize: '10.5px', opacity: 0.8, lineHeight: 1.3 }}>
                    {lang === 'en' ? 'Build from scratch' : 'بناء جدولك من الصفر'}
                  </span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.weeksDuration}</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[4, 8, 12].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => setDurationWeeks(weeks)}
                    className={durationWeeks === weeks ? 'glow-btn' : 'secondary-btn'}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {weeks} {t.weeks}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>{t.startDateLabel}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {creationMethod === 'AI' && (
              <div style={{ background: 'var(--primary-glow)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid var(--primary)' }}>
                <Check size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'en' ? 'The AI engine will now draft a fully customized weekly workout program specifically tailored to your physical metrics, fitness goals, and available equipment.' : 'سيقوم الذكاء الاصطناعي الآن بصياغة جدول تمارين متناسق ومخصص 100% لك بناءً على هذه الإجابات. يستغرق التحليل بضع ثوانٍ.'}
                </p>
              </div>
            )}

            {creationMethod === 'PRESET' && selectedPresetPlan && (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={20} color="#f59e0b" />
                    <span style={{ fontWeight: '800', fontSize: '14px' }}>
                      {lang === 'en' ? selectedPresetPlan.title_en : selectedPresetPlan.title_ar}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresetModal(true)}
                    className="secondary-btn"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                  >
                    {lang === 'en' ? 'Change Plan 🔄' : 'تغيير الخطة 🔄'}
                  </button>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  👤 {selectedPresetPlan.coach_or_source} • {selectedPresetPlan.daysPerWeek} {lang === 'en' ? 'Days/Week' : 'أيام / أسبوع'} • {lang === 'en' ? selectedPresetPlan.description_en : selectedPresetPlan.description_ar}
                </p>
              </div>
            )}

            {creationMethod === 'MANUAL' && (
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid var(--secondary)' }}>
                <PenTool size={20} color="var(--secondary)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'en' ? 'You will be redirected directly to the interactive manual plan builder to select exercises, customize sets/reps, or apply pre-made templates.' : 'ستنتقل مباشرة إلى مصمم الجداول التفاعلي لاختيار التمارين، وتحديد الجولات والتكرارات بنفسك.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px', gap: '16px' }}>
          {step > 1 ? (
            <button onClick={handlePrev} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
              {lang === 'en' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              {t.prev}
            </button>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {step < 5 ? (
            <button onClick={handleNext} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
              {t.next}
              {lang === 'en' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          ) : (
            <button onClick={handleFinish} disabled={loading} className="glow-btn" style={{ flex: 1.2, justifyContent: 'center' }}>
              {loading ? (
                lang === 'en' ? 'Setting up your Plan...' : 'جاري إعداد خطتك...'
              ) : creationMethod === 'AI' ? (
                <>
                  <span>{lang === 'en' ? 'Generate AI Plan ⚡' : 'توليد برنامج التمارين بالذكاء الاصطناعي ⚡'}</span>
                  <Check size={18} />
                </>
              ) : creationMethod === 'PRESET' ? (
                <>
                  <span>{lang === 'en' ? `Activate Selected Plan 👑` : `تفعيل الخطة المختارة 👑`}</span>
                  <Check size={18} />
                </>
              ) : (
                <>
                  <span>{lang === 'en' ? 'Start Manual Builder ✏️' : 'بدء التصميم اليدوي للجدول ✏️'}</span>
                  <Check size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Preset Plans Selector Modal */}
      <PresetPlansModal
        isOpen={showPresetModal}
        lang={lang}
        onClose={() => setShowPresetModal(false)}
        onSelectPlan={(plan) => {
          setSelectedPresetPlan(plan);
          setShowPresetModal(false);
        }}
      />
    </div>
  );
};
