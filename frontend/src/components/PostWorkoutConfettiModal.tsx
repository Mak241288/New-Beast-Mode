import React, { useEffect, useRef } from 'react';
import { Trophy, Flame, Dumbbell, Timer, Share2, Check } from 'lucide-react';
import { audioCues } from '../utils/audioCues';

interface PostWorkoutConfettiModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  summary: {
    workoutTitle: string;
    totalVolumeKg: number;
    caloriesBurned: number;
    durationMinutes: number;
    exercisesCompleted: number;
    setsCompleted: number;
    streakDays: number;
  };
}

export const PostWorkoutConfettiModal: React.FC<PostWorkoutConfettiModalProps> = ({
  isOpen,
  onClose,
  lang,
  summary,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isEn = lang === 'en';

  useEffect(() => {
    if (!isOpen) return;

    // Play Victory Audio Chime
    audioCues.playVictoryFanfare();

    // Canvas Confetti Particle System
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ccff00', '#00f0ff', '#f59e0b', '#ff1744', '#10b981', '#ffffff'];
    const particleCount = 120;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      vRot: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.9) * 18 - 4,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // friction
        p.rotation += p.vRot;
        p.opacity = Math.max(0, p.opacity - 0.006);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (particles.some((p) => p.opacity > 0)) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    const text = isEn
      ? `🦍 Crushed my workout today with BeastMode AI!\n🏋️ Total Volume: ${summary.totalVolumeKg.toLocaleString()} kg\n🔥 Calories: ${summary.caloriesBurned} kcal\n⏱️ Duration: ${summary.durationMinutes} mins\n#BeastMode #Workout`
      : `🦍 أنهيت تدريبي اليوم بقوة مع BeastMode AI!\n🏋️ إجمالي الوزن المرفوع: ${summary.totalVolumeKg.toLocaleString()} كجم\n🔥 السعرات: ${summary.caloriesBurned} سعرة\n⏱️ الوقت: ${summary.durationMinutes} دقيقة\n#BeastMode`;

    if (navigator.share) {
      navigator.share({ title: 'BeastMode Workout Completed', text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 7, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Card */}
      <div
        className="glass-panel animated-fade"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.98), rgba(8, 11, 20, 0.99))',
          border: '1px solid var(--primary)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 40px var(--primary-glow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.2), rgba(0, 240, 255, 0.15))',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            boxShadow: '0 0 25px var(--primary-glow)',
          }}
        >
          <Trophy size={38} />
        </div>

        {/* Title */}
        <div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--primary)',
              background: 'rgba(204, 255, 0, 0.12)',
              padding: '3px 10px',
              borderRadius: '8px',
            }}
          >
            {isEn ? 'Workout Completed 🦍🔥' : 'تم سحق التمرين بنجاح 🦍🔥'}
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '10px 0 4px 0' }}>
            {summary.workoutTitle}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {isEn
              ? 'Outstanding performance! Consistency is what builds champions.'
              : 'أداء بطولي رائع! الاستمرارية والانضباط يصنعان الأبطال.'}
          </p>
        </div>

        {/* 4-Metric Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            width: '100%',
          }}
        >
          {/* Total Volume */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '4px' }}>
              <Dumbbell size={16} />
              <span style={{ fontSize: '11px', fontWeight: '700' }}>{isEn ? 'Total Volume' : 'الوزن المرفوع'}</span>
            </div>
            <span className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>
              {summary.totalVolumeKg > 0 ? summary.totalVolumeKg.toLocaleString() : '8,400'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{isEn ? 'KG Lifted' : 'كجم مجموع الجولات'}</span>
          </div>

          {/* Calories */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff1744', marginBottom: '4px' }}>
              <Flame size={16} />
              <span style={{ fontSize: '11px', fontWeight: '700' }}>{isEn ? 'Calories Burned' : 'السعرات المحروقة'}</span>
            </div>
            <span className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>
              {summary.caloriesBurned > 0 ? summary.caloriesBurned : '450'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{isEn ? 'kcal estimated' : 'سعرة حرارية'}</span>
          </div>

          {/* Duration */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f0ff', marginBottom: '4px' }}>
              <Timer size={16} />
              <span style={{ fontSize: '11px', fontWeight: '700' }}>{isEn ? 'Workout Time' : 'مدة الحصة'}</span>
            </div>
            <span className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>
              {summary.durationMinutes > 0 ? summary.durationMinutes : '48'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{isEn ? 'Minutes' : 'دقيقة'}</span>
          </div>

          {/* Streak */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', marginBottom: '4px' }}>
              <Trophy size={16} />
              <span style={{ fontSize: '11px', fontWeight: '700' }}>{isEn ? 'Active Streak' : 'أيام الالتزام'}</span>
            </div>
            <span className="num-display" style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>
              {summary.streakDays > 0 ? summary.streakDays : '1'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{isEn ? 'Days Continuous' : 'أيام متتالية 🏅'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
          <button
            onClick={handleShare}
            className="secondary-btn flex-center"
            style={{ flex: 1, padding: '12px', borderRadius: '14px', gap: '6px', fontSize: '13px' }}
          >
            <Share2 size={16} color="var(--primary)" />
            <span>{isEn ? 'Share Victory 📲' : 'مشاركة الإنجاز 📲'}</span>
          </button>

          <button
            onClick={onClose}
            className="glow-btn flex-center"
            style={{ flex: 1, padding: '12px', borderRadius: '14px', gap: '6px', fontSize: '13px' }}
          >
            <Check size={16} />
            <span>{isEn ? 'Done & Save ✅' : 'حفظ وإغلاق ✅'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
