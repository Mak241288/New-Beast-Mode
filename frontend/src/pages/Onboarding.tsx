import React, { useState } from 'react';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight, Activity, Calendar, Compass, ShieldAlert, Check } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { translations } from '../utils/translations';

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
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Step 2: Fitness settings
  const [workoutLocation, setWorkoutLocation] = useState<'HOME' | 'GYM'>('GYM');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [level, setLevel] = useState('beginner');
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [exercisesPerDay, setExercisesPerDay] = useState(5);
  const [restDays, setRestDays] = useState<string[]>([]);

  // Step 3: Health / Medical
  const [medicalConditions, setMedicalConditions] = useState('');
  const [labResults, setLabResults] = useState('');

  // Step 4: Nutrition
  const [foodAllergies, setFoodAllergies] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('Balanced');
  const [foodDislikes, setFoodDislikes] = useState('');

  // Step 5: Plan duration & Start Date
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const equipmentList = [
    { id: 'dumbbells', label: 'دمبلز (Dumbbells)' },
    { id: 'barbell', label: 'بار وأوزان (Barbell)' },
    { id: 'bands', label: 'حبال مقاومة (Bands)' },
    { id: 'pullup', label: 'عقلة منزلية (Pull-up Bar)' },
    { id: 'cables', label: 'جهاز كيبل (Cables)' },
  ];

  const muscleGroups = [
    { id: 'chest', label: 'الصدر (Chest)' },
    { id: 'back', label: 'الظهر (Back)' },
    { id: 'shoulders', label: 'الأكتاف (Shoulders)' },
    { id: 'legs', label: 'الأرجل (Legs)' },
    { id: 'arms', label: 'الذراعين (Arms)' },
    { id: 'abs', label: 'البطن (Abs)' },
  ];

  const handleMuscleChange = (id: string) => {
    if (targetMuscles.includes(id)) {
      setTargetMuscles(targetMuscles.filter((m) => m !== id));
    } else {
      setTargetMuscles([...targetMuscles, id]);
    }
  };

  const weekdaysList = [
    { id: 'saturday', label: 'السبت' },
    { id: 'sunday', label: 'الأحد' },
    { id: 'monday', label: 'الإثنين' },
    { id: 'tuesday', label: 'الثلاثاء' },
    { id: 'wednesday', label: 'الأربعاء' },
    { id: 'thursday', label: 'الخميس' },
    { id: 'friday', label: 'الجمعة' },
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
        height: height ? parseFloat(height) : undefined,
        currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        medicalConditions,
        labResults,
        foodAllergies,
        foodPreferences,
        foodDislikes,
        workoutLocation,
      });

      // 2. Generate workout plan via Local Python Engine
      const curW = currentWeight ? parseFloat(currentWeight) : 75;
      const tarW = targetWeight ? parseFloat(targetWeight) : 75;
      let calculatedGoal = 'HYPERTROPHY';
      if (tarW < curW) {
        calculatedGoal = 'FAT_LOSS';
      } else if (foodPreferences === 'High Protein') {
        calculatedGoal = 'STRENGTH';
      }

      await api.generatePlan({
        durationWeeks,
        startDate: new Date(startDate),
        workoutLocation,
        equipment,
        level,
        targetMuscles,
        goal: calculatedGoal,
        restDays,
        exercisesPerDay,
        daysPerWeek: 7 - restDays.length,
        lang,
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'فشل توليد الجدول بالذكاء الاصطناعي، يرجى التحقق من المدخلات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '30px 16px', background: 'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.06) 0%, transparent 40%)' }}>
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
              <h3>البيانات الجسدية الأساسية</h3>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>الجنس</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>تاريخ الميلاد</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>الطول (سم)</label>
              <input
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700' }}>الوزن الحالي (كجم)</label>
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
                <label style={{ fontSize: '13px', fontWeight: '700' }}>الوزن المستهدف (كجم)</label>
                <input
                  type="number"
                  placeholder="75"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
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
              <h3>خيارات التدريب الرياضي</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>مكان التمرين المفضل</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => setWorkoutLocation('GYM')}
                  className={workoutLocation === 'GYM' ? 'glow-btn' : 'secondary-btn'}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  النادي الرياضي (Gym)
                </button>
                <button
                  type="button"
                  onClick={() => setWorkoutLocation('HOME')}
                  className={workoutLocation === 'HOME' ? 'glow-btn' : 'secondary-btn'}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  المنزل (Home)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>مستوى اللياقة</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
                <option value="beginner">مبتدئ (فترة انقطاع طويلة أو جديد بالكامل)</option>
                <option value="intermediate">متوسط (تتدرب بانتظام منذ عدة أشهر)</option>
                <option value="advanced">متقدم (تتدرب بأوزان ثقيلة وشدة عالية لأكثر من سنة)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>الأدوات والمعدات المتوفرة لديك</label>
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
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>العضلات المستهدفة للتمرين (اتركه فارغاً لاستهداف الجسم بالكامل)</label>
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
                      border: targetMuscles.includes(item.id) ? '1px solid var(--secondary)' : '1px solid var(--border-color)',
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
                      style={{ accentColor: 'var(--secondary)' }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>أيام الراحة المخصصة (اتركها فارغة للتوزيع التلقائي)</label>
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
                  max="25"
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

        {/* STEP 3: Medical / Lab Details */}
        {step === 3 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <ShieldAlert size={24} color="var(--primary)" />
              <h3>الملف الصحي والطبي للذكاء الاصطناعي</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>الإصابات والآلام البدنية (إن وجدت)</label>
              <textarea
                placeholder="ألم في الركبة اليسرى عند القرفصاء، إصابة سابقة في الكتف الأيمن، إلخ..."
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>تفاصيل التحاليل الطبية أو نقص الفيتامينات (إن وجدت)</label>
              <textarea
                placeholder="نقص فيتامين د، ارتفاع طفيف بالكوليسترول، فقر دم..."
                value={labResults}
                onChange={(e) => setLabResults(e.target.value)}
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Diet and Food Preferences */}
        {step === 4 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Compass size={24} color="var(--primary)" />
              <h3>خيارات التغذية والوجبات</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>التفضيل الغذائي الأساسي</label>
              <select value={foodPreferences} onChange={(e) => setFoodPreferences(e.target.value)} className="input-field">
                <option value="Balanced">متوازن شامل لكل شيء (Balanced)</option>
                <option value="High Protein">بروتين عالٍ لبناء العضلات (High Protein)</option>
                <option value="Vegan">نباتي بالكامل (Vegan)</option>
                <option value="Vegetarian">نباتي البيض والألبان (Vegetarian)</option>
                <option value="Keto">كيتو - دهون عالية وكربوهيدرات منخفضة (Keto)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>حساسية الطعام (إن وجدت)</label>
              <input
                type="text"
                placeholder="حساسية المكسرات، اللاكتوز (الحليب)، الغلوتين، إلخ..."
                value={foodAllergies}
                onChange={(e) => setFoodAllergies(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>أطعمة تكرهها ولا تريد رؤيتها في الوجبات</label>
              <textarea
                placeholder="السمك، البروكلي، البصل، الكوسا..."
                value={foodDislikes}
                onChange={(e) => setFoodDislikes(e.target.value)}
                className="input-field"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* STEP 5: Plan Length & Start Date */}
        {step === 5 && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Calendar size={24} color="var(--primary)" />
              <h3>مدة البرنامج الرياضي وبدايته</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>عدد أسابيع البرنامج</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[4, 8, 12].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => setDurationWeeks(weeks)}
                    className={durationWeeks === weeks ? 'glow-btn' : 'secondary-btn'}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {weeks} أسابيع
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>تاريخ بداية الجدول (التقويم)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ background: 'var(--primary-glow)', padding: '16px', borderRadius: '12px', marginTop: '10px', display: 'flex', gap: '12px', border: '1px solid var(--primary)' }}>
              <Check size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                سيقوم الذكاء الاصطناعي الآن بصياغة جدول تمارين وتغذية متناسق ومخصص 100% لك بناءً على هذه الإجابات. يستغرق التحليل بضع ثوانٍ.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '16px' }}>
          {step > 1 ? (
            <button onClick={handlePrev} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
              <ChevronRight size={18} />
              السابق
            </button>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {step < 5 ? (
            <button onClick={handleNext} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
              التالي
              <ChevronLeft size={18} />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={loading} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'جاري بناء خطتك الذكية...' : 'صناعة خطتي الرياضية'}
              <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
