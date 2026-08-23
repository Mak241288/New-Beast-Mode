import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { playTimerSound } from '../utils/audioSynthesizer';

interface DynamicWarmupModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  focusArea?: string;
  onClose: () => void;
}

export const DynamicWarmupModal: React.FC<DynamicWarmupModalProps> = ({
  isOpen,
  lang,
  focusArea = '',
  onClose,
}) => {
  const isEn = lang === 'en';

  const getWarmupMoves = () => {
    const text = (focusArea || '').toLowerCase();
    const isLower = text.includes('leg') || text.includes('أرجل') || text.includes('فخذ') || text.includes('squat');
    const isCore = text.includes('ab') || text.includes('بطن') || text.includes('core') || text.includes('كور');

    if (isLower) {
      return [
        {
          name: isEn ? 'Standing Hip Circles' : 'دوائر الورك والحوض لليونة المفاصل',
          muscle: isEn ? 'Glutes & Hips' : 'الحوض والأرداف',
          durationSec: 60,
          desc: isEn ? 'Slow, wide rotations to lubricate hip capsules and activate stabilizers.' : 'تدوير الحوض في دوائر واسعة وبطيئة لتليين مفصل الورك وتفادي الشد.',
          img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Ankle_Circles/0.jpg'
        },
        {
          name: isEn ? 'Bodyweight Air Squats' : 'سكوات بوزن الجسم لتنشيط الركبتين',
          muscle: isEn ? 'Quads & Glutes' : 'الأفخاذ الأمامية والمؤخرة',
          durationSec: 60,
          desc: isEn ? 'Controlled full-depth squats pushing knees outward to prime quads.' : 'نزول كامل متحكم به مع فتح الركبتين للخارج لضخ الدم في الأفخاذ.',
          img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Bodyweight_Squat/0.jpg'
        },
        {
          name: isEn ? 'Leg Swings (Front & Back)' : 'مرجحة الساقين للأمام والخلف',
          muscle: isEn ? 'Hamstrings & Hip Flexors' : 'الأوتار الخلفية وثنيات الفخذ',
          durationSec: 60,
          desc: isEn ? 'Dynamic swings to stretch hamstrings and prepare tendons for loading.' : 'مرجحة حركية للأمام والخلف لإطالة العضلات الخلفية وتجهيز الأوتار.',
          img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Leg_Swings/0.jpg'
        }
      ];
    }

    if (isCore) {
      return [
        {
          name: isEn ? 'Cat-Cow Spinal Flexion' : 'إطالة القطة والبقرة لمرونة العمود الفقري',
          muscle: isEn ? 'Spine & Core' : 'الفقرات والبطن',
          durationSec: 60,
          desc: isEn ? 'Alternate arching and rounding back to decompress discs.' : 'تقويس وتمديد فقرات الظهر بالتناوب لزيادة المرونة وتنشيط الكور.',
          img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Cat_Cow/0.jpg'
        },
        {
          name: isEn ? 'Bird-Dog Core Stabilizers' : 'تمرين الطائر والكلب لتثبيت الجذع',
          muscle: isEn ? 'Lower Back & Glutes' : 'أسفل الظهر والأرداف',
          durationSec: 60,
          desc: isEn ? 'Extend opposite arm and leg while bracing abdominals.' : 'مد الذراع والساق المعاكسة بالتناوب مع شد عضلات البطن.',
          img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Bird_Dog/0.jpg'
        },
        {
          name: isEn ? 'Jumping Jacks Activation' : 'القفز وفتح الرجلين لرفع النبض',
          muscle: isEn ? 'Full Body & Cardio' : 'كامل الجسم والقلب',
          durationSec: 60,
          desc: isEn ? 'Light rhythm to raise body temperature and CNS readiness.' : 'إيقاع خفيف وسريع لرفع درجة حرارة الجسم وتجهيز الجهاز العصبي.',
          img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Jumping_Jacks/0.jpg'
        }
      ];
    }

    // Default: Upper Body / Push / Pull
    return [
      {
        name: isEn ? 'Arm Circles & Rotator Cuff Swings' : 'دوائر الذراعين وتنشيط عضلات الكتف',
        muscle: isEn ? 'Shoulders & Rotator Cuff' : 'الكتف وأوتار التدوير',
        durationSec: 60,
        desc: isEn ? 'Rotate arms in small then large circles to warm up shoulder capsules.' : 'عمل دوائر للأمام والخلف لتسخين مفصل الكتف والأوتار الحساسة وتفادي الإصابات.',
        img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Arm_Circles/0.jpg'
      },
      {
        name: isEn ? 'Band / Bodyweight Wall Slides' : 'انزلاق الذراعين على الجدار لفتح الصدر',
        muscle: isEn ? 'Chest & Upper Back' : 'الصدر وأعلى الظهر',
        durationSec: 60,
        desc: isEn ? 'Press forearms against wall and slide upward to activate scapula.' : 'رفع الذراعين على الجدار وتنشيط لوحي الكتف وفتح القفص الصدري.',
        img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Wall_Slides/0.jpg'
      },
      {
        name: isEn ? 'Jumping Jacks & Torso Twists' : 'القفز والالتواء لتنشيط الدورة الدموية',
        muscle: isEn ? 'Full Body Cardio' : 'كامل الجسم',
        durationSec: 60,
        desc: isEn ? 'Raise heart rate and prepare nervous system for maximum strength.' : 'تنشيط النبض وضخ الدم في العضلات استعداداً لرفع الأوزان الثقيلة.',
        img: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Jumping_Jacks/0.jpg'
      }
    ];
  };

  const moves = getWarmupMoves();
  const [activeMoveIdx, setActiveMoveIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSecondsRemaining(60);
      setActiveMoveIdx(0);
      setIsCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      playTimerSound('BOXING_BELL');
      if (activeMoveIdx < moves.length - 1) {
        setActiveMoveIdx((prev) => prev + 1);
        setSecondsRemaining(60);
      } else {
        setIsRunning(false);
        setIsCompleted(true);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining, activeMoveIdx, moves.length]);

  if (!isOpen) return null;

  const currentMove = moves[activeMoveIdx];
  const progressPercent = ((60 - secondsRemaining) / 60) * 100;

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
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.98), rgba(4, 7, 18, 0.99))',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(245, 158, 11, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🤸‍♂️</span>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', margin: 0, color: '#fff' }}>
                {isEn ? '3-Min Dynamic Mobility Warmup' : 'الإحماء الحركي الذكي (3 دقائق) 🔥'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {isEn ? 'Prime your joints, nervous system & lubricate cartilage' : 'تجهيز المفاصل وتليين الأوتار لتفادي الإصابات ورفع الأداء'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="secondary-btn" style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {isCompleted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0 }}>
              {isEn ? 'Warmup Complete! Ready to Lift ⚡' : 'اكتمل الإحماء! مفاصلك جاهزة للأوزان ⚡'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: 0 }}>
              {isEn ? 'Your body temperature is optimal and your nervous system is primed for maximum strength.' : 'ارتفعت حرارة جسمك واكتمل تليين المفاصل. ابدأ جولتك الأولى بتركيز وثبات!'}
            </p>
            <button onClick={onClose} className="glow-btn shimmer-glow" style={{ marginTop: '10px', padding: '12px 30px', fontSize: '14px', borderRadius: '12px' }}>
              {isEn ? 'Start Workout Session ▶' : 'الانتقال للتمارين الرئيسية ▶'}
            </button>
          </div>
        ) : (
          <>
            {/* Step Progress Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {moves.map((_m, idx) => {
                const isActive = activeMoveIdx === idx;
                const isPassed = activeMoveIdx > idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveMoveIdx(idx);
                      setSecondsRemaining(60);
                      setIsRunning(false);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(245, 158, 11, 0.2)' : isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isActive ? '1px solid #f59e0b' : isPassed ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: isActive ? '#f59e0b' : isPassed ? '#10b981' : 'var(--text-muted)',
                    }}
                  >
                    {isPassed ? '✓ ' : ''}{isEn ? `Move ${idx + 1}` : `الحركة ${idx + 1}`}
                  </div>
                );
              })}
            </div>

            {/* Active Move Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#f59e0b', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 10px', borderRadius: '8px' }}>
                  🎯 {currentMove.muscle}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {activeMoveIdx + 1} / 3
                </span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#fff' }}>
                {currentMove.name}
              </h4>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {currentMove.desc}
              </p>

              {/* Progress Bar & Countdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {isEn ? 'Time Remaining:' : 'الوقت المتبقي:'}
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: secondsRemaining <= 10 ? '#ef4444' : '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
                    00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', transition: 'width 1s linear' }} />
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="glow-btn"
                style={{
                  flex: 2,
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isRunning ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined,
                }}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                <span>{isRunning ? (isEn ? 'Pause Timer' : 'إيقاف مؤقت') : (isEn ? 'Start Warmup ▶' : 'بدء الإحماء ▶')}</span>
              </button>

              <button
                onClick={() => {
                  setSecondsRemaining(60);
                  setIsRunning(false);
                }}
                className="secondary-btn"
                style={{ padding: '12px', borderRadius: '12px' }}
                title={isEn ? 'Reset' : 'إعادة ضبط'}
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => {
                  if (activeMoveIdx < moves.length - 1) {
                    setActiveMoveIdx((prev) => prev + 1);
                    setSecondsRemaining(60);
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="secondary-btn"
                style={{ padding: '12px', borderRadius: '12px' }}
                title={isEn ? 'Skip' : 'تخطي'}
              >
                {isEn ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
