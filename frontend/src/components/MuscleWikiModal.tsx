import React from 'react';
import { X, Play, CheckCircle2, Dumbbell, ShieldAlert, Youtube, Activity } from 'lucide-react';

interface MuscleWikiModalProps {
  exercise: any;
  lang: 'ar' | 'en';
  onClose: () => void;
  onAddToPlan?: (exercise: any) => void;
}

export const MuscleWikiModal: React.FC<MuscleWikiModalProps> = ({
  exercise,
  lang,
  onClose,
  onAddToPlan,
}) => {
  if (!exercise) return null;

  const isAr = lang === 'ar';

  const name = isAr ? (exercise.name_ar || exercise.name_en || exercise.name) : (exercise.name_en || exercise.name);
  const primaryMuscle = isAr ? (exercise.muscle_ar || exercise.muscle_en || exercise.targetMuscle) : (exercise.muscle_en || exercise.targetMuscle);
  const secondaryMuscles = isAr ? (exercise.secondary_muscles_ar || exercise.secondary_muscles_en) : (exercise.secondary_muscles_en || exercise.secondary_muscles_ar);
  const equipment = isAr ? (exercise.equipment_ar || exercise.equipment_en) : (exercise.equipment_en || exercise.equipment_ar);
  const instructions = isAr ? (exercise.instructions_ar || exercise.instructions_en || exercise.description_ar) : (exercise.instructions_en || exercise.instructions_ar || exercise.description_en);
  const commonMistakes = isAr ? (exercise.common_mistakes_ar || exercise.common_mistakes_en) : (exercise.common_mistakes_en || exercise.common_mistakes_ar);
  const youtubeUrl = exercise.youtube_url || exercise.video_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercise tutorial')}`;
  const anatomyUrl = exercise.anatomy_image_url || `https://musclewiki.com/media/uploads/${(exercise.muscle_en || 'chest').toLowerCase()}-anatomy.png`;

  // Split steps
  const stepsList = instructions
    ? instructions
        .split(/[.\n]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 3)
    : [];

  // Split mistakes
  const mistakesList = commonMistakes
    ? commonMistakes
        .split(/[\n]+/)
        .map((m: string) => m.trim())
        .filter((m: string) => m.length > 3)
    : [];

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
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
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
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

        {/* Title & Badges Header */}
        <div style={{ marginBottom: '20px', paddingRight: isAr ? '0' : '40px', paddingLeft: isAr ? '40px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              <Dumbbell size={14} />
              <span>MuscleWiki Pro Guide & Media 🎬</span>
            </div>

            {/* Interactive YouTube Button */}
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Youtube size={16} color="#ef4444" />
                <span>{isAr ? 'مشاهدة التكنيك على يوتيوب 🔴' : 'YouTube Tutorial 🔴'}</span>
              </a>
            )}
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
            {name}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {equipment && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>
                🏋️ {equipment}
              </span>
            )}
            {exercise.level && (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                ⚡ {exercise.level}
              </span>
            )}
          </div>
        </div>

        {/* Media & Anatomy Split Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {/* Motion GIF */}
          <div style={{ position: 'relative', height: '220px', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            {exercise.image_url || exercise.gif_url ? (
              <img
                src={exercise.gif_url || exercise.image_url}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Dumbbell size={40} style={{ opacity: 0.4, marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '12px' }}>{isAr ? 'عرض الحركة التوضيحي' : 'Exercise Motion Demo'}</p>
              </div>
            )}
          </div>

          {/* Anatomy Muscle Diagram */}
          <div style={{ position: 'relative', height: '220px', background: 'rgba(59, 130, 246, 0.04)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '8px' }}>
            <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={12} />
              <span>{isAr ? 'رسم تشريحي للعضلات' : 'Anatomy Heatmap'}</span>
            </div>
            <img
              src={anatomyUrl}
              alt="Anatomy Diagram"
              style={{ width: '100%', height: '180px', objectFit: 'contain', marginTop: '12px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://musclewiki.com/media/uploads/full-body-anatomy.png';
              }}
            />
          </div>
        </div>

        {/* Targeted Muscles Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {isAr ? '🎯 العضلة الأساسية (Primary Target)' : '🎯 Primary Target Muscle'}
            </span>
            <strong style={{ fontSize: '15px', color: '#fff' }}>{primaryMuscle || (isAr ? 'غير محدد' : 'General')}</strong>
          </div>

          <div style={{ padding: '14px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c084fc', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {isAr ? '💪 العضلات الثانوية (Secondary Targets)' : '💪 Secondary Target Muscles'}
            </span>
            <strong style={{ fontSize: '14px', color: '#e9d5ff' }}>{secondaryMuscles || (isAr ? 'عضلات الجذع والمفاصل المساعدة' : 'Core & Stabilizers')}</strong>
          </div>
        </div>

        {/* Step-by-Step Execution Guide */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>{isAr ? 'دليل خطوات الأداء الصحيح (Execution Steps)' : 'Execution Steps & Form Guide'}</span>
          </h4>

          {stepsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stepsList.map((step: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ background: 'var(--primary)', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isAr ? 'حافظ على استقامة الظهر، التحكم بالسحب والنزول ببطء للحصول على أفضل تفعيل عضلي.' : 'Maintain a neutral spine, control the movement, and move through a full range of motion.'}
            </p>
          )}
        </div>

        {/* Common Form Mistakes & Cues */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
            <ShieldAlert size={18} />
            <span>{isAr ? 'أخطاء شائعة وحماية المفاصل (Form Mistakes & Safety)' : 'Common Mistakes & Joint Safety'}</span>
          </h4>

          {mistakesList.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: isAr ? 0 : '20px', paddingRight: isAr ? '20px' : 0, color: '#fca5a5', fontSize: '13px', lineHeight: '1.6' }}>
              {mistakesList.map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#fca5a5' }}>
              {isAr ? 'تجنب أرجحة الجسم باستخدام الزخم، واحرص على اختيار وزن يسمح لك بالأداء التكنيكي المتقن.' : 'Avoid using momentum to lift the weight; focus on strict technique to protect joints.'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {exercise.video_url && (
            <a
              href={exercise.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-btn"
              style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', padding: '12px', fontSize: '14px', borderRadius: '10px' }}
            >
              <Play size={16} />
              <span>{isAr ? 'شرح فيديو يوتيوب 🎥' : 'Watch Video Demo 🎥'}</span>
            </a>
          )}

          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(exercise)}
              className="primary-btn"
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px', borderRadius: '10px' }}
            >
              {isAr ? 'إضافة إلى جدولي التدريبي ➕' : 'Add to Workout Plan ➕'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
