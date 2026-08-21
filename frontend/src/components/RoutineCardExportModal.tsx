import React, { useRef, useState } from 'react';
import { X, Download, Copy, Dumbbell, Check } from 'lucide-react';

interface RoutineCardExportModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  planTitle?: string;
  dayTitle: string;
  dayIndex: number;
  focusArea?: string;
  exercises: Array<{
    name: string;
    sets: number | string;
    reps: string;
    targetMuscle?: string;
    weight?: string;
  }>;
  onClose: () => void;
}

export const RoutineCardExportModal: React.FC<RoutineCardExportModalProps> = ({
  isOpen,
  lang,
  planTitle = 'BeastMode Routine',
  dayTitle,
  dayIndex,
  focusArea,
  exercises,
  onClose,
}) => {
  const isEn = lang === 'en';
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetMuscles = Array.from(
    new Set(exercises.map((e) => e.targetMuscle).filter(Boolean))
  );
  const totalSets = exercises.reduce(
    (sum, e) => sum + (parseInt(String(e.sets)) || 3),
    0
  );
  const estMin = Math.max(20, Math.round(totalSets * 2.5 + 5));

  const handleCopyText = () => {
    let text = `🦍 *${planTitle}* ⚡\n`;
    text += `📅 *${isEn ? `Day ${dayIndex}: ${dayTitle}` : `اليوم ${dayIndex}: ${dayTitle}`}*\n`;
    if (focusArea) text += `🎯 ${isEn ? 'Focus:' : 'التركيز:'} ${focusArea}\n\n`;
    text += `📋 *${isEn ? 'Exercises List:' : 'قائمة التمارين:'}*\n`;
    exercises.forEach((ex, idx) => {
      text += `${idx + 1}. ${ex.name} — ${ex.sets} × ${ex.reps}\n`;
    });
    text += `\n⚡ https://new-beast-mode.vercel.app/`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintOrSave = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(0, 210, 255, 0.4)',
          background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.98), rgba(4, 7, 18, 0.99))',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 210, 255, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📷</span>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', margin: 0, color: '#fff' }}>
                {isEn ? 'Visual Gym Routine Card' : 'بطاقة التمرين السينمائية للجيم 📷'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isEn ? 'Aesthetic dark-mode routine card for your phone & gym' : 'تصميم بطاقة أنيقة لمراجعتها في الجيم ومشاركتها'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable / Visual Dark Card */}
        <div
          ref={cardRef}
          style={{
            borderRadius: '20px',
            padding: '24px',
            background: 'linear-gradient(145deg, #090e1f, #04060d)',
            border: '2px solid rgba(0, 210, 255, 0.5)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(0, 210, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Watermark Logo */}
          <div
            style={{
              position: 'absolute',
              top: '-15px',
              right: isEn ? '-15px' : 'auto',
              left: isEn ? 'auto' : '-15px',
              fontSize: '90px',
              opacity: 0.04,
              fontWeight: '900',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            BEAST
          </div>

          {/* Card Brand Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Dumbbell size={16} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.5px', background: 'linear-gradient(135deg, #00d2ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BEASTMODE AI
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', background: 'rgba(0, 210, 255, 0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              DAY {dayIndex} • {estMin}m ⚡
            </span>
          </div>

          {/* Day Title & Focus */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.3px' }}>
              {dayTitle}
            </h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {targetMuscles.map((m: any) => (
                <span
                  key={m}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10b981',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '8px',
                  }}
                >
                  🎯 {m}
                </span>
              ))}
            </div>
          </div>

          {/* Exercise Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {exercises.map((ex, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', width: '18px' }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f1f5f9' }}>
                    {ex.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                    {ex.sets} × {ex.reps}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Card Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
            <span>🔥 {totalSets} Total Sets • High Intensity</span>
            <span>new-beast-mode.vercel.app</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyText}
            className="secondary-btn"
            style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? (isEn ? 'Copied Text!' : 'تم النسخ!') : (isEn ? 'Copy Text 📋' : 'نسخ النص 📋')}</span>
          </button>

          <button
            onClick={handlePrintOrSave}
            className="glow-btn shimmer-glow"
            style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} />
            <span>{isEn ? 'Print / Save PDF 🖨️' : 'طباعة وحفظ PDF 🖨️'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
