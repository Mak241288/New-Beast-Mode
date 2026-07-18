import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Timer, Award, Flame, Dumbbell, CheckCircle2, ChevronRight, Activity, Calendar } from 'lucide-react';
import { translations } from '../utils/translations';

interface DashboardProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, onNavigate }) => {
  const t = translations[lang] || translations.ar;
  const [activePlan, setActivePlan] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
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

  // Exercise countdown timer (for time-based exercises like Plank)
  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [isExerciseTimerActive, setIsExerciseTimerActive] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch plan
      const plan = await api.getActivePlan();
      setActivePlan(plan);

      // Fetch user profile
      const prof = await api.getProfile();
      setProfile(prof);

      if (plan && plan.dayWorkouts.length > 0) {
        // Calculate today's day index based on start date
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
      console.error(err);
      setError(err.message || (lang === 'en' ? 'Could not load active workout routine.' : 'لم نتمكن من تحميل جدول التمارين النشط.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStreakCount = () => {
    if (!activePlan || !activePlan.dayWorkouts) return 0;
    const loggedDates = new Set<string>();
    activePlan.dayWorkouts.forEach((day: any) => {
      day.exercises.forEach((ex: any) => {
        if (ex.progressLogs) {
          ex.progressLogs.forEach((log: any) => {
            const dateStr = new Date(log.date).toDateString();
            loggedDates.add(dateStr);
          });
        }
      });
    });
    return loggedDates.size;
  };

  const getXPLevel = () => {
    if (!activePlan || !activePlan.dayWorkouts) return { level: lang === 'en' ? 'Newbie' : 'مبتدئ', xp: 0 };
    let totalLogs = 0;
    activePlan.dayWorkouts.forEach((day: any) => {
      day.exercises.forEach((ex: any) => {
        if (ex.progressLogs) {
          totalLogs += ex.progressLogs.length;
        }
      });
    });
    const xp = totalLogs * 10;
    let levelName = lang === 'en' ? 'Newbie' : 'مبتدئ';
    if (xp >= 100 && xp < 500) levelName = lang === 'en' ? 'Challenger' : 'متحدي';
    else if (xp >= 500) levelName = lang === 'en' ? 'Beast Mode' : 'الوحش ⚡';
    return { level: levelName, xp };
  };

  const handleLocationToggle = async (newLoc: 'GYM' | 'HOME') => {
    setRegenerating(true);
    try {
      // 1. Update Profile Location
      const updatedProfile = { ...profile, workoutLocation: newLoc };
      await api.updateProfile(updatedProfile);
      setProfile(updatedProfile);

      // 2. Regenerate Workout Plan
      await api.generatePlan({
        durationWeeks: 4,
        startDate: new Date(),
        workoutLocation: newLoc,
        equipment: newLoc === 'HOME' 
          ? ['dumbbells', 'bands'] 
          : (profile?.equipment ? profile.equipment.split(',') : []),
        level: profile?.fitnessLevel || 'intermediate',
        goal: profile?.fitnessGoal || 'HYPERTROPHY',
        restDays: [5, 7],
        daysPerWeek: 5,
        lang,
      });

      // 3. Reload Plan
      const newPlan = await api.getActivePlan();
      setActivePlan(newPlan);
      setSelectedDayIndex(1);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to switch workout location plan.' : 'فشل تغيير موقع التمرين وإعادة التوليد.');
    } finally {
      setRegenerating(false);
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep failed:', e);
    }
  };

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

  const getSelectedDay = () => {
    if (!activePlan) return null;
    return activePlan.dayWorkouts.find((dw: any) => dw.dayIndex === selectedDayIndex);
  };

  const handleStartWorkout = () => {
    const exercises = getSelectedDay()?.exercises || [];
    if (exercises.length === 0) return;
    
    setCompletedReps([]);
    setLoggedWeight([]);
    setExerciseLogNotes('');
    setActiveExerciseIndex(0);
    setCurrentSet(1);
    setIsResting(false);
    setShowPlayer(true);
    checkAndInitExerciseTimer(exercises[0]);
  };

  const handleFinishSet = () => {
    const exercises = getSelectedDay()?.exercises || [];
    const currentEx = exercises[activeExerciseIndex];
    
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
      setRestSeconds(60);
      setIsResting(true);
    } else {
      handleNextExercise(newReps, newWeights);
    }
  };

  const handleNextExercise = async (finalReps?: string[], finalWeights?: string[]) => {
    const exercises = getSelectedDay()?.exercises || [];
    const currentEx = exercises[activeExerciseIndex];
    const repsToLog = finalReps || completedReps;
    const weightsToLog = finalWeights || loggedWeight;

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
      checkAndInitExerciseTimer(exercises[activeExerciseIndex + 1]);
    } else {
      setShowPlayer(false);
      alert(lang === 'en' ? 'Congratulations! You have completed today\'s routine! Keep up the beast momentum!' : 'تهانينا! لقد أنهيت تمرين اليوم بنجاح. استمر في هذا الزخم للوحوش!');
      fetchDashboardData();
    }
  };

