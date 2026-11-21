import React, { useMemo } from 'react';
import { Dumbbell } from 'lucide-react';
import { ExerciseImage } from '../ExerciseImage';
import type { AppLang } from '../../types/domain';

export interface PickerExerciseOption {
  id?: string | number;
  name?: string;
  name_en?: string;
  name_ar?: string;
  muscle_en?: string;
  muscle_ar?: string;
  targetMuscle?: string;
  equipment?: string;
  equipment_en?: string;
  equipment_ar?: string;
  image_url?: string;
  gif_url?: string;
  instructions_ar?: string;
  instructions_en?: string;
}

export interface SelectedPickerExercise {
  id: number;
  name: string;
  targetMuscle: string;
  weight: string;
  imageUrl: string;
  sets: number;
  reps: string;
  restSeconds: number;
  exerciseTips: string;
}

interface ExercisePickerModalProps {
  lang: AppLang;
  isReplaceMode: boolean;
  pickerMuscle: string;
  setPickerMuscle: (muscle: string) => void;
  pickerEquipment: string;
  setPickerEquipment: (eq: string) => void;
  pickerQuery: string;
  setPickerQuery: (q: string) => void;
  libraryExercises: PickerExerciseOption[];
  onSelectExercise: (selected: SelectedPickerExercise) => void;
  onClose: () => void;
}

const MUSCLE_TABS = (lang: AppLang) => [
  { key: 'ALL', label: lang === 'en' ? '🌐 All' : '🌐 جميع العضلات' },
  { key: 'Chest', label: lang === 'en' ? '🏋️ Chest' : '🏋️ الصدر' },
  { key: 'Back', label: lang === 'en' ? '🦍 Back' : '🦍 الظهر' },
  { key: 'Shoulders', label: lang === 'en' ? '🦾 Shoulders' : '🦾 الأكتاف' },
  { key: 'Quadriceps', label: lang === 'en' ? '🦵 Quads' : '🦵 الأرجل' },
  { key: 'Hamstrings', label: lang === 'en' ? '🦵 Hamstrings' : '🦵 الفخذ الخلفي' },
  { key: 'Biceps', label: lang === 'en' ? '💪 Biceps' : '💪 البايسبس' },
  { key: 'Triceps', label: lang === 'en' ? '⚡ Triceps' : '⚡ الترايسبس' },
  { key: 'Abs', label: lang === 'en' ? '🔥 Abs & Core' : '🔥 عضلات البطن' },
  { key: 'Calves', label: lang === 'en' ? '🦶 Calves' : '🦶 السمانة' },
  { key: 'Cardio', label: lang === 'en' ? '⏱️ Cardio' : '⏱️ كارديو' },
];

