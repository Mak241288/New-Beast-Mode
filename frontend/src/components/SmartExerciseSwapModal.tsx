import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Dumbbell, Zap, Check } from 'lucide-react';
import { api } from '../services/api';
import { cacheStore } from '../utils/cacheStore';

interface SmartExerciseSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExerciseName: string;
  targetMuscle: string;
  onSwap: (newExercise: { name: string; targetMuscle: string }) => void;
  lang: 'ar' | 'en';
}

export const SmartExerciseSwapModal: React.FC<SmartExerciseSwapModalProps> = ({
  isOpen,
  onClose,
  currentExerciseName,
  targetMuscle,
  onSwap,
  lang,
}) => {
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isEn = lang === 'en';

  useEffect(() => {
    if (!isOpen) return;

    const fetchAlternatives = async () => {
      setLoading(true);
      try {
        const cached = cacheStore.get<any[]>('library_tree_flat');
        const list = cached && cached.length > 0 ? cached : await api.getLibraryTree();
        // Filter out current exercise and match muscle
        const muscleQuery = (targetMuscle || 'chest').toLowerCase();
        const filtered = (list || []).filter(
          (ex: any) =>
            (ex.muscle_en || ex.targetMuscle || ex.muscle_ar || '').toLowerCase().includes(muscleQuery) &&
            (ex.name_en || ex.name || '').toLowerCase() !== currentExerciseName.toLowerCase()
        );

        if (filtered.length > 0) {
          setAlternatives(filtered.slice(0, 4));
        } else {
          // Fallback static alternatives
          setAlternatives([
            { name: isEn ? 'Dumbbell Variation' : 'بديل بالدمبلز', targetMuscle: targetMuscle || 'Chest', equipment: 'Dumbbell' },
            { name: isEn ? 'Cable Alternative' : 'بديل بالكيبل', targetMuscle: targetMuscle || 'Chest', equipment: 'Cable' },
            { name: isEn ? 'Machine Press' : 'جهاز ميكانيكي', targetMuscle: targetMuscle || 'Chest', equipment: 'Machine' },
          ]);
        }
      } catch {
        // Fallback static alternatives
        setAlternatives([
          { name: isEn ? 'Dumbbell Variation' : 'بديل بالدمبلز', targetMuscle: targetMuscle || 'Chest', equipment: 'Dumbbell' },
          { name: isEn ? 'Cable Alternative' : 'بديل بالكيبل', targetMuscle: targetMuscle || 'Chest', equipment: 'Cable' },
          { name: isEn ? 'Machine Press' : 'جهاز ميكانيكي', targetMuscle: targetMuscle || 'Chest', equipment: 'Machine' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [isOpen, currentExerciseName, targetMuscle, isEn]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animated-fade"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(180deg, rgba(16, 22, 38, 0.98), rgba(8, 11, 20, 0.99))',
          borderTop: '2px solid var(--primary)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: 'none',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px',
          boxShadow: '0 -15px 50px rgba(0,0,0,0.8), 0 0 30px var(--primary-glow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(204, 255, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#fff', margin: 0 }}>
                {isEn ? 'Smart Exercise Swap 🔀' : 'استبدال التمرين الذكي 🔀'}
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                {isEn
                  ? `Equipment busy? Choose a match for: ${currentExerciseName}`
                  : `الجهاز مشغول؟ اختر بديلاً معتمداً لتمرين: ${currentExerciseName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Alternatives List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <RefreshCw size={20} className="spin-slow" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <span>{isEn ? 'Finding biomechanical alternatives...' : 'جاري البحث عن بدائل عضلية مطابقة...'}</span>
            </div>
          ) : alternatives.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {isEn ? 'No alternatives found for this muscle group.' : 'لم يتم العثور على بدائل إضافية لهذه العضلة.'}
            </div>
          ) : (
            alternatives.map((alt: any, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  onSwap({ name: alt.name, targetMuscle: alt.targetMuscle || targetMuscle });
                  onClose();
                }}
                className="glass-panel-hover"
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(0, 240, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--secondary, #00f0ff)',
                    }}
                  >
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{alt.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span>🎯 {alt.targetMuscle || targetMuscle}</span>
                      {alt.equipment && <span>⚙️ {alt.equipment}</span>}
                    </div>
                  </div>
                </div>

                <button
                  className="glow-btn"
                  style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', gap: '4px' }}
                >
                  <Check size={13} />
                  <span>{isEn ? 'Swap' : 'تبديل'}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer note */}
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <Zap size={12} color="var(--primary)" />
          <span>{isEn ? 'Keeps your target sets, reps, and progression intact.' : 'يحافظ على نفس الجولات والتكرارات المخططة لجلسة اليوم.'}</span>
        </div>
      </div>
    </div>
  );
};
