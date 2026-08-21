import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Timer, Award, Flame, Dumbbell, CheckCircle2, ChevronRight, Calendar, Info, Utensils, Percent, Droplets, Camera, Volume2 } from 'lucide-react';
import { translations } from '../utils/translations';
import { MuscleWikiModal } from '../components/MuscleWikiModal';
import { ExerciseImage } from '../components/ExerciseImage';
import { SmartNutritionModal } from '../components/SmartNutritionModal';
import { BarbellPlate1RMModal } from '../components/BarbellPlate1RMModal';
import { RecoveryTrackerModal } from '../components/RecoveryTrackerModal';
import { TransformationGalleryModal } from '../components/TransformationGalleryModal';
import { RoutineCardExportModal } from '../components/RoutineCardExportModal';
import { DynamicWarmupModal } from '../components/DynamicWarmupModal';
import { InteractiveBodyMap } from '../components/InteractiveBodyMap';
import { calculateNutrition } from '../utils/nutritionCalculator';
import { playTimerSound, type SoundPack } from '../utils/audioSynthesizer';
import { cacheStore } from '../utils/cacheStore';
import { useWorkoutSession } from '../context/WorkoutSessionContext';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface DashboardProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, onNavigate }) => {
  const t = translations[lang] || translations.ar;
  const { startSession, maximizePlayer, state: sessionState } = useWorkoutSession();
  const [activePlan, setActivePlan] = useState<any>(() => cacheStore.get('active_plan'));
  const [profile, setProfile] = useState<any>(() => cacheStore.get('user_profile'));
  const [stats, setStats] = useState<any>(() => cacheStore.get('user_stats'));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState(() => !cacheStore.get('user_profile') && !cacheStore.get('active_plan'));
  const [regenerating, setRegenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [wikiExercise, setWikiExercise] = useState<any | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showStrengthCalcModal, setShowStrengthCalcModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showRoutineCardModal, setShowRoutineCardModal] = useState(false);
  const [showDynamicWarmupModal, setShowDynamicWarmupModal] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [selectedBodyMuscle, setSelectedBodyMuscle] = useState('ALL');
  const [timerSoundPack, setTimerSoundPack] = useState<SoundPack>(() => (localStorage.getItem('bm_timer_sound_pack') as SoundPack) || 'BOXING_BELL');
  const [timerVolume, setTimerVolume] = useState<number>(() => parseInt(localStorage.getItem('bm_timer_volume') || '80', 10));
  const [showSoundSettings, setShowSoundSettings] = useState(false);

  // Weekly Check-in States
  const [checkInDue, setCheckInDue] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [latestCheckIn, setLatestCheckIn] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInFeel, setCheckInFeel] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
  const [checkInCompleted, setCheckInCompleted] = useState<'YES' | 'MOSTLY' | 'NO'>('YES');
  const [checkInPain, setCheckInPain] = useState('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [, setHasStartedWorkouts] = useState(false);
  const [, setDaysRemaining] = useState(0);

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

  const handleGeneratePlan = async () => {
    const isComplete = profile && profile.fitnessGoal && profile.fitnessLevel && profile.daysPerWeek;
    if (!isComplete) {
      setProfileError(lang === 'en' ? 'Please complete your profile first.' : 'يرجى إكمال ملفك الشخصي أولاً.');
      return;
    }

    setProfileError('');
    setRegenerating(true);
    setLoadingMessage(lang === 'en' ? 'Building your personalized plan...' : 'جاري بناء جدولك الرياضي المخصص...');
    try {
      await api.generatePlan({
        durationWeeks: 4,
        startDate: new Date(),
        workoutLocation: profile.workoutLocation || 'GYM',
        equipment: profile.equipment ? profile.equipment.split(',') : [],
        level: profile.fitnessLevel,
        goal: profile.fitnessGoal,
        daysPerWeek: parseInt(profile.daysPerWeek) || 4,
        lang,
      });
      onNavigate('myplan');
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'Failed to generate plan.' : 'فشل توليد الخطة الرياضية.'));
    } finally {
      setRegenerating(false);
    }
  };

  const fetchDashboardData = async () => {
    // Only show full loading spinner if no cached data exists at all
    if (!cacheStore.get('active_plan') && !cacheStore.get('user_profile')) {
      setLoading(true);
    }
    try {
      // Fetch plan, profile, stats, and check-in status in parallel (Fast Concurrent Load)
      const [planRes, profRes, statsRes, checkInRes] = await Promise.allSettled([
        api.getActivePlan(),
        api.getProfile(),
        api.getStats(),
        api.getCheckInStatus(),
      ]);

      // 1. Process Plan
      if (planRes.status === 'fulfilled' && planRes.value) {
        const plan = planRes.value;
        setActivePlan(plan);
        cacheStore.set('active_plan', plan);
        if (plan.dayWorkouts && plan.dayWorkouts.length > 0) {
          const today = new Date();
          const todayDayIndex = today.getDay() + 1; // 0 = Sunday (Day 1), 1 = Monday (Day 2) ... 6 = Saturday (Day 7)
          setSelectedDayIndex(todayDayIndex >= 1 && todayDayIndex <= 7 ? todayDayIndex : 1);
        }
      }

      // 2. Process Profile
      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
        cacheStore.set('user_profile', profRes.value);
      }

      // 3. Process Stats
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
        cacheStore.set('user_stats', statsRes.value);
      }

      // 4. Process Check-in Status
      if (checkInRes.status === 'fulfilled' && checkInRes.value) {
        const status = checkInRes.value;
        setCheckInDue(!!status.due);
        setLatestCheckIn(status.latestCheckIn);
        setHasStartedWorkouts(!!status.hasStartedWorkouts);
        setDaysRemaining(status.daysRemaining || 0);
      }
    } catch (err: any) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleCloudSync = () => {
      fetchDashboardData();
    };
    window.addEventListener('beast_cloud_synced', handleCloudSync);
    return () => window.removeEventListener('beast_cloud_synced', handleCloudSync);
  }, []);

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCheckIn(true);
    try {
      const res = await api.submitCheckIn({
        workoutFeel: checkInFeel,
        sessionsCompleted: checkInCompleted,
        painNotes: checkInPain,
        lang
      });
      if (res.success) {
        alert(lang === 'en' 
          ? 'Check-in submitted successfully! Your recommendation is ready on the dashboard.'
          : 'تم إرسال التقييم بنجاح! اقتراح الكوتش جاهز الآن على لوحة التحكم.'
        );
        setShowCheckInModal(false);
        setCheckInDue(false);
        setLatestCheckIn(res.checkIn);
        setDaysRemaining(7);
        setHasStartedWorkouts(true);
        setCheckInPain('');
      }
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to submit check-in.' : 'فشل إرسال التقييم الأسبوعي.');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const handleApplySuggestions = async () => {
    setSubmittingCheckIn(true);
    try {
      const res = await api.applyCheckInSuggestions();
      if (res.success) {
        alert(res.message);
        // Reload dashboard details
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to apply suggestions.' : 'فشل تطبيق التعديلات.');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const formatProfileSummary = () => {
    if (!profile) return '';
    
    // Map goals
    const goalMapEn: any = {
      HYPERTROPHY: 'Build Muscle',
      LOSE_WEIGHT: 'Lose Weight',
      STRENGTH: 'Power & Strength',
      ENDURANCE: 'Cardio & Endurance',
      ATHLETICISM: 'Athletic Performance'
    };
    const goalMapAr: any = {
      HYPERTROPHY: 'بناء عضلات',
      LOSE_WEIGHT: 'خسارة وزن',
      STRENGTH: 'قوة بدنية',
      ENDURANCE: 'قوة تحمل',
      ATHLETICISM: 'أداء رياضي متكامل'
    };

    // Map levels
    const levelMapEn: any = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };
    const levelMapAr: any = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم'
    };

    const goal = lang === 'en' 
      ? (goalMapEn[profile.fitnessGoal] || profile.fitnessGoal || 'Build Muscle')
      : (goalMapAr[profile.fitnessGoal] || profile.fitnessGoal || 'بناء عضلات');

    const level = lang === 'en'
      ? (levelMapEn[profile.fitnessLevel] || profile.fitnessLevel || 'Intermediate')
      : (levelMapAr[profile.fitnessLevel] || profile.fitnessLevel || 'متوسط');


    const days = profile.daysPerWeek || '4';
    const daysStr = lang === 'en' ? `${days} days/week` : `${days} أيام/الأسبوع`;

    return lang === 'en'
      ? `Goal: ${goal} · ${level} · ${daysStr}`
      : `الهدف: ${goal} · ${level} · ${daysStr}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Active Plan and profile fetching and handling logic

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
    playTimerSound(timerSoundPack, timerVolume);
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

  const quickNutrition = useMemo(() => {
    if (!profile) return null;
    return calculateNutrition({
      weightKg: Number(profile.currentWeight) || 75,
      heightCm: Number(profile.height) || 175,
      age: Number(profile.age) || 26,
      gender: profile.gender === 'female' ? 'female' : 'male',
      fitnessGoal: profile.fitnessGoal || 'HYPERTROPHY',
      daysPerWeek: Number(profile.daysPerWeek) || 4,
    });
  }, [profile]);

  const getSelectedDay = () => {
    if (!activePlan) return null;
    return activePlan.dayWorkouts.find((dw: any) => dw.dayIndex === selectedDayIndex);
  };

  const handleStartWorkout = () => {
    const today = getSelectedDay();
    if (!today || !today.exercises || today.exercises.length === 0) return;
    startSession(today);
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

  const todayWorkout = getSelectedDay();

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header Info Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span>{lang === 'en' ? 'Welcome Back, Beast! ⚡' : 'مرحباً بعودتك، أيها البطل! ⚡'}</span>
            <span 
              onClick={async () => {
                setCheckInLoading(true);
                try {
                  const status = await api.getCheckInStatus(true);
                  setCheckInDue(status.due);
                  setHasStartedWorkouts(status.hasStartedWorkouts);
                  setDaysRemaining(status.daysRemaining);
                  setShowCheckInModal(true);
                } catch (err) {
                  alert('Failed to force checkin');
                } finally {
                  setCheckInLoading(false);
                }
              }}
              style={{ fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'normal' }}
            >
              {checkInLoading ? '...' : (lang === 'en' ? '[Test Check-In ⚡]' : '[تجربة التقييم الأسبوعي ⚡]')}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {lang === 'en' ? 'Fuel your consistency, crush today\'s limit, and activate BEASTMODE.' : 'زد من التزامك، وحطم أرقامك القياسية اليوم، ودع الوحش الذي بداخلك يستيقظ.'}
          </p>
          {profile && (profile.fitnessGoal || profile.fitnessLevel) && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎯</span>
              <span>{formatProfileSummary()}</span>
            </div>
          )}
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
            {loadingMessage || (lang === 'en' ? 'Regenerating Workout Plan...' : 'جاري إعادة توليد وتحديث خطتك الرياضية بالذكاء الاصطناعي...')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>
            {lang === 'en' ? 'Tailoring exercises based on your preferred location.' : 'نقوم بتوزيع التمارين والأدوات لتناسب موقع تمرينك الجديد.'}
          </p>
        </div>
      )}

      {loading && !regenerating && (
        <div style={{ padding: '20px 0' }}>
          <SkeletonLoader type="card" count={3} />
        </div>
      )}

      {!loading && !activePlan && !regenerating && (
        <div className="glass-panel text-center" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <Award size={48} color="var(--primary)" style={{ opacity: 0.8 }} />
          <h3>{lang === 'en' ? 'Setup Your Program' : 'صمم برنامجك الرياضي'}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {lang === 'en' ? 'Generate a customized weekly plan using your profile details, or complete the onboarding steps.' : 'قم بتوليد جدول تمارين أسبوعي مخصص باستخدام تفاصيل ملفك الشخصي، أو أكمل خطوات التهيئة.'}
          </p>
          
          {profileError && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span>⚠️ {profileError}</span>
              <button 
                onClick={() => onNavigate('profile')} 
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
              >
                {lang === 'en' ? 'Go to Profile page' : 'الذهاب لصفحة الملف الشخصي'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
            <button onClick={handleGeneratePlan} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
              ⚡ {lang === 'en' ? 'Generate Plan' : 'توليد الجدول ⚡'}
            </button>
            {(!profile || !profile.onboardingCompleted) && (
              <button onClick={() => onNavigate('onboarding')} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                {lang === 'en' ? 'Start Onboarding' : 'خطوات التهيئة'}
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !regenerating && activePlan && (
        <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Weekly Check-In Card / Coach Feedback Card */}
          {(() => {
            if (latestCheckIn && !latestCheckIn.applied) {
              return (
                <div className="glass-panel animated-fade" style={{ padding: '24px', borderLeft: '5px solid var(--primary)', background: 'rgba(0, 210, 255, 0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {lang === 'en' ? 'Coach AI Weekly Feedback' : 'نصيحة مدرب الذكاء الاصطناعي الأسبوعية'}
                      </h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(latestCheckIn.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '15px' }}>
                    "{latestCheckIn.aiRecommendation?.trim() || (lang === 'en' 
                      ? 'Welcome Champion! Start logging your daily workout sessions so Coach AI can analyze your performance and deliver customized weekly advice to level up your strength 🦍🔥' 
                      : 'أهلاً بك يا بطل! ابدأ بتسجيل تمارينك اليومية ليقوم المدرب الذكي بتحليل أدائك وتقديم خطة ونصائح أسبوعية مخصصة لتطوير مستواك 🦍🔥')}"
                  </p>
                  <button
                    onClick={handleApplySuggestions}
                    disabled={submittingCheckIn}
                    className="glow-btn"
                    style={{ padding: '8px 16px', fontSize: '12.5px' }}
                  >
                    {submittingCheckIn ? (lang === 'en' ? 'Applying...' : 'جاري التطبيق...') : (lang === 'en' ? 'Apply Suggestions ⚡' : 'تطبيق التعديلات المقترحة ⚡')}
                  </button>
                </div>
              );
            }

            if (checkInDue) {
              return (
                <div className="glass-panel animated-fade" style={{ padding: '20px', border: '1px solid var(--primary)', background: 'var(--primary-glow)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <span className="badge" style={{ background: 'var(--primary)', color: '#050710', fontWeight: 'bold' }}>
                        📅 {lang === 'en' ? 'Weekly AI Check-In' : 'التقييم الأسبوعي بالذكاء الاصطناعي'}
                      </span>
                      <h3 style={{ fontSize: '17px', fontWeight: '900', marginTop: '8px' }}>
                        {lang === 'en' ? 'How was your fitness progress this week?' : 'كيف كان تقدمك الرياضي هذا الأسبوع؟'}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '4px', maxWidth: '600px', lineHeight: '1.5' }}>
                        {lang === 'en' ? 'Your coach wants to review your workouts, pain notes, and consistency to customize your plan for the upcoming week!' : 'يرغب مدرب الذكاء الاصطناعي في مراجعة أدائك وتحديث خطتك التدريبية لتناسب مدى راحتك وتطور قوتك!'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCheckInModal(true)}
                      className="glow-btn"
                      style={{ padding: '10px 22px', fontSize: '13.5px' }}
                    >
                      {lang === 'en' ? 'Check In Now ⚡' : 'ابدأ التقييم الآن ⚡'}
                    </button>
                  </div>
                </div>
              );
            }

            // If not due and no pending recommendations, keep dashboard clean and focused
            return null;
          })()}

          {/* Top Widgets Row: Streak, Workouts, Minutes, Exercises */}
          <div className="grid-responsive-4col">
            {/* Streak Counter */}
            <div
              onClick={() => setShowRecoveryModal(true)}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                cursor: 'pointer',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s ease',
              }}
              title={lang === 'en' ? 'Click to view Recovery & Streak Badges' : 'انقر لعرض الاستشفاء وشارات الالتزام'}
            >
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Flame size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Workout Streak' : 'أيام الالتزام'}</span>
                  <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold' }}>🏅</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalStreak || 0} {lang === 'en' ? 'Days' : 'يوم'}
                </h2>
              </div>
            </div>

            {/* Total Workouts */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Dumbbell size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Total Workouts' : 'إجمالي الحصص'}</span>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#3b82f6', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalWorkouts || 0} {lang === 'en' ? 'Sessions' : 'حصة'}
                </h2>
              </div>
            </div>

            {/* Estimated Minutes */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Timer size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Estimated Minutes' : 'دقائق التمرين'}</span>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalMinutes || 0} {lang === 'en' ? 'Min' : 'دقيقة'}
                </h2>
              </div>
            </div>

            {/* Completed Exercises */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={28} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Completed Exercises' : 'التمارين المنجزة'}</span>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {stats?.workoutStats?.globalExercises || 0} {lang === 'en' ? 'Exs' : 'تمرين'}
                </h2>
              </div>
            </div>
          </div>

          {/* GitHub-Style Monthly Workout Streak Heatmap Matrix */}
          <div
            className="glass-panel"
            style={{
              padding: '20px 24px',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(15, 23, 42, 0.6))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔥</span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#fff' }}>
                  {lang === 'en' ? 'Monthly Workout Consistency Heatmap' : 'مصفوفة الالتزام والنشاط الرياضي الشهري'}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>{lang === 'en' ? 'Less' : 'أقل'}</span>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.35)' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span>{lang === 'en' ? 'Active' : 'نشط'}</span>
              </div>
            </div>

            {/* 28-Day Heatmap Grid */}
            <div className="streak-heatmap-grid">
              {Array.from({ length: 28 }).map((_, idx) => {
                const dayNum = idx + 1;
                const currentStreak = stats?.workoutStats?.globalStreak || 3;
                const isWorkoutDay = idx >= (28 - currentStreak) || (idx % 2 === 0 && idx > 10);
                const isToday = idx === 27;

                return (
                  <div
                    key={idx}
                    title={lang === 'en' ? `Day ${dayNum}: ${isWorkoutDay ? 'Completed Session ⚡' : 'Rest Day'}` : `اليوم ${dayNum}: ${isWorkoutDay ? 'حصة مكتملة ⚡' : 'راحة'}`}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '5px',
                      background: isWorkoutDay
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'rgba(255, 255, 255, 0.06)',
                      border: isToday ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.04)',
                      boxShadow: isWorkoutDay ? '0 0 8px rgba(16, 185, 129, 0.35)' : 'none',
                      transition: 'transform 0.15s ease',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>
                {lang === 'en' ? '⚡ 28-day active streak cycle' : '⚡ دورة التزام الـ 28 يوماً السابقة'}
              </span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                🔥 {stats?.workoutStats?.globalStreak || 0} {lang === 'en' ? 'Days Streak' : 'أيام متتالية مستمرة'}
              </span>
            </div>
          </div>

          {/* Smart Nutrition & Macro Coach Card */}
          {quickNutrition && (
            <div
              className="glass-panel animated-fade"
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Utensils size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                      {lang === 'en' ? 'Smart Nutrition & Macro Coach 🥗' : 'خطة التغذية والماكروز اليومية 🥗'}
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        fontWeight: '700',
                      }}
                    >
                      AI TDEE
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <span>🔥 <strong style={{ color: 'var(--primary)' }}>{quickNutrition.workoutDay.calories}</strong> kcal</span>
                    <span>🥩 {lang === 'en' ? 'Protein:' : 'البروتين:'} <strong style={{ color: '#ef4444' }}>{quickNutrition.workoutDay.proteinGrams}g</strong></span>
                    <span>🌾 {lang === 'en' ? 'Carbs:' : 'الكارب:'} <strong style={{ color: '#f59e0b' }}>{quickNutrition.workoutDay.carbsGrams}g</strong></span>
                    <span>🥑 {lang === 'en' ? 'Fats:' : 'الدهون:'} <strong style={{ color: 'var(--primary)' }}>{quickNutrition.workoutDay.fatsGrams}g</strong></span>
                    <span>💧 {lang === 'en' ? 'Water:' : 'الماء:'} <strong style={{ color: 'var(--secondary)' }}>{quickNutrition.waterIntakeLiters}L</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="secondary-btn"
                  style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                >
                  <Droplets size={14} />
                  <span>{lang === 'en' ? 'Hydration & Badges' : 'الماء والشارات 💧'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="secondary-btn"
                  style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: '#ec4899', color: '#ec4899' }}
                >
                  <Camera size={14} />
                  <span>{lang === 'en' ? 'Transformation Photos' : 'معرض الصور 📷'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNutritionModal(true)}
                  className="glow-btn"
                  style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{lang === 'en' ? 'Macro Coach 🥗' : 'خطة الماكروز 🥗'}</span>
                  <ChevronRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>
            </div>
          )}

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

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {!todayWorkout.isRestDay && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDynamicWarmupModal(true)}
                        className="secondary-btn"
                        style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: '#f59e0b', color: '#f59e0b' }}
                      >
                        <span>🤸‍♂️ {lang === 'en' ? 'Warmup (3m)' : 'إحماء (3د) 🔥'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRoutineCardModal(true)}
                        className="secondary-btn"
                        style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                      >
                        <span>📷 {lang === 'en' ? 'Routine Card' : 'بطاقة التمرين 📷'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowBodyMap(!showBodyMap)}
                        className={showBodyMap ? 'glow-btn' : 'secondary-btn'}
                        style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span>🗺️ {lang === 'en' ? 'Anatomy Map' : 'مجسم التشريح 🗺️'}</span>
                      </button>
                    </>
                  )}

                  {!todayWorkout.isRestDay && (
                    sessionState.status === 'active' || sessionState.status === 'resting' || sessionState.status === 'paused' ? (
                      <button
                        onClick={maximizePlayer}
                        className="glow-btn"
                        style={{
                          padding: '10px 20px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        <Dumbbell size={16} />
                        {lang === 'en' ? 'Resume Active Workout ⛶' : 'استئناف التمرين النشط ⛶'}
                      </button>
                    ) : (
                      <button
                        onClick={handleStartWorkout}
                        className="glow-btn shimmer-glow"
                        style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Dumbbell size={16} />
                        {lang === 'en' ? 'Start Active Player ⚡' : 'ابدأ مشغل التمرين التفاعلي ⚡'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Collapsible Interactive 3D Anatomy Map */}
              {showBodyMap && (
                <div className="animated-fade" style={{ marginBottom: '20px' }}>
                  <InteractiveBodyMap
                    lang={lang}
                    selectedMuscle={selectedBodyMuscle}
                    onSelectMuscle={(m) => setSelectedBodyMuscle(m)}
                  />
                </div>
              )}

              {todayWorkout.isRestDay ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '48px' }}>🧘‍♂️</span>
                  <h4 style={{ fontWeight: 'bold' }}>{t.restDayTitle}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>{t.restDayDesc}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {todayWorkout.exercises.map((ex: any) => (
                    <div
                      key={ex.id}
                      onClick={() => setWikiExercise({
                        ...ex,
                        name_en: ex.name,
                        name_ar: ex.name,
                        muscle_en: ex.targetMuscle || 'Chest',
                        instructions_ar: ex.exerciseTips || '',
                        image_url: ex.imageUrl || null,
                      })}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>●</span>
                        <span style={{ fontWeight: 'bold' }}>{ex.name}</span>
                        <span className="badge" style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', padding: '2px 8px' }}>
                          💡 MuscleWiki Guide
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {ex.sets} {t.sets} × {ex.reps} ({ex.weight || 'Bodyweight'})
                        </span>
                        <Info size={16} style={{ color: 'var(--primary)' }} />
                      </div>
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
                
                // Calculate the exact date for this dayIndex in the current week
                const start = new Date(activePlan.startDate);
                start.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                let currentWeek = Math.floor(diffDays / 7);
                if (currentWeek < 0) currentWeek = 0;
                
                const targetDate = new Date(start);
                targetDate.setDate(start.getDate() + (currentWeek * 7) + (dw.dayIndex - 1));

                const hasLogged = dw.exercises.some((ex: any) => 
                  ex.progressLogs && ex.progressLogs.some((log: any) => 
                    new Date(log.date).toDateString() === targetDate.toDateString()
                  )
                );

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                  {lang === 'en' ? 'Interactive Player 🏋️‍♂️' : 'مشغل التمرين التفاعلي 🏋️‍♂️'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowStrengthCalcModal(true)}
                  className="secondary-btn"
                  style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#f59e0b', color: '#f59e0b' }}
                  title={lang === 'en' ? 'Plate & 1RM Calculator' : 'حاسبة أوزان البار والـ 1RM'}
                >
                  <Percent size={12} />
                  <span>{lang === 'en' ? 'Plates' : 'البار'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSoundSettings(!showSoundSettings)}
                  className="secondary-btn"
                  style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  title={lang === 'en' ? 'Timer Audio Settings' : 'إعدادات صوت المؤقت'}
                >
                  <Volume2 size={12} />
                  <span>{lang === 'en' ? 'Sound' : 'الصوت'}</span>
                </button>
              </div>
              <button onClick={() => setShowPlayer(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* SOUND SETTINGS DRAWER */}
            {showSoundSettings && (
              <div
                className="glass-panel animated-fade"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800' }}>
                    {lang === 'en' ? 'Rest Timer Sound Effect:' : 'نغمة انتهاء وقت الراحة:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => playTimerSound(timerSoundPack, timerVolume)}
                    className="glow-btn"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                  >
                    🔊 {lang === 'en' ? 'Test Sound' : 'تجربة النغمة'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { id: 'BOXING_BELL', name_en: '🥊 Boxing Bell', name_ar: '🥊 جرس ملاكمة' },
                    { id: 'CYBER_BEEP', name_en: '🤖 Cyber Beep', name_ar: '🤖 صافرة رقمية' },
                    { id: 'ZEN_CHIME', name_en: '🔔 Zen Chime', name_ar: '🔔 جرس هادئ' },
                    { id: 'WHISTLE', name_en: '🎺 Coach Whistle', name_ar: '🎺 صافرة مدرب' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setTimerSoundPack(s.id as any);
                        localStorage.setItem('bm_timer_sound_pack', s.id);
                        playTimerSound(s.id as any, timerVolume);
                      }}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: timerSoundPack === s.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: timerSoundPack === s.id ? 'rgba(0, 210, 255, 0.15)' : 'transparent',
                        color: timerSoundPack === s.id ? 'var(--primary)' : 'var(--text-secondary)',
                        textAlign: 'center',
                      }}
                    >
                      {lang === 'en' ? s.name_en : s.name_ar}
                    </button>
                  ))}
                </div>

                {/* Volume Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    🔊 {lang === 'en' ? 'Volume:' : 'مستوى الصوت:'} {timerVolume}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={timerVolume}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setTimerVolume(v);
                      localStorage.setItem('bm_timer_volume', String(v));
                    }}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>
            )}

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
                        <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', background: '#0e111a', border: '1px solid var(--border-color)' }}>
                          <ExerciseImage src={ex.imageUrl} alt={ex.name} muscle={ex.targetMuscle} />
                        </div>
                      </div>
                    )}
                    {ex.anatomyImageUrl && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Anatomy Map' : 'العضلات المستهدفة'}</span>
                        <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', background: '#0e111a', border: '1px solid var(--border-color)' }}>
                          <ExerciseImage src={ex.anatomyImageUrl} alt="Target Muscle Anatomy" muscle={ex.targetMuscle} />
                        </div>
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

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.96)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form
            onSubmit={handleSubmitCheckIn}
            className="glass-panel animated-fade"
            style={{ width: '100%', maxWidth: '480px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>
                📅 {lang === 'en' ? 'Weekly AI Check-In' : 'التقييم الأسبوعي للمدرب'}
              </h3>
              <button type="button" onClick={() => setShowCheckInModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Question 1: How did workouts feel? */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                1. {lang === 'en' ? 'How did your workouts feel this week?' : 'كيف شعرت بصعوبة التمارين هذا الأسبوع؟'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {(['EASY', 'NORMAL', 'HARD'] as const).map((feel) => {
                  const labelEn = feel === 'EASY' ? 'Too Easy' : feel === 'NORMAL' ? 'Just Right' : 'Too Hard';
                  const labelAr = feel === 'EASY' ? 'سهل جداً' : feel === 'NORMAL' ? 'مناسب' : 'صعب جداً';
                  const active = checkInFeel === feel;
                  return (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => setCheckInFeel(feel)}
                      className={active ? 'glow-btn' : 'secondary-btn'}
                      style={{ padding: '8px', fontSize: '12px', justifyContent: 'center' }}
                    >
                      {lang === 'en' ? labelEn : labelAr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2: Did you complete all sessions? */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                2. {lang === 'en' ? 'Did you complete all planned sessions?' : 'هل أكملت جميع الجلسات المجدولة؟'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {(['YES', 'MOSTLY', 'NO'] as const).map((comp) => {
                  const labelEn = comp === 'YES' ? 'Yes' : comp === 'MOSTLY' ? 'Mostly' : 'No';
                  const labelAr = comp === 'YES' ? 'نعم بالكامل' : comp === 'MOSTLY' ? 'معظمها' : 'لا';
                  const active = checkInCompleted === comp;
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setCheckInCompleted(comp)}
                      className={active ? 'glow-btn' : 'secondary-btn'}
                      style={{ padding: '8px', fontSize: '12px', justifyContent: 'center' }}
                    >
                      {lang === 'en' ? labelEn : labelAr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 3: Pain / Discomfort */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                3. {lang === 'en' ? 'Any pain or discomfort? (Optional)' : 'هل تشعر بأي ألم أو إصابة؟ (اختياري)'}
              </label>
              <textarea
                value={checkInPain}
                onChange={(e) => setCheckInPain(e.target.value)}
                placeholder={lang === 'en' ? 'E.g., lower back tightness, knee pain...' : 'مثال: ألم خفيف في أسفل الظهر، أو الركبة...'}
                className="input-field"
                rows={3}
                style={{ resize: 'none', padding: '10px', fontSize: '13px' }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingCheckIn}
              className="glow-btn"
              style={{ justifyContent: 'center', padding: '12px', fontSize: '14px', marginTop: '10px' }}
            >
              {submittingCheckIn ? (lang === 'en' ? 'Analyzing with AI...' : 'جاري التحليل بالذكاء الاصطناعي...') : (lang === 'en' ? 'Submit Check-In' : 'إرسال التقييم الأسبوعي')}
            </button>
          </form>
        </div>
      )}

      {/* MuscleWiki Detail Modal */}
      {wikiExercise && (
        <MuscleWikiModal
          exercise={wikiExercise}
          lang={lang}
          onClose={() => setWikiExercise(null)}
        />
      )}

      {/* Smart Nutrition & Macro Coach Modal */}
      <SmartNutritionModal
        isOpen={showNutritionModal}
        lang={lang}
        userProfile={profile}
        onClose={() => setShowNutritionModal(false)}
      />

      {/* Barbell Plate & 1RM Calculator Modal */}
      <BarbellPlate1RMModal
        isOpen={showStrengthCalcModal}
        lang={lang}
        onClose={() => setShowStrengthCalcModal(false)}
      />

      {/* Recovery & Gamification Badges Hub Modal */}
      <RecoveryTrackerModal
        isOpen={showRecoveryModal}
        lang={lang}
        globalStreak={stats?.workoutStats?.globalStreak || 0}
        totalWorkouts={stats?.workoutStats?.globalWorkouts || 0}
        defaultWaterTargetLiters={quickNutrition?.waterIntakeLiters || 3.0}
        onClose={() => setShowRecoveryModal(false)}
      />

      {/* Transformation Photo Gallery Modal */}
      <TransformationGalleryModal
        isOpen={showGalleryModal}
        lang={lang}
        currentWeight={profile?.currentWeight ? parseFloat(profile.currentWeight) : 75}
        onClose={() => setShowGalleryModal(false)}
      />

      {/* Routine Card Export Modal */}
      {todayWorkout && (
        <RoutineCardExportModal
          isOpen={showRoutineCardModal}
          lang={lang}
          planTitle={activePlan?.title || (lang === 'en' ? 'BeastMode Routine' : 'جدول الوحش اليومي')}
          dayTitle={todayWorkout.title}
          dayIndex={todayWorkout.dayIndex || 1}
          focusArea={todayWorkout.focusArea}
          exercises={todayWorkout.exercises || []}
          onClose={() => setShowRoutineCardModal(false)}
        />
      )}

      {/* Dynamic Mobility Warmup Modal */}
      <DynamicWarmupModal
        isOpen={showDynamicWarmupModal}
        lang={lang}
        focusArea={todayWorkout?.focusArea || ''}
        onClose={() => setShowDynamicWarmupModal(false)}
      />
    </div>
  );
};
