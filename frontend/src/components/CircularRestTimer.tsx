import React, { useEffect, useState } from 'react';
import { Play, Pause, Plus, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { audioCues } from '../utils/audioCues';

interface CircularRestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onAddSeconds: (sec: number) => void;
  onSkip: () => void;
  lang: 'ar' | 'en';
  size?: number;
}

export const CircularRestTimer: React.FC<CircularRestTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isPaused,
  onTogglePause,
  onAddSeconds,
  onSkip,
  lang,
  size = 140,
}) => {
  const [isMuted, setIsMuted] = useState(audioCues.getMuted());
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Safe percentage calculation
  const safeTotal = Math.max(totalSeconds, 1);
  const fraction = Math.max(0, Math.min(remainingSeconds / safeTotal, 1));
  const strokeDashoffset = circumference * (1 - fraction);

  // Dynamic Neon Color shift: Lime/Turquoise -> Yellow (< 15s) -> Red Pulse (< 5s)
  const strokeColor =
    remainingSeconds <= 5
      ? '#ef4444'
      : remainingSeconds <= 15
      ? '#f59e0b'
      : 'var(--primary, #ccff00)';

  // Format MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Audio Cue Triggers
  useEffect(() => {
    if (!isPaused) {
      if (remainingSeconds === 3 || remainingSeconds === 2 || remainingSeconds === 1) {
        audioCues.playCountdownTick(remainingSeconds === 1 ? 980 : 880);
      } else if (remainingSeconds === 0) {
        audioCues.playRestFinishedChime();
      }
    }
  }, [remainingSeconds, isPaused]);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioCues.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      {/* SVG Countdown Ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Neon Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${strokeColor})`,
            }}
          />
        </svg>

        {/* Center Countdown Label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            className="num-display"
            style={{
              fontSize: size >= 140 ? '34px' : '26px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '1px',
              textShadow: `0 0 12px ${strokeColor}`,
            }}
          >
            {timeFormatted}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: strokeColor,
              fontWeight: '800',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            {isPaused
              ? lang === 'en'
                ? 'PAUSED'
                : 'مؤقت'
              : lang === 'en'
              ? 'RESTING'
              : 'فترة راحة'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onTogglePause}
          className="secondary-btn"
          title={isPaused ? (lang === 'en' ? 'Resume' : 'استئناف') : (lang === 'en' ? 'Pause' : 'إيقاف مؤقت')}
          style={{ padding: '8px 12px', borderRadius: '10px' }}
        >
          {isPaused ? <Play size={15} color="var(--primary)" /> : <Pause size={15} />}
        </button>

        <button
          type="button"
          onClick={() => onAddSeconds(30)}
          className="secondary-btn"
          title={lang === 'en' ? '+30 Seconds' : '+30 ثانية'}
          style={{ padding: '8px 12px', fontSize: '11.5px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={13} />
          <span>30s</span>
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="secondary-btn"
          title={lang === 'en' ? 'Skip Rest' : 'تخطي الراحة'}
          style={{ padding: '8px 12px', borderRadius: '10px' }}
        >
          <SkipForward size={15} />
        </button>

        <button
          type="button"
          onClick={handleToggleSound}
          className="secondary-btn"
          title={isMuted ? (lang === 'en' ? 'Unmute Cues' : 'تشغيل التنبيه الصوتي') : (lang === 'en' ? 'Mute Cues' : 'كتم التنبيه الصوتي')}
          style={{ padding: '8px 10px', borderRadius: '10px', color: isMuted ? 'var(--text-muted)' : 'var(--primary)' }}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
};
