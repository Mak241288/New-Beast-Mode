import React, { useState } from 'react';
import { useWorkoutSession } from '../context/WorkoutSessionContext';
import { ExerciseImage } from './ExerciseImage';
import { WorkoutCompletionModal } from './WorkoutCompletionModal';
import { BarbellPlate1RMModal } from './BarbellPlate1RMModal';
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
  Flame,
  Share2
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
    selectExercise,
    finishWorkoutSession,
    discardSession,
    closeSummaryModal,
  } = useWorkoutSession();

  const isAr = lang === 'ar';
  const [saving, setSaving] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [showWarmupModal, setShowWarmupModal] = useState(false);

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
          maxWidth: '840px',
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
          }}
        >
          {/* Day Title & Timer */}
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
            </div>
          </div>

          {/* Minimize & Discard Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={minimizePlayer}
              title={isAr ? 'تصغير والتصفح في الخلفية' : 'Minimize to background'}
              className="secondary-btn"
              style={{
                padding: '8px 14px',
                fontSize: '12.5px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <Minimize2 size={15} />
              <span>{isAr ? 'تصغير 🗕' : 'Minimize'}</span>
            </button>

            <button
              onClick={discardSession}
              title={isAr ? 'إلغاء التمرين نهائياً' : 'Discard Workout'}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '8px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Square size={13} />
              <span>{isAr ? 'إلغاء' : 'Cancel'}</span>
            </button>
          </div>
        </div>

        {/* Exercises Scrollable Pill Navigator */}
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {exercises.map((ex: any, idx: number) => {
            const isCurrent = idx === state.activeExerciseIndex;
            const exLogs = state.setLogs[idx] || [];
            const isAllCompleted = exLogs.length > 0 && exLogs.every((s: any) => s.completed);

            return (
              <button
                key={idx}
                onClick={() => selectExercise(idx)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isCurrent
                    ? '1px solid var(--primary)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isCurrent
                    ? 'rgba(0, 210, 255, 0.15)'
                    : (isAllCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)'),
                  color: isCurrent ? 'var(--primary)' : (isAllCompleted ? '#10b981' : 'var(--text-secondary)'),
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{idx + 1}. {isAr ? (ex.name_ar || ex.name || ex.name_en) : (ex.name_en || ex.name)}</span>
                {isAllCompleted && <Check size={12} />}
              </button>
            );
          })}
        </div>

        {/* Main Content Area: Exercise Details + Sets Logger */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: '20px',
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
                <button
                  type="button"
                  onClick={() => setShowWarmupModal(true)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#f59e0b',
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
                  <Flame size={12} />
                  <span>{isAr ? 'الإحماء الهرمي 🔥' : 'Warm-up Sets 🔥'}</span>
                </button>
              </div>
            </div>

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
                className="animated-fade"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.08))',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Timer size={24} color="#f59e0b" style={{ animation: 'pulse 1.5s infinite' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>
                      {isAr ? 'فترة راحة بين الجولات ⏳' : 'Resting Between Sets ⏳'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <th style={{ padding: '8px', width: '45px' }}>{isAr ? 'الجولة' : 'Set'}</th>
                    <th style={{ padding: '8px' }}>{isAr ? 'الوزن' : 'Weight'}</th>
                    <th style={{ padding: '8px' }}>{isAr ? 'التكرار' : 'Reps'}</th>
                    <th style={{ padding: '8px', width: '75px' }}>{isAr ? 'الجهد (RPE)' : 'RPE'}</th>
                    <th style={{ padding: '8px', width: '65px' }}>{isAr ? 'إنجاز' : 'Done'}</th>
                    <th style={{ padding: '8px', width: '35px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((setLog, sIdx) => {
                    const isTargetSet = sIdx === state.currentSetIndex;

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
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 'bold', color: isTargetSet ? 'var(--primary)' : '#fff' }}>
                          {setLog.setNumber}
                        </td>

                        <td style={{ padding: '6px' }}>
                          <input
                            type="text"
                            value={setLog.weight}
                            onChange={(e) => updateSetLog(state.activeExerciseIndex, sIdx, { weight: e.target.value })}
                            placeholder="15 kg"
                            style={{
                              width: '100%',
                              padding: '8px 4px',
                              textAlign: 'center',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: isTargetSet ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '13px',
                            }}
                          />
                        </td>

                        <td style={{ padding: '6px' }}>
                          <input
                            type="text"
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
                              fontSize: '13px',
                            }}
                          />
                        </td>

                        <td style={{ padding: '6px' }}>
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

                        <td style={{ padding: '6px', textAlign: 'center' }}>
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

                        <td style={{ padding: '8px', textAlign: 'center' }}>
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
                fontSize: '12.5px',
                borderRadius: '10px',
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
              style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '12px', opacity: state.activeExerciseIndex === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>

            <button
              onClick={nextExercise}
              disabled={state.activeExerciseIndex >= exercises.length - 1}
              className="secondary-btn"
              style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '12px', opacity: state.activeExerciseIndex >= exercises.length - 1 ? 0.5 : 1 }}
            >
              <span>{isAr ? 'التالي' : 'Next'}</span>
              <ChevronRight size={16} />
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

      {/* Render Warmup Sets & Plate Modal if requested */}
      {showWarmupModal && (
        <BarbellPlate1RMModal
          isOpen={showWarmupModal}
          onClose={() => setShowWarmupModal(false)}
          lang={lang as any}
          initialWeight={parseFloat(String(currentLogs[0]?.weight || 60)) || 60}
          initialReps={10}
        />
      )}
    </div>
  );
};
