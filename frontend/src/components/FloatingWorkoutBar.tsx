import React from 'react';
import { useWorkoutSession } from '../context/WorkoutSessionContext';
import { Play, Pause, Maximize2, Check, FastForward, Square, Timer, Activity } from 'lucide-react';

interface FloatingWorkoutBarProps {
  lang?: 'ar' | 'en';
}

export const FloatingWorkoutBar: React.FC<FloatingWorkoutBarProps> = ({ lang = 'ar' }) => {
  const {
    state,
    maximizePlayer,
    finishCurrentSet,
    skipRest,
    togglePauseWorkout,
    togglePauseRestTimer,
    discardSession,
  } = useWorkoutSession();

  const isAr = lang === 'ar';

  // Only render if a session is currently in progress and the full player is minimized / closed
  if (state.status === 'idle' || state.status === 'completed' || state.isPlayerOpen) {
    return null;
  }

  const currentEx = state.dayData?.exercises?.[state.activeExerciseIndex];
  const exName = currentEx ? (isAr ? (currentEx.name_ar || currentEx.name || currentEx.name_en) : (currentEx.name_en || currentEx.name)) : (isAr ? 'تمرين مخصص' : 'Custom Exercise');
  const currentLogs = state.setLogs[state.activeExerciseIndex] || [];
  const totalSets = currentLogs.length || 3;
  const currentSetNum = Math.min(state.currentSetIndex + 1, totalSets);

  // Format Elapsed time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="floating-workout-bar animated-fade"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 32px)',
        maxWidth: '680px',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 210, 255, 0.4)',
        borderRadius: '20px',
        padding: '12px 18px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 210, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Left: Exercise & Set Info */}
      <div
        onClick={maximizePlayer}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          flex: '1 1 auto',
          minWidth: '180px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: state.isResting
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(204, 255, 0, 0.12)',
            color: state.isResting ? '#f59e0b' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: state.isResting
              ? '0 0 15px rgba(245, 158, 11, 0.35)'
              : '0 0 15px var(--primary-glow)',
          }}
        >
          {state.isResting ? (
            <>
              <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  stroke={state.restRemainingSeconds <= 5 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - Math.max(0, Math.min(state.restRemainingSeconds / Math.max(state.restTotalDuration || 60, 1), 1)))}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-dashoffset 0.35s ease' }}
                />
              </svg>
              <span
                className="num-display"
                style={{
                  position: 'absolute',
                  fontSize: '11px',
                  fontWeight: '900',
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {state.restRemainingSeconds}
              </span>
            </>
          ) : (
            <Activity size={20} />
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exName}
            </span>
            <span
              className="num-display"
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
              }}
            >
              {isAr ? `جولة ${currentSetNum}/${totalSets}` : `Set ${currentSetNum}/${totalSets}`}
            </span>
          </div>

          {/* Time indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            {state.isResting ? (
              <span style={{ color: '#f59e0b', fontSize: '12.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Timer size={13} />
                <span>{isAr ? 'فترة راحة:' : 'Resting:'}</span>
                <span className="num-display" style={{ fontSize: '14px', fontWeight: '800' }}>{formatTime(state.restRemainingSeconds)}</span>
              </span>
            ) : (
              <span style={{ color: 'var(--primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Timer size={13} />
                <span>{isAr ? 'الوقت المنقضي:' : 'Elapsed:'}</span>
                <span className="num-display" style={{ fontSize: '13.5px', fontWeight: '800' }}>{formatTime(state.totalElapsedSeconds)}</span>
                {state.isPaused && <span style={{ color: '#f87171', fontWeight: 'bold' }}>({isAr ? 'مؤقت' : 'Paused'})</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Pause/Resume Timer */}
        {state.isResting ? (
          <>
            <button
              onClick={togglePauseRestTimer}
              title={isAr ? (state.isRestPaused ? 'استئناف الراحة' : 'إيقاف الراحة مؤقتاً') : (state.isRestPaused ? 'Resume Rest' : 'Pause Rest')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {state.isRestPaused ? <Play size={16} color="#10b981" /> : <Pause size={16} color="#f59e0b" />}
            </button>

            <button
              onClick={skipRest}
              title={isAr ? 'تخطي الراحة' : 'Skip Rest'}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                padding: '6px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              <FastForward size={14} />
              <span>{isAr ? 'تخطي' : 'Skip'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={togglePauseWorkout}
              title={isAr ? (state.isPaused ? 'استئناف التمرين' : 'إيقاف مؤقت') : (state.isPaused ? 'Resume' : 'Pause')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {state.isPaused ? <Play size={16} color="#10b981" /> : <Pause size={16} />}
            </button>

            <button
              onClick={() => finishCurrentSet()}
              title={isAr ? 'إنهاء الجولة وبدء الراحة' : 'Finish Set & Rest'}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Check size={14} />
              <span>{isAr ? 'تمت الجولة' : 'Set Done'}</span>
            </button>
          </>
        )}

        {/* Maximize Full-Screen Player */}
        <button
          onClick={maximizePlayer}
          title={isAr ? 'تكبير المشغل' : 'Maximize Player'}
          style={{
            background: 'rgba(0, 210, 255, 0.15)',
            border: '1px solid rgba(0, 210, 255, 0.4)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Cancel / Stop Workout */}
        <button
          onClick={discardSession}
          title={isAr ? 'إلغاء التمرين نهائياً' : 'Discard Workout'}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Square size={14} />
        </button>
      </div>
    </div>
  );
};
