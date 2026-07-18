import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Info, HelpCircle, ExternalLink, Play } from 'lucide-react';

interface ExerciseLibraryProps {
  lang: 'ar' | 'en';
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ lang }) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('ALL');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Add to Plan States
  const [activePlan, setActivePlan] = useState<any>(null);
  const [targetDayId, setTargetDayId] = useState<number | ''>('');
  const [addingToPlan, setAddingToPlan] = useState(false);

  const muscleGroups = [
    { id: 'ALL', label: lang === 'en' ? 'All Muscles' : 'كل العضلات' },
    { id: 'chest', label: lang === 'en' ? 'Chest' : 'الصدر' },
    { id: 'back', label: lang === 'en' ? 'Back' : 'الظهر' },
    { id: 'shoulders', label: lang === 'en' ? 'Shoulders' : 'الأكتاف' },
    { id: 'legs', label: lang === 'en' ? 'Legs' : 'الأرجل' },
    { id: 'arms', label: lang === 'en' ? 'Arms' : 'الذراعين' },
    { id: 'abs', label: lang === 'en' ? 'Abs' : 'البطن' },
  ];

  const equipments = [
    { id: 'ALL', label: lang === 'en' ? 'All Equipment' : 'كل الأدوات' },
    { id: 'dumbbell', label: lang === 'en' ? 'Dumbbells' : 'دمبلز' },
    { id: 'barbell', label: lang === 'en' ? 'Barbell' : 'بار' },
    { id: 'bodyweight', label: lang === 'en' ? 'Bodyweight' : 'وزن الجسم' },
    { id: 'cable', label: lang === 'en' ? 'Cables' : 'جهاز كيبل' },
    { id: 'band', label: lang === 'en' ? 'Bands' : 'حبال مقاومة' },
  ];

  const difficulties = [
    { id: 'ALL', label: lang === 'en' ? 'All Levels' : 'كل المستويات' },
    { id: 'beginner', label: lang === 'en' ? 'Beginner' : 'مبتدئ' },
    { id: 'intermediate', label: lang === 'en' ? 'Intermediate' : 'متوسط' },
    { id: 'advanced', label: lang === 'en' ? 'Advanced' : 'متقدم' },
  ];

  const getSecondaryMuscles = (primary: string) => {
    const p = (primary || '').toLowerCase();
    if (p.includes('chest') || p.includes('صدر')) {
      return lang === 'en' ? 'Triceps, Front Delts' : 'العضلة ثلاثية الرؤوس (ترايسبس)، الأكتاف الأمامية';
    }
    if (p.includes('back') || p.includes('lat') || p.includes('ظهر') || p.includes('lats')) {
      return lang === 'en' ? 'Biceps, Forearms, Rear Delts' : 'العضلة ثنائية الرؤوس (بايسبس)، السواعد، الأكتاف الخلفية';
    }
    if (p.includes('shoulder') || p.includes('كتف') || p.includes('trap')) {
      return lang === 'en' ? 'Triceps, Upper Chest' : 'العضلة ثلاثية الرؤوس (ترايسبس)، أعلى الصدر';
    }
    if (p.includes('quad') || p.includes('leg') || p.includes('رجل') || p.includes('فخذ') || p.includes('glute')) {
      return lang === 'en' ? 'Hamstrings, Glutes, Calves' : 'الأوتار الخلفية، الأرداف، السمانة';
    }
    if (p.includes('bicep') || p.includes('arm') || p.includes('ذراع')) {
      return lang === 'en' ? 'Forearms, Brachialis' : 'السواعد، العضلة العضدية';
    }
    if (p.includes('tricep')) {
      return lang === 'en' ? 'Rear Delts, Forearms' : 'الأكتاف الخلفية، السواعد';
    }
    return lang === 'en' ? 'Core stabilizers' : 'عضلات الجذع المساعدة';
  };

  const getProTip = (primary: string) => {
    const p = (primary || '').toLowerCase();
    if (p.includes('chest') || p.includes('صدر')) {
      return lang === 'en' 
        ? 'Keep your shoulder blades retracted and elbows at a 45-degree angle to protect your joints.'
        : 'حافظ على سحب لوحي كتفيك للخلف وضم مرفقيك بزاوية 45 درجة لحماية المفاصل.';
    }
    if (p.includes('back') || p.includes('lat') || p.includes('ظهر') || p.includes('lats')) {
      return lang === 'en'
        ? 'Focus on pulling with your elbows rather than your hands to isolate the lats.'
        : 'ركز على السحب عن طريق تحريك مرفقيك للخلف وليس يديك لعزل عضلات الظهر.';
    }
    if (p.includes('shoulder') || p.includes('كتف') || p.includes('trap')) {
      return lang === 'en'
        ? 'Control the weight on the way down; do not let your elbows drop below shoulder level.'
        : 'تحكم في الوزن أثناء النزول؛ لا تدع مرفقيك ينزلان عن مستوى الكتف.';
    }
    if (p.includes('quad') || p.includes('leg') || p.includes('رجل') || p.includes('فخذ') || p.includes('glute')) {
      return lang === 'en'
        ? 'Keep your knees aligned with your toes and drive through the mid-foot.'
        : 'حافظ على استقامة ركبتيك مع اتجاه أصابع قدميك وادفع بمنتصف القدم.';
    }
    if (p.includes('bicep') || p.includes('curl') || p.includes('arm')) {
      return lang === 'en'
        ? 'Keep your elbows tucked tight to your torso throughout and avoid swinging.'
        : 'حافظ على تثبيت كوعك بجانب جذعك طوال الحركة وتجنب أرجحة الجسم.';
    }
    return lang === 'en'
      ? 'Control the negative (eccentric) phase of the movement for maximum efficiency.'
      : 'تحكم في مسار الحركة السلبي (الرجوع للبداية ببطء) للحصول على أقصى كفاءة.';
  };

  const getStepList = (instructions: string) => {
    if (!instructions) return [];
    return instructions
      .split(/[.\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const tree = await api.getLibraryTree();
      // Flatten the tree structure to get all exercises
      const list: any[] = [];
      tree.forEach((division: any) => {
        division.children.forEach((muscleGroup: any) => {
          muscleGroup.exercises.forEach((ex: any) => {
            list.push({
              ...ex,
              division: division.key,
              muscleGroupKey: muscleGroup.key,
            });
          });
        });
      });
      setExercises(list);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
    api.getActivePlan().then(setActivePlan).catch(() => null);
  }, []);

  const handleAddToPlan = async () => {
    if (!selectedExercise || !targetDayId) return;
    setAddingToPlan(true);
    try {
      const name = lang === 'en' ? selectedExercise.name_en : (selectedExercise.name_ar || selectedExercise.name_en);
      const targetMuscle = lang === 'en' ? selectedExercise.muscle_en : (selectedExercise.muscle_ar || selectedExercise.muscle_en);
      
      await api.addCustomExercise(Number(targetDayId), {
        name,
        targetMuscle,
        category: selectedExercise.category || 'IRON',
        sets: 3,
        reps: '10-12',
        weight: 'Bodyweight',
        exerciseTips: getProTip(selectedExercise.muscle_en),
        imageUrl: selectedExercise.image_url || null,
        videoUrl: selectedExercise.video_url || null
      });

      alert(lang === 'en' 
        ? `Successfully added "${name}" to your workout plan!`
        : `تم إضافة "${name}" إلى جدول تمارينك بنجاح!`
      );
      setTargetDayId('');
      setSelectedExercise(null);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to add exercise to plan.' : 'فشل إضافة التمرين إلى الجدول.');
    } finally {
      setAddingToPlan(false);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const nameEn = (ex.name_en || '').toLowerCase();
    const nameAr = (ex.name_ar || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery = nameEn.includes(query) || nameAr.includes(query);

    const muscleEn = (ex.muscle_en || '').toLowerCase();
    const muscleAr = (ex.muscle_ar || '').toLowerCase();
    const matchesMuscle =
      selectedMuscle === 'ALL' ||
      muscleEn === selectedMuscle ||
      muscleAr.includes(selectedMuscle) ||
      (selectedMuscle === 'back' && (muscleEn.includes('back') || muscleEn.includes('lat'))) ||
      (selectedMuscle === 'shoulders' && (muscleEn.includes('shoulder') || muscleEn.includes('trap'))) ||
      (selectedMuscle === 'arms' && (muscleEn.includes('bicep') || muscleEn.includes('tricep') || muscleEn.includes('arm') || muscleEn.includes('forearm'))) ||
      (selectedMuscle === 'legs' && (muscleEn.includes('quad') || muscleEn.includes('hamstring') || muscleEn.includes('calf') || muscleEn.includes('glute') || muscleEn.includes('leg') || muscleEn.includes('adductor') || muscleEn.includes('abductor'))) ||
      (selectedMuscle === 'abs' && (muscleEn.includes('ab') || muscleEn.includes('core')));

    const equipEn = (ex.equipment_en || '').toLowerCase();
    const equipAr = (ex.equipment_ar || '').toLowerCase();
    const matchesEquipment =
      selectedEquipment === 'ALL' ||
      equipEn.includes(selectedEquipment) ||
      equipAr.includes(selectedEquipment) ||
      (selectedEquipment === 'bodyweight' && (equipEn.includes('body only') || equipEn.includes('none')));

    const matchesDifficulty =
      selectedDifficulty === 'ALL' ||
      (ex.level || '').toLowerCase() === selectedDifficulty;

    return matchesQuery && matchesMuscle && matchesEquipment && matchesDifficulty;
  });

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header and Search */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>
            {lang === 'en' ? 'Exercise Library 📚' : 'مكتبة التمارين الرياضية 📚'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            {lang === 'en' ? 'Browse the local database of exercise tutorials and instructions' : 'تصفح قاعدة بيانات التمارين المتاحة، العضلات المستهدفة، وطريقة الأداء الصحيحة'}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search style={{ position: 'absolute', top: '14px', right: lang === 'en' ? 'auto' : '15px', left: lang === 'en' ? '15px' : 'auto', color: 'var(--text-muted)' }} size={20} />
          <input
            type="text"
            className="input-field"
            placeholder={lang === 'en' ? 'Search exercise by name...' : 'ابحث عن تمرين بالاسم العربي أو الإنجليزي...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingRight: lang === 'en' ? '16px' : '45px',
              paddingLeft: lang === 'en' ? '45px' : '16px',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Muscle Groups */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
            {muscleGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedMuscle(group.id)}
                className={selectedMuscle === group.id ? 'glow-btn' : 'secondary-btn'}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.label}
              </button>
            ))}
          </div>

          {/* Equipment */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
            {equipments.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelectedEquipment(eq.id)}
                className={selectedEquipment === eq.id ? 'glow-btn' : 'secondary-btn'}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                {eq.label}
              </button>
            ))}
          </div>

          {/* Difficulty Level */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={selectedDifficulty === diff.id ? 'glow-btn' : 'secondary-btn'}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          {lang === 'en' ? 'Loading exercise library...' : 'جاري تحميل مكتبة التمارين...'}
        </div>
      ) : (
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="card glass-panel animated-fade"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                transition: 'transform var(--transition-fast)',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedExercise(ex)}
            >
              {/* Exercise Image */}
              <div style={{ height: '180px', position: 'relative', background: '#0e111a', overflow: 'hidden' }}>
                <img
                  src={ex.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'}
                  alt={ex.name_en}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(6, 8, 20, 0.95) 0%, transparent 100%)',
                    padding: '20px 15px 10px',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)',
                      fontSize: '10px',
                      padding: '2px 8px',
                    }}
                  >
                    {lang === 'en' ? ex.muscle_en : (ex.muscle_ar || ex.muscle_en)}
                  </span>
                </div>
              </div>

              {/* Title & Equipment */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    {lang === 'en' ? ex.name_en : (ex.name_ar || ex.name_en)}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    🏋️‍♂️ {lang === 'en' ? ex.equipment_en : (ex.equipment_ar || ex.equipment_en)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  <Info size={14} />
                  {lang === 'en' ? 'View Details' : 'عرض التفاصيل والتعليمات'}
                </div>
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
              <h3>{lang === 'en' ? 'No exercises found' : 'لم نجد أي تمارين تطابق البحث'}</h3>
              <p style={{ fontSize: '13px', marginTop: '5px' }}>{lang === 'en' ? 'Try changing your filters or query' : 'حاول تغيير العضلة أو الكلمة الدلالية للبحث'}</p>
            </div>
          )}
        </div>
      )}

      {/* EXERCISE DETAIL MODAL */}
      {selectedExercise && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 16, 0.95)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="glass-panel animated-fade"
            style={{
              width: '100%',
              maxWidth: '650px',
              borderRadius: '24px',
              border: '1px solid var(--primary)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image & Close Button */}
            <div style={{ height: '240px', position: 'relative', background: '#0e111a' }}>
              <img
                src={selectedExercise.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'}
                alt={selectedExercise.name_en}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => {
                  setSelectedExercise(null);
                  setTargetDayId('');
                }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: lang === 'en' ? 'auto' : '15px',
                  right: lang === 'en' ? '15px' : 'auto',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  zIndex: 10,
                }}
              >
                ✕
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(6, 8, 20, 1) 0%, transparent 100%)',
                  padding: '25px 24px 10px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                    🎯 {lang === 'en' ? selectedExercise.muscle_en : (selectedExercise.muscle_ar || selectedExercise.muscle_en)}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)' }}>
                    🏋️‍♂️ {lang === 'en' ? selectedExercise.equipment_en : (selectedExercise.equipment_ar || selectedExercise.equipment_en)}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', textTransform: 'capitalize' }}>
                    ⚡ {lang === 'en' ? selectedExercise.level : (selectedExercise.level === 'beginner' ? 'مبتدئ' : selectedExercise.level === 'advanced' ? 'متقدم' : 'متوسط')}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
                  {lang === 'en' ? selectedExercise.name_en : (selectedExercise.name_ar || selectedExercise.name_en)}
                </h2>
                {lang !== 'en' && selectedExercise.name_ar && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedExercise.name_en}
                  </p>
                )}
              </div>

              {/* Targeting Stats Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🎯 {lang === 'en' ? 'Primary Targets' : 'العضلات الأساسية'}</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold' }}>
                    {lang === 'en' ? selectedExercise.muscle_en : (selectedExercise.muscle_ar || selectedExercise.muscle_en)}
                  </h4>
                </div>
                <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🤝 {lang === 'en' ? 'Secondary Targets' : 'العضلات المساعدة'}</span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold' }}>
                    {getSecondaryMuscles(selectedExercise.muscle_en)}
                  </h4>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                  📝 {lang === 'en' ? 'Step-by-Step Instructions' : 'خطوات الأداء'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  {getStepList(lang === 'en' ? selectedExercise.instructions_en : (selectedExercise.instructions_ar || selectedExercise.instructions_en)).map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  {getStepList(lang === 'en' ? selectedExercise.instructions_en : (selectedExercise.instructions_ar || selectedExercise.instructions_en)).length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      {lang === 'en' ? 'No instructions configured.' : 'لا توجد تعليمات مسجلة.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Pro Tip */}
              <div className="glass-panel" style={{ padding: '15px', borderLeft: '4px solid var(--primary)', borderRadius: '8px', background: 'rgba(0,210,255,0.02)' }}>
                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>💡 Pro Tip / نصيحة الخبراء</h5>
                <p style={{ margin: '5px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {getProTip(selectedExercise.muscle_en)}
                </p>
              </div>

              {/* Add to Plan Section */}
              {activePlan && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    📥 {lang === 'en' ? 'Add to Your Current Plan' : 'إضافة هذا التمرين لجدولك الرياضي'}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={targetDayId || ''}
                      onChange={(e) => setTargetDayId(Number(e.target.value))}
                      className="input-field"
                      style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                    >
                      <option value="">{lang === 'en' ? '-- Select a Training Day --' : '-- اختر يوم التدريب --'}</option>
                      {activePlan.dayWorkouts
                        .filter((dw: any) => !dw.isRestDay)
                        .map((dw: any) => (
                          <option key={dw.id} value={dw.id}>
                            Day {dw.dayIndex}: {dw.title}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleAddToPlan}
                      className="glow-btn"
                      disabled={!targetDayId || addingToPlan}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      {addingToPlan ? (lang === 'en' ? 'Adding...' : 'جاري الإضافة...') : (lang === 'en' ? 'Add' : 'إضافة')}
                    </button>
                  </div>
                </div>
              )}

              {/* YouTube Video Link */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent((selectedExercise.name_en || '') + ' exercise tutorial shorts')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    textDecoration: 'none',
                    borderRadius: '12px',
                  }}
                >
                  <Play size={16} fill="currentColor" />
                  {lang === 'en' ? 'Watch Video Tutorial' : 'شرح بالفيديو 🎥'}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
