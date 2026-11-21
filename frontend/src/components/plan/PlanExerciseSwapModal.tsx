import React, { useMemo } from 'react';
import type { AppLang } from '../../types/domain';
import type { PickerExerciseOption } from './ExercisePickerModal';

export interface ManualSwapTarget {
  dayIdx: number;
  exIdx: number;
  exercise: {
    name?: string;
    targetMuscle?: string;
    sets?: number | string;
    reps?: string | number;
    weight?: string;
  };
}

export interface SwapReplacementData {
  name: string;
  targetMuscle: string;
  weight: string;
  imageUrl: string;
}

interface PlanExerciseSwapModalProps {
  lang: AppLang;
  target: ManualSwapTarget;
  query: string;
  setQuery: (q: string) => void;
  libraryExercises: PickerExerciseOption[];
  onSelectReplacement: (replacement: SwapReplacementData) => void;
  onClose: () => void;
}

export const PlanExerciseSwapModal: React.FC<PlanExerciseSwapModalProps> = ({
  lang,
  target,
  query,
  setQuery,
  libraryExercises,
  onSelectReplacement,
  onClose,
}) => {
  const alternatives = useMemo(() => {
    const targetM = (target.exercise.targetMuscle || '').toLowerCase().trim();
    const q = query
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي');

    let alts = libraryExercises || [];
    if (q) {
      alts = alts.filter((ex) => {
        const nameAr = (ex.name_ar || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
        const nameEn = (ex.name_en || ex.name || '').toLowerCase();
        const muscleAr = (ex.muscle_ar || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
        const muscleEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
        return nameAr.includes(q) || nameEn.includes(q) || muscleAr.includes(q) || muscleEn.includes(q);
      });
    } else if (targetM) {
      alts = alts.filter((ex) => {
        const muscleEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
        const muscleAr = (ex.muscle_ar || '').toLowerCase();
        return muscleEn.includes(targetM) || targetM.includes(muscleEn) || muscleAr.includes(targetM);
      });
    }
    return alts.slice(0, 15);
  }, [libraryExercises, query, target.exercise.targetMuscle]);

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card plan-architect-modal"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '22px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--glass-shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔄</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {lang === 'en' ? 'Smart Exercise Alternative Swap' : 'المبادلة الذكية لبدائل التمارين 🔄'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {lang === 'en'
                  ? `Target Muscle: ${target.exercise.targetMuscle || 'Muscle'}`
                  : `العضلة المستهدفة: ${target.exercise.targetMuscle || 'تمرين'}`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>
              {lang === 'en' ? 'CURRENT EXERCISE TO REPLACE:' : 'التمرين الحالي المراد استبداله:'}
            </span>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
              {target.exercise.name || (lang === 'en' ? 'Empty Slot' : 'تمرين فارغ')}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {target.exercise.sets} × {target.exercise.reps}
          </span>
        </div>

        <input
          type="text"
          placeholder={lang === 'en' ? 'Search alternative exercise...' : 'ابحث عن تمرين بديل مخصص...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field"
          style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }}
          autoFocus
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {alternatives.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              {lang === 'en' ? 'No alternatives found. Type a name to search.' : 'لا توجد بدائل مباشرة. اكتب اسم التمرين في مربع البحث أعلاه.'}
            </div>
          ) : (
            alternatives.map((altEx, idx) => {
              const altName = lang === 'en' ? altEx.name_en || altEx.name || 'Exercise' : altEx.name_ar || altEx.name_en || altEx.name || 'تمرين';
              const altEquip = lang === 'en' ? altEx.equipment_en || altEx.equipment : altEx.equipment_ar || altEx.equipment_en || altEx.equipment;
              const altMuscle = lang === 'en' ? altEx.muscle_en || altEx.targetMuscle : altEx.muscle_ar || altEx.muscle_en || altEx.targetMuscle;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onSelectReplacement({
                      name: altName,
                      targetMuscle: altEx.muscle_en || altEx.targetMuscle || target.exercise.targetMuscle || 'General',
                      weight: altEx.equipment_en || altEx.equipment || target.exercise.weight || 'Dumbbells',
                      imageUrl: altEx.image_url || altEx.gif_url || '',
                    })
                  }
                  className="secondary-btn"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: lang === 'en' ? 'left' : 'right',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card-hover)',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>{altName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                      <span>🏋️ {altEquip || 'Free Weight'}</span>
                      <span>🎯 {altMuscle || ''}</span>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(0, 210, 255, 0.15)', color: 'var(--primary)', fontSize: '11px', fontWeight: 'bold' }}>
                    {lang === 'en' ? 'Select ⚡' : 'استبدال ⚡'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
