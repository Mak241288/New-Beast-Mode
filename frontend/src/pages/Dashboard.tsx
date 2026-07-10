import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Play, Plus, Edit, Trash2, RefreshCw, Timer } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigate }) => {
  const [activePlan, setActivePlan] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Player state
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [completedReps, setCompletedReps] = useState<string[]>([]);
  const [loggedWeight, setLoggedWeight] = useState<string[]>([]);
  const [exerciseLogNotes, setExerciseLogNotes] = useState('');

  // Manual Edit State
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customExForm, setCustomExForm] = useState({
    name: '',
    targetMuscle: '',
    category: 'IRON',
    sets: '3',
    reps: '10-12',
    weight: 'Bodyweight',
    exerciseTips: '',
  });

  const fetchActivePlan = async () => {
    setLoading(true);
    setError('');
    try {
      const plan = await api.getActivePlan();
      setActivePlan(plan);
      // Default to day 1 or current day of week if exists
      if (plan && plan.dayWorkouts.length > 0) {
        // Calculate day index based on today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(plan.startDate);
        start.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        let calculatedDay = (diffDays % 7) + 1;
        if (calculatedDay < 1) calculatedDay = 1;
        setSelectedDayIndex(calculatedDay <= 7 ? calculatedDay : 1);
      }
    } catch (err: any) {
      setError(err.message || 'لم نتمكن من تحميل جدول التمارين النشط.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  // Web Audio Api to play sound natively (glowing beep)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep failed:', e);
    }
  };

  // Exercise countdown timer (for time-based exercises like Plank)
  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [isExerciseTimerActive, setIsExerciseTimerActive] = useState(false);

  // Helper to parse duration from reps text (e.g. "60s" or "30 ثانية")
  const parseRepsToSeconds = (repsText: string): number | null => {
    const match = repsText.match(/(\d+)\s*(ثانية|s|second|sec|ثوان|دقيقة|min)/i);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.includes('دقيقة') || unit.includes('min')) {
      return value * 60;
    }
    return value;
  };

  const checkAndInitExerciseTimer = (ex: any) => {
    if (!ex) return;
    const secs = parseRepsToSeconds(ex.reps);
    if (secs !== null) {
      setExerciseSeconds(secs);
      setIsExerciseTimerActive(false);
    } else {
      setExerciseSeconds(0);
      setIsExerciseTimerActive(false);
    }
  };

  // Active workout rest timer
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restSeconds === 0) {
      setIsResting(false);
      playBeep();
      // Initialize the exercise timer for the next set if it's time-based
      const exercises = getSelectedDay()?.exercises || [];
      const currentEx = exercises[activeExerciseIndex];
      checkAndInitExerciseTimer(currentEx);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds, activeExerciseIndex, selectedDayIndex]);

  // Exercise countdown timer ticking
  useEffect(() => {
    let interval: any = null;
    if (isExerciseTimerActive && exerciseSeconds > 0) {
      interval = setInterval(() => {
        setExerciseSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isExerciseTimerActive && exerciseSeconds === 0) {
      setIsExerciseTimerActive(false);
      playBeep();
      // Auto trigger set completion
      handleFinishSet();
    }
    return () => clearInterval(interval);
  }, [isExerciseTimerActive, exerciseSeconds]);

  const handleStartWorkout = () => {
    const exercises = getSelectedDay()?.exercises || [];
    if (exercises.length === 0) return;
    
    // Init sets logging arrays
    setCompletedReps([]);
    setLoggedWeight([]);
    setExerciseLogNotes('');
    setActiveExerciseIndex(0);
    setCurrentSet(1);
    setIsResting(false);
    setShowPlayer(true);
    
    // Check if first exercise is time-based
    checkAndInitExerciseTimer(exercises[0]);
  };

  const handleFinishSet = () => {
    const exercises = getSelectedDay()?.exercises || [];
    const currentEx = exercises[activeExerciseIndex];
    
    // Save sets input
    let currentRepVal = '';
    let currentWeightVal = '';

    const isTimeBased = parseRepsToSeconds(currentEx.reps) !== null;
    if (isTimeBased) {
      currentRepVal = `${currentEx.reps}`;
      currentWeightVal = currentEx.weight || 'Bodyweight';
    } else {
      currentRepVal = (document.getElementById('rep-input') as HTMLInputElement)?.value || '10';
      currentWeightVal = (document.getElementById('weight-input') as HTMLInputElement)?.value || 'Bodyweight';
    }

    const newReps = [...completedReps];
    newReps[currentSet - 1] = currentRepVal;
    setCompletedReps(newReps);

    const newWeights = [...loggedWeight];
    newWeights[currentSet - 1] = currentWeightVal;
    setLoggedWeight(newWeights);

    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
      setRestSeconds(60); // 60 seconds rest
      setIsResting(true);
    } else {
      // Finished all sets of this exercise
      handleNextExercise(newReps, newWeights);
    }
  };

  const handleNextExercise = async (finalReps?: string[], finalWeights?: string[]) => {
    const exercises = getSelectedDay()?.exercises || [];
    const currentEx = exercises[activeExerciseIndex];

    const repsToLog = finalReps || completedReps;
    const weightsToLog = finalWeights || loggedWeight;

    // Log progress to backend
    try {
      await api.logProgress(currentEx.id, {
        completedSets: currentEx.sets,
        repsCompleted: repsToLog.join(','),
        weightUsed: weightsToLog.join(','),
        notes: exerciseLogNotes,
      });
    } catch (err) {
      console.error('Failed to log exercise progress:', err);
    }

    if (activeExerciseIndex < exercises.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedReps([]);
      setLoggedWeight([]);
      setExerciseLogNotes('');
      setIsResting(false);
      
      // Check if next exercise is time-based
      checkAndInitExerciseTimer(exercises[activeExerciseIndex + 1]);
    } else {
      // Finished entire day workout
      setShowPlayer(false);
      alert('تهانينا! لقد أنهيت تمرين اليوم بنجاح. استمر في هذا الزخم للوحوش!');
      fetchActivePlan();
    }
  };

  const getSelectedDay = () => {
    if (!activePlan) return null;
    return activePlan.dayWorkouts.find((dw: any) => dw.dayIndex === selectedDayIndex);
  };

  // Helper to format date in Arabic
  const getArabicDateForDay = (dayIdx: number) => {
    if (!activePlan) return '';
    const start = new Date(activePlan.startDate);
    const dateForDay = new Date(start);
    dateForDay.setDate(start.getDate() + (dayIdx - 1));
    return dateForDay.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Manual Edit Submits
  const handleEditExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateExercise(editingExercise.id, editingExercise);
      setEditingExercise(null);
      fetchActivePlan();
    } catch (err) {
      alert('فشل تعديل تفاصيل التمرين.');
    }
  };

  const handleDeleteExercise = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التمرين من جدولك؟')) return;
    try {
      await api.deleteExercise(id);
      fetchActivePlan();
    } catch (err) {
      alert('فشل حذف التمرين.');
    }
  };

  const handleAddCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const day = getSelectedDay();
    if (!day) return;
    try {
      await api.addCustomExercise(day.id, customExForm);
      setAddingCustom(false);
      setCustomExForm({
        name: '',
        targetMuscle: '',
        category: 'IRON',
        sets: '3',
        reps: '10-12',
        weight: 'Bodyweight',
        exerciseTips: '',
      });
      fetchActivePlan();
    } catch (err) {
      alert('فشل إضافة التمرين المخصص.');
    }
  };

  const handleUpgradePlan = async () => {
    if (!confirm('سيقوم الذكاء الاصطناعي بمراجعة إنجازاتك المسجلة وتوليد جدول متطور وجديد كلياً. هل تود البدء؟')) return;
    setLoading(true);
    try {
      const res = await api.upgradePlan();
      alert(`مبروك! نسبة التزامك بالجدول السابق بلغت ${res.completionRate.toFixed(1)}%. تم توليد نسختك المطورة بنجاح.`);
      fetchActivePlan();
    } catch (err: any) {
      alert(err.message || 'فشل الترقية. تأكد من تسجيل تقدمك في التمارين أولاً.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDay = getSelectedDay();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '0 0 20px 20px', borderTop: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BEASTMODE
          </h2>
        </div>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => onNavigate('dashboard')} className="glow-btn" style={{ padding: '8px 16px' }}>التمارين</button>
          <button onClick={() => onNavigate('nutrition')} className="secondary-btn" style={{ padding: '8px 16px' }}>التغذية</button>
          <button onClick={() => onNavigate('stats')} className="secondary-btn" style={{ padding: '8px 16px' }}>الإحصاءات</button>
          <button onClick={() => onNavigate('chat')} className="secondary-btn" style={{ padding: '8px 16px' }}>استشارة الذكاء الاصطناعي</button>
          <button onClick={() => onNavigate('profile')} className="secondary-btn" style={{ padding: '8px 16px' }}>الملف الشخصي</button>
        </nav>
        <button onClick={onLogout} className="secondary-btn" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>تسجيل الخروج</button>
      </header>

      <main className="container">
        {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>جاري تحميل جدولك الرياضي وتفاصيل اللياقة...</div>}
        
        {error && (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
            <button onClick={() => onNavigate('onboarding')} className="glow-btn" style={{ marginTop: '20px' }}>توليد جدول جديد بالذكاء الاصطناعي</button>
          </div>
        )}

        {!loading && activePlan && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>خطة تمارين نشطة</span>
                <h1 style={{ fontSize: '26px', fontWeight: '800' }}>{activePlan.title}</h1>
                <p style={{ fontSize: '14px', marginTop: '6px' }}>
                  تاريخ البداية: {new Date(activePlan.startDate).toLocaleDateString('ar-EG')} | المدة: {activePlan.durationWeeks} أسابيع
                </p>
                {activePlan.weeklyTips && (
                  <p style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '8px', fontWeight: '600' }}>
                    💡 نصيحة الأسبوع: {activePlan.weeklyTips}
                  </p>
                )}
              </div>
              <button onClick={handleUpgradePlan} className="secondary-btn" style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)' }}>
                <RefreshCw size={18} />
                ترقية الجدول بالذكاء الاصطناعي
              </button>
            </div>

            {/* Days Calendar Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {activePlan.dayWorkouts.map((day: any) => {
                const isSelected = day.dayIndex === selectedDayIndex;
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayIndex(day.dayIndex)}
                    className="glass-panel"
                    style={{
                      padding: '16px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      boxShadow: isSelected ? '0 0 15px var(--primary-glow)' : 'none',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '800' }}>
                      اليوم {day.dayIndex}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '600', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {day.isRestDay ? 'استراحة' : day.focusArea}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {getArabicDateForDay(day.dayIndex).split('،')[0]} {/* Day Name only */}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Content */}
            {selectedDay && (
              <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px' }}>{selectedDay.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                      📅 التاريخ: {getArabicDateForDay(selectedDay.dayIndex)}
                    </p>
                    {selectedDay.dayTips && (
                      <p style={{ fontSize: '13px', color: 'var(--secondary)', marginTop: '8px', fontWeight: '600' }}>
                        🏋️‍♂️ إرشادات اليوم: {selectedDay.dayTips}
                      </p>
                    )}
                  </div>
                  {!selectedDay.isRestDay && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={handleStartWorkout} className="glow-btn">
                        <Play size={18} />
                        ابدأ تمرين الوحش
                      </button>
                      <button onClick={() => setAddingCustom(true)} className="secondary-btn">
                        <Plus size={18} />
                        إضافة تمرين يدوي
                      </button>
                    </div>
                  )}
                </div>

                {selectedDay.isRestDay ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '50px' }}>🧘‍♂️</div>
                    <h3 style={{ fontSize: '20px', marginTop: '16px' }}>يوم راحة واستشفاء عضلي</h3>
                    <p style={{ maxWidth: '450px', margin: '10px auto 0', fontSize: '14px' }}>
                      الاستشفاء جزء لا يتجزأ من التطور الرياضي. ركز على التمدد الخفيف، المشي، شرب كميات وافرة من الماء، وتغذية جسدك بشكل سليم استعداداً للأيام القادمة.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedDay.exercises.map((ex: any) => (
                      <div
                        key={ex.id}
                        className="glass-panel glass-panel-hover"
                        style={{
                          display: 'flex',
                          padding: '20px',
                          gap: '20px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        {ex.imageUrl && (
                          <img
                            src={ex.imageUrl}
                            alt={ex.name}
                            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '18px' }}>{ex.name}</h3>
                            <span className="badge badge-secondary">{ex.targetMuscle}</span>
                            <span className="badge badge-primary">{ex.category}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            الجولات: <strong>{ex.sets}</strong> | التكرارات: <strong>{ex.reps}</strong> | الوزن: <strong>{ex.weight}</strong>
                          </p>
                          {ex.exerciseTips && (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                              💪 نصيحة أداء: {ex.exerciseTips}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            {ex.videoUrl && (
                              <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>
                                🎥 شرح يوتيوب شورتس
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Edit / Delete Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setEditingExercise(ex)}
                            className="secondary-btn"
                            style={{ padding: '8px 12px', borderColor: 'var(--border-color)' }}
                            title="تعديل"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(ex.id)}
                            className="secondary-btn"
                            style={{ padding: '8px 12px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ACTIVE WORKOUT PLAYER MODAL */}
      {showPlayer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', border: '1px solid var(--primary)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px' }}>مشغل التمرين التفاعلي 🏋️‍♂️</h3>
              <button onClick={() => setShowPlayer(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {(() => {
              const exercises = getSelectedDay()?.exercises || [];
              const ex = exercises[activeExerciseIndex];
              if (!ex) return null;

              return (
                <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <span className="badge badge-primary">تمرين {activeExerciseIndex + 1} من {exercises.length}</span>
                    <h2 style={{ fontSize: '22px', marginTop: '10px' }}>{ex.name}</h2>
                    <span className="badge badge-secondary" style={{ marginTop: '5px' }}>{ex.targetMuscle}</span>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الجولة الحالية</span>
                      <h3 style={{ fontSize: '32px', color: 'var(--primary)' }}>{currentSet} / {ex.sets}</h3>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الهدف المقترح</span>
                      <h3 style={{ fontSize: '20px' }}>{ex.reps} تكرار @ {ex.weight}</h3>
                    </div>
                  </div>

                  {/* Rest countdown */}
                  {isResting ? (
                    <div className="glass-panel" style={{ padding: '20px', borderColor: 'var(--secondary)', animation: 'pulse 1.5s infinite' }}>
                      <div style={{ display: 'flex', justifySelf: 'center', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
                        <Timer size={24} />
                        <h3 style={{ fontSize: '16px' }}>وقت الراحة والاستشفاء</h3>
                      </div>
                      <h2 style={{ fontSize: '48px', color: 'var(--secondary)', marginTop: '10px' }}>{restSeconds} ثانية</h2>
                      <button onClick={() => setIsResting(false)} className="secondary-btn" style={{ marginTop: '10px', fontSize: '12px' }}>تخطي الراحة</button>
                    </div>
                  ) : (
                    parseRepsToSeconds(ex.reps) !== null ? (
                      <div className="glass-panel" style={{ padding: '20px', borderColor: 'var(--primary)' }}>
                        <div style={{ display: 'flex', justifySelf: 'center', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                          <Timer size={24} />
                          <h3 style={{ fontSize: '16px' }}>عداد التمرين التنازلي</h3>
                        </div>
                        <h2 style={{ fontSize: '48px', color: 'var(--primary)', marginTop: '10px' }}>{exerciseSeconds} ثانية</h2>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setIsExerciseTimerActive(!isExerciseTimerActive)}
                            className="glow-btn"
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                          >
                            {isExerciseTimerActive ? 'إيقاف مؤقت' : 'بدء المؤقت'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExerciseTimerActive(false);
                              setExerciseSeconds(parseRepsToSeconds(ex.reps) || 0);
                            }}
                            className="secondary-btn"
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                          >
                            إعادة تعيين
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>التكرارات الفعلية</label>
                          <input id="rep-input" type="number" defaultValue={ex.reps.split('-')[0]} className="input-field" style={{ textAlign: 'center' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>الوزن المستعمل</label>
                          <input id="weight-input" type="text" defaultValue={ex.weight} className="input-field" style={{ textAlign: 'center' }} />
                        </div>
                      </div>
                    )
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>ملاحظات الجولة (اختياري)</label>
                    <input
                      type="text"
                      placeholder="كيف كان الشعور؟ (سلس، صعب، ألم طفيف...)"
                      value={exerciseLogNotes}
                      onChange={(e) => setExerciseLogNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {!isResting && (
                    <button onClick={handleFinishSet} className="glow-btn" style={{ justifyContent: 'center', padding: '14px', fontSize: '16px' }}>
                      إتمام الجولة {currentSet}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* EDIT EXERCISE MODAL */}
      {editingExercise && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleEditExerciseSubmit} className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '20px' }}>تعديل تفاصيل التمرين 🛠️</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>اسم التمرين</label>
              <input
                type="text"
                value={editingExercise.name}
                onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>الجولات</label>
                <input
                  type="number"
                  value={editingExercise.sets}
                  onChange={(e) => setEditingExercise({ ...editingExercise, sets: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>التكرارات</label>
                <input
                  type="text"
                  value={editingExercise.reps}
                  onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>الوزن المقترح</label>
              <input
                type="text"
                value={editingExercise.weight || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>العضلة المستهدفة</label>
              <input
                type="text"
                value={editingExercise.targetMuscle || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, targetMuscle: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>إرشادات الأداء</label>
              <textarea
                value={editingExercise.exerciseTips || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, exerciseTips: e.target.value })}
                className="input-field"
                style={{ minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>حفظ التعديلات</button>
              <button type="button" onClick={() => setEditingExercise(null)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* ADD CUSTOM EXERCISE MODAL */}
      {addingCustom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleAddCustomSubmit} className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '20px' }}>إضافة تمرين مخصص للجدول ➕</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>اسم التمرين</label>
              <input
                type="text"
                placeholder="مثال: رفرفة رف جانبي بالدمبلز"
                value={customExForm.name}
                onChange={(e) => setCustomExForm({ ...customExForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>الجولات</label>
                <input
                  type="number"
                  value={customExForm.sets}
                  onChange={(e) => setCustomExForm({ ...customExForm, sets: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>التكرارات</label>
                <input
                  type="text"
                  placeholder="10-12"
                  value={customExForm.reps}
                  onChange={(e) => setCustomExForm({ ...customExForm, reps: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>الوزن</label>
              <input
                type="text"
                placeholder="10 كجم أو وزن الجسم"
                value={customExForm.weight}
                onChange={(e) => setCustomExForm({ ...customExForm, weight: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>العضلة المستهدفة</label>
                <input
                  type="text"
                  placeholder="الأكتاف الجانبية"
                  value={customExForm.targetMuscle}
                  onChange={(e) => setCustomExForm({ ...customExForm, targetMuscle: e.target.value })}
                  className="input-field"
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>نوع التمرين</label>
                <select
                  value={customExForm.category}
                  onChange={(e) => setCustomExForm({ ...customExForm, category: e.target.value })}
                  className="input-field"
                >
                  <option value="IRON">حديد جيم (IRON)</option>
                  <option value="CALISTHENICS">مقاومة ووزن جسم (CALISTHENICS)</option>
                  <option value="YOGA">يوجا (YOGA)</option>
                  <option value="PILATES">بيلاتس (PILATES)</option>
                  <option value="HIIT">تمارين شدة عالية (HIIT)</option>
                  <option value="CARDIO">كارديو (CARDIO)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>نصائح الأداء</label>
              <textarea
                placeholder="حافظ على استقامة الظهر ولا تقم بمرجحة الوزن..."
                value={customExForm.exerciseTips}
                onChange={(e) => setCustomExForm({ ...customExForm, exerciseTips: e.target.value })}
                className="input-field"
                style={{ minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>إضافة التمرين</button>
              <button type="button" onClick={() => setAddingCustom(false)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
