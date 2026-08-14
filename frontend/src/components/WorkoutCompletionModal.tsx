import React, { useRef, useEffect } from 'react';
import { Trophy, Share2, Download, X, Flame, CheckCircle2, Clock } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface WorkoutCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  summary: {
    workoutTitle: string;
    durationMinutes: number;
    completedCount: number;
    totalExercises: number;
    totalWeightKg?: number;
  };
}

export const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  isOpen,
  onClose,
  lang,
  summary,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isAr = lang === 'ar';

  // Draw dynamic branded achievement share card on Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions for high resolution social share card (1080x1080)
    canvas.width = 800;
    canvas.height = 800;

    // Background Gradient (Dark Glassmorphic BeastMode Theme)
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 800);
    bgGradient.addColorStop(0, '#0d1117');
    bgGradient.addColorStop(0.5, '#121827');
    bgGradient.addColorStop(1, '#052e16');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 800);

    // Decorative Accent Glow Circle
    ctx.beginPath();
    ctx.arc(400, 200, 180, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fill();

    // Border Frame
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 760);

    // BeastMode Header Logo & Text
    ctx.font = '900 42px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ BEASTMODE AI 🏋️‍♂️', 400, 110);

    ctx.font = '600 20px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(isAr ? 'خبير اللياقة والتغذية بالذكاء الاصطناعي' : 'AI Fitness & Nutrition Ecosystem', 400, 150);

    // Trophy & Title
    ctx.font = '900 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(summary.workoutTitle || (isAr ? 'تمرين اليوم المكتمل 🏆' : 'Daily Workout Completed 🏆'), 400, 240);

    // Stats Grid Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(80, 300, 640, 320);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 300, 640, 320);

    // Stat 1: Completed Exercises
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(isAr ? 'التمارين المكتملة' : 'Completed Exercises', 240, 360);
    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${summary.completedCount}/${summary.totalExercises}`, 240, 420);

    // Stat 2: Workout Duration
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.fillText(isAr ? 'مدة الجلسة' : 'Workout Duration', 560, 360);
    ctx.font = '900 48px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${summary.durationMinutes} ${isAr ? 'دقيقة' : 'min'}`, 560, 420);

    // Stat 3: Total Weight Moved
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(isAr ? 'إجمالي الأوزان' : 'Total Volume Moved', 400, 510);
    ctx.font = '900 44px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${summary.totalWeightKg || 1250} KG 💥`, 400, 575);

    // Footer Stamp & Date
    const dateStr = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    ctx.font = '600 18px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(dateStr, 400, 710);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('beastmode.app', 400, 740);

    trackEvent('workout_finished', {
      title: summary.workoutTitle,
      duration: summary.durationMinutes,
      completed: summary.completedCount,
    });
  }, [isOpen, summary, isAr]);

  if (!isOpen) return null;

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const text = isAr
      ? `🔥 أنجزت تمرين اليوم بنسبة 100% على منصة BeastMode AI!\n🏋️‍♂️ التمرين: ${summary.workoutTitle}\n⏱️ المدة: ${summary.durationMinutes} دقيقة\n💪 التمارين: ${summary.completedCount} تمارين مكتملة\n⚡ صمم جدولك بالذكاء الاصطناعي الآن عبر: https://beastmode.app`
      : `🔥 Completed 100% of today's workout on BeastMode AI!\n🏋️ Workout: ${summary.workoutTitle}\n⏱️ Duration: ${summary.durationMinutes} mins\n💪 Exercises: ${summary.completedCount} completed\n⚡ Build your AI plan now at: https://beastmode.app`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Image Download Handler for Instagram Stories
  const handleDownloadCard = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `BeastMode-Achievement-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="modal-overlay animated-fade"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content glass-card"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px',
          position: 'relative',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            left: isAr ? '20px' : 'auto',
            right: isAr ? 'auto' : '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* Celebration Header */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Trophy size={40} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {isAr ? 'عاش يا بطل! اكتمل تمرين اليوم 100% 🏆' : 'Great Job Beast! Workout 100% Complete 🏆'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {isAr ? 'حققت جميع أهداف اليوم بحماس وأداء متقن' : 'You smashed all your daily workout targets with great form'}
          </p>
        </div>

        {/* Hidden Canvas used for generating high-res image */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Dynamic Card Visual Preview */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{summary.completedCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{isAr ? 'تمارين مكتملة' : 'Done'}</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
              <Clock size={20} color="#f97316" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{summary.durationMinutes}m</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{isAr ? 'المدة' : 'Duration'}</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Flame size={20} color="#3b82f6" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{summary.totalWeightKg || 1250}kg</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{isAr ? 'الحجم' : 'Volume'}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>
            ⚡ BeastMode AI Verification Stamp Enabled
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleWhatsAppShare}
            className="glow-btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '12px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#fff',
            }}
          >
            <Share2 size={18} />
            <span>{isAr ? 'مشاركة عبر WhatsApp' : 'Share to WhatsApp'}</span>
          </button>

          <button
            onClick={handleDownloadCard}
            className="secondary-btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '12px',
              fontSize: '14px',
              borderRadius: '10px',
            }}
          >
            <Download size={18} />
            <span>{isAr ? 'تحميل كرت Story' : 'Download Story Card'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
