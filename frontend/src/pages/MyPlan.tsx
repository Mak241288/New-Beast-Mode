import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Edit2, Trash2, ArrowLeftRight, Plus, Upload, History, Sparkles, AlertCircle, Info, RefreshCw, ChevronDown, ChevronUp, Printer, Download, Dumbbell, Copy, Timer, Crown, Layers, Percent } from 'lucide-react';
import { translations } from '../utils/translations';
import { MuscleWikiModal } from '../components/MuscleWikiModal';
import { ExerciseImage } from '../components/ExerciseImage';
import { PresetPlansModal } from '../components/PresetPlansModal';
import { MultiPlanManagerModal } from '../components/MultiPlanManagerModal';
import { BarbellPlate1RMModal } from '../components/BarbellPlate1RMModal';
import type { PresetPlan } from '../utils/presetWorkoutPlans';
import { cacheStore } from '../utils/cacheStore';
import { exportWorkoutPlanToCSV, triggerPrint } from '../utils/exportUtils';
import { useWorkoutSession } from '../context/WorkoutSessionContext';

interface MyPlanProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
  onboardingCompleted?: boolean;
}

export const MyPlan: React.FC<MyPlanProps> = ({ lang, onNavigate, onboardingCompleted: _onboardingCompleted }) => {
  const t = translations[lang] || translations.ar;
  const { startSession } = useWorkoutSession();
  const [activePlan, setActivePlan] = useState<any>(() => cacheStore.get('active_plan'));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState(() => !cacheStore.get('active_plan'));

  // Modals / Views state
  const [editingExercise, setEditingExercise] = useState<any | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showManualBuilder, setShowManualBuilder] = useState(false);
  const [showPresetPlansModal, setShowPresetPlansModal] = useState(false);
  const [showMultiPlanModal, setShowMultiPlanModal] = useState(false);
  const [showStrengthCalcModal, setShowStrengthCalcModal] = useState(false);
  const [manualTitle, setManualTitle] = useState(lang === 'en' ? 'Custom Gym Routine' : 'جدولي التدريبي اليدوي');
  const [manualActiveDayIdx, setManualActiveDayIdx] = useState(1);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualRowSuggestions, setManualRowSuggestions] = useState<{ dayIdx: number; exIdx: number; list: any[] } | null>(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [manualDays, setManualDays] = useState([
    { dayIndex: 1, title: lang === 'en' ? 'Push (Chest & Triceps)' : 'دفع (صدر وترايسبس وأكتاف)', focusArea: lang === 'en' ? 'Chest, Triceps' : 'صدر، ترايسبس', isRestDay: false, exercises: [
      { name: lang === 'en' ? 'Barbell Bench Press' : 'بنش برس بالبار مستوي', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell' },
      { name: lang === 'en' ? 'Incline Dumbbell Press' : 'ضغط دمبلز مائل للأعلى', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells' },
      { name: lang === 'en' ? 'Dumbbell Lateral Raise' : 'رفرفة جانبية للأكتاف بالدمبلز', targetMuscle: 'Shoulders', sets: 3, reps: '12-15', weight: 'Dumbbells' },
      { name: lang === 'en' ? 'Cable Tricep Pushdown' : 'دفع كيبل ترايسبس لأسفل', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable' },
    ] },
    { dayIndex: 2, title: lang === 'en' ? 'Pull (Back & Biceps)' : 'سحب (ظهر وبايسبس)', focusArea: lang === 'en' ? 'Back, Biceps' : 'ظهر، بايسبس', isRestDay: false, exercises: [
      { name: lang === 'en' ? 'Lat Pulldown' : 'سحب عالي للظهر (لاتس)', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable' },
      { name: lang === 'en' ? 'Seated Cable Row' : 'سحب أرضي للظهر بالكيبل', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable' },
      { name: lang === 'en' ? 'Dumbbell Bicep Curl' : 'تبادل بايسبس بالدمبلز', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells' },
      { name: lang === 'en' ? 'Face Pulls' : 'سحب حبل للكتف الخلفي والترابيس', targetMuscle: 'Shoulders', sets: 3, reps: '15', weight: 'Cable' },
    ] },
    { dayIndex: 3, title: lang === 'en' ? 'Legs & Abs' : 'أرجل وبطن وكور', focusArea: lang === 'en' ? 'Legs, Abs' : 'أرجل، بطن', isRestDay: false, exercises: [
      { name: lang === 'en' ? 'Barbell Squat' : 'سكوات بالبار (قرفصاء)', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell' },
      { name: lang === 'en' ? 'Leg Press' : 'دفع أرجل بجهاز المكبس', targetMuscle: 'Quadriceps', sets: 3, reps: '10-12', weight: 'Machine' },
      { name: lang === 'en' ? 'Standing Calf Raise' : 'رفع السمانة واقفاً', targetMuscle: 'Calves', sets: 4, reps: '15', weight: 'Machine' },
      { name: lang === 'en' ? 'Hanging Leg Raise' : 'رفع الأرجل على العقله للبطن', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight' },
    ] },
    { dayIndex: 4, title: lang === 'en' ? 'Rest & Recovery' : 'يوم راحة واستشفاء', focusArea: lang === 'en' ? 'Recovery' : 'استشفاء', isRestDay: true, exercises: [] },
    { dayIndex: 5, title: lang === 'en' ? 'Upper Body Power' : 'جزء علوي شامل', focusArea: lang === 'en' ? 'Upper Body' : 'جزء علوي', isRestDay: false, exercises: [
      { name: lang === 'en' ? 'Overhead Shoulder Press' : 'ضغط أكتاف بالدمبلز جالس', targetMuscle: 'Shoulders', sets: 4, reps: '8-10', weight: 'Dumbbells' },
      { name: lang === 'en' ? 'Dumbbell Chest Fly' : 'تفتيح صدر بالدمبلز مستوي', targetMuscle: 'Chest', sets: 3, reps: '12-15', weight: 'Dumbbells' },
      { name: lang === 'en' ? 'Barbell Bicep Curl' : 'بايسبس بالبار مستقيم', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Barbell' },
      { name: lang === 'en' ? 'EZ-Bar Skullcrusher' : 'ترايسبس بالبار المتعرج استلقاء', targetMuscle: 'Triceps', sets: 3, reps: '10-12', weight: 'Barbell' },
    ] },
    { dayIndex: 6, title: lang === 'en' ? 'Lower Body & Core' : 'جزء سفلي وبطن', focusArea: lang === 'en' ? 'Lower Body' : 'جزء سفلي', isRestDay: false, exercises: [
      { name: lang === 'en' ? 'Romanian Deadlift' : 'ديدليفت روماني بالبار (أرجل خلفية)', targetMuscle: 'Hamstrings', sets: 4, reps: '8-10', weight: 'Barbell' },
      { name: lang === 'en' ? 'Leg Extension' : 'فرد أرجل أمامي بالجهاز', targetMuscle: 'Quadriceps', sets: 3, reps: '12-15', weight: 'Machine' },
      { name: lang === 'en' ? 'Plank' : 'تمرين البلانك للبطن والكور', targetMuscle: 'Abs', sets: 3, reps: '60s', weight: 'Bodyweight' },
    ] },
    { dayIndex: 7, title: lang === 'en' ? 'Rest Day' : 'يوم راحة', focusArea: lang === 'en' ? 'Recovery' : 'استشفاء', isRestDay: true, exercises: [] },
  ]);
  
  // Alternatives State
  const [swapExerciseId, setSwapExerciseId] = useState<number | null>(null);
  const [alternativesList, setAlternativesList] = useState<any[]>([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);

  // Forms State
  const [importListText, setImportListText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Custom states for smart match and tabbed preview
  const [libraryExercises, setLibraryExercises] = useState<any[]>([]);
  const [previewDayIndex, setPreviewDayIndex] = useState<number>(1);
  const [fillRestDays, setFillRestDays] = useState(false);
  const [rawParsedPlan, setRawParsedPlan] = useState<any | null>(null);

  // Autocomplete Suggestions States
  const [customSuggestions, setCustomSuggestions] = useState<any[]>([]);
  const [editSuggestions, setEditSuggestions] = useState<any[]>([]);
  const [previewSuggestions, setPreviewSuggestions] = useState<{ dayIdx: number; exIdx: number; list: any[] } | null>(null);

  const [swapSearchQuery, setSwapSearchQuery] = useState('');
  const [swapMode, setSwapMode] = useState<'ai' | 'manual'>('ai');
  const [aiSwapReason, setAiSwapReason] = useState('');
  const [aiSwapLoading, setAiSwapLoading] = useState(false);

  const [viewingExercise, setViewingExercise] = useState<any | null>(null);
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

  // Smart Warmup & Cooldown Routines mapped to Focus Area
  const getSmartWarmupRoutine = (focus: string = '', title: string = '') => {
    const text = `${focus} ${title}`.toLowerCase();
    const isLower = text.includes('leg') || text.includes('أرجل') || text.includes('قرفصاء') || text.includes('فخذ') || text.includes('squat');
    const isCore = text.includes('ab') || text.includes('بطن') || text.includes('core') || text.includes('كور');

    if (isLower) {
      return [
        {
          name: lang === 'en' ? 'Standing Hip Circles (Warmup)' : 'دوائر الورك لليونة الحوض (إحماء)',
          targetMuscle: 'Glutes',
          category: 'WARMUP',
          sets: 1,
          reps: '45s',
          weight: 'Bodyweight',
          exerciseTips: lang === 'en' ? 'Rotate hips in slow wide circles to lubricate joints.' : 'تدوير الحوض في دوائر واسعة وبطيئة لتليين المفاصل وتفادي الإصابات.',
          imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Ankle_Circles/0.jpg',
          videoUrl: 'https://www.youtube.com/results?search_query=Hip+circles+mobility+warmup'
        },
        {
          name: lang === 'en' ? 'Bodyweight Air Squats (Warmup)' : 'سكوات بوزن الجسم لتنشيط الأرجل (إحماء)',
          targetMuscle: 'Quadriceps',
          category: 'WARMUP',
          sets: 1,
          reps: '15',
          weight: 'Bodyweight',
          exerciseTips: lang === 'en' ? 'Perform smooth squats to prime quads and knees.' : 'أداء نزول وصعود انسيابي لضخ الدم في عضلات الفخذ والمفاصل.',
          imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500',
          videoUrl: 'https://www.youtube.com/results?search_query=bodyweight+air+squat+warmup'
        }
      ];
    }

    if (isCore) {
      return [
        {
          name: lang === 'en' ? 'Cat-Cow Mobility Stretch (Warmup)' : 'إطالة القطة والبقرة لمرونة الظهر (إحماء)',
          targetMuscle: 'Back',
          category: 'WARMUP',
          sets: 1,
          reps: '60s',
          weight: 'Bodyweight',
          exerciseTips: lang === 'en' ? 'Alternate arching and rounding your spine.' : 'تقويس وتمديد فقرات الظهر بالتناوب لزيادة المرونة وتنشيط الكور.',
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
          videoUrl: 'https://www.youtube.com/results?search_query=cat+cow+stretch+warmup'
        },
        {
          name: lang === 'en' ? 'Jumping Jacks (Cardio Activation)' : 'القفز وفتح الرجلين لرفع النبض (إحماء)',
          targetMuscle: 'Full Body',
          category: 'WARMUP',
          sets: 1,
          reps: '60s',
          weight: 'Bodyweight',
          exerciseTips: lang === 'en' ? 'Elevate heart rate and body temperature.' : 'رفع نبضات القلب وتهيئة كامل عضلات الجسم للحرق.',
          imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Jumping_Jacks/0.jpg',
          videoUrl: 'https://www.youtube.com/results?search_query=jumping+jacks+warmup'
        }
      ];
    }

    // Default: Upper Body / Push / Pull
    return [
      {
        name: lang === 'en' ? 'Arm Circles & Rotator Cuff (Warmup)' : 'دوائر الذراعين وتنشيط الكتف (إحماء)',
        targetMuscle: 'Shoulders',
        category: 'WARMUP',
        sets: 1,
        reps: '45s',
        weight: 'Bodyweight',
        exerciseTips: lang === 'en' ? 'Make small then large circles to warm up shoulder capsules.' : 'عمل دوائر للأمام والخلف لتسخين مفصل الكتف والأوتار الحساسة.',
        imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Arm_Circles/0.jpg',
        videoUrl: 'https://www.youtube.com/results?search_query=Arm+circles+rotator+cuff+warmup'
      },
      {
        name: lang === 'en' ? 'Jumping Jacks (Full Body Activation)' : 'القفز وفتح الرجلين (إحماء عام لرفع الحرارة)',
        targetMuscle: 'Full Body',
        category: 'WARMUP',
        sets: 1,
        reps: '60s',
        weight: 'Bodyweight',
        exerciseTips: lang === 'en' ? 'Raise heart rate and prepare nervous system.' : 'تنشيط الدورة الدموية والجهاز العصبي قبل بدء الأوزان.',
        imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Jumping_Jacks/0.jpg',
        videoUrl: 'https://www.youtube.com/results?search_query=Jumping+Jacks+warmup'
      }
    ];
  };

  const getSmartCooldownRoutine = (focus: string = '', title: string = '') => {
    const text = `${focus} ${title}`.toLowerCase();
    const isLower = text.includes('leg') || text.includes('أرجل') || text.includes('قرفصاء') || text.includes('فخذ') || text.includes('squat');

    if (isLower) {
      return [
        {
          name: lang === 'en' ? 'Lying Glute & Hamstring Stretch' : 'إطالة الأرداف والفخذ الخلفي مستلقياً (استشفاء)',
          targetMuscle: 'Glutes',
          category: 'COOLDOWN',
          sets: 1,
          reps: '45s/leg',
          weight: 'Bodyweight',
          exerciseTips: lang === 'en' ? 'Relieve tension in glutes and sciatic nerve.' : 'تفكيك الشد في عضلات المؤخرة والعصب الوركي بعد مجهود الأرجل.',
          imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
          videoUrl: 'https://www.youtube.com/results?search_query=lying+glute+stretch+recovery'
        },
        {
          name: lang === 'en' ? 'Wall Calf Stretch & Ankle Relief' : 'إطالة السمانة على الحائط (استشفاء)',
          targetMuscle: 'Calves',
          category: 'COOLDOWN',
          sets: 1,
          reps: '40s/leg',
          weight: 'Bodyweight',
          exerciseTips: lang === 'en' ? 'Static stretch for gastrocnemius & Achilles tendon.' : 'استطالة ثابتة لعضلة السمانة وأوتار القدم لتهدئة الشد العضلي.',
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
          videoUrl: 'https://www.youtube.com/results?search_query=wall+calf+stretch'
        }
      ];
    }

    // Default: Upper Body / Back / Chest
    return [
      {
        name: lang === 'en' ? 'Behind Head Chest & Shoulder Stretch' : 'إطالة الصدر والكتف خلف الرأس (استشفاء)',
        targetMuscle: 'Chest',
        category: 'COOLDOWN',
        sets: 1,
        reps: '45s',
        weight: 'Bodyweight',
        exerciseTips: lang === 'en' ? 'Clasp hands behind head and gently open chest.' : 'شبك اليدين خلف الرأس وفتح الصدر بلطف للاسترخاء.',
        imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Chest_Stretch/0.jpg',
        videoUrl: 'https://www.youtube.com/results?search_query=behind+head+chest+stretch'
      },
      {
        name: lang === 'en' ? 'Seated Overhead Lat & Spine Stretch' : 'الإطالة العلوية للظهر والعمود الفقري (استشفاء)',
        targetMuscle: 'Back',
        category: 'COOLDOWN',
        sets: 1,
        reps: '45s',
        weight: 'Bodyweight',
        exerciseTips: lang === 'en' ? 'Lengthen spine and decompress upper back.' : 'تمديد فقرات الظهر وتفكيك الضغط بعد أوزان السحب والدفع.',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
        videoUrl: 'https://www.youtube.com/results?search_query=seated+lat+stretch+recovery'
      }
    ];
  };

  const handleAddWarmupToDay = async (dw: any) => {
    const routine = getSmartWarmupRoutine(dw.focusArea, dw.title);
    try {
      for (const ex of routine) {
        await api.addCustomExercise(dw.id, ex);
      }
      alert(lang === 'en' ? `🔥 Added warm-up routine to Day ${dw.dayIndex}!` : `🔥 تمت إضافة تمارين الإحماء لليوم ${dw.dayIndex} بنجاح!`);
      fetchActivePlan();
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to add warmup routine.' : 'فشل إضافة تمارين الإحماء.');
    }
  };

  const handleAddCooldownToDay = async (dw: any) => {
    const routine = getSmartCooldownRoutine(dw.focusArea, dw.title);
    try {
      for (const ex of routine) {
        await api.addCustomExercise(dw.id, ex);
      }
      alert(lang === 'en' ? `🧊 Added recovery / cooldown routine to Day ${dw.dayIndex}!` : `🧊 تمت إضافة تمارين الاستشفاء والإطالة لليوم ${dw.dayIndex} بنجاح!`);
      fetchActivePlan();
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to add cooldown routine.' : 'فشل إضافة تمارين الاستشفاء.');
    }
  };

  const [customExForm, setCustomExForm] = useState({
    name: '',
    targetMuscle: '',
    category: 'IRON',
    sets: '3',
    reps: '10-12',
    weight: 'Bodyweight',
    exerciseTips: '',
    imageUrl: '',
    videoUrl: '',
  });

  const fetchActivePlan = async () => {
    if (!cacheStore.get('active_plan')) {
      setLoading(true);
    }
    try {
      const plan = await api.getActivePlan();
      setActivePlan(plan);
      cacheStore.set('active_plan', plan);
    } catch (err: any) {
      console.error('Failed to load active plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraryOnce = async () => {
    try {
      const list = await api.getLibraryTree();
      if (list && list.length > 0) {
        setLibraryExercises(list);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    }
  };

  useEffect(() => {
    fetchActivePlan();
    fetchHistory();
    if (localStorage.getItem('open_manual_builder') === 'true') {
      localStorage.removeItem('open_manual_builder');
      setShowManualBuilder(true);
    }
  }, []);

  const handleNameChange = (val: string, type: 'custom' | 'edit' | 'preview', dayIdx?: number, exIdx?: number) => {
    if (type === 'custom') {
      setCustomExForm({ ...customExForm, name: val });
      if (val.trim().length > 1) {
        const matches = libraryExercises.filter(ex => 
          (ex.name_ar && ex.name_ar.toLowerCase().includes(val.toLowerCase())) ||
          (ex.name_en && ex.name_en.toLowerCase().includes(val.toLowerCase()))
        ).slice(0, 5);
        setCustomSuggestions(matches);
      } else {
        setCustomSuggestions([]);
      }
    } else if (type === 'edit') {
      setEditingExercise({ ...editingExercise, name: val });
      if (val.trim().length > 1) {
        const matches = libraryExercises.filter(ex => 
          (ex.name_ar && ex.name_ar.toLowerCase().includes(val.toLowerCase())) ||
          (ex.name_en && ex.name_en.toLowerCase().includes(val.toLowerCase()))
        ).slice(0, 5);
        setEditSuggestions(matches);
      } else {
        setEditSuggestions([]);
      }
    } else if (type === 'preview' && dayIdx !== undefined && exIdx !== undefined) {
      handleUpdatePreviewEx(dayIdx, exIdx, 'name', val);
      if (val.trim().length > 1) {
        const matches = libraryExercises.filter(ex => 
          (ex.name_ar && ex.name_ar.toLowerCase().includes(val.toLowerCase())) ||
          (ex.name_en && ex.name_en.toLowerCase().includes(val.toLowerCase()))
        ).slice(0, 5);
        setPreviewSuggestions({ dayIdx, exIdx, list: matches });
      } else {
        setPreviewSuggestions(null);
      }
    }
  };

  const handleSelectSuggestion = (suggestion: any, type: 'custom' | 'edit' | 'preview', dayIdx?: number, exIdx?: number) => {
    const name = lang === 'en' ? (suggestion.name_en || suggestion.name_ar) : (suggestion.name_ar || suggestion.name_en);
    const targetMuscle = lang === 'en' ? (suggestion.muscle_en || suggestion.muscle_ar) : (suggestion.muscle_ar || suggestion.muscle_en);
    const tips = lang === 'en' ? (suggestion.instructions_en || suggestion.instructions_ar || '') : (suggestion.instructions_ar || suggestion.instructions_en || '');
    
    if (type === 'custom') {
      setCustomExForm({
        ...customExForm,
        name,
        targetMuscle,
        category: suggestion.category || 'IRON',
        exerciseTips: tips,
        imageUrl: suggestion.image_url || '',
        videoUrl: suggestion.video_url || '',
      });
      setCustomSuggestions([]);
    } else if (type === 'edit') {
      setEditingExercise({
        ...editingExercise,
        name,
        targetMuscle,
        category: suggestion.category || 'IRON',
        exerciseTips: tips,
        imageUrl: suggestion.image_url || '',
        videoUrl: suggestion.video_url || '',
      });
      setEditSuggestions([]);
    } else if (type === 'preview' && dayIdx !== undefined && exIdx !== undefined) {
      if (!importPreview) return;
      const updatedDays = [...importPreview.days];
      updatedDays[dayIdx].exercises[exIdx] = {
        ...updatedDays[dayIdx].exercises[exIdx],
        name,
        targetMuscle,
        exerciseTips: tips,
        imageUrl: suggestion.image_url || '',
        videoUrl: suggestion.video_url || '',
      };
      setImportPreview({ ...importPreview, days: updatedDays });
    }
  };

  const getDayName = (index: number) => {
    const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    return lang === 'en' ? daysEn[index - 1] : daysAr[index - 1];
  };

  const getRestTime = (ex: any) => {
    const cat = (ex.category || '').toUpperCase();
    if (cat === 'HIIT' || cat === 'CARDIO') return lang === 'en' ? '30s' : '30 ثانية';
    if (cat === 'YOGA' || cat === 'PILATES') return lang === 'en' ? 'None' : 'بدون';
    return lang === 'en' ? '90s' : '90 ثانية';
  };

  const getEstimatedDuration = (dw: any) => {
    if (dw.isRestDay) return lang === 'en' ? '0 mins' : '0 دقيقة';
    const count = dw.exercises ? dw.exercises.length : 0;
    const mins = count * 8 + 10;
    return lang === 'en' ? `${mins} mins` : `${mins} دقيقة`;
  };

  const toggleDayExpanded = (dayIndex: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const handleRegeneratePlan = async () => {
    setRegeneratingPlan(true);
    try {
      const profile = await api.getProfile();
      const isComplete = profile && profile.fitnessGoal && profile.fitnessLevel && profile.daysPerWeek;
      if (!isComplete) {
        alert(lang === 'en' ? 'Please complete your profile first.' : 'يرجى إكمال ملفك الشخصي أولاً.');
        onNavigate('profile');
        return;
      }

      await api.generatePlan({
        durationWeeks: 4,
        startDate: new Date(),
        workoutLocation: profile.workoutLocation || 'GYM',
        equipment: profile.equipment ? profile.equipment.split(',') : [],
        level: profile.fitnessLevel,
        goal: profile.fitnessGoal,
        daysPerWeek: parseInt(profile.daysPerWeek) || 4,
        lang,
      });

      alert(lang === 'en' ? 'Plan regenerated successfully!' : 'تم إعادة توليد خطتك الرياضية بنجاح!');
      fetchActivePlan();
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'Failed to regenerate plan.' : 'فشل إعادة توليد الخطة الرياضية.'));
    } finally {
      setRegeneratingPlan(false);
    }
  };

  const handleStartWorkoutSession = (dw: any) => {
    if (!dw.exercises || dw.exercises.length === 0) {
      alert(lang === 'en' ? 'This day has no exercises to perform.' : 'لا توجد تمارين مضافة في هذا اليوم.');
      return;
    }
    startSession(dw);
  };

  useEffect(() => {
    fetchActivePlan();
    fetchLibraryOnce();
  }, []);



  const applyRestDaysFilling = (basePlan: any, shouldFill: boolean) => {
    if (!basePlan) return null;
    const planCopy = JSON.parse(JSON.stringify(basePlan));
    if (shouldFill) {
      const days = [...planCopy.days];
      for (let i = 1; i <= 7; i++) {
        if (!days.find((d: any) => d.dayIndex === i)) {
          days.push({
            dayIndex: i,
            title: lang === 'en' ? `Day ${i}: Rest Day` : `اليوم ${i}: يوم راحة`,
            focusArea: lang === 'en' ? 'Rest & Recovery' : 'راحة واستشفاء',
            isRestDay: true,
            exercises: []
          });
        }
      }
      days.sort((a: any, b: any) => a.dayIndex - b.dayIndex);
      planCopy.days = days;
    }
    return planCopy;
  };

  const handleToggleFillRestDays = (checked: boolean) => {
    setFillRestDays(checked);
    if (rawParsedPlan) {
      const processed = applyRestDaysFilling(rawParsedPlan, checked);
      setImportPreview(processed);
      if (processed && processed.days.length > 0) {
        const hasCurrentTab = processed.days.some((d: any) => d.dayIndex === previewDayIndex);
        if (!hasCurrentTab) {
          setPreviewDayIndex(processed.days[0].dayIndex);
        }
      }
    }
  };

  const handleSmartFillPreviewEx = async (dayIdx: number, exIdx: number) => {
    if (!importPreview) return;
    const exName = importPreview.days[dayIdx].exercises[exIdx].name;
    if (!exName.trim()) {
      alert(lang === 'en' ? 'Please enter an exercise name first.' : 'يرجى إدخال اسم التمرين أولاً.');
      return;
    }

    const match = await api.matchExerciseDatabase(exName);

    if (match) {
      const matchedName = lang === 'en' ? (match.name_en || match.name_ar) : (match.name_ar || match.name_en);
      const matchedMuscle = lang === 'en' ? (match.muscle_en || match.muscle_ar) : (match.muscle_ar || match.muscle_en);
      const matchedTips = lang === 'en' ? (match.instructions_en || match.instructions_ar || '') : (match.instructions_ar || match.instructions_en || '');
      
      const updatedDays = [...importPreview.days];
      updatedDays[dayIdx].exercises[exIdx] = {
        ...updatedDays[dayIdx].exercises[exIdx],
        name: matchedName,
        targetMuscle: matchedMuscle,
        exerciseTips: matchedTips,
        imageUrl: match.image_url || match.gif_url || '',
        videoUrl: match.video_url || '',
      };
      setImportPreview({ ...importPreview, days: updatedDays });
    } else {
      alert(lang === 'en' 
        ? 'No matching exercise found in our database.' 
        : 'لم يتم العثور على تمرين مطابق في قاعدة البيانات.');
    }
  };

  const handleSmartFillActiveEx = async (ex: any) => {
    const match = await api.matchExerciseDatabase(ex.name);

    if (match) {
      const matchedName = lang === 'en' ? (match.name_en || match.name_ar) : (match.name_ar || match.name_en);
      const matchedMuscle = lang === 'en' ? (match.muscle_en || match.muscle_ar) : (match.muscle_ar || match.muscle_en);
      const matchedTips = lang === 'en' ? (match.instructions_en || match.instructions_ar || '') : (match.instructions_ar || match.instructions_en || '');
      
      try {
        await api.updateExercise(ex.id, {
          ...ex,
          name: matchedName,
          targetMuscle: matchedMuscle,
          exerciseTips: matchedTips,
          imageUrl: match.image_url || match.gif_url || null,
          videoUrl: match.video_url || null
        });
        alert(lang === 'en' 
          ? `Matched: "${matchedName}"! Exercise details, image, and video updated.` 
          : `تمت المطابقة مع: "${matchedName}"! تم تحديث التفاصيل، الصورة، والفيديو بنجاح.`);
        fetchActivePlan();
      } catch (err) {
        alert(lang === 'en' ? 'Failed to update exercise details.' : 'فشل تحديث تفاصيل التمرين.');
      }
    } else {
      alert(lang === 'en' 
        ? 'No matching exercise found in our database.' 
        : 'لم يتم العثور على تمرين مطابق في قاعدة البيانات.');
    }
  };

  const getSelectedDay = () => {
    if (!activePlan) return null;
    return activePlan.dayWorkouts.find((dw: any) => dw.dayIndex === selectedDayIndex);
  };

  const handleFetchAlternatives = async (exerciseId: number) => {
    setSwapExerciseId(exerciseId);
    setSwapMode('ai');
    setAiSwapReason('');
    setSwapSearchQuery('');
    setAlternativesLoading(true);
    try {
      const list = await api.getAlternatives(exerciseId);
      setAlternativesList(list || []);
    } catch (err) {
      alert(lang === 'en' ? 'Failed to fetch alternative exercises.' : 'فشل جلب التمارين البديلة.');
    } finally {
      setAlternativesLoading(false);
    }
  };

  const getFilteredSwapOptions = () => {
    if (!swapSearchQuery.trim()) {
      return alternativesList;
    }
    const q = swapSearchQuery.toLowerCase().trim();
    return libraryExercises.filter((item: any) => 
      (item.name_en && item.name_en.toLowerCase().includes(q)) ||
      (item.name_ar && item.name_ar.toLowerCase().includes(q))
    ).slice(0, 20);
  };

  const handleSwapExercise = async (newEx: any) => {
    if (!swapExerciseId) return;
    try {
      await api.updateExercise(swapExerciseId, {
        name: newEx.name_ar || newEx.name_en,
        targetMuscle: newEx.muscle_ar || newEx.muscle_en,
        category: newEx.category || 'IRON',
        sets: 3,
        reps: '8-12',
        weight: 'Bodyweight',
        exerciseTips: newEx.instructions_ar || newEx.instructions_en || '',
        imageUrl: newEx.image_url || null,
        videoUrl: newEx.video_url || null
      });
      setSwapExerciseId(null);
      fetchActivePlan();
    } catch (err) {
      alert(lang === 'en' ? 'Failed to swap exercise.' : 'فشل استبدال التمرين.');
    }
  };

  const handleAISwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapExerciseId || !aiSwapReason.trim()) return;
    setAiSwapLoading(true);
    try {
      const res = await api.swapExerciseAI(swapExerciseId, aiSwapReason, lang);
      if (res.success) {
        alert(lang === 'en'
          ? `Successfully swapped with: "${res.exercise.name}"!\n\nAI Explanation: ${res.explanation}`
          : `تم الاستبدال بنجاح بـ: "${res.exercise.name}"!\n\nتفسير الذكاء الاصطناعي: ${res.explanation}`
        );
        setSwapExerciseId(null);
        setAiSwapReason('');
        fetchActivePlan();
      }
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'AI Swap failed.' : 'فشل التبديل الذكي بالذكاء الاصطناعي.'));
    } finally {
      setAiSwapLoading(false);
    }
  };

  const handleEditExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateExercise(editingExercise.id, editingExercise);
      setEditingExercise(null);
      fetchActivePlan();
    } catch (err) {
      alert(lang === 'en' ? 'Failed to update exercise.' : 'فشل تعديل تفاصيل التمرين.');
    }
  };

  const handleDeleteExercise = async (id: number) => {
    const confirmMsg = lang === 'en' ? 'Are you sure you want to delete this exercise?' : 'هل أنت متأكد من حذف هذا التمرين من جدولك؟';
    if (!confirm(confirmMsg)) return;
    try {
      await api.deleteExercise(id);
      fetchActivePlan();
    } catch (err) {
      alert(lang === 'en' ? 'Failed to delete exercise.' : 'فشل حذف التمرين.');
    }
  };

  const handleAddCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const day = getSelectedDay();
    if (!day) return;
    try {
      await api.addCustomExercise(day.id, customExForm);
      setAddingCustom(false);
      setCustomExForm({
        name: '',
        targetMuscle: '',
        category: 'IRON',
        sets: '3',
        reps: '10-12',
        weight: 'Bodyweight',
        exerciseTips: '',
        imageUrl: '',
        videoUrl: '',
      });
      fetchActivePlan();
    } catch (err) {
      alert(lang === 'en' ? 'Failed to add custom exercise.' : 'فشل إضافة التمرين المخصص.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileBase64 = event.target?.result as string;
        // Request structured plan preview (third arg is lang, fourth arg is preview=true)
        const previewPlan = await api.importFilePlan(fileBase64, file.name, lang, true);
        setRawParsedPlan(previewPlan);
        const processed = applyRestDaysFilling(previewPlan, fillRestDays);
        setImportPreview(processed);
        setPreviewDayIndex(previewPlan.days[0]?.dayIndex || 1);
      } catch (err: any) {
        alert(err.message || (lang === 'en' ? 'Failed to parse file.' : 'فشل تحليل وقراءة ملف الجدول المرفق.'));
      } finally {
        setFileLoading(false);
      }
    };
    reader.onerror = () => {
      alert(lang === 'en' ? 'Failed to read file' : 'فشل قراءة الملف من جهازك.');
      setFileLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleImportBulk = async () => {
    if (!importListText.trim()) return;
    setImportLoading(true);
    try {
      // Request structured plan preview (second arg is lang, third arg is preview=true)
      const previewPlan = await api.importBulkPlan(importListText, lang, true);
      setRawParsedPlan(previewPlan);
      const processed = applyRestDaysFilling(previewPlan, fillRestDays);
      setImportPreview(processed);
      setPreviewDayIndex(previewPlan.days[0]?.dayIndex || 1);
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'Failed to import bulk plan.' : 'فشل استيراد الجدول المجمع وتحليله.'));
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setImportLoading(true);
    try {
      const plan = await api.saveStructuredPlan(importPreview, lang);
      setActivePlan(plan);
      setShowImport(false);
      setImportPreview(null);
      setImportListText('');
      setSelectedDayIndex(1);
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'Failed to save imported plan.' : 'فشل حفظ وتفعيل الجدول المستورد.'));
    } finally {
      setImportLoading(false);
    }
  };

  const handleUpdatePreviewEx = (dayIdx: number, exIdx: number, field: string, value: any) => {
    if (!importPreview) return;
    const updatedDays = [...importPreview.days];
    updatedDays[dayIdx].exercises[exIdx] = {
      ...updatedDays[dayIdx].exercises[exIdx],
      [field]: value
    };
    setImportPreview({
      ...importPreview,
      days: updatedDays
    });
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getPlanHistory();
      setHistoryList(res || []);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to fetch history.' : 'فشل جلب سجل الخطط السابقة.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleActivatePlan = async (id: number) => {
    try {
      const plan = await api.activateHistoricalPlan(id);
      setActivePlan(plan);
      setShowHistory(false);
      setSelectedDayIndex(1);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to activate plan.' : 'فشل تفعيل هذا البرنامج الرياضي.');
    }
  };

  const handleSelectPresetPlan = async (plan: PresetPlan, openManualBuilder?: boolean) => {
    const structuredPlan = {
      title: lang === 'en' ? plan.title_en : plan.title_ar,
      days: plan.days.map((d) => ({
        dayIndex: d.dayIndex,
        title: d.title,
        focusArea: d.focusArea,
        isRestDay: d.isRestDay,
        exercises: d.exercises.map((ex) => ({
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          category: ex.category || 'IRON',
          sets: ex.sets || 3,
          reps: ex.reps || '10-12',
          weight: ex.weight || 'Bodyweight',
          exerciseTips: ex.exerciseTips || '',
          imageUrl: ex.imageUrl || null,
          videoUrl: ex.videoUrl || null,
        })),
      })),
    };

    if (openManualBuilder) {
      setManualTitle(structuredPlan.title);
      setManualDays(plan.days.map((d) => ({
        dayIndex: d.dayIndex,
        title: d.title,
        focusArea: d.focusArea,
        isRestDay: d.isRestDay,
        exercises: d.exercises.map((ex) => ({
          name: ex.name,
          targetMuscle: ex.targetMuscle,
          sets: ex.sets || 3,
          reps: ex.reps || '10-12',
          weight: ex.weight || 'Bodyweight',
        })),
      })));
      setShowPresetPlansModal(false);
      setShowManualBuilder(true);
      return;
    }

    setLoading(true);
    try {
      const saved = await api.saveStructuredPlan(structuredPlan, lang);
      setActivePlan(saved);
      cacheStore.set('active_plan', saved);
      setShowPresetPlansModal(false);
      setSelectedDayIndex(1);
      alert(
        lang === 'en'
          ? `🎉 Successfully activated: "${plan.title_en}"!`
          : `🎉 تم تفعيل جدول: "${plan.title_ar}" بنجاح كخطتك الحالية!`
      );
    } catch (err: any) {
      alert(err.message || (lang === 'en' ? 'Failed to apply preset plan.' : 'فشل تفعيل الخطة الجاهزة.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    const isEn = lang === 'en';
    const confirmMsg = isEn
      ? 'AI will review your achievements and generate a brand new progressive routine. Do you want to start?'
      : 'سيقوم الذكاء الاصطناعي بمراجعة إنجازاتك المسجلة وتوليد جدول متطور وجديد كلياً. هل تود البدء؟';
    if (!confirm(confirmMsg)) return;
    setLoading(true);
    try {
      const res = await api.upgradePlan(lang);
      const successMsg = isEn
        ? `Congratulations! Your adherence rate was ${res.completionRate.toFixed(1)}%. Upgraded plan generated successfully!`
        : `مبروك! نسبة التزامك بالجدول السابق بلغت ${res.completionRate.toFixed(1)}%. تم توليد نسختك المطورة بنجاح.`;
      alert(successMsg);
      fetchActivePlan();
    } catch (err: any) {
      const errMsg = isEn
        ? (err.message || 'Upgrade failed. Make sure you have logged some exercise progress first.')
        : (err.message || 'فشل الترقية. تأكد من تسجيل تقدمك في التمارين أولاً.');
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Cortisol & CNS Neurological Stress Engine
  const getCortisolAndCnsMetrics = (dw: any) => {
    if (dw.isRestDay) {
      return {
        score: 18,
        level: 'LOW',
        badgeText: lang === 'en' ? 'Cortisol: 18% (Anabolic Recovery 🟢)' : 'الكورتيزول: 18% (استشفاء بنائي 🟢)',
        shortLabel: lang === 'en' ? 'Cortisol: 18% 🟢' : 'الكورتيزول: 18% 🟢',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        title: lang === 'en' ? 'Rest & Hormonal Rebound' : 'يوم راحة واستشفاء هرموني كامل',
        cnsLoad: lang === 'en' ? 'Low CNS Load (10%)' : 'إجهاد عصبي منخفض (10%)',
        recoveryTime: lang === 'en' ? 'Active Rebound' : 'استشفاء فوري',
        recommendation: lang === 'en'
          ? 'Deep sleep (8h), hydration, and balanced whole foods to suppress stress hormones and maximize growth hormone secretion.'
          : 'نوم عميق (8 ساعات)، ترطيب مستمر، وأغذية متوازنة لخفض هرمونات التوتر وتعزيز إفراز هرمون النمو البنائي.',
        supplements: lang === 'en' ? 'Magnesium Glycinate + Deep Hydration' : 'مغنيسيوم جلايسينات + ترطيب عميق',
      };
    }

    const focus = (dw.focusArea || dw.title || '').toLowerCase();
    const exNames = (dw.exercises || []).map((e: any) => (e.name || '').toLowerCase()).join(' ');
    const isHeavyLegsOrDeadlift = focus.includes('leg') || focus.includes('أرجل') || focus.includes('قرفصاء') || focus.includes('squat') || focus.includes('deadlift') || exNames.includes('squat') || exNames.includes('deadlift') || exNames.includes('leg press');
    const isHeavyUpper = focus.includes('chest') || focus.includes('صدر') || focus.includes('back') || focus.includes('ظهر') || focus.includes('push') || focus.includes('pull') || focus.includes('سحب') || focus.includes('دفع');

    if (isHeavyLegsOrDeadlift) {
      return {
        score: 88,
        level: 'HIGH',
        badgeText: lang === 'en' ? 'Cortisol: 88% (High CNS Tax 🔴)' : 'الكورتيزول: 88% (إجهاد عصبي مرتفع 🔴)',
        shortLabel: lang === 'en' ? 'Cortisol: 88% 🔴' : 'الكورتيزول: 88% 🔴',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.35)',
        title: lang === 'en' ? 'Heavy Compound / High CNS Stress' : 'تمرين مركب شاق وإجهاد عصبي مرتفع',
        cnsLoad: lang === 'en' ? 'High CNS Stress (88%)' : 'إجهاد عصبي وجهازي عالي (88%)',
        recoveryTime: lang === 'en' ? '48 - 72 Hours' : '48 - 72 ساعة استشفاء',
        recommendation: lang === 'en'
          ? 'Heavy spinal loading triggers high systemic cortisol. Drink intra-workout fast carbs (30-40g) to blunt cortisol spikes and take Magnesium before bed.'
          : 'الأوزان المركبة ترفع الكورتيزول والإجهاد العصبي. اشرب كارب سريع (30-40 جم Intra-workout) لكبح الكورتيزول فورياً، وتناول المغنيسيوم ليلاً.',
        supplements: lang === 'en' ? 'Intra-workout Carbs + Ashwagandha + Magnesium' : 'كارب سريع أثناء التمرين + أشواغاندا + مغنيسيوم',
      };
    } else if (isHeavyUpper) {
      return {
        score: 64,
        level: 'MODERATE',
        badgeText: lang === 'en' ? 'Cortisol: 64% (Optimal Hypertrophy 🟡)' : 'الكورتيزول: 64% (تضخيم متوازن 🟡)',
        shortLabel: lang === 'en' ? 'Cortisol: 64% 🟡' : 'الكورتيزول: 64% 🟡',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        title: lang === 'en' ? 'Optimal Hypertrophy Load' : 'تحفيز تضخيم عضلي متوازن',
        cnsLoad: lang === 'en' ? 'Moderate CNS Stress (64%)' : 'إجهاد عصبي معتدل (64%)',
        recoveryTime: lang === 'en' ? '36 - 48 Hours' : '36 - 48 ساعة استشفاء',
        recommendation: lang === 'en'
          ? 'Stimulates muscle protein synthesis with controlled hormonal stress. Consume protein + complex carbs within 60 mins post-workout.'
          : 'تحفيز بنائي مثالي مع تحكم هرموني مستقر. تناول وجبة بروتين وكارب معقد خلال 60 دقيقة بعد التمرين لدعم التخليق العضلي.',
        supplements: lang === 'en' ? 'Whey Protein + Creatine + Vitamin C' : 'بروتين مصل اللبن + كرياتين + فيتامين C',
      };
    } else {
      return {
        score: 38,
        level: 'LOW',
        badgeText: lang === 'en' ? 'Cortisol: 38% (Low CNS Stress 🟢)' : 'الكورتيزول: 38% (إجهاد عصبي خفيف 🟢)',
        shortLabel: lang === 'en' ? 'Cortisol: 38% 🟢' : 'الكورتيزول: 38% 🟢',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        title: lang === 'en' ? 'Isolation / Active Hypertrophy' : 'تمارين عزل واستشفاء سريع',
        cnsLoad: lang === 'en' ? 'Low CNS Stress (38%)' : 'إجهاد عصبي خفيف (38%)',
        recoveryTime: lang === 'en' ? '24 Hours' : '24 ساعة استشفاء',
        recommendation: lang === 'en'
          ? 'Minimal central fatigue with localized muscle pump. Rapid recovery window.'
          : 'إجهاد جهازي طفيف مع ضخ دم موضعي ممتاز. الاستشفاء العصبي سريع وسهل.',
        supplements: lang === 'en' ? 'Hydration + Electrolytes + EAAs' : 'ترطيب + أملاح إلكترولايت + أحماض أمينية',
      };
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {regeneratingPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>🔄</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
            {lang === 'en' ? 'Building your personalized plan...' : 'جاري بناء جدولك الرياضي المخصص...'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {lang === 'en' ? 'Tailoring exercises based on your profile.' : 'نقوم بتوزيع التمارين والأدوات لتناسب ملفك الشخصي.'}
          </p>
        </div>
      )}

      {/* Title & Action Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>
            {lang === 'en' ? 'My Weekly Workout Plan 🗓️' : 'خطة تمارين الأسبوع 🗓️'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            {activePlan ? activePlan.title : (lang === 'en' ? 'No active workout routine' : 'لا يوجد برنامج رياضي نشط')}
          </p>
        </div>

        {/* Quick Tools */}
        <div className="responsive-toolbar">
          <button 
            onClick={() => {
              fetchHistory();
              setShowMultiPlanModal(true);
            }} 
            className="secondary-btn" 
            style={{ 
              padding: '8px 15px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              borderColor: 'rgba(6, 182, 212, 0.4)',
              background: 'rgba(6, 182, 212, 0.08)'
            }}
          >
            <Layers size={16} color="var(--secondary)" />
            <span>{lang === 'en' ? `Multi-Plan Hub (${historyList.length || 1}) 📑` : `إدارة جداولي المتعددة (${historyList.length || 1}) 📑`}</span>
          </button>
          <button 
            onClick={() => setShowPresetPlansModal(true)} 
            className="glow-btn" 
            style={{ 
              padding: '8px 16px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              border: 'none',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Crown size={16} />
            <span>{lang === 'en' ? 'Curated Pro Plans 👑' : 'الخطط الجاهزة والأساطير 👑'}</span>
          </button>
          <button 
            onClick={() => setShowStrengthCalcModal(true)} 
            className="secondary-btn" 
            style={{ 
              padding: '8px 14px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              borderColor: '#f59e0b',
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.08)',
            }}
          >
            <Percent size={15} />
            <span>{lang === 'en' ? 'Plate & 1RM Calculator 🔢' : 'حاسبة أوزان البار والـ 1RM 🔢'}</span>
          </button>
          <button onClick={() => setShowManualBuilder(true)} className="glow-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>{lang === 'en' ? 'Create Custom Plan ✍️' : 'تصميم جدول يدوي ✍️'}</span>
          </button>
          <button onClick={handleRegeneratePlan} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} />
            {lang === 'en' ? 'Regenerate Plan' : 'إعادة توليد الجدول ⚡'}
          </button>
          <button onClick={handleUpgradePlan} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} />
            {lang === 'en' ? 'AI Upgrade' : 'ترقية بالذكاء الاصطناعي'}
          </button>
          <button onClick={() => setShowImport(true)} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} />
            {t.importBtn}
          </button>
          <button onClick={() => { setShowHistory(true); fetchHistory(); }} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={16} />
            {t.historyBtn}
          </button>
          {activePlan && (
            <>
              <button 
                onClick={() => exportWorkoutPlanToCSV(activePlan, lang)} 
                className="secondary-btn" 
                title={lang === 'en' ? 'Export CSV' : 'تصدير إكسل'}
                style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} />
                <span>{lang === 'en' ? 'Export CSV' : 'تصدير CSV'}</span>
              </button>
              <button 
                onClick={triggerPrint} 
                className="secondary-btn" 
                title={lang === 'en' ? 'Print Workout Plan' : 'طباعة الجدول الورقي'}
                style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} />
                <span>{lang === 'en' ? 'Print Sheet' : 'طباعة الجدول 🖨️'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          {lang === 'en' ? 'Loading workout schedule...' : 'جاري تحميل جدول التمارين...'}
        </div>
      )}

      {!loading && !activePlan && (
        <div className="glass-panel text-center" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ opacity: 0.8 }} />
          <h3>{lang === 'en' ? 'No Active Plan Found' : 'لا يوجد جدول رياضي نشط'}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {lang === 'en' 
              ? 'You have not configured a workout routine yet. You can design one manually or let AI generate it!' 
              : 'لم تقم بتهيئة جدول تمارينك الرياضية بعد. يمكنك تصميمه يدوياً بالكامل أو توليده بالذكاء الاصطناعي!'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setShowManualBuilder(true)} className="glow-btn">
              {lang === 'en' ? 'Design Plan Manually ✍️' : 'تصميم جدول يدوي ✍️'}
            </button>
            <button onClick={() => onNavigate('dashboard')} className="secondary-btn">
              {lang === 'en' ? 'Generate with AI ⚡' : 'توليد بالذكاء الاصطناعي ⚡'}
            </button>
          </div>
        </div>
      )}

      {!loading && activePlan && (
        <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Accordion List of Days */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activePlan.dayWorkouts.map((dw: any) => {
              const isExpanded = expandedDays[dw.dayIndex] ?? false;
              const dayLabel = `${getDayName(dw.dayIndex)} – ${dw.title.split(' - ')[1] || dw.title.split(': ')[1] || dw.title}`;
              const duration = getEstimatedDuration(dw);
              const cort = getCortisolAndCnsMetrics(dw);

              return (
                <div key={dw.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleDayExpanded(dw.dayIndex)}
                    style={{
                      padding: '18px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <span>🗓️</span>
                        <span>{dayLabel}</span>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          🎯 {dw.focusArea} | ⏱️ {duration}
                        </span>
                        <span
                          style={{
                            background: cort.bg,
                            color: cort.color,
                            border: `1px solid ${cort.border}`,
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          🩸 {cort.shortLabel}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {!dw.isRestDay && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartWorkoutSession(dw);
                            }}
                            className="glow-btn"
                            style={{
                              padding: '6px 12px',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 'bold',
                              border: '1px solid var(--primary)',
                              background: 'var(--primary-glow)',
                              color: '#fff',
                              borderRadius: '8px',
                            }}
                          >
                            ⚡ {lang === 'en' ? 'Start Workout' : 'ابدأ التمرين ⚡'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayIndex(dw.dayIndex);
                              setAddingCustom(true);
                            }}
                            className="secondary-btn"
                            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Plus size={12} />
                            {t.addCustomEx}
                          </button>
                        </>
                      )}
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div style={{ padding: '24px' }}>
                      {/* Cortisol & CNS Stress Panel */}
                      <div
                        className="glass-panel"
                        style={{
                          padding: '14px 18px',
                          borderRadius: '14px',
                          border: `1px solid ${cort.border}`,
                          background: `linear-gradient(135deg, ${cort.bg}, rgba(255,255,255,0.01))`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          marginBottom: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>🩸</span>
                            <div>
                              <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: 0, color: cort.color }}>
                                {lang === 'en' ? 'Cortisol & CNS Stress Forecast' : 'مؤشر الكورتيزول والإجهاد العصبي المتوقع'}
                              </h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cort.title}</span>
                            </div>
                          </div>
                          <span style={{ background: cort.bg, color: cort.color, border: `1px solid ${cort.border}`, borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: '900' }}>
                            {cort.score}% {cort.level === 'HIGH' ? '🔴 High Tax' : cort.level === 'MODERATE' ? '🟡 Balanced' : '🟢 Low Tax'}
                          </span>
                        </div>

                        {/* Progress / Gauge Bar */}
                        <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                          <div
                            style={{
                              width: `${cort.score}%`,
                              height: '100%',
                              borderRadius: '10px',
                              background: cort.level === 'HIGH'
                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                : cort.level === 'MODERATE'
                                ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                                : '#10b981',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>

                        {/* 3 Scientific Badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🧠</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'CNS Load:' : 'إجهاد الجهاز العصبي:'}</span>
                            <strong style={{ color: cort.color }}>{cort.cnsLoad}</strong>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>⏳</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Recovery Time:' : 'وقت الاستشفاء:'}</span>
                            <strong style={{ color: '#fff' }}>{cort.recoveryTime}</strong>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>💊</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Anti-Catabolic:' : 'مكملات الكبح:'}</span>
                            <strong style={{ color: '#22d3ee' }}>{cort.supplements}</strong>
                          </div>
                        </div>

                        {/* Recommendation Note */}
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', borderLeft: `3px solid ${cort.color}`, lineHeight: 1.5 }}>
                          💡 <strong>{lang === 'en' ? 'BeastMode Hormonal Protocol:' : 'بروتوكول التحكم الهرموني:'}</strong> {cort.recommendation}
                        </div>
                      </div>

                      {dw.isRestDay ? (
                        <div style={{ textAlign: 'center', padding: '20px 10px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '36px' }}>🧘‍♂️</span>
                          <h4 style={{ fontWeight: 'bold', margin: 0 }}>{t.restDayTitle}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{t.restDayDesc}</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {/* Day Quick Routine Protocol Toolbar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <span>⚡</span>
                              <span style={{ fontWeight: 'bold' }}>{lang === 'en' ? 'Day Protocols:' : 'بروتوكولات اليوم المخصصة:'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleAddWarmupToDay(dw)}
                                className="secondary-btn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                                title={lang === 'en' ? 'Add 2 smart warm-up exercises for this day' : 'إضافة تمرينين إحماء مخصصين لليوم'}
                              >
                                <span>🔥 + {lang === 'en' ? 'Add Warm-up' : 'إضافة إحماء لليوم'}</span>
                              </button>
                              <button
                                onClick={() => handleAddCooldownToDay(dw)}
                                className="secondary-btn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                                title={lang === 'en' ? 'Add 2 recovery/stretching exercises for this day' : 'إضافة تمرينين استشفاء وإطالة لليوم'}
                              >
                                <span>🧊 + {lang === 'en' ? 'Add Recovery' : 'إضافة استشفاء لليوم'}</span>
                              </button>
                            </div>
                          </div>

                          {dw.exercises.map((ex: any) => (
                            <div
                              key={ex.id}
                              className="glass-panel animated-fade"
                              style={{
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                marginBottom: '10px'
                              }}
                            >
                              {/* Line 1: Full Width Name & Tip */}
                              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', width: '100%' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#0e111a', flexShrink: 0 }}>
                                  <ExerciseImage
                                    src={ex.imageUrl}
                                    alt={ex.name}
                                    muscle={ex.targetMuscle}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#fff' }}>{ex.name}</h4>
                                    {((ex.category || '').toUpperCase() === 'WARMUP' || ex.name.includes('إحماء') || ex.name.includes('Warmup')) && (
                                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                                        🔥 {lang === 'en' ? 'Warm-up' : 'إحماء'}
                                      </span>
                                    )}
                                    {((ex.category || '').toUpperCase() === 'COOLDOWN' || ex.name.includes('استشفاء') || ex.name.includes('إطالة') || ex.name.includes('Stretch')) && (
                                      <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '6px', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                                        🧊 {lang === 'en' ? 'Recovery' : 'استشفاء'}
                                      </span>
                                    )}
                                  </div>
                                  {ex.exerciseTips && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px', marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      💡 {ex.exerciseTips}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Line 2: Stats (Sets, Reps, Rest) & Actions (Swap on Right) */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                                {/* Stats Block */}
                                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                    🔄 {ex.sets} {t.sets}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    🔢 {ex.reps} {t.reps}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    ⚖️ {ex.weight || 'Bodyweight'}
                                  </span>
                                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    ⏱️ {lang === 'en' ? 'Rest' : 'راحة'}: {getRestTime(ex)}
                                  </span>
                                  {ex.targetMuscle && (
                                    <span style={{ color: 'var(--primary)', opacity: 0.8 }}>
                                      🎯 {ex.targetMuscle}
                                    </span>
                                  )}
                                </div>

                                {/* Actions Group */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {/* Swap Button is highly visible */}
                                  <button
                                    onClick={() => {
                                      setSelectedDayIndex(dw.dayIndex);
                                      handleFetchAlternatives(ex.id);
                                    }}
                                    className="glow-btn"
                                    style={{
                                      padding: '8px 16px',
                                      fontSize: '13px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontWeight: 'bold',
                                      border: '1px solid var(--primary)',
                                      background: 'var(--primary-glow)',
                                      color: '#fff',
                                      borderRadius: '8px',
                                    }}
                                    title={lang === 'en' ? 'Swap Exercise' : 'استبدال التمرين'}
                                  >
                                    <ArrowLeftRight size={14} />
                                    <span>{lang === 'en' ? 'Swap' : 'استبدال'}</span>
                                  </button>

                                  <button
                                    onClick={() => setViewingExercise(ex)}
                                    className="secondary-btn"
                                    title={lang === 'en' ? 'View Details' : 'عرض تفاصيل وتوجيهات التمرين'}
                                    style={{ padding: '6px 10px', borderRadius: '8px' }}
                                  >
                                    <Info size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleSmartFillActiveEx(ex)}
                                    className="secondary-btn"
                                    title={lang === 'en' ? 'Smart Match from Database' : 'مطابقة ذكية من قاعدة البيانات'}
                                    style={{ padding: '6px 10px', borderRadius: '8px' }}
                                  >
                                    <Sparkles size={13} color="var(--primary)" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedDayIndex(dw.dayIndex);
                                      setEditingExercise(ex);
                                    }}
                                    className="secondary-btn"
                                    title={lang === 'en' ? 'Edit Details' : 'تعديل التكرارات والأوزان'}
                                    style={{ padding: '6px 10px', borderRadius: '8px' }}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedDayIndex(dw.dayIndex);
                                      handleDeleteExercise(ex.id);
                                    }}
                                    className="secondary-btn"
                                    title={lang === 'en' ? 'Delete' : 'حذف التمرين'}
                                    style={{ padding: '6px 10px', borderRadius: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT EXERCISE MODAL */}
      {editingExercise && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setEditingExercise(null)}>
          <form onSubmit={handleEditExerciseSubmit} className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '480px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{lang === 'en' ? 'Edit Exercise details' : 'تعديل جولات وتكرارات التمرين'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              <label>{lang === 'en' ? 'Exercise Name' : 'اسم التمرين'}</label>
              <input
                type="text"
                value={editingExercise.name}
                onChange={(e) => handleNameChange(e.target.value, 'edit')}
                onBlur={() => setTimeout(() => setEditSuggestions([]), 200)}
                className="input-field"
                required
              />
              {editSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0e111a', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 1200, maxHeight: '150px', overflowY: 'auto', marginTop: '4px' }}>
                  {editSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item, 'edit')}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {lang === 'en' ? (item.name_en || item.name_ar) : (item.name_ar || item.name_en)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>{t.sets}</label>
                <input type="number" value={editingExercise.sets} onChange={(e) => setEditingExercise({ ...editingExercise, sets: parseInt(e.target.value) || 3 })} className="input-field" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>{t.reps}</label>
                <input type="text" value={editingExercise.reps} onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })} className="input-field" required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{t.weight}</label>
              <input type="text" value={editingExercise.weight || ''} onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })} className="input-field" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{t.perfTip}</label>
              <textarea value={editingExercise.exerciseTips || ''} onChange={(e) => setEditingExercise({ ...editingExercise, exerciseTips: e.target.value })} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>{t.save}</button>
              <button type="button" onClick={() => setEditingExercise(null)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>{t.cancel}</button>
            </div>
          </form>
        </div>
      )}

      {/* SWAP / ALTERNATIVES MODAL */}
      {swapExerciseId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSwapExerciseId(null)}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '520px', padding: '24px', border: '1px solid var(--primary)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '15px' }}>{lang === 'en' ? 'Select Alternative Exercise' : 'اختر التمرين البديل المناسب'}</h3>

            {/* Swap Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setSwapMode('ai')}
                className={swapMode === 'ai' ? 'glow-btn' : 'secondary-btn'}
                style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px', justifyContent: 'center' }}
              >
                ⚡ {lang === 'en' ? 'AI Smart Swap' : 'تبديل ذكي بالذكاء الاصطناعي'}
              </button>
              <button
                type="button"
                onClick={() => setSwapMode('manual')}
                className={swapMode === 'manual' ? 'glow-btn' : 'secondary-btn'}
                style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px', justifyContent: 'center' }}
              >
                🔍 {lang === 'en' ? 'Manual Selection' : 'اختيار يدوي'}
              </button>
            </div>

            {swapMode === 'ai' ? (
              <form onSubmit={handleAISwapSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>
                    {lang === 'en' ? 'Why do you want to swap this exercise?' : 'ما هو سبب رغبتك في استبدال هذا التمرين؟'}
                  </label>
                  <textarea
                    rows={4}
                    value={aiSwapReason}
                    onChange={(e) => setAiSwapReason(e.target.value)}
                    placeholder={lang === 'en' ? 'E.g., I don\'t have a barbell, this hurts my lower back, make it easier...' : 'مثال: لا أملك بار حديد، هذا التمرين يؤلم أسفل ظهري، أريد خياراً أسهل...'}
                    className="input-field"
                    style={{ fontSize: '13px', resize: 'vertical' }}
                    required
                  />
                </div>

                {aiSwapLoading && (
                  <div style={{ textAlign: 'center', padding: '10px', fontSize: '13px', color: 'var(--primary)' }}>
                    <span>🔄 {lang === 'en' ? 'AI is finding the perfect alternative...' : 'جاري البحث عن البديل الأنسب بالذكاء الاصطناعي...'}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={aiSwapLoading} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {aiSwapLoading ? (lang === 'en' ? 'Swapping...' : 'جاري التبديل...') : (lang === 'en' ? 'Swap Exercise' : 'استبدل التمرين ⚡')}
                  </button>
                  <button type="button" onClick={() => setSwapExerciseId(null)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {t.cancel}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Search other exercises...' : 'ابحث عن تمارين أخرى...'}
                  value={swapSearchQuery}
                  onChange={(e) => setSwapSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: '15px', fontSize: '13px', padding: '10px' }}
                />

                {(() => {
                  const displayList = getFilteredSwapOptions();
                  return alternativesLoading && !swapSearchQuery ? (
                    <div style={{ textAlign: 'center', padding: '30px' }}>{lang === 'en' ? 'Searching alternatives...' : 'جاري البحث عن بدائل رياضية...'}</div>
                  ) : (
                    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                      {displayList.map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => handleSwapExercise(alt)}
                          className="glass-panel"
                          style={{
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)',
                            transition: 'border-color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                        >
                          <div style={{ width: '45px', height: '45px', borderRadius: '6px', overflow: 'hidden', background: '#0e111a', flexShrink: 0 }}>
                            <ExerciseImage src={alt.image_url} alt={alt.name_en} muscle={alt.muscle_en || alt.muscle_ar} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{lang === 'en' ? alt.name_en : alt.name_ar}</h4>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>🏋️‍♂️ {lang === 'en' ? alt.equipment_en : alt.equipment_ar}</span>
                          </div>
                        </div>
                      ))}

                      {displayList.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          {lang === 'en' ? 'No exercises found.' : 'لم نجد تمارين مطابقة في قاعدة البيانات.'}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <button onClick={() => setSwapExerciseId(null)} className="secondary-btn" style={{ width: '100%', marginTop: '15px', justifyContent: 'center' }}>
                  {t.cancel}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD CUSTOM EXERCISE MODAL */}
      {addingCustom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setAddingCustom(false)}>
          <form onSubmit={handleAddCustomSubmit} className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '480px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{lang === 'en' ? 'Add Custom Exercise' : 'إضافة تمرين يدوي جديد'}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              <label>{lang === 'en' ? 'Exercise Name' : 'اسم التمرين'}</label>
              <input
                type="text"
                placeholder={lang === 'en' ? 'E.g., Dumbbell Hammer Curl' : 'مثال: تبادل بايسبس بالدمبلز'}
                value={customExForm.name}
                onChange={(e) => handleNameChange(e.target.value, 'custom')}
                onBlur={() => setTimeout(() => setCustomSuggestions([]), 200)}
                className="input-field"
                required
              />
              {customSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0e111a', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 1200, maxHeight: '150px', overflowY: 'auto', marginTop: '4px' }}>
                  {customSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item, 'custom')}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {lang === 'en' ? (item.name_en || item.name_ar) : (item.name_ar || item.name_en)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>{lang === 'en' ? 'Target Muscle' : 'العضلة المستهدفة'}</label>
                <input
                  type="text"
                  placeholder="Biceps, Chest..."
                  value={customExForm.targetMuscle}
                  onChange={(e) => setCustomExForm({ ...customExForm, targetMuscle: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>{lang === 'en' ? 'Category' : 'التصنيف'}</label>
                <select
                  value={customExForm.category}
                  onChange={(e) => setCustomExForm({ ...customExForm, category: e.target.value })}
                  className="input-field"
                >
                  <option value="IRON">IRON (جيم)</option>
                  <option value="CALISTHENICS">CALISTHENICS (وزن جسم)</option>
                  <option value="HIIT">HIIT (كارديو شدة عالية)</option>
                  <option value="CARDIO">CARDIO (هوائي)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>{t.sets}</label>
                <input
                  type="number"
                  value={customExForm.sets}
                  onChange={(e) => setCustomExForm({ ...customExForm, sets: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>{t.reps}</label>
                <input
                  type="text"
                  placeholder="10-12 or Max"
                  value={customExForm.reps}
                  onChange={(e) => setCustomExForm({ ...customExForm, reps: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{t.weight}</label>
              <input
                type="text"
                placeholder="Bodyweight, 10kg..."
                value={customExForm.weight}
                onChange={(e) => setCustomExForm({ ...customExForm, weight: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{t.perfTip}</label>
              <textarea
                value={customExForm.exerciseTips}
                onChange={(e) => setCustomExForm({ ...customExForm, exerciseTips: e.target.value })}
                className="input-field"
                style={{ minHeight: '60px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>{t.save}</button>
              <button type="button" onClick={() => setAddingCustom(false)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>{t.cancel}</button>
            </div>
          </form>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showImport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { if (!importLoading) setShowImport(false); }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: importPreview ? '680px' : '500px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              {importPreview 
                ? (lang === 'en' ? 'Review & Edit Structured Workout Plan' : 'مراجعة وتعديل الجدول قبل الحفظ') 
                : t.importBtn}
            </h3>

            {importPreview ? (
              // STEP 2: Preview & Edit structured plan before saving
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>
                    {lang === 'en' ? 'Workout Plan Title' : 'مسمى خطة التمارين'}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={importPreview.title}
                    onChange={(e) => setImportPreview({ ...importPreview, title: e.target.value })}
                  />
                </div>

                {/* Auto fill remaining days checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                  <input
                    type="checkbox"
                    id="toggle-fill-rest-days"
                    checked={fillRestDays}
                    onChange={(e) => handleToggleFillRestDays(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="toggle-fill-rest-days" style={{ fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    {lang === 'en' ? 'Fill remaining week days as rest days automatically' : 'إكمال باقي أيام الأسبوع كأيام راحة تلقائياً'}
                  </label>
                </div>

                {/* Horizontal tabs for preview days */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  {importPreview.days.map((day: any, dayIdx: number) => {
                    const isActive = day.dayIndex === previewDayIndex;
                    return (
                      <button
                        key={dayIdx}
                        type="button"
                        onClick={() => setPreviewDayIndex(day.dayIndex)}
                        className={isActive ? 'glow-btn' : 'secondary-btn'}
                        style={{ padding: '6px 12px', fontSize: '12px', minWidth: '85px', justifyContent: 'center', borderRadius: '8px' }}
                      >
                        {lang === 'en' ? `Day ${day.dayIndex}` : `اليوم ${day.dayIndex}`}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day View inside Preview */}
                {(() => {
                  const dayIdx = importPreview.days.findIndex((d: any) => d.dayIndex === previewDayIndex);
                  if (dayIdx === -1) return null;
                  const day = importPreview.days[dayIdx];

                  return (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {lang === 'en' ? 'Day Title' : 'عنوان اليوم'}
                          </label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => {
                              const updatedDays = [...importPreview.days];
                              updatedDays[dayIdx].title = e.target.value;
                              setImportPreview({ ...importPreview, days: updatedDays });
                            }}
                            className="input-field"
                            style={{ fontSize: '13px', padding: '8px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '15px' }}>
                          <input
                            type="checkbox"
                            id={`preview-rest-${dayIdx}`}
                            checked={!!day.isRestDay}
                            onChange={(e) => {
                              const updatedDays = [...importPreview.days];
                              updatedDays[dayIdx].isRestDay = e.target.checked;
                              if (e.target.checked) {
                                updatedDays[dayIdx].exercises = [];
                              }
                              setImportPreview({ ...importPreview, days: updatedDays });
                            }}
                          />
                          <label htmlFor={`preview-rest-${dayIdx}`} style={{ fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {lang === 'en' ? 'Rest Day' : 'يوم راحة'}
                          </label>
                        </div>
                      </div>

                      {day.isRestDay ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          🧘‍♂️ {lang === 'en' ? 'Rest Day (No exercises)' : 'يوم راحة (بدون تمارين)'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="table-scroll-container">
                          <div style={{ minWidth: '560px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {lang === 'en' ? 'Exercises' : 'التمارين'}
                            </label>
                            {(day.exercises || []).map((ex: any, exIdx: number) => (
                              <div key={exIdx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 1.5fr auto auto', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{ position: 'relative' }}>
                                  <input
                                    type="text"
                                    value={ex.name}
                                    onChange={(e) => handleNameChange(e.target.value, 'preview', dayIdx, exIdx)}
                                    onBlur={() => setTimeout(() => setPreviewSuggestions(null), 200)}
                                    placeholder={lang === 'en' ? 'Exercise Name' : 'اسم التمرين'}
                                    className="input-field"
                                    style={{ fontSize: '12px', padding: '6px', width: '100%' }}
                                  />
                                  {previewSuggestions && previewSuggestions.dayIdx === dayIdx && previewSuggestions.exIdx === exIdx && previewSuggestions.list.length > 0 && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0e111a', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 1200, maxHeight: '150px', overflowY: 'auto', marginTop: '4px' }}>
                                      {previewSuggestions.list.map((item) => (
                                        <div
                                          key={item.id}
                                          onClick={() => handleSelectSuggestion(item, 'preview', dayIdx, exIdx)}
                                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-primary)' }}
                                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                          {lang === 'en' ? (item.name_en || item.name_ar) : (item.name_ar || item.name_en)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="number"
                                  value={ex.sets}
                                  onChange={(e) => handleUpdatePreviewEx(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 3)}
                                  placeholder="Sets"
                                  className="input-field"
                                  style={{ fontSize: '12px', padding: '6px', textAlign: 'center' }}
                                />
                                <input
                                  type="text"
                                  value={ex.reps}
                                  onChange={(e) => handleUpdatePreviewEx(dayIdx, exIdx, 'reps', e.target.value)}
                                  placeholder="Reps"
                                  className="input-field"
                                  style={{ fontSize: '12px', padding: '6px' }}
                                />
                                <input
                                  type="text"
                                  value={ex.targetMuscle}
                                  onChange={(e) => handleUpdatePreviewEx(dayIdx, exIdx, 'targetMuscle', e.target.value)}
                                  placeholder="Muscle"
                                  className="input-field"
                                  style={{ fontSize: '12px', padding: '6px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSmartFillPreviewEx(dayIdx, exIdx)}
                                  className="secondary-btn"
                                  title={lang === 'en' ? 'Smart Match' : 'مطابقة ذكية'}
                                  style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Sparkles size={12} color="var(--primary)" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedDays = [...importPreview.days];
                                    updatedDays[dayIdx].exercises.splice(exIdx, 1);
                                    setImportPreview({ ...importPreview, days: updatedDays });
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDays = [...importPreview.days];
                              if (!updatedDays[dayIdx].exercises) updatedDays[dayIdx].exercises = [];
                              updatedDays[dayIdx].exercises.push({
                                name: '',
                                sets: 3,
                                reps: '10 reps',
                                targetMuscle: 'Custom'
                              });
                              setImportPreview({ ...importPreview, days: updatedDays });
                            }}
                            className="secondary-btn"
                            style={{ padding: '6px 12px', fontSize: '12px', justifyContent: 'center', marginTop: '5px' }}
                          >
                            + {lang === 'en' ? 'Add Exercise' : 'إضافة تمرين'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={handleConfirmImport} disabled={importLoading} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {importLoading ? t.loading : (lang === 'en' ? 'Save & Activate Plan' : 'تأكيد وحفظ الجدول ⚡')}
                  </button>
                  <button onClick={() => setImportPreview(null)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {lang === 'en' ? 'Back / Edit Text' : 'الرجوع لتعديل النص'}
                  </button>
                </div>
              </div>
            ) : (
              // STEP 1: Paste Text or Upload File
              <>
                {/* File Upload Zone */}
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', position: 'relative', background: 'rgba(255,255,255,0.01)' }}>
                  <Upload size={28} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', fontWeight: '700', margin: '4px 0' }}>
                    {fileLoading 
                      ? (lang === 'en' ? 'AI reading file...' : 'جاري تحليل وقراءة الملف بالذكاء الاصطناعي...') 
                      : (lang === 'en' ? 'Upload .txt, .docx, or .xlsx file' : 'ارفع ملف نصي، وورد، أو إكسل')}
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {lang === 'en' ? 'AI will automatically parse and distribute to days' : 'سيقوم الذكاء الاصطناعي بالتحليل والتوزيع التلقائي على الأيام'}
                  </span>
                  <input
                    type="file"
                    accept=".txt,.docx,.xlsx"
                    onChange={handleFileUpload}
                    disabled={fileLoading || importLoading}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>

                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  {lang === 'en' ? '— OR PASTE TEXT DIRECTLY —' : '— أو الصق نصوص التمارين مباشرة —'}
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'en'
                    ? 'Paste your workout routine in any format. Supports "Day 1:", "Monday", "Exercise | Sets | Reps | Muscle", "Exercise: 3 sets 12 reps", and "Rest":'
                    : 'الصق جدولك بأي صيغة (مثل "اليوم 1:" أو "السبت"، وصيغة "اسم التمرين | 4 | 10-12 | صدر" أو "سكوات: 3 جولات 12 تكرار" أو "راحة"): '}
                </p>

                <textarea
                  className="input-field"
                  rows={9}
                  style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
                  placeholder={lang === 'en' 
                    ? "Day 1: Chest & Triceps\nBench Press | 4 | 10-12 | Chest\nIncline DB Press: 3 sets of 12 reps\nTricep Dips 3x12\n\nDay 2: Back & Biceps\nLat Pulldown | 4 | 12 | Back\nBarbell Row: 3x10\n\nDay 3: Rest"
                    : "اليوم 1: صدر وترايسبس\nبنش برس بالبار | 4 | 10-12 | صدر\nضغط دمبلز مائل: 3 جولات 12 تكرار\nترايسبس بالكيبل 3 × 12\n\nاليوم 2: ظهر وبايسبس\nسحب عالي للظهر | 4 | 12 | ظهر\nتجديف بالبار: 3 جولات 10 تكرار\n\nاليوم 3: راحة واستشفاء"}
                  value={importListText}
                  onChange={(e) => setImportListText(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleImportBulk} disabled={importLoading || fileLoading} className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {importLoading ? t.loading : (lang === 'en' ? 'Parse & Import' : 'تحليل وحفظ الجدول ⚡')}
                  </button>
                  <button onClick={() => setShowImport(false)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>{t.cancel}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PLAN HISTORY MODAL */}
      {showHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowHistory(false)}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '500px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{t.historyBtn}</h3>

            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>{t.loading}</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                {historyList.map((hPlan) => (
                  <div
                    key={hPlan.id}
                    style={{
                      padding: '15px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{hPlan.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        📅 {new Date(hPlan.startDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')} ({hPlan.durationWeeks} {t.weeks})
                      </p>
                    </div>
                    {hPlan.active ? (
                      <span className="badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '11px' }}>
                        {lang === 'en' ? 'Active' : 'نشط'}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivatePlan(hPlan.id)}
                        className="secondary-btn"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {lang === 'en' ? 'Activate' : 'تفعيل'}
                      </button>
                    )}
                  </div>
                ))}

                {historyList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    {lang === 'en' ? 'No plan history found.' : 'لا يوجد سجل برامج سابقة.'}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setShowHistory(false)} className="secondary-btn" style={{ justifyContent: 'center' }}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* MANUAL WORKOUT PLAN BUILDER MODAL */}
      {showManualBuilder && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            backdropFilter: 'blur(12px)',
            zIndex: 1150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={() => {
            setShowManualBuilder(false);
            setManualRowSuggestions(null);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(0, 210, 255, 0.35)',
              background: 'linear-gradient(135deg, rgba(13, 19, 36, 0.98), rgba(4, 7, 18, 0.99))',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 210, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-0.3px' }}>
                      {lang === 'en' ? 'Custom Workout Plan Architect' : 'منشئ ومصمم الجدول التدريبي المتقدم ✍️'}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      {lang === 'en' ? 'Design days 1–7 freely, search 4,298+ exercises with instant autocomplete.' : 'صمم أيامك التدريبية بحرية، مع بحث فوري واقتراحات تلقائية من 4,298 تمرين.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Header Actions: Starter Templates & Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTemplatesModal(!showTemplatesModal)}
                  className="glow-btn"
                  style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={14} />
                  <span>{lang === 'en' ? 'Load Ready Template 📋' : 'تطبيق قالب جاهز 📋'}</span>
                </button>
                <button
                  onClick={() => setShowManualBuilder(false)}
                  className="secondary-btn"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Template Selector Drawer */}
            {showTemplatesModal && (
              <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.25)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold' }}>
                    ⚡ {lang === 'en' ? 'Choose a Pro Workout Split Template to Auto-Fill:' : 'اختر قالباً تدريبياً معتمداً للتعبئة الفورية بنقرة واحدة:'}
                  </h4>
                  <button onClick={() => setShowTemplatesModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {[
                    { key: 'ppl', titleEn: 'Push Pull Legs (6 Days)', titleAr: 'Push Pull Legs (6 أيام)', desc: 'صدر/ترايسبس - ظهر/بايسبس - أرجل' },
                    { key: 'upper_lower', titleEn: 'Upper / Lower (4 Days)', titleAr: 'علوي / سفلي (4 أيام)', desc: 'يومان علوي + يومان سفلي + 3 راحة' },
                    { key: 'full_body', titleEn: 'Full Body 3x (3 Days)', titleAr: 'كامل الجسم (3 أيام)', desc: '3 أيام شاملة مع يوم راحة بين كل يوم' },
                    { key: 'arnold', titleEn: 'Arnold Split (6 Days)', titleAr: 'جدول أرنولد (6 أيام)', desc: 'صدر وظهر - أكتاف وذراعين - أرجل' },
                    { key: 'bro_split', titleEn: 'Bro Split (5 Days)', titleAr: 'عضلة كل يوم (5 أيام)', desc: 'صدر - ظهر - أرجل - أكتاف - ذراعين' },
                  ].map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      onClick={() => {
                        if (tpl.key === 'ppl') {
                          setManualTitle(lang === 'en' ? 'PPL Hypertrophy 6-Day Split' : 'جدول بوش بول ليجز (PPL 6 أيام)');
                          setManualDays([
                            { dayIndex: 1, title: 'Push Day A (Chest & Triceps)', focusArea: 'صدر، ترايسبس، كتف أمامي', isRestDay: false, exercises: [
                              { name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell' },
                              { name: 'Incline Dumbbell Press', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells' },
                              { name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells' },
                              { name: 'Cable Tricep Pushdown', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable' },
                            ] },
                            { dayIndex: 2, title: 'Pull Day A (Back & Biceps)', focusArea: 'ظهر، بايسبس، كتف خلفي', isRestDay: false, exercises: [
                              { name: 'Lat Pulldown', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable' },
                              { name: 'Seated Cable Row', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable' },
                              { name: 'Face Pulls', targetMuscle: 'Shoulders', sets: 3, reps: '15', weight: 'Cable' },
                              { name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Barbell' },
                            ] },
                            { dayIndex: 3, title: 'Legs Day A (Quads & Abs)', focusArea: 'أرجل أمامية، بطن', isRestDay: false, exercises: [
                              { name: 'Barbell Squat', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell' },
                              { name: 'Leg Press', targetMuscle: 'Quadriceps', sets: 3, reps: '10-12', weight: 'Machine' },
                              { name: 'Standing Calf Raise', targetMuscle: 'Calves', sets: 4, reps: '15', weight: 'Machine' },
                              { name: 'Hanging Leg Raise', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 4, title: 'Push Day B (Shoulders & Chest)', focusArea: 'أكتاف، صدر، ترايسبس', isRestDay: false, exercises: [
                              { name: 'Overhead Shoulder Press', targetMuscle: 'Shoulders', sets: 4, reps: '8-10', weight: 'Dumbbells' },
                              { name: 'Dumbbell Chest Fly', targetMuscle: 'Chest', sets: 3, reps: '12-15', weight: 'Dumbbells' },
                              { name: 'Dips', targetMuscle: 'Triceps', sets: 3, reps: '10-12', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 5, title: 'Pull Day B (Upper Back & Rear Delts)', focusArea: 'ظهر، بايسبس', isRestDay: false, exercises: [
                              { name: 'Bent Over Barbell Row', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Barbell' },
                              { name: 'Hammer Curls', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells' },
                              { name: 'Hyperextensions', targetMuscle: 'Back', sets: 3, reps: '15', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 6, title: 'Legs Day B (Hamstrings & Glutes)', focusArea: 'أرجل خلفية، سمانة', isRestDay: false, exercises: [
                              { name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 4, reps: '8-10', weight: 'Barbell' },
                              { name: 'Leg Curl', targetMuscle: 'Hamstrings', sets: 3, reps: '12', weight: 'Machine' },
                              { name: 'Plank', targetMuscle: 'Abs', sets: 3, reps: '60s', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 7, title: 'Rest & Active Recovery', focusArea: 'استشفاء كامل', isRestDay: true, exercises: [] },
                          ]);
                        } else if (tpl.key === 'upper_lower') {
                          setManualTitle(lang === 'en' ? 'Upper / Lower 4-Day Split' : 'جدول علوي / سفلي (4 أيام)');
                          setManualDays([
                            { dayIndex: 1, title: 'Upper Body Power', focusArea: 'صدر، ظهر، أكتاف، ذراعين', isRestDay: false, exercises: [
                              { name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '6-8', weight: 'Barbell' },
                              { name: 'Lat Pulldown', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Cable' },
                              { name: 'Overhead Shoulder Press', targetMuscle: 'Shoulders', sets: 3, reps: '8-10', weight: 'Dumbbells' },
                              { name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Barbell' },
                            ] },
                            { dayIndex: 2, title: 'Lower Body Strength', focusArea: 'أرجل، سمانة، بطن', isRestDay: false, exercises: [
                              { name: 'Barbell Squat', targetMuscle: 'Quadriceps', sets: 4, reps: '6-8', weight: 'Barbell' },
                              { name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 3, reps: '8-10', weight: 'Barbell' },
                              { name: 'Standing Calf Raise', targetMuscle: 'Calves', sets: 4, reps: '15', weight: 'Machine' },
                              { name: 'Hanging Leg Raise', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 3, title: 'Rest & Recovery', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                            { dayIndex: 4, title: 'Upper Body Hypertrophy', focusArea: 'صدر، ظهر، أكتاف، ذراعين', isRestDay: false, exercises: [
                              { name: 'Incline Dumbbell Press', targetMuscle: 'Chest', sets: 4, reps: '10-12', weight: 'Dumbbells' },
                              { name: 'Seated Cable Row', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable' },
                              { name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells' },
                              { name: 'Cable Tricep Pushdown', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable' },
                            ] },
                            { dayIndex: 5, title: 'Lower Body Hypertrophy', focusArea: 'أرجل، سمانة، بطن', isRestDay: false, exercises: [
                              { name: 'Leg Press', targetMuscle: 'Quadriceps', sets: 4, reps: '10-12', weight: 'Machine' },
                              { name: 'Leg Extension', targetMuscle: 'Quadriceps', sets: 3, reps: '12-15', weight: 'Machine' },
                              { name: 'Leg Curl', targetMuscle: 'Hamstrings', sets: 3, reps: '12-15', weight: 'Machine' },
                              { name: 'Plank', targetMuscle: 'Abs', sets: 3, reps: '60s', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 6, title: 'Rest Day', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                            { dayIndex: 7, title: 'Rest Day', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                          ]);
                        } else if (tpl.key === 'full_body') {
                          setManualTitle(lang === 'en' ? 'Full Body 3-Day Foundation' : 'جدول كامل الجسم (3 أيام)');
                          setManualDays([
                            { dayIndex: 1, title: 'Full Body Workout A', focusArea: 'كامل الجسم', isRestDay: false, exercises: [
                              { name: 'Barbell Squat', targetMuscle: 'Quadriceps', sets: 3, reps: '8-10', weight: 'Barbell' },
                              { name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 3, reps: '8-10', weight: 'Barbell' },
                              { name: 'Lat Pulldown', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable' },
                              { name: 'Overhead Shoulder Press', targetMuscle: 'Shoulders', sets: 3, reps: '10-12', weight: 'Dumbbells' },
                            ] },
                            { dayIndex: 2, title: 'Rest & Recovery', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                            { dayIndex: 3, title: 'Full Body Workout B', focusArea: 'كامل الجسم', isRestDay: false, exercises: [
                              { name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 3, reps: '8-10', weight: 'Barbell' },
                              { name: 'Incline Dumbbell Press', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells' },
                              { name: 'Seated Cable Row', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable' },
                              { name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', sets: 3, reps: '12-15', weight: 'Dumbbells' },
                            ] },
                            { dayIndex: 4, title: 'Rest & Recovery', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                            { dayIndex: 5, title: 'Full Body Workout C', focusArea: 'كامل الجسم', isRestDay: false, exercises: [
                              { name: 'Leg Press', targetMuscle: 'Quadriceps', sets: 3, reps: '10-12', weight: 'Machine' },
                              { name: 'Dips', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Bodyweight' },
                              { name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Barbell' },
                              { name: 'Plank', targetMuscle: 'Abs', sets: 3, reps: '60s', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 6, title: 'Rest Day', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                            { dayIndex: 7, title: 'Rest Day', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                          ]);
                        } else {
                          // Arnold / Bro Split
                          setManualTitle(lang === 'en' ? 'Arnold Classic Split (6 Days)' : 'جدول أرنولد الكلاسيكي (6 أيام)');
                          setManualDays([
                            { dayIndex: 1, title: 'Chest & Back (Antagonist)', focusArea: 'صدر، ظهر', isRestDay: false, exercises: [
                              { name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '8-10', weight: 'Barbell' },
                              { name: 'Incline Dumbbell Press', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Dumbbells' },
                              { name: 'Lat Pulldown', targetMuscle: 'Back', sets: 4, reps: '10-12', weight: 'Cable' },
                              { name: 'Seated Cable Row', targetMuscle: 'Back', sets: 3, reps: '10-12', weight: 'Cable' },
                            ] },
                            { dayIndex: 2, title: 'Shoulders & Arms', focusArea: 'أكتاف، بايسبس، ترايسبس', isRestDay: false, exercises: [
                              { name: 'Overhead Shoulder Press', targetMuscle: 'Shoulders', sets: 4, reps: '8-10', weight: 'Dumbbells' },
                              { name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', sets: 4, reps: '12-15', weight: 'Dumbbells' },
                              { name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '10-12', weight: 'Barbell' },
                              { name: 'Cable Tricep Pushdown', targetMuscle: 'Triceps', sets: 3, reps: '12-15', weight: 'Cable' },
                            ] },
                            { dayIndex: 3, title: 'Legs & Calves', focusArea: 'أرجل، سمانة، بطن', isRestDay: false, exercises: [
                              { name: 'Barbell Squat', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', weight: 'Barbell' },
                              { name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 3, reps: '10-12', weight: 'Barbell' },
                              { name: 'Leg Press', targetMuscle: 'Quadriceps', sets: 3, reps: '10-12', weight: 'Machine' },
                              { name: 'Hanging Leg Raise', targetMuscle: 'Abs', sets: 3, reps: '15', weight: 'Bodyweight' },
                            ] },
                            { dayIndex: 4, title: 'Chest & Back B', focusArea: 'صدر، ظهر', isRestDay: false, exercises: [
                              { name: 'Dumbbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '10-12', weight: 'Dumbbells' },
                              { name: 'Bent Over Barbell Row', targetMuscle: 'Back', sets: 4, reps: '8-10', weight: 'Barbell' },
                            ] },
                            { dayIndex: 5, title: 'Shoulders & Arms B', focusArea: 'أكتاف، ذراعين', isRestDay: false, exercises: [
                              { name: 'Arnold Press', targetMuscle: 'Shoulders', sets: 4, reps: '10-12', weight: 'Dumbbells' },
                              { name: 'Hammer Curls', targetMuscle: 'Biceps', sets: 3, reps: '12', weight: 'Dumbbells' },
                            ] },
                            { dayIndex: 6, title: 'Legs B', focusArea: 'أرجل، بطن', isRestDay: false, exercises: [
                              { name: 'Leg Extension', targetMuscle: 'Quadriceps', sets: 4, reps: '12-15', weight: 'Machine' },
                              { name: 'Leg Curl', targetMuscle: 'Hamstrings', sets: 4, reps: '12-15', weight: 'Machine' },
                            ] },
                            { dayIndex: 7, title: 'Rest & Recovery', focusArea: 'استشفاء', isRestDay: true, exercises: [] },
                          ]);
                        }
                        setShowTemplatesModal(false);
                      }}
                      className="secondary-btn"
                      style={{ padding: '10px 12px', borderRadius: '10px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{lang === 'en' ? tpl.titleEn : tpl.titleAr}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tpl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plan Title Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {lang === 'en' ? 'Workout Routine Name:' : 'اسم ومسمى الجدول التدريبي:'}
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder={lang === 'en' ? 'E.g., Hypertrophy Push Pull Legs' : 'مثال: جدول التضخيم 5 أيام (Push Pull Legs)'}
                className="input-field"
                style={{ padding: '12px 14px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            {/* Day Selector Tabs (Days 1 to 7) */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {manualDays.map((day) => {
                const isActive = day.dayIndex === manualActiveDayIdx;
                const count = day.exercises ? day.exercises.length : 0;
                return (
                  <button
                    key={day.dayIndex}
                    type="button"
                    onClick={() => {
                      setManualActiveDayIdx(day.dayIndex);
                      setManualRowSuggestions(null);
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'linear-gradient(135deg, var(--primary), #00a8ff)' : 'rgba(255,255,255,0.04)',
                      color: isActive ? '#050710' : (day.isRestDay ? 'var(--text-muted)' : 'var(--text-primary)'),
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 4px 15px var(--primary-glow)' : 'none',
                    }}
                  >
                    <span>{lang === 'en' ? `Day ${day.dayIndex}` : `اليوم ${day.dayIndex}`}</span>
                    {day.isRestDay ? (
                      <span style={{ fontSize: '11px', opacity: 0.9 }}>💤</span>
                    ) : (
                      <span style={{ background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Day Card Editor */}
            {(() => {
              const currentDay = manualDays.find(d => d.dayIndex === manualActiveDayIdx) || manualDays[0];
              const dayIdx = manualDays.findIndex(d => d.dayIndex === manualActiveDayIdx);

              const updateCurrentDay = (field: string, val: any) => {
                const updated = [...manualDays];
                updated[dayIdx] = { ...updated[dayIdx], [field]: val };
                setManualDays(updated);
              };

              const addExercise = () => {
                const updated = [...manualDays];
                updated[dayIdx].exercises.push({
                  name: '',
                  targetMuscle: 'Chest',
                  sets: 3,
                  reps: '10-12',
                  weight: 'Dumbbells',
                });
                setManualDays(updated);
              };

              const removeExercise = (exIdx: number) => {
                const updated = [...manualDays];
                updated[dayIdx].exercises.splice(exIdx, 1);
                setManualDays(updated);
                setManualRowSuggestions(null);
              };

              const updateExercise = (exIdx: number, field: string, val: any) => {
                const updated = [...manualDays];
                updated[dayIdx].exercises[exIdx] = {
                  ...updated[dayIdx].exercises[exIdx],
                  [field]: val,
                };
                setManualDays(updated);
              };

              const handleRowNameSearch = async (val: string, exIdx: number) => {
                updateExercise(exIdx, 'name', val);
                if (val.trim().length >= 1) {
                  const matches = await api.searchExercises(val.trim(), 8);
                  setManualRowSuggestions({ dayIdx, exIdx, list: matches });
                } else {
                  setManualRowSuggestions(null);
                }
              };

              const selectRowSuggestion = (sug: any, exIdx: number) => {
                const updated = [...manualDays];
                const cleanName = lang === 'ar' ? (sug.name_ar || sug.name_en) : (sug.name_en || sug.name_ar);
                const muscle = sug.muscle_ar || sug.muscle_en || 'الصدر';
                const equipment = sug.equipment_ar || sug.equipment_en || 'دمبلز';
                const tips = sug.instructions_ar || sug.instructions_en || '';
                const img = sug.image_url || sug.gif_url || '';

                updated[dayIdx].exercises[exIdx] = {
                  ...updated[dayIdx].exercises[exIdx],
                  name: cleanName,
                  targetMuscle: muscle,
                  weight: equipment,
                  exerciseTips: tips,
                  imageUrl: img,
                  sets: updated[dayIdx].exercises[exIdx].sets || 3,
                  reps: updated[dayIdx].exercises[exIdx].reps || '10-12',
                } as any;
                setManualDays(updated);
                setManualRowSuggestions(null);
              };

              const clearDayExercises = () => {
                if (confirm(lang === 'en' ? 'Clear all exercises for this day?' : 'هل تود مسح جميع تمارين هذا اليوم؟')) {
                  const updated = [...manualDays];
                  updated[dayIdx].exercises = [];
                  setManualDays(updated);
                }
              };

              const duplicateDayToNext = () => {
                const nextIdx = (dayIdx + 1) % 7;
                const updated = [...manualDays];
                updated[nextIdx] = {
                  ...updated[nextIdx],
                  title: `${currentDay.title} (نسخة)`,
                  focusArea: currentDay.focusArea,
                  isRestDay: currentDay.isRestDay,
                  exercises: JSON.parse(JSON.stringify(currentDay.exercises)),
                };
                setManualDays(updated);
                setManualActiveDayIdx(updated[nextIdx].dayIndex);
                alert(lang === 'en' ? `Copied to Day ${updated[nextIdx].dayIndex}` : `تم نسخ التمارين إلى اليوم ${updated[nextIdx].dayIndex}`);
              };

              const injectWarmup = () => {
                const routine = getSmartWarmupRoutine(currentDay.focusArea, currentDay.title);
                const formatted = routine.map(r => ({
                  name: r.name,
                  targetMuscle: r.targetMuscle,
                  sets: r.sets,
                  reps: r.reps,
                  weight: r.weight,
                  category: 'WARMUP',
                }));
                const updated = [...manualDays];
                updated[dayIdx].exercises = [...formatted, ...updated[dayIdx].exercises];
                setManualDays(updated);
                alert(lang === 'en' ? '🔥 Added warm-up routine to day!' : '🔥 تمت إضافة تمارين الإحماء لليوم بنجاح!');
              };

              const injectCooldown = () => {
                const routine = getSmartCooldownRoutine(currentDay.focusArea, currentDay.title);
                const formatted = routine.map(r => ({
                  name: r.name,
                  targetMuscle: r.targetMuscle,
                  sets: r.sets,
                  reps: r.reps,
                  weight: r.weight,
                  category: 'COOLDOWN',
                }));
                const updated = [...manualDays];
                updated[dayIdx].exercises = [...updated[dayIdx].exercises, ...formatted];
                setManualDays(updated);
                alert(lang === 'en' ? '🧊 Added recovery & stretching routine to day!' : '🧊 تمت إضافة تمارين الاستشفاء والإطالة لليوم بنجاح!');
              };

              return (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Day Config & Focus Area */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) minmax(200px, 1.5fr) auto', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        🏷️ {lang === 'en' ? 'Day Title:' : 'عنوان اليوم التدريبي:'}
                      </label>
                      <input
                        type="text"
                        value={currentDay.title}
                        onChange={(e) => updateCurrentDay('title', e.target.value)}
                        placeholder="مثال: صدر وبايسبس..."
                        className="input-field"
                        style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        🎯 {lang === 'en' ? 'Target Muscle Focus:' : 'التركيز العضلي الأساسي:'}
                      </label>
                      <input
                        type="text"
                        value={currentDay.focusArea}
                        onChange={(e) => updateCurrentDay('focusArea', e.target.value)}
                        placeholder="صدر، ترايسبس، أكتاف..."
                        className="input-field"
                        style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', width: '100%' }}
                      />
                    </div>

                    {/* Rest Day Switch */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        {lang === 'en' ? 'Day Status:' : 'حالة اليوم:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => updateCurrentDay('isRestDay', !currentDay.isRestDay)}
                        className={currentDay.isRestDay ? 'secondary-btn' : 'glow-btn'}
                        style={{
                          padding: '10px 16px',
                          fontSize: '13px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: currentDay.isRestDay ? 'rgba(100, 116, 139, 0.2)' : undefined,
                          color: currentDay.isRestDay ? '#94a3b8' : undefined,
                          border: currentDay.isRestDay ? '1px solid #475569' : undefined,
                        }}
                      >
                        <span>{currentDay.isRestDay ? '💤 يوم راحة واستشفاء' : '🏋️ يوم تمرين ونشاط'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Focus Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      ⚡ {lang === 'en' ? 'Quick Focus Preset:' : 'تحديد سريع للتركيز:'}
                    </span>
                    {[
                      { label: '🔥 صدر وترايسبس (Push)', title: 'دفع (صدر وترايسبس)', focus: 'صدر، ترايسبس' },
                      { label: '⚡ ظهر وبايسبس (Pull)', title: 'سحب (ظهر وبايسبس)', focus: 'ظهر، بايسبس' },
                      { label: '🦵 أرجل وبطن (Legs)', title: 'أرجل وبطن', focus: 'أرجل، بطن' },
                      { label: '💪 أكتاف وذراعين', title: 'أكتاف وذراعين', focus: 'أكتاف، ذراعين' },
                      { label: '🎯 كامل الجسم (Full Body)', title: 'كامل الجسم', focus: 'كامل الجسم' },
                      { label: '💤 راحة واستشفاء', title: 'يوم راحة واستشفاء', focus: 'استشفاء', rest: true },
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          updateCurrentDay('title', pill.title);
                          updateCurrentDay('focusArea', pill.focus);
                          if (pill.rest) updateCurrentDay('isRestDay', true);
                          else updateCurrentDay('isRestDay', false);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-primary)',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  {/* Exercises Management Section */}
                  {!currentDay.isRestDay ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <h4 style={{ fontSize: '14px', margin: 0, color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Dumbbell size={16} />
                          <span>{lang === 'en' ? `Day Exercises (${currentDay.exercises.length})` : `تمارين اليوم التدريبي (${currentDay.exercises.length})`}</span>
                        </h4>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={injectWarmup}
                            className="secondary-btn"
                            style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                            title="إضافة تمارين إحماء مخصصة لهذا اليوم"
                          >
                            <span>🔥 + {lang === 'en' ? 'Warmup' : 'إحماء'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={injectCooldown}
                            className="secondary-btn"
                            style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                            title="إضافة تمارين استشفاء وإطالة لهذا اليوم"
                          >
                            <span>🧊 + {lang === 'en' ? 'Recovery' : 'استشفاء'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={duplicateDayToNext}
                            className="secondary-btn"
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="نسخ تمارين هذا اليوم لليوم التالي"
                          >
                            <Copy size={13} />
                            <span>{lang === 'en' ? 'Duplicate Day' : 'نسخ اليوم 📋'}</span>
                          </button>

                          {currentDay.exercises.length > 0 && (
                            <button
                              type="button"
                              onClick={clearDayExercises}
                              className="secondary-btn"
                              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}
                            >
                              <Trash2 size={13} />
                              <span>{lang === 'en' ? 'Clear' : 'تفريغ 🧹'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={addExercise}
                            className="glow-btn"
                            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Plus size={14} />
                            <span>{lang === 'en' ? 'Add Exercise +' : 'إضافة تمرين +'}</span>
                          </button>
                        </div>
                      </div>

                      {currentDay.exercises.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '35px 20px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <Plus size={20} />
                          </div>
                          <span>{lang === 'en' ? 'No exercises in this day yet. Click Add Exercise!' : 'لم تقم بإضافة أي تمارين لهذا اليوم بعد. اضغط على زر إضافة تمرين!'}</span>
                          <button
                            type="button"
                            onClick={addExercise}
                            className="glow-btn"
                            style={{ padding: '8px 18px', fontSize: '12px' }}
                          >
                            {lang === 'en' ? 'Add First Exercise +' : 'إضافة أول تمرين +'}
                          </button>
                        </div>
                      ) : (
                        <div className="table-scroll-container">
                          <div style={{ minWidth: '780px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Table Headers */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(210px, 2.5fr) minmax(120px, 1.3fr) 90px 100px minmax(130px, 1.6fr) minmax(110px, 1.2fr) 38px',
                              gap: '8px',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              color: 'var(--text-secondary)',
                              textTransform: 'uppercase',
                            }}>
                            <div>{lang === 'en' ? 'Exercise (Search 🔍)' : 'اسم التمرين (بحث ذكي 🔍)'}</div>
                            <div>{lang === 'en' ? 'Muscle' : 'العضلة 🎯'}</div>
                            <div style={{ textAlign: 'center' }}>{lang === 'en' ? 'Mode' : 'النوع ⏱️/🔢'}</div>
                            <div style={{ textAlign: 'center' }}>{lang === 'en' ? 'Sets' : 'الجولات 🔢'}</div>
                            <div style={{ textAlign: 'center' }}>{lang === 'en' ? 'Reps / Time' : 'التكرار أو المدة ⏱️'}</div>
                            <div>{lang === 'en' ? 'Equipment' : 'الأداة 🏋️'}</div>
                            <div></div>
                          </div>

                          {/* Exercise Rows */}
                          {currentDay.exercises.map((ex, exIdx) => {
                            const isSugActive = manualRowSuggestions && manualRowSuggestions.dayIdx === dayIdx && manualRowSuggestions.exIdx === exIdx;
                            const isTimed = (ex as any).isTimed || (typeof ex.reps === 'string' && (ex.reps.includes('s') || ex.reps.includes('m') || ex.reps.includes('sec') || ex.reps.includes('ثانية') || ex.reps.includes('دقيقة')));

                            return (
                              <div
                                key={exIdx}
                                style={{
                                  position: 'relative',
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(210px, 2.5fr) minmax(120px, 1.3fr) 90px 100px minmax(130px, 1.6fr) minmax(110px, 1.2fr) 38px',
                                  gap: '8px',
                                  alignItems: 'center',
                                  padding: '10px 12px',
                                  background: isTimed ? 'rgba(0, 210, 255, 0.04)' : 'rgba(255,255,255,0.03)',
                                  borderRadius: '12px',
                                  border: isTimed ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid var(--border-color)',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {/* Exercise Name Input with Floating Suggestions */}
                                <div style={{ position: 'relative' }}>
                                  <input
                                    type="text"
                                    placeholder={lang === 'en' ? 'Search 4,298+ exercises...' : 'ابحث بين 4,298 تمرين (بنش، بلانك...)'}
                                    value={ex.name}
                                    onChange={(e) => handleRowNameSearch(e.target.value, exIdx)}
                                    onFocus={() => {
                                      if (ex.name.trim().length > 1) {
                                        handleRowNameSearch(ex.name, exIdx);
                                      }
                                    }}
                                    className="input-field"
                                    style={{ padding: '8px 12px', fontSize: '13px', width: '100%', borderRadius: '8px' }}
                                  />

                                  {/* Floating Dropdown Autocomplete */}
                                  {isSugActive && manualRowSuggestions.list.length > 0 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        left: 0,
                                        marginTop: '4px',
                                        background: 'rgba(15, 23, 42, 0.98)',
                                        backdropFilter: 'blur(16px)',
                                        border: '1px solid var(--primary)',
                                        borderRadius: '12px',
                                        boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(0, 210, 255, 0.2)',
                                        zIndex: 1200,
                                        overflow: 'hidden',
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                      }}
                                    >
                                      {manualRowSuggestions.list.map((sug, sIdx) => {
                                        const isCardioOrHold = (sug.muscle_en || '').toLowerCase().includes('cardio') || (sug.name_en || '').toLowerCase().includes('plank') || (sug.name_en || '').toLowerCase().includes('hold') || (sug.name_en || '').toLowerCase().includes('run');
                                        return (
                                          <div
                                            key={sIdx}
                                            onClick={() => selectRowSuggestion(sug, exIdx)}
                                            style={{
                                              padding: '10px 12px',
                                              cursor: 'pointer',
                                              borderBottom: sIdx === manualRowSuggestions.list.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: '8px',
                                              transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.12)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                          >
                                            <div>
                                              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                                                {lang === 'ar' ? (sug.name_ar || sug.name_en) : (sug.name_en || sug.name_ar)}
                                              </div>
                                              {sug.name_en && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                  {sug.name_en}
                                                </div>
                                              )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                              {isCardioOrHold && (
                                                <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 6px', borderRadius: '6px' }}>
                                                  ⏱️ مؤقت
                                                </span>
                                              )}
                                              <span style={{ fontSize: '10px', background: 'rgba(0, 210, 255, 0.15)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '6px' }}>
                                                {sug.muscle_ar || sug.muscle_en || 'عضلات'}
                                              </span>
                                              {sug.equipment_en && (
                                                <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '6px' }}>
                                                  {sug.equipment_en}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Target Muscle Select */}
                                <div>
                                  <select
                                    value={ex.targetMuscle}
                                    onChange={(e) => updateExercise(exIdx, 'targetMuscle', e.target.value)}
                                    className="input-field"
                                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                                  >
                                    <option value="Chest" style={{ background: '#0f172a' }}>الصدر (Chest)</option>
                                    <option value="Back" style={{ background: '#0f172a' }}>الظهر (Back / Lats)</option>
                                    <option value="Shoulders" style={{ background: '#0f172a' }}>الأكتاف (Shoulders)</option>
                                    <option value="Quadriceps" style={{ background: '#0f172a' }}>الأرجل الأمامية (Quads)</option>
                                    <option value="Hamstrings" style={{ background: '#0f172a' }}>الأرجل الخلفية (Hamstrings)</option>
                                    <option value="Biceps" style={{ background: '#0f172a' }}>البايسبس (Biceps)</option>
                                    <option value="Triceps" style={{ background: '#0f172a' }}>الترايسبس (Triceps)</option>
                                    <option value="Abs" style={{ background: '#0f172a' }}>عضلات البطن والكور (Abs)</option>
                                    <option value="Calves" style={{ background: '#0f172a' }}>السمانة (Calves)</option>
                                    <option value="Cardio" style={{ background: '#0f172a' }}>كارديو ولياقة (Cardio)</option>
                                    <option value="Full Body" style={{ background: '#0f172a' }}>كامل الجسم (Full Body)</option>
                                  </select>
                                </div>

                                {/* Mode Switch: Timed vs Reps */}
                                <div style={{ textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextTimed = !isTimed;
                                      updateExercise(exIdx, 'isTimed', nextTimed);
                                      if (nextTimed) {
                                        updateExercise(exIdx, 'reps', '45s');
                                      } else {
                                        updateExercise(exIdx, 'reps', '10-12');
                                      }
                                    }}
                                    style={{
                                      padding: '6px 8px',
                                      fontSize: '11px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      width: '100%',
                                      border: isTimed ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                                      background: isTimed ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                                      color: isTimed ? 'var(--primary)' : 'var(--text-secondary)',
                                      transition: 'all 0.2s',
                                    }}
                                    title={isTimed ? 'تمرين يعتمد على المؤقت الزمني' : 'تمرين يعتمد على عدد التكرارات'}
                                  >
                                    {isTimed ? (
                                      <>
                                        <Timer size={12} />
                                        <span>مؤقت</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>🔢</span>
                                        <span>تكرار</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Sets Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => updateExercise(exIdx, 'sets', Math.max(1, (parseInt(String(ex.sets)) || 3) - 1))}
                                    style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={ex.sets}
                                    onChange={(e) => updateExercise(exIdx, 'sets', parseInt(e.target.value) || 3)}
                                    className="input-field"
                                    style={{ padding: '6px 2px', fontSize: '12px', width: '34px', textAlign: 'center', borderRadius: '6px' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateExercise(exIdx, 'sets', (parseInt(String(ex.sets)) || 3) + 1)}
                                    style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Reps or Time Duration Input & Quick Selector */}
                                <div>
                                  {isTimed ? (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <select
                                        value={ex.reps}
                                        onChange={(e) => updateExercise(exIdx, 'reps', e.target.value)}
                                        className="input-field"
                                        style={{ padding: '6px 4px', fontSize: '11px', width: '100%', borderRadius: '8px', background: 'rgba(0, 210, 255, 0.08)', color: 'var(--primary)', fontWeight: 'bold' }}
                                      >
                                        <option value="30s" style={{ background: '#0f172a' }}>⏱️ 30 ثانية</option>
                                        <option value="45s" style={{ background: '#0f172a' }}>⏱️ 45 ثانية</option>
                                        <option value="60s" style={{ background: '#0f172a' }}>⏱️ 60 ثانية</option>
                                        <option value="90s" style={{ background: '#0f172a' }}>⏱️ 90 ثانية</option>
                                        <option value="2 mins" style={{ background: '#0f172a' }}>⏱️ 2 دقيقة</option>
                                        <option value="5 mins" style={{ background: '#0f172a' }}>⏱️ 5 دقائق</option>
                                        <option value="10 mins" style={{ background: '#0f172a' }}>⏱️ 10 دقائق</option>
                                        <option value="15 mins" style={{ background: '#0f172a' }}>⏱️ 15 دقيقة</option>
                                        <option value="20 mins" style={{ background: '#0f172a' }}>⏱️ 20 دقيقة</option>
                                        <option value="30 mins" style={{ background: '#0f172a' }}>⏱️ 30 دقيقة</option>
                                      </select>
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder="10-12"
                                      value={ex.reps}
                                      onChange={(e) => updateExercise(exIdx, 'reps', e.target.value)}
                                      className="input-field"
                                      style={{ padding: '6px 8px', fontSize: '12px', width: '100%', textAlign: 'center', borderRadius: '8px' }}
                                    />
                                  )}
                                </div>

                                {/* Equipment / Weight Selector */}
                                <div>
                                  <select
                                    value={ex.weight || 'Dumbbells'}
                                    onChange={(e) => updateExercise(exIdx, 'weight', e.target.value)}
                                    className="input-field"
                                    style={{ padding: '8px 8px', fontSize: '12px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                                  >
                                    <option value="Barbell" style={{ background: '#0f172a' }}>بار حديد (Barbell)</option>
                                    <option value="Dumbbells" style={{ background: '#0f172a' }}>دمبلز (Dumbbells)</option>
                                    <option value="Cable" style={{ background: '#0f172a' }}>كيبل (Cable)</option>
                                    <option value="Machine" style={{ background: '#0f172a' }}>أجهزة (Machine)</option>
                                    <option value="Bodyweight" style={{ background: '#0f172a' }}>وزن الجسم (Bodyweight)</option>
                                    <option value="Cardio Machine" style={{ background: '#0f172a' }}>جهاز كارديو (Cardio)</option>
                                  </select>
                                </div>

                                {/* Delete Exercise Button */}
                                <button
                                  type="button"
                                  onClick={() => removeExercise(exIdx)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    color: '#ef4444',
                                    borderRadius: '8px',
                                    height: '34px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s',
                                  }}
                                  title="حذف هذا التمرين"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '14px', background: 'rgba(255,255,255,0.01)', borderRadius: '14px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '32px' }}>💤</span>
                      <strong style={{ color: '#fff' }}>{lang === 'en' ? 'Full Rest & Recovery Day' : 'يوم راحة واستشفاء عضلي كامل'}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '450px' }}>
                        {lang === 'en' ? 'Muscles grow during rest! Ensure adequate sleep, hydration, and nutrition.' : 'تنمو العضلات أثناء فترات الاستشفاء. احرص على شرب 3-4 لتر ماء والنوم الكافي وتناول احتياج البروتين.'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Save & Cancel Footer */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowManualBuilder(false)}
                className="secondary-btn"
                style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px', justifyContent: 'center' }}
              >
                {lang === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!manualTitle.trim()) {
                    alert(lang === 'en' ? 'Please provide a plan title' : 'يرجى كتابة اسم للجدول التدريبي');
                    return;
                  }
                  setManualSaving(true);
                  try {
                    await api.saveStructuredPlan({
                      title: manualTitle,
                      days: manualDays,
                    }, lang);
                    alert(lang === 'en' ? 'Custom workout plan saved and activated! ⚡' : 'تم حفظ وتفعيل جدولك الرياضي اليدوي بنجاح! ⚡');
                    setShowManualBuilder(false);
                    fetchActivePlan();
                  } catch (err: any) {
                    alert(err.message || (lang === 'en' ? 'Failed to save custom plan' : 'فشل حفظ الجدول اليدوي'));
                  } finally {
                    setManualSaving(false);
                  }
                }}
                disabled={manualSaving}
                className="glow-btn"
                style={{ flex: 2, padding: '14px', borderRadius: '12px', fontSize: '15px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={18} />
                <span>{manualSaving ? (lang === 'en' ? 'Saving & Activating...' : 'جاري الحفظ والتفعيل...') : (lang === 'en' ? 'Save & Activate Custom Plan ⚡' : 'حفظ وتفعيل الجدول اليدوي ⚡')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MuscleWiki Exercise Guide Modal */}
      {viewingExercise && (
        <MuscleWikiModal
          exercise={{
            ...viewingExercise,
            name_en: viewingExercise.name,
            name_ar: viewingExercise.name,
            muscle_en: viewingExercise.targetMuscle || 'Chest',
            instructions_ar: viewingExercise.exerciseTips || '',
            image_url: viewingExercise.imageUrl || null,
          }}
          lang={lang}
          onClose={() => setViewingExercise(null)}
        />
      )}

      {/* Preset & Legendary Plans Modal */}
      <PresetPlansModal
        isOpen={showPresetPlansModal}
        lang={lang}
        onClose={() => setShowPresetPlansModal(false)}
        onSelectPlan={handleSelectPresetPlan}
      />

      {/* Multi-Plan Manager Hub Modal */}
      <MultiPlanManagerModal
        isOpen={showMultiPlanModal}
        lang={lang}
        plans={historyList.length > 0 ? historyList : (activePlan ? [activePlan] : [])}
        activePlanId={activePlan?.id || null}
        onClose={() => setShowMultiPlanModal(false)}
        onPlanActivated={(plan) => {
          setActivePlan(plan);
          cacheStore.set('active_plan', plan);
          setSelectedDayIndex(1);
          fetchHistory();
        }}
        onOpenManualBuilderForNew={() => {
          setManualTitle(lang === 'en' ? 'New Custom Workout Routine' : 'جدولي التدريبي الجديد');
          setManualDays([
            { dayIndex: 1, title: lang === 'en' ? 'Push (Chest & Triceps)' : 'دفع (صدر وترايسبس وأكتاف)', focusArea: lang === 'en' ? 'Chest, Triceps' : 'صدر، ترايسبس', isRestDay: false, exercises: [] },
            { dayIndex: 2, title: lang === 'en' ? 'Pull (Back & Biceps)' : 'سحب (ظهر وبايسبس)', focusArea: lang === 'en' ? 'Back, Biceps' : 'ظهر، بايسبس', isRestDay: false, exercises: [] },
            { dayIndex: 3, title: lang === 'en' ? 'Rest & Recovery' : 'راحة واستشفاء', focusArea: lang === 'en' ? 'Rest' : 'راحة', isRestDay: true, exercises: [] },
            { dayIndex: 4, title: lang === 'en' ? 'Legs & Core' : 'أرجل وبطن', focusArea: lang === 'en' ? 'Legs, Abs' : 'أرجل، بطن', isRestDay: false, exercises: [] },
            { dayIndex: 5, title: lang === 'en' ? 'Rest & Recovery' : 'راحة واستشفاء', focusArea: lang === 'en' ? 'Rest' : 'راحة', isRestDay: true, exercises: [] },
            { dayIndex: 6, title: lang === 'en' ? 'Full Body Blast' : 'تمرين شامل لكامل الجسم', focusArea: lang === 'en' ? 'Full Body' : 'كامل الجسم', isRestDay: false, exercises: [] },
            { dayIndex: 7, title: lang === 'en' ? 'Rest & Recovery' : 'راحة واستشفاء', focusArea: lang === 'en' ? 'Rest' : 'راحة', isRestDay: true, exercises: [] },
          ]);
          setShowManualBuilder(true);
        }}
        onOpenManualBuilderForEdit={(plan) => {
          setManualTitle(plan.title);
          if (plan.dayWorkouts && plan.dayWorkouts.length > 0) {
            setManualDays(plan.dayWorkouts.map((d: any) => ({
              dayIndex: d.dayIndex,
              title: d.title,
              focusArea: d.focusArea || '',
              isRestDay: d.isRestDay || false,
              exercises: (d.exercises || []).map((ex: any) => ({
                name: ex.name,
                targetMuscle: ex.targetMuscle || 'Chest',
                sets: ex.sets || 3,
                reps: ex.reps || '10-12',
                weight: ex.weight || 'Bodyweight',
              }))
            })));
          }
          setShowManualBuilder(true);
        }}
        onOpenPresetsModal={() => {
          setShowPresetPlansModal(true);
        }}
        onRefreshPlans={() => {
          fetchHistory();
          fetchActivePlan();
        }}
      />

      {/* Barbell Plate & 1RM Calculator Modal */}
      <BarbellPlate1RMModal
        isOpen={showStrengthCalcModal}
        lang={lang}
        onClose={() => setShowStrengthCalcModal(false)}
      />
    </div>
  );
};