const EQUIPMENT_PILLS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'Dumbbells', label: 'دمبلز' },
  { key: 'Barbell', label: 'بار' },
  { key: 'Cable', label: 'كيبل' },
  { key: 'Machine', label: 'أجهزة' },
  { key: 'Bodyweight', label: 'وزن الجسم' },
];

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  lang,
  isReplaceMode,
  pickerMuscle,
  setPickerMuscle,
  pickerEquipment,
  setPickerEquipment,
  pickerQuery,
  setPickerQuery,
  libraryExercises,
  onSelectExercise,
  onClose,
}) => {
  const filteredList = useMemo(() => {
    const q = pickerQuery
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي');
    const qWords = q.split(/\s+/).filter(Boolean);

    let list = libraryExercises || [];

    if (pickerMuscle !== 'ALL') {
      const normPickerM = pickerMuscle.toLowerCase();
      list = list.filter((ex) => {
        const mEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
        const mAr = (ex.muscle_ar || '').toLowerCase();
        return mEn.includes(normPickerM) || normPickerM.includes(mEn) || mAr.includes(normPickerM);
      });
    }

    if (pickerEquipment !== 'ALL') {
      const normPickerEq = pickerEquipment.toLowerCase();
      list = list.filter((ex) => {
        const eqEn = (ex.equipment_en || ex.equipment || '').toLowerCase();
        const eqAr = (ex.equipment_ar || '').toLowerCase();
        return eqEn.includes(normPickerEq) || eqAr.includes(normPickerEq);
      });
    }

    if (qWords.length > 0) {
      list = list.filter((ex) => {
        const nameAr = (ex.name_ar || ex.name || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
        const nameEn = (ex.name_en || ex.name || '').toLowerCase();
        const muscleAr = (ex.muscle_ar || '').toLowerCase();
        const muscleEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
        const combined = `${nameAr} ${nameEn} ${muscleAr} ${muscleEn}`;
        return qWords.every((w) => combined.includes(w));
      });
    }

    return list.slice(0, 40);
  }, [libraryExercises, pickerMuscle, pickerEquipment, pickerQuery]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1400,
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
          maxWidth: '860px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '22px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--glass-shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', margin: 0, color: 'var(--text-primary)' }}>
                {lang === 'en' ? 'Visual Exercise Picker (+4,100 Exercises)' : 'المكتبة التفاعلية لاختيار التمارين المصورة (+4,100 تمرين) 🏋️'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                {lang === 'en' ? 'Filter by muscle or equipment, search in real-time, and add to your day with 1-click.' : 'فلترة حسب العضلة أو الأداة، بحث فوري فائق السرعة، وإضافة للجدول بنقرة واحدة.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ width: '34px', height: '34px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'thin' }}>
          {MUSCLE_TABS(lang).map((tab) => {
            const isActive = pickerMuscle === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPickerMuscle(tab.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-card-hover)',
                  color: isActive ? 'var(--primary-contrast, #050710)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search by exercise name, muscle, equipment...' : '🔍 اكتب اسم التمرين، العضلة، الأداة...'}
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              className="input-field"
              style={{ padding: '11px 16px', fontSize: '13.5px', borderRadius: '12px', width: '100%' }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {EQUIPMENT_PILLS.map((eq) => {
              const isActive = pickerEquipment === eq.key;
              return (
                <button
                  key={eq.key}
                  type="button"
                  onClick={() => setPickerEquipment(eq.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isActive ? 'rgba(0, 210, 255, 0.15)' : 'var(--bg-card-hover)',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                >
                  {eq.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '12px',
            maxHeight: '440px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {filteredList.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '32px' }}>🔍</span>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px' }}>
                {lang === 'en' ? 'No exercises match your filter. Try changing muscle or search query.' : 'لم نجد تمارين مطابقة للفلتر المحدد. جرب تغيير العضلة أو كتابة اسم آخر.'}
              </p>
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const nameAr = item.name_ar || item.name_en || item.name || 'تمرين';
              const nameEn = item.name_en || item.name || 'Exercise';
              const muscle = item.muscle_ar || item.muscle_en || item.targetMuscle || 'عضلات';
              const equip = item.equipment_ar || item.equipment_en || item.equipment || 'أداة';
              const img = item.image_url || item.gif_url || '';

              return (
                <div
                  key={item.id || idx}
                  className="glass-panel"
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card-hover)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-card)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <ExerciseImage src={img} alt={nameEn} muscle={item.muscle_en || item.targetMuscle} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lang === 'en' ? nameEn : nameAr}
                      </div>
                      {lang === 'ar' && nameEn && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {nameEn}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(0, 210, 255, 0.12)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                          🎯 {muscle}
                        </span>
                        <span style={{ fontSize: '10px', background: 'var(--border-color)', color: 'var(--text-secondary)', padding: '1px 6px', borderRadius: '6px' }}>
                          🏋️ {equip}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectExercise({
                        id: Date.now(),
                        name: lang === 'en' ? nameEn : nameAr,
                        targetMuscle: item.muscle_en || item.targetMuscle || 'Chest',
                        weight: item.equipment_en || item.equipment || 'Dumbbells',
                        imageUrl: img,
                        sets: 3,
                        reps: '10-12',
                        restSeconds: 60,
                        exerciseTips: item.instructions_ar || item.instructions_en || '',
                      })
                    }
                    className="glow-btn"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>
                      {isReplaceMode
                        ? lang === 'en'
                          ? 'Choose This Exercise ⚡'
                          : 'استبدال بهذا التمرين ⚡'
                        : lang === 'en'
                        ? '+ Add to Routine'
                        : '+ إضافة إلى اليوم التدريبي'}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
