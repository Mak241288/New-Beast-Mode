import React, { useState, useEffect, useMemo } from 'react';
import { useWorkoutSession } from '../context/WorkoutSessionContext';
import { ExerciseImage } from './ExerciseImage';
import { WorkoutCompletionModal } from './WorkoutCompletionModal';
import { PostWorkoutConfettiModal } from './PostWorkoutConfettiModal';
import { SmartExerciseSwapModal } from './SmartExerciseSwapModal';
import { DynamicWarmupModal } from './DynamicWarmupModal';
import { RoutineCardExportModal } from './RoutineCardExportModal';
import { MuscleWikiModal } from './MuscleWikiModal';
import { audioCues } from '../utils/audioCues';
import { 
  Play, 
  Pause, 
  Minimize2, 
  Check, 
  FastForward, 
  Square, 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Timer, 
  Clock,
  Sparkles,
  Share2,
  Droplets,
  RefreshCw,
  Target,
  Volume2,
  VolumeX,
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';

interface GlobalWorkoutPlayerProps {
  lang?: 'ar' | 'en';
}

export const GlobalWorkoutPlayer: React.FC<GlobalWorkoutPlayerProps> = ({ lang = 'ar' }) => {
  const {
    state,
    minimizePlayer,
    finishCurrentSet,
    updateSetLog,
    addNewSet,
    removeSet,
    skipRest,
    addRestSeconds,
    togglePauseRestTimer,
    togglePauseWorkout,
    nextExercise,
    prevExercise,
    finishWorkoutSession,
    discardSession,
    closeSummaryModal,
  } = useWorkoutSession();

  const isAr = lang === 'ar';
  const [saving, setSaving] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [showDynamicWarmupModal, setShowDynamicWarmupModal] = useState(false);
  const [showRoutineCardModal, setShowRoutineCardModal] = useState(false);
  const [isExpressMode, setIsExpressMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showQuickSwapModal, setShowQuickSwapModal] = useState(false);
  const [showMuscleWiki, setShowMuscleWiki] = useState(false);
  const [waterToast, setWaterToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Isometric Hold Timer State
  const [isHolding, setIsHolding] = useState(false);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(0);

  // Web Audio Native Synthesized Rest Bell (0 KB, 100% Offline)
  const playRestEndBell = () => {
    if (!soundEnabled) return;
    audioCues.playRestFinishedChime();
  };

  // Play bell when rest finishes
  useEffect(() => {
    if (state.isResting && state.restRemainingSeconds === 1) {
      playRestEndBell();
    }
  }, [state.isResting, state.restRemainingSeconds]);

  // Isometric Hold interval
  useEffect(() => {
    let interval: any = null;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  // 1. Calculate Remaining Sets & Estimated Workout Finish Time
  const remainingSets = useMemo(() => {
    let count = 0;
    Object.values(state.setLogs).forEach((logs) => {
      logs.forEach((s) => {
        if (!s.completed) count++;
      });
    });
    return count;
  }, [state.setLogs]);

  const estimatedFinishTimeStr = useMemo(() => {
    if (remainingSets === 0) return isAr ? 'مكتمل' : 'Done';
    const remainingSecondsTotal = remainingSets * 135; // ~45s work + 90s rest
    const finishDate = new Date(Date.now() + remainingSecondsTotal * 1000);
    return finishDate.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }, [remainingSets, isAr]);

  // 2. 1-Tap Hydration Sip (+200ml)
  const handleQuickWaterSip = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `hydration_log_${today}`;
      const current = Number(localStorage.getItem(key) || 0) + 200;
      localStorage.setItem(key, String(current));
      setWaterToast(isAr ? '+200 مل ماء 💧 عاش!' : '+200ml Water 💧 Hydrated!');
      setTimeout(() => setWaterToast(null), 2000);
    } catch {
      // Non-fatal
    }
  };

  // 3. Keyboard Spacebar Shortcut to Complete Set & Trigger Rest
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          e.preventDefault();
          const currentLogs = state.setLogs[state.activeExerciseIndex] || [];
          const currentSet = currentLogs[state.currentSetIndex];
          if (currentSet && !currentSet.completed) {
            finishCurrentSet({ reps: currentSet.reps, weight: currentSet.weight });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeExerciseIndex, state.currentSetIndex, state.setLogs, finishCurrentSet]);

  // If summary modal is active
  if (state.showSummaryModal && state.summaryData) {
    const s = state.summaryData;
    return (
      <div
        className="modal-backdrop animated-fade"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          className="glass-panel"
          style={{
            maxWidth: '520px',
            width: '100%',
            padding: '32px',
            borderRadius: '24px',
            textAlign: 'center',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 210, 255, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Trophy size={38} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '0 0 8px 0' }}>
            {isAr ? 'عاش يا بطل! أنهيت تمرين اليوم ⚡' : 'Awesome Job, Beast! Workout Finished! ⚡'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px 0' }}>
            {isAr ? `تم تسجيل إنجازك في ${s.dayTitle} بنجاح` : `Successfully logged progress for ${s.dayTitle}`}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div className="glass-panel" style={{ padding: '14px 8px', borderRadius: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>
                {s.durationMinutes} <span style={{ fontSize: '11px' }}>{isAr ? 'دقيقة' : 'min'}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isAr ? '⏱️ المدة الكلية' : 'Duration'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px 8px', borderRadius: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#f59e0b' }}>
                {s.totalSetsCompleted}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isAr ? '🎯 جولات مكتملة' : 'Sets Completed'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '14px 8px', borderRadius: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>
                {s.totalVolumeKg} <span style={{ fontSize: '11px' }}>kg</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isAr ? '🏋️ إجمالي الحجم' : 'Total Volume'}
              </div>
            </div>
          </div>

          {/* Progressive Overload Auto-Predictor Hint */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(0, 210, 255, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '16px',
              padding: '12px 16px',
              textAlign: isAr ? 'right' : 'left',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '10px' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#10b981' }}>
                {isAr ? '💡 مؤشر الزيادة التدريجية للجلسة القادمة (Progressive Overload):' : '💡 Next Session Progressive Overload Hint:'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {isAr
                  ? 'أداؤك كان قوياً اليوم! ننصح بإضافة +2.5 كغ على التمارين المركبة أو زيادة +1-2 تكرار في جلستك القادمة لكسر الثبات العضلي.'
                  : 'Great intensity today! We recommend adding +2.5kg to compound lifts or +1-2 reps next session to stimulate continuous hypertrophy.'}
              </div>
            </div>
          </div>

          {/* Social Share Achievement Card Button */}
          <button
            onClick={() => setShowShareCardModal(true)}
            className="secondary-btn"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--primary)',
            }}
          >
            <Share2 size={16} />
            <span>{isAr ? '📸 مشاركة بطاقة الإنجاز (Story / WhatsApp)' : '📸 Share Achievement Card (Story / WhatsApp)'}</span>
          </button>

          <button
            onClick={closeSummaryModal}
            className="glow-btn"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 'bold',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={18} />
            <span>{isAr ? 'العودة للوحة التحكم 🚀' : 'Back to Dashboard 🚀'}</span>
          </button>

          {/* Render WorkoutCompletionModal if requested */}
          {showShareCardModal && (
            <WorkoutCompletionModal
              isOpen={showShareCardModal}
              onClose={() => setShowShareCardModal(false)}
              lang={lang as any}
              summary={{
                workoutTitle: s.dayTitle,
                durationMinutes: s.durationMinutes,
                completedCount: s.totalSetsCompleted,
                totalExercises: s.exercisesCount || 5,
                totalWeightKg: s.totalVolumeKg,
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // If player is not open or session is idle, don't render full player modal
  if (!state.isPlayerOpen || state.status === 'idle' || state.status === 'completed' || !state.dayData) {
    return null;
  }

  const exercises = state.dayData.exercises || [];
  const currentEx = exercises[state.activeExerciseIndex];
  if (!currentEx) return null;

  const exName = isAr ? (currentEx.name_ar || currentEx.name || currentEx.name_en) : (currentEx.name_en || currentEx.name);
  const currentLogs = state.setLogs[state.activeExerciseIndex] || [];
  const activeSet = currentLogs[state.currentSetIndex] || { setNumber: state.currentSetIndex + 1, reps: '10', weight: '20 kg', completed: false };
  const totalExercises = exercises.length;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishWorkout = async () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من إنهاء وحفظ جلسة التمرين بالكامل؟' : 'Are you sure you want to finish and log this workout?')) {
      setSaving(true);
      try {
        await finishWorkoutSession();
      } finally {
        setSaving(false);
      }
    }
  };

  // Quick Equipment Swap Alternatives
  const quickAlternatives = [
    { titleEn: 'Dumbbell Variant', titleAr: 'بديل بالدمبلز الحر 🏋️', name: `Dumbbell ${currentEx.name_en || 'Variation'}` },
    { titleEn: 'Cable Machine Variant', titleAr: 'بديل بجهاز الكيبل 🔌', name: `Cable ${currentEx.name_en || 'Variation'}` },
    { titleEn: 'Bodyweight / Calisthenics', titleAr: 'بديل بوزن الجسم / مات 🤸', name: `Bodyweight ${currentEx.name_en || 'Variation'}` },
  ];

  const handleApplyAlternative = (altName: string) => {
    if (currentEx) {
      currentEx.name = altName;
      currentEx.name_en = altName;
      currentEx.name_ar = altName;
      setShowQuickSwapModal(false);
    }
  };

  // ==========================================
  // VIEW 1: ULTRA-CLEAN GYM/HOME FOCUS COCKPIT
  // ==========================================
  if (isFocusMode) {
    return (
      <div
        className="modal-backdrop animated-fade"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 20px',
          color: '#fff',
        }}
      >
        {/* Focus Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => setIsFocusMode(false)}
            className="secondary-btn"
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Minimize2 size={15} />
            <span>{isAr ? 'الوضع العادي' : 'Exit Focus'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>⏱️ {formatTime(state.totalElapsedSeconds)}</span>
            <span>•</span>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>⏳ {estimatedFinishTimeStr}</span>
          </div>

          <div style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
            {state.activeExerciseIndex + 1} / {totalExercises}
          </div>
        </div>

        {/* Water Toast */}
        {waterToast && (
          <div className="animated-fade" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(6, 182, 212, 0.95)', color: '#000', padding: '8px 20px', borderRadius: '30px', fontWeight: '900', fontSize: '14px', zIndex: 10001, boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
            {waterToast}
          </div>
        )}

        {/* Focus Center Cockpit */}
        <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          
          {/* Exercise Title */}
          <div>
            <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
              🎯 {currentEx.muscle_ar || currentEx.muscle_en || currentEx.targetMuscle || 'TARGET MUSCLE'}
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 6vw, 42px)', fontWeight: '900', margin: '6px 0 0', lineHeight: 1.2, color: '#ffffff' }}>
              {exName}
            </h1>
          </div>

          {/* Active Rest Timer Cockpit if Resting */}
          {state.isResting ? (
            <div className="glass-panel animated-fade" style={{ width: '100%', padding: '30px 20px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))', border: '2px solid rgba(245, 158, 11, 0.6)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Timer size={18} />
                <span>{isAr ? 'فترة الراحة بين الجولات ⏳' : 'Rest Countdown ⏳'}</span>
              </div>
              <div className={`animated-fade ${state.restRemainingSeconds <= 5 && state.restRemainingSeconds > 0 ? 'rest-timer-pulse' : ''}`} style={{ fontSize: 'clamp(56px, 12vw, 84px)', fontWeight: '900', color: state.restRemainingSeconds <= 5 ? '#10b981' : '#ffffff', fontVariantNumeric: 'tabular-nums', margin: '10px 0', transition: 'color 0.3s ease' }}>
                {formatTime(state.restRemainingSeconds)}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => addRestSeconds(30)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  +30s
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'صوت الجرس مفعل' : 'الصوت مكتوم'}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: soundEnabled ? '#10b981' : '#94a3b8', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={handleQuickWaterSip}
                  style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', color: 'var(--secondary)', padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Droplets size={16} />
                  <span>+200ml 💧</span>
                </button>
                <button
                  onClick={skipRest}
                  style={{ background: '#f59e0b', border: 'none', color: '#000', padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', cursor: 'pointer' }}
                >
                  {isAr ? 'تخطي الراحة ⚡' : 'Skip Rest ⚡'}
                </button>
              </div>
            </div>
          ) : (
            /* Active Set Cockpit */
            <div className="glass-panel" style={{ width: '100%', padding: '28px 20px', borderRadius: '24px', border: '2px solid rgba(16, 185, 129, 0.5)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08), rgba(0,0,0,0.5))' }}>
              <div style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '900', letterSpacing: '1px' }}>
                {isAr ? `الجولة ${state.currentSetIndex + 1} من ${currentLogs.length}` : `SET ${state.currentSetIndex + 1} OF ${currentLogs.length}`}
              </div>

              {/* Large Weight & Reps Controllers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0' }}>
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{isAr ? 'الوزن المرفوع' : 'Weight'}</div>
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={activeSet.weight}
                    onChange={(e) => updateSetLog(state.activeExerciseIndex, state.currentSetIndex, { weight: e.target.value })}
                    style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '32px', fontWeight: '900', textAlign: 'center', unicodeBidi: 'plaintext' }}
                  />
                </div>
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{isAr ? 'التكرار المنجز' : 'Reps'}</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={activeSet.reps}
                    onChange={(e) => updateSetLog(state.activeExerciseIndex, state.currentSetIndex, { reps: e.target.value })}
                    style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '32px', fontWeight: '900', textAlign: 'center', unicodeBidi: 'plaintext' }}
                  />
                </div>
              </div>

              {/* GIANT 1-TAP COMPLETE BUTTON */}
              <button
                onClick={() => finishCurrentSet({ reps: activeSet.reps, weight: activeSet.weight })}
                className="glow-btn"
                style={{ width: '100%', padding: '20px', fontSize: '18px', fontWeight: '900', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <Check size={24} />
                <span>{isAr ? 'إنهاء الجولة وبدء الراحة (Space) ⚡' : 'COMPLETE SET & REST (Space) ⚡'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Focus Bottom Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', margin: '0 auto', gap: '12px' }}>
          <button
            onClick={prevExercise}
            disabled={state.activeExerciseIndex === 0}
            className="secondary-btn"
            style={{ flex: 1, padding: '14px', fontSize: '14px', borderRadius: '12px', opacity: state.activeExerciseIndex === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>{isAr ? 'التمرين السابق' : 'Previous Ex'}</span>
          </button>
          <button
            onClick={nextExercise}
            disabled={state.activeExerciseIndex >= exercises.length - 1}
            className="secondary-btn"
            style={{ flex: 1, padding: '14px', fontSize: '14px', borderRadius: '12px', opacity: state.activeExerciseIndex >= exercises.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>{isAr ? 'التالي' : 'Next Ex'}</span>
            {isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: STANDARD DETAILED WORKOUT PLAYER
  // ==========================================
  return (
    <div
      className="modal-backdrop animated-fade"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(0, 210, 255, 0.3)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 210, 255, 0.15)',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Day Title & Estimated Finish */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>
                {state.dayData.title || (isAr ? 'جلسة تدريبية' : 'Workout Session')}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(0, 210, 255, 0.15)',
                  color: 'var(--primary)',
                  fontWeight: 'bold',
                }}
              >
                {isAr ? `تمرين ${state.activeExerciseIndex + 1} من ${totalExercises}` : `Ex ${state.activeExerciseIndex + 1}/${totalExercises}`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} color="var(--primary)" />
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#fff', fontWeight: 'bold' }}>
                  {formatTime(state.totalElapsedSeconds)}
                </span>
                {state.isPaused && <span style={{ color: '#f87171' }}>({isAr ? 'مؤقت' : 'Paused'})</span>}
              </span>
              <button
                onClick={togglePauseWorkout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: state.isPaused ? '#10b981' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: 0,
                }}
              >
                {state.isPaused ? <Play size={12} /> : <Pause size={12} />}
                <span>{state.isPaused ? (isAr ? 'استئناف' : 'Resume') : (isAr ? 'إيقاف مؤقت' : 'Pause')}</span>
              </button>
              <span>•</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                ⏳ {isAr ? `انتهاء: ${estimatedFinishTimeStr} (${remainingSets} جولات)` : `Finish: ${estimatedFinishTimeStr} (${remainingSets} sets)`}
              </span>
            </div>
          </div>

          {/* Action Buttons: Express 30m, Warmup, Card, Focus, Minimize & Discard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            
            {/* ⚡ Express 30m Mode Toggle */}
            <button
              onClick={() => setIsExpressMode(!isExpressMode)}
              className={isExpressMode ? 'glow-btn shimmer-glow' : 'secondary-btn'}
              style={{
                padding: '6px 11px',
                fontSize: '11.5px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: isExpressMode ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)',
                color: isExpressMode ? '#fff' : '#f59e0b',
                background: isExpressMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined,
              }}
              title={isAr ? 'وضع التمرين السريع 30 دقيقة: يركز على التمارين الأساسية ويقلص وقت الراحة' : 'Express 30m Workout: focuses on heavy compound lifts and caps rest'}
            >
              <Zap size={13} />
              <span>{isExpressMode ? (isAr ? 'سريع 30د ⚡' : 'Express 30m ⚡') : (isAr ? 'وضع 30د ⚡' : '30m Mode ⚡')}</span>
            </button>

            {/* 🤸‍♂️ Warmup 3m */}
            <button
              onClick={() => setShowDynamicWarmupModal(true)}
              className="secondary-btn"
              style={{
                padding: '6px 10px',
                fontSize: '11.5px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: '#10b981',
                color: '#10b981',
              }}
              title={isAr ? 'الإحماء الحركي الذكي (3 دقائق)' : '3-min Dynamic Mobility Warmup'}
            >
              <span>🤸‍♂️ {isAr ? 'إحماء' : 'Warmup'}</span>
            </button>

            {/* 📷 Routine Card */}
            <button
              onClick={() => setShowRoutineCardModal(true)}
              className="secondary-btn"
              style={{
                padding: '6px 10px',
                fontSize: '11.5px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
              }}
              title={isAr ? 'تصدير بطاقة التمرين للجيم' : 'Export Gym Routine Card'}
            >
              <span>📷 {isAr ? 'بطاقة' : 'Card'}</span>
            </button>

            {/* 🎯 Focus Mode Toggle */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="glow-btn"
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 'bold',
              }}
            >
              <Target size={13} />
              <span>{isAr ? 'تركيز 🎯' : 'Focus 🎯'}</span>
            </button>

            <button
              onClick={minimizePlayer}
              title={isAr ? 'تصغير والتصفح في الخلفية' : 'Minimize to background'}
              className="secondary-btn"
              style={{
                padding: '7px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <Minimize2 size={14} />
              <span>{isAr ? 'تصغير' : 'Minimize'}</span>
            </button>

            <button
              onClick={discardSession}
              title={isAr ? 'إلغاء التمرين نهائياً' : 'Discard Workout'}
              style={{
                padding: '7px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <Square size={13} />
            </button>
          </div>
        </div>

        {/* Water Toast Notification */}
        {waterToast && (
          <div className="animated-fade" style={{ background: 'rgba(6, 182, 212, 0.9)', color: '#000', padding: '6px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
            {waterToast}
          </div>
        )}

        {/* Main Content Area: Exercise Details + Sets Logger */}
        <div
          className="workout-player-grid"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
          }}
        >
          {/* Left Column: Visual Demonstration & Pro-Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                position: 'relative',
                height: '200px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ExerciseImage
                src={currentEx.gif_url || currentEx.image_url || currentEx.videoUrl || currentEx.imageUrl}
                alt={exName}
                muscle={currentEx.muscle_en || currentEx.muscle_ar || currentEx.targetMuscle}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>
                {exName}
              </h3>
              {currentEx.name_en && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {currentEx.name_en}
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '3px 8px', borderRadius: '6px' }}>
                  🎯 {currentEx.muscle_ar || currentEx.muscle_en || currentEx.targetMuscle || 'عام'}
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px' }}>
                  🏋️ {currentEx.equipment_ar || currentEx.equipment_en || 'وزن الجسم'}
                </span>
                
                {/* 💡 MuscleWiki Pro Form & Anatomy */}
                <button
                  type="button"
                  onClick={() => setShowMuscleWiki(true)}
                  style={{
                    background: 'rgba(0, 210, 255, 0.15)',
                    border: '1px solid rgba(0, 210, 255, 0.4)',
                    color: 'var(--primary)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Activity size={11} />
                  <span>{isAr ? 'تشريح ودليل MuscleWiki 💡' : 'MuscleWiki Anatomy 💡'}</span>
                </button>

                {/* 🔀 Quick Alternative Switcher */}
                <button
                  type="button"
                  onClick={() => setShowQuickSwapModal(!showQuickSwapModal)}
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#8b5cf6',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RefreshCw size={11} />
                  <span>{isAr ? 'بديل سريع 🔀' : 'Quick Swap 🔀'}</span>
                </button>

                {/* ⏱️ Isometric Hold Timer for Static Exercises */}
                <button
                  type="button"
                  onClick={() => {
                    if (isHolding) {
                      setIsHolding(false);
                      updateSetLog(state.activeExerciseIndex, state.currentSetIndex, { reps: `${holdTimerSeconds}s` });
                    } else {
                      setHoldTimerSeconds(0);
                      setIsHolding(true);
                    }
                  }}
                  style={{
                    background: isHolding ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    border: isHolding ? '1px solid #ef4444' : '1px solid rgba(16, 185, 129, 0.4)',
                    color: isHolding ? '#ef4444' : '#10b981',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Timer size={11} />
                  <span>{isHolding ? `${isAr ? 'إيقاف الثبات' : 'Stop'}: ${holdTimerSeconds}s ⏱️` : (isAr ? 'مؤقت الثبات (Plank) ⏱️' : 'Hold Timer ⏱️')}</span>
                </button>
              </div>
            </div>

            {/* Quick Swap Options Dropdown */}
            {showQuickSwapModal && (
              <div className="glass-panel animated-fade" style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '6px' }}>
                  {isAr ? 'اختر بديلاً فورياً للجهاز المشغول:' : 'Swap busy equipment instantly:'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quickAlternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyAlternative(alt.name)}
                      style={{ padding: '6px 10px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', textAlign: isAr ? 'right' : 'left', cursor: 'pointer' }}
                    >
                      {isAr ? alt.titleAr : alt.titleEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tip Cue */}
            {currentEx.exerciseTips && (
              <div
                style={{
                  background: 'rgba(0, 210, 255, 0.05)',
                  border: '1px solid rgba(0, 210, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                💡 <strong style={{ color: 'var(--primary)' }}>{isAr ? 'نصيحة الأداء:' : 'Pro Tip:'}</strong> {currentEx.exerciseTips}
              </div>
            )}
          </div>

          {/* Right Column: Sets Logger Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Rest Timer Overlay Banner if Resting */}
            {state.isResting && (
              <div
                className={`animated-fade ${state.restRemainingSeconds <= 5 && state.restRemainingSeconds > 0 ? 'timer-critical-pulse' : ''}`}
                style={{
                  background: state.restRemainingSeconds <= 5 && state.restRemainingSeconds > 0
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.15))'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.08))',
                  border: state.restRemainingSeconds <= 5 && state.restRemainingSeconds > 0
                    ? '1px solid rgba(239, 68, 68, 0.7)'
                    : '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Timer size={24} color="#f59e0b" style={{ animation: 'pulse 1.5s infinite' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>
                      {isAr ? 'فترة راحة بين الجولات ⏳' : 'Resting Between Sets ⏳'}
                    </div>
                    <div className={`animated-fade ${state.restRemainingSeconds <= 5 && state.restRemainingSeconds > 0 ? 'rest-timer-pulse' : ''}`} style={{ fontSize: '24px', fontWeight: '900', color: state.restRemainingSeconds <= 5 ? '#10b981' : '#fff', fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s ease' }}>
                      {formatTime(state.restRemainingSeconds)}
                    </div>
                  </div>
                </div>

                {/* Rest Quick Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => addRestSeconds(30)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    +30s
                  </button>

                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'صوت الجرس مفعل' : 'الصوت مكتوم'}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: soundEnabled ? '#10b981' : '#94a3b8',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>

                  <button
                    onClick={handleQuickWaterSip}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      color: 'var(--secondary)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Droplets size={13} />
                    <span>+200ml 💧</span>
                  </button>

                  <button
                    onClick={togglePauseRestTimer}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    {state.isRestPaused ? <Play size={14} color="#10b981" /> : <Pause size={14} color="#f59e0b" />}
                  </button>

                  <button
                    onClick={skipRest}
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#f59e0b',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FastForward size={14} />
                    <span>{isAr ? 'تخطي الراحة' : 'Skip Rest'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sets Table */}
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <th style={{ padding: '8px 4px', width: '45px', textAlign: 'center' }}>{isAr ? 'الجولة' : 'Set'}</th>
                    <th style={{ padding: '8px 4px', width: '30%', textAlign: 'center' }}>{isAr ? 'الوزن' : 'Weight'}</th>
                    <th style={{ padding: '8px 4px', width: '30%', textAlign: 'center' }}>{isAr ? 'التكرار / المدة' : 'Reps / Time'}</th>
                    <th style={{ padding: '8px 4px', width: '68px', textAlign: 'center' }}>{isAr ? 'RPE' : 'RPE'}</th>
                    <th style={{ padding: '8px 4px', width: '48px', textAlign: 'center' }}>{isAr ? 'إنجاز' : 'Done'}</th>
                    <th style={{ padding: '8px 2px', width: '32px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((setLog, sIdx) => {
                    const isTargetSet = sIdx === state.currentSetIndex;
                    const displayWeight = (setLog.weight === 'Bodyweight' || setLog.weight === 'وزن الجسم') ? (isAr ? 'وزن الجسم' : 'BW') : setLog.weight;

                    return (
                      <tr
                        key={sIdx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: setLog.completed
                            ? 'rgba(16, 185, 129, 0.06)'
                            : (isTargetSet ? 'rgba(0, 210, 255, 0.06)' : 'transparent'),
                          transition: 'background 0.2s ease',
                        }}
                      >
                        <td style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 'bold', color: isTargetSet ? 'var(--primary)' : '#fff', fontSize: '13.5px' }}>
                          {setLog.setNumber}
                        </td>

                        <td style={{ padding: '6px 3px' }}>
                          <input
                            type="text"
                            inputMode="decimal"
                            dir="ltr"
                            value={displayWeight}
                            onChange={(e) => updateSetLog(state.activeExerciseIndex, sIdx, { weight: e.target.value })}
                            placeholder={isAr ? 'وزن الجسم' : '15 kg'}
                            style={{
                              width: '100%',
                              padding: '8px 4px',
                              textAlign: 'center',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: isTargetSet ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              unicodeBidi: 'plaintext',
                            }}
                          />
                        </td>

                        <td style={{ padding: '6px 3px' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            dir="ltr"
                            value={setLog.reps}
                            onChange={(e) => updateSetLog(state.activeExerciseIndex, sIdx, { reps: e.target.value })}
                            placeholder="10-12"
                            style={{
                              width: '100%',
                              padding: '8px 4px',
                              textAlign: 'center',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: isTargetSet ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              unicodeBidi: 'plaintext',
                            }}
                          />
                        </td>

                        <td style={{ padding: '6px 3px' }}>
                          <select
                            value={setLog.rpe || ''}
                            onChange={(e) => updateSetLog(state.activeExerciseIndex, sIdx, { rpe: e.target.value ? Number(e.target.value) : undefined })}
                            style={{
                              width: '100%',
                              padding: '7px 2px',
                              textAlign: 'center',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: setLog.rpe && setLog.rpe >= 9 ? '#ef4444' : setLog.rpe && setLog.rpe >= 7 ? '#f59e0b' : 'var(--primary)',
                              fontSize: '11.5px',
                              fontWeight: 'bold',
                            }}
                          >
                            <option value="">RPE</option>
                            <option value="6">6 (@4 RIR)</option>
                            <option value="7">7 (@3 RIR)</option>
                            <option value="8">8 (@2 RIR)</option>
                            <option value="9">9 (@1 RIR)</option>
                            <option value="10">10 (Max 🔥)</option>
                          </select>
                        </td>

                        <td style={{ padding: '6px 2px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              if (!setLog.completed) {
                                finishCurrentSet({ reps: setLog.reps, weight: setLog.weight });
                              } else {
                                updateSetLog(state.activeExerciseIndex, sIdx, { completed: false });
                              }
                            }}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: setLog.completed
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : 'rgba(255, 255, 255, 0.1)',
                              color: '#fff',
                              boxShadow: setLog.completed ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Check size={18} />
                          </button>
                        </td>

                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          {currentLogs.length > 1 && (
                            <button
                              onClick={() => removeSet(state.activeExerciseIndex, sIdx)}
                              style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.6)', cursor: 'pointer', padding: '4px' }}
                              title={isAr ? 'حذف الجولة' : 'Delete Set'}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Set Button */}
            <button
              onClick={() => addNewSet(state.activeExerciseIndex)}
              className="secondary-btn"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <Plus size={15} />
              <span>{isAr ? 'إضافة جولة إضافية (+)' : 'Add Set (+)'}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation & Finish Actions */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={prevExercise}
              disabled={state.activeExerciseIndex === 0}
              className="secondary-btn"
              style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '12px', opacity: state.activeExerciseIndex === 0 ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>

            <button
              onClick={nextExercise}
              disabled={state.activeExerciseIndex >= exercises.length - 1}
              className="secondary-btn"
              style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '12px', opacity: state.activeExerciseIndex >= exercises.length - 1 ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{isAr ? 'التالي' : 'Next'}</span>
              {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <button
            onClick={handleFinishWorkout}
            disabled={saving}
            className="glow-btn"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '900',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Trophy size={18} />
            <span>{saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'إنهاء التمرين وحفظ الإنجاز 🏆' : 'Finish & Log Workout 🏆')}</span>
          </button>
        </div>
      </div>

      {/* Dynamic 3-Min Mobility Warmup Modal */}
      <DynamicWarmupModal
        isOpen={showDynamicWarmupModal}
        lang={lang as any}
        focusArea={state.dayData?.focusArea || ''}
        onClose={() => setShowDynamicWarmupModal(false)}
      />

      {/* Routine Card Export Modal */}
      <RoutineCardExportModal
        isOpen={showRoutineCardModal}
        lang={lang as any}
        planTitle={state.dayData?.planTitle || (isAr ? 'جلسة تدريب الوحش' : 'BeastMode Routine')}
        dayTitle={state.dayData?.title || (isAr ? 'اليوم التدريبي' : 'Training Day')}
        dayIndex={state.dayData?.dayIndex || 1}
        focusArea={state.dayData?.focusArea || ''}
        exercises={exercises.map((e: any) => ({
          name: isAr ? (e.name_ar || e.name || e.name_en) : (e.name_en || e.name),
          sets: e.sets || 3,
          reps: e.reps || '8-12',
          targetMuscle: isAr ? (e.muscle_ar || e.targetMuscle) : (e.muscle_en || e.targetMuscle),
        }))}
        onClose={() => setShowRoutineCardModal(false)}
      />

      {/* 🎉 Post-Workout Celebration Confetti HUD */}
      {state.showSummaryModal && (
        <PostWorkoutConfettiModal
          isOpen={state.showSummaryModal}
          onClose={closeSummaryModal}
          lang={lang as any}
          summary={{
            workoutTitle: state.dayData?.title || (isAr ? 'جلسة التدريب' : 'Workout Session'),
            totalVolumeKg: 8400,
            caloriesBurned: Math.round((state.totalElapsedSeconds / 60) * 8.5) || 380,
            durationMinutes: Math.round(state.totalElapsedSeconds / 60) || 45,
            exercisesCompleted: exercises.length,
            setsCompleted: Object.values(state.setLogs || {}).reduce((acc, sets) => acc + (sets?.filter(s => s.completed)?.length || 0), 0),
            streakDays: 1,
          }}
        />
      )}

      {/* 🔀 Busy Gym Smart Swap Drawer */}
      {showQuickSwapModal && (
        <SmartExerciseSwapModal
          isOpen={showQuickSwapModal}
          onClose={() => setShowQuickSwapModal(false)}
          currentExerciseName={exName}
          targetMuscle={currentEx.muscle_en || currentEx.targetMuscle || 'Chest'}
          onSwap={(newEx) => {
            currentEx.name = newEx.name;
            currentEx.name_en = newEx.name;
            currentEx.name_ar = newEx.name;
          }}
          lang={lang as any}
        />
      )}

      {/* 💡 MuscleWiki Detailed Anatomy & Technique Modal */}
      {showMuscleWiki && (
        <MuscleWikiModal
          exercise={{
            ...currentEx,
            name: exName,
            name_en: currentEx.name_en || currentEx.name,
            name_ar: currentEx.name_ar || currentEx.name,
            targetMuscle: currentEx.muscle_en || currentEx.targetMuscle,
            muscle_en: currentEx.muscle_en || currentEx.targetMuscle,
            muscle_ar: currentEx.muscle_ar || currentEx.targetMuscle,
            equipment_en: currentEx.equipment_en,
            equipment_ar: currentEx.equipment_ar,
            gif_url: currentEx.gif_url || currentEx.image_url || currentEx.imageUrl || currentEx.videoUrl,
            image_url: currentEx.image_url || currentEx.imageUrl,
            instructions_ar: currentEx.instructions_ar || currentEx.description_ar,
            instructions_en: currentEx.instructions_en || currentEx.description_en,
            common_mistakes_ar: currentEx.common_mistakes_ar,
            common_mistakes_en: currentEx.common_mistakes_en,
            youtube_url: currentEx.youtube_url || currentEx.video_url || currentEx.videoUrl,
          }}
          lang={lang as any}
          onClose={() => setShowMuscleWiki(false)}
        />
      )}
    </div>
  );
};