  // Rest timer tick
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restSeconds === 0) {
      setIsResting(false);
      playBeep();
      const exercises = getSelectedDay()?.exercises || [];
      const currentEx = exercises[activeExerciseIndex];
      checkAndInitExerciseTimer(currentEx);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds, activeExerciseIndex, selectedDayIndex]);

  // Exercise timer tick
  useEffect(() => {
    let interval: any = null;
    if (isExerciseTimerActive && exerciseSeconds > 0) {
      interval = setInterval(() => {
        setExerciseSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isExerciseTimerActive && exerciseSeconds === 0) {
      setIsExerciseTimerActive(false);
      playBeep();
      handleFinishSet();
    }
    return () => clearInterval(interval);
  }, [isExerciseTimerActive, exerciseSeconds]);

  const streak = getStreakCount();
  const xpInfo = getXPLevel();
  const todayWorkout = getSelectedDay();

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header Info Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>
            {lang === 'en' ? 'Welcome Back, Beast! ⚡' : 'مرحباً بعودتك، أيها البطل! ⚡'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {lang === 'en' ? 'Fuel your consistency, crush today\'s limit, and activate BEASTMODE.' : 'زد من التزامك، وحطم أرقامك القياسية اليوم، ودع الوحش الذي بداخلك يستيقظ.'}
          </p>
        </div>

        {/* Workout Location Toggle */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              📍 {lang === 'en' ? 'Location' : 'الموقع'}:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => profile.workoutLocation !== 'GYM' && handleLocationToggle('GYM')}
                disabled={regenerating}
                className={profile.workoutLocation === 'GYM' ? 'glow-btn' : 'secondary-btn'}
                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '10px' }}
              >
                🏋️‍♂️ {lang === 'en' ? 'Gym' : 'النادي'}
              </button>
              <button
                onClick={() => profile.workoutLocation !== 'HOME' && handleLocationToggle('HOME')}
                disabled={regenerating}
                className={profile.workoutLocation === 'HOME' ? 'glow-btn' : 'secondary-btn'}
                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '10px' }}
              >
                🏠 {lang === 'en' ? 'Home' : 'البيت'}
              </button>
            </div>
          </div>
        )}
      </div>

      {regenerating && (
        <div className="glass-panel text-center" style={{ padding: '50px', marginBottom: '24px', border: '1px solid var(--primary)' }}>
          <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>🔄</div>
          <h3 style={{ marginTop: '15px' }}>
            {lang === 'en' ? 'Regenerating Workout Plan...' : 'جاري إعادة توليد وتحديث خطتك الرياضية بالذكاء الاصطناعي...'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>
            {lang === 'en' ? 'Tailoring exercises based on your preferred location.' : 'نقوم بتوزيع التمارين والأدوات لتناسب موقع تمرينك الجديد.'}
          </p>
        </div>
      )}

      {loading && !regenerating && (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          {lang === 'en' ? 'Loading your fitness dashboard...' : 'جاري تحميل لوحتك الرئيسية...'}
        </div>
      )}

      {error && !activePlan && !regenerating && (
        <div className="glass-panel text-center" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <Award size={48} color="var(--primary)" style={{ opacity: 0.8 }} />
          <h3>{lang === 'en' ? 'Setup Your Program' : 'صمم برنامجك الرياضي'}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {lang === 'en' ? 'Please complete the onboarding steps to generate your first workout routine.' : 'يرجى إكمال خطوات التهيئة البسيطة لتوليد خطة تمارين مخصصة لك بالكامل.'}
          </p>
          <button onClick={() => onNavigate('onboarding')} className="glow-btn">
            {lang === 'en' ? 'Start Onboarding' : 'ابدأ الآن ⚡'}
          </button>
        </div>
      )}

      {!loading && !regenerating && activePlan && (
        <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Widgets Row: Streak & Level */}
          <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Streak Counter */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '15px', borderRadius: '16px' }}>
                <Flame size={32} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Active Workout Streak' : 'الأيام المتتالية للالتزام'}</span>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#ef4444', marginTop: '2px' }}>
                  {streak} {lang === 'en' ? 'Days' : 'يوم متتالي'}
                </h2>
              </div>
            </div>

            {/* XP Level */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '15px', borderRadius: '16px' }}>
                <Activity size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Beast Tier Level' : 'مستوى القوة والخبرة'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>{xpInfo.xp} XP</span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>
                  {xpInfo.level}
                </h2>
              </div>
            </div>
          </div>

          {/* Today's Workout Routine Card */}
          {todayWorkout && (
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '10px' }}>
                    {lang === 'en' ? 'TODAY\'S TASK' : 'مهمة اليوم الرياضية'}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '6px' }}>{todayWorkout.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                    🎯 {todayWorkout.focusArea} | {todayWorkout.isRestDay ? (lang === 'en' ? 'Rest Day' : 'يوم راحة') : `${todayWorkout.exercises.length} ${t.exercises}`}
                  </p>
                </div>

                {!todayWorkout.isRestDay && (
                  <button onClick={handleStartWorkout} className="glow-btn" style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Dumbbell size={16} />
                    {lang === 'en' ? 'Start Active Player ⚡' : 'ابدأ مشغل التمرين التفاعلي ⚡'}
                  </button>
                )}
              </div>

              {todayWorkout.isRestDay ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '48px' }}>🧘‍♂️</span>
                  <h4 style={{ fontWeight: 'bold' }}>{t.restDayTitle}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>{t.restDayDesc}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {todayWorkout.exercises.map((ex: any) => (
                    <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>●</span>
                        <span style={{ fontWeight: 'bold' }}>{ex.name}</span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {ex.sets} {t.sets} × {ex.reps} ({ex.weight || 'Bodyweight'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weekly Overview Planner */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Calendar size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>
                {lang === 'en' ? 'Weekly Workout Schedule Overview' : 'مخطط وجدول تمارين الأسبوع'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activePlan.dayWorkouts.map((dw: any) => {
                const isSelected = dw.dayIndex === selectedDayIndex;
                const hasLogged = dw.exercises.some((ex: any) => ex.progressLogs && ex.progressLogs.length > 0);

                return (
                  <div
                    key={dw.id}
                    onClick={() => setSelectedDayIndex(dw.dayIndex)}
                    className="glass-panel animated-fade"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: dw.isRestDay ? 'var(--text-muted)' : 'var(--primary)',
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>
                          {lang === 'en' ? `Day ${dw.dayIndex}` : `اليوم ${dw.dayIndex}`}: {dw.title.split(' - ')[1] || dw.title}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {dw.focusArea}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hasLogged && (
                        <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                          <CheckCircle2 size={14} />
                          {lang === 'en' ? 'Completed' : 'مكتمل'}
                        </span>
                      )}
                      {dw.isRestDay && (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '10px' }}>
                          {lang === 'en' ? 'Rest' : 'راحة'}
                        </span>
                      )}
                      <ChevronRight size={16} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE WORKOUT PLAYER MODAL */}
      {showPlayer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.98)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '500px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>
                {lang === 'en' ? 'Interactive Workout Player 🏋️‍♂️' : 'مشغل التمرين التفاعلي 🏋️‍♂️'}
              </h3>
              <button onClick={() => setShowPlayer(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {(() => {
              const exercises = getSelectedDay()?.exercises || [];
              const ex = exercises[activeExerciseIndex];
              if (!ex) return null;

              const isTimeBased = parseRepsToSeconds(ex.reps) !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '11px' }}>
                      {lang === 'en' ? `Exercise ${activeExerciseIndex + 1} of ${exercises.length}` : `تمرين ${activeExerciseIndex + 1} من ${exercises.length}`}
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', marginTop: '8px' }}>{ex.name}</h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>🎯 {ex.targetMuscle}</span>
                  </div>

                  {/* Images */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {ex.imageUrl && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Movement' : 'طريقة الحركة'}</span>
                        <img src={ex.imageUrl} alt={ex.name} style={{ width: '100%', height: '110px', borderRadius: '8px', objectFit: 'contain', background: '#0e111a', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                    {ex.anatomyImageUrl && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Anatomy Map' : 'العضلات المستهدفة'}</span>
                        <img src={ex.anatomyImageUrl} alt="Target Muscle Anatomy" style={{ width: '100%', height: '110px', borderRadius: '8px', objectFit: 'contain', background: '#0e111a', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>

                  {/* Target Details */}
                  <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{lang === 'en' ? 'Current Set' : 'الجولة الحالية'}</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{currentSet} / {ex.sets}</h3>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{lang === 'en' ? 'AI Suggestion' : 'الهدف المقترح'}</span>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{ex.reps} reps @ {ex.weight || 'Bodyweight'}</h3>
                    </div>
                  </div>

                  {/* Rest timer / Exercise Countdown */}
                  {isResting ? (
                    <div className="glass-panel text-center" style={{ padding: '16px', borderColor: 'var(--secondary)', animation: 'pulse 1.5s infinite' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--secondary)' }}>
                        <Timer size={18} />
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>{lang === 'en' ? 'Rest Time' : 'وقت الراحة والاستشفاء'}</h4>
                      </div>
                      <h2 style={{ fontSize: '36px', color: 'var(--secondary)', fontWeight: '900', marginTop: '6px' }}>{restSeconds}s</h2>
                      <button onClick={() => setIsResting(false)} className="secondary-btn" style={{ marginTop: '8px', fontSize: '11px', padding: '4px 10px' }}>
                        {lang === 'en' ? 'Skip Rest' : 'تخطي الراحة'}
                      </button>
                    </div>
                  ) : (
                    isTimeBased ? (
                      <div className="glass-panel text-center" style={{ padding: '16px', borderColor: 'var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                          <Timer size={18} />
                          <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>{lang === 'en' ? 'Countdown Timer' : 'عداد التمرين التنازلي'}</h4>
                        </div>
                        <h2 style={{ fontSize: '36px', color: 'var(--primary)', fontWeight: '900', marginTop: '6px' }}>{exerciseSeconds}s</h2>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setIsExerciseTimerActive(!isExerciseTimerActive)}
                            className="glow-btn"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            {isExerciseTimerActive ? (lang === 'en' ? 'Pause' : 'إيقاف مؤقت') : (lang === 'en' ? 'Start' : 'بدء المؤقت')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExerciseTimerActive(false);
                              setExerciseSeconds(parseRepsToSeconds(ex.reps) || 0);
                            }}
                            className="secondary-btn"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            {lang === 'en' ? 'Reset' : 'إعادة تعيين'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'en' ? 'Actual Reps' : 'التكرارات الفعلية'}</label>
                          <input id="rep-input" type="number" defaultValue={ex.reps.split('-')[0]} className="input-field" style={{ textAlign: 'center' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'en' ? 'Weight Used' : 'الوزن المستعمل'}</label>
                          <select id="weight-input" defaultValue={ex.weight || 'Bodyweight'} className="input-field" style={{ textAlign: 'center', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px', cursor: 'pointer' }}>
                            <option value="Bodyweight">{lang === 'en' ? 'Bodyweight' : 'وزن الجسم'}</option>
                            {(() => {
                              const opts = [];
                              for (let w = 2.5; w <= 150; w += 2.5) {
                                const val = `${w} kg`;
                                opts.push(<option key={val} value={val}>{val}</option>);
                              }
                              if (ex.weight && ex.weight !== 'Bodyweight' && !opts.some(o => o.props.value === ex.weight)) {
                                opts.unshift(<option key={ex.weight} value={ex.weight}>{ex.weight}</option>);
                              }
                              return opts;
                            })()}
                          </select>
                        </div>
                      </div>
                    )
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>{lang === 'en' ? 'Notes (Optional)' : 'ملاحظات الجولة (اختياري)'}</label>
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'E.g., felt light, shoulder pain...' : 'كيف كان شعورك بالوزن؟'}
                      value={exerciseLogNotes}
                      onChange={(e) => setExerciseLogNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {!isResting && (
                    <button onClick={handleFinishSet} className="glow-btn" style={{ justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                      {lang === 'en' ? `Complete Set ${currentSet}` : `إتمام الجولة ${currentSet}`}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
