import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Info, HelpCircle, LayoutGrid, MapPin, Database, RefreshCw } from 'lucide-react';
import { InteractiveBodyMap } from '../components/InteractiveBodyMap';
import { MuscleWikiModal } from '../components/MuscleWikiModal';
import { ExerciseSearchAutocomplete } from '../components/ExerciseSearchAutocomplete';
import { ExerciseImage } from '../components/ExerciseImage';
import { cacheStore } from '../utils/cacheStore';

interface ExerciseLibraryProps {
  lang: 'ar' | 'en';
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ lang }) => {
  const [exercises, setExercises] = useState<any[]>(() => cacheStore.get('library_tree_flat') || []);
  const [loading, setLoading] = useState(() => !(cacheStore.get('library_tree_flat') && (cacheStore.get('library_tree_flat') as any[]).length > 0));
  const [searchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('ALL');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');
  const [isDbEmpty, setIsDbEmpty] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Add to Plan States
  const [activePlan, setActivePlan] = useState<any>(null);
  const [targetDayId, setTargetDayId] = useState<number | ''>('');
  const [_addingToPlan, setAddingToPlan] = useState(false);

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

  const fetchExercises = async () => {
    const cached = cacheStore.get<any[]>('library_tree_flat');
    if (!cached || cached.length === 0) {
      setLoading(true);
    }
    try {
      const list = await api.getLibraryTree();
      setExercises(list);
      setIsDbEmpty(list.length === 0);
    } catch (err) {
      console.error('[ExerciseLibrary] Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSupabaseExercises = async () => {
    setSyncing(true);
    try {
      await api.syncExercises();
      alert(lang === 'en' ? 'Exercises synced to Supabase successfully!' : 'تم مزامنة وتغذية قاعدة بيانات Supabase بالتمارين بنجاح!');
      await fetchExercises();
    } catch (err: any) {
      console.error('[Sync Error]:', err);
      alert(lang === 'en' ? 'Failed to sync exercises.' : 'فشل مزامنة التمارين مع Supabase.');
    } finally {
      setSyncing(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
              {lang === 'en' ? 'Exercise Library 📚' : 'مكتبة التمارين الرياضية 📚'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              {lang === 'en' ? 'Browse exercises via interactive body map or grid view' : 'تصفح التمارين بواسطة خريطة تشريح العضلات التفاعلية أو العرض الشبكي'}
            </p>
          </div>

          {/* Dual-View Toggle Switch */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('map')}
              className={viewMode === 'map' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MapPin size={16} />
              <span>{lang === 'en' ? 'Body Map View 🗺️' : 'خريطة الجسم 🗺️'}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutGrid size={16} />
              <span>{lang === 'en' ? 'Grid View 📋' : 'عرض القائمة 📋'}</span>
            </button>
          </div>
        </div>

        {/* Supabase Live DB Status & Sync Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: isDbEmpty ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 210, 255, 0.05)',
          border: isDbEmpty ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color={isDbEmpty ? '#f59e0b' : 'var(--primary)'} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {lang === 'en' ? 'Supabase Live Database:' : 'اتصال قاعدة بيانات Supabase:'}
            </span>
            <span className="badge" style={{
              background: isDbEmpty ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isDbEmpty ? '#f59e0b' : '#10b981',
              border: isDbEmpty ? '1px solid #f59e0b' : '1px solid #10b981',
              fontSize: '11px',
              padding: '2px 8px'
            }}>
              {isDbEmpty ? (lang === 'en' ? 'Table Empty / Waiting for Seed' : 'جدول التمارين فارغ / في انتظار المزامنة') : (lang === 'en' ? `${exercises.length} Exercises Live` : `تم تحميل ${exercises.length} تمرين مباشرة`)}
            </span>
          </div>

          <button
            onClick={handleSyncSupabaseExercises}
            disabled={syncing}
            className="secondary-btn"
            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={syncing ? 'spin-anim' : ''} />
            <span>{syncing ? (lang === 'en' ? 'Syncing...' : 'جاري المزامنة...') : (lang === 'en' ? '⚡ Seed / Sync Supabase Exercises' : '⚡ مزامنة وتغذية قاعدة بيانات Supabase')}</span>
          </button>
        </div>

        {/* Interactive Body Map Render */}
        {viewMode === 'map' && (
          <InteractiveBodyMap
            lang={lang}
            selectedMuscle={selectedMuscle}
            onSelectMuscle={(m) => setSelectedMuscle(m)}
          />
        )}

        {/* Real-Time Bilingual Autocomplete Search Bar */}
        <div style={{ width: '100%' }}>
          <ExerciseSearchAutocomplete
            exercises={exercises}
            lang={lang}
            placeholder={lang === 'en' ? 'Type 2+ letters to search (e.g. Squat, skwat, بنش, ديدليفت)...' : 'اكتب حرفين للبحث المباشر (مثال: سكوات، skwat، بنش برس، ديد)...'}
            onSelect={(selectedEx) => {
              setSelectedExercise(selectedEx);
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
                <ExerciseImage
                  src={ex.image_url}
                  alt={ex.name_en}
                  muscle={ex.muscle_en || ex.muscle_ar}
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
                  {lang === 'ar' && ex.name_en && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>
                      {ex.name_en}
                    </div>
                  )}
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
        <MuscleWikiModal
          exercise={selectedExercise}
          lang={lang}
          onClose={() => setSelectedExercise(null)}
          onAddToPlan={activePlan ? () => {
            const dayId = activePlan.dayWorkouts?.find((d: any) => !d.isRestDay)?.id;
            if (dayId) {
              setTargetDayId(dayId);
              handleAddToPlan();
            } else {
              alert(lang === 'en' ? 'Please select a valid workout day.' : 'يرجى اختيار يوم تدريب نشط.');
            }
          } : undefined}
        />
      )}
    </div>
  );
};
