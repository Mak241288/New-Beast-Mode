import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Edit2, Trash2, ArrowLeftRight, Plus, Upload, History, Sparkles, AlertCircle, Info, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Printer, Download, Dumbbell, Copy, Timer, Crown, Layers, Percent, Share2, Calendar, Search } from 'lucide-react';
import { translations } from '../utils/translations';
import { MuscleWikiModal } from '../components/MuscleWikiModal';
import { ExerciseImage } from '../components/ExerciseImage';
import { PresetPlansModal } from '../components/PresetPlansModal';
import { MultiPlanManagerModal } from '../components/MultiPlanManagerModal';
import { BarbellPlate1RMModal } from '../components/BarbellPlate1RMModal';
import { RoutineCardExportModal } from '../components/RoutineCardExportModal';
import { DynamicWarmupModal } from '../components/DynamicWarmupModal';
import type { PresetPlan } from '../utils/presetWorkoutPlans';
import { cacheStore } from '../utils/cacheStore';
import { exportWorkoutPlanToCSV } from '../utils/exportUtils';
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
  const [routineCardDay, setRoutineCardDay] = useState<any | null>(null);
  const [dynamicWarmupDay, setDynamicWarmupDay] = useState<any | null>(null);
  const [manualTitle, setManualTitle] = useState(lang === 'en' ? 'Custom Gym Routine' : 'جدولي التدريبي اليدوي');
  const [manualActiveDayIdx, setManualActiveDayIdx] = useState(1);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualRowSuggestions, setManualRowSuggestions] = useState<{ dayIdx: number; exIdx: number; list: any[] } | null>(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [manualDays, setManualDays] = useState<Array<{ dayIndex: number; title: string; focusArea: string; isRestDay: boolean; exercises: any[] }>>([
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
  const [manualEditingPlanId, setManualEditingPlanId] = useState<number | null>(null);
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
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);

  // Manual Architect Smart Swap Modal State
  const [manualSwapTarget, setManualSwapTarget] = useState<{ dayIdx: number; exIdx: number; exercise: any } | null>(null);
  const [manualSwapQuery, setManualSwapQuery] = useState<string>('');

  // Interactive Visual Exercise Picker State
  const [showExercisePickerModal, setShowExercisePickerModal] = useState<{ dayIdx: number; exIdx?: number } | null>(null);
  const [pickerMuscle, setPickerMuscle] = useState<string>('ALL');
  const [pickerEquipment, setPickerEquipment] = useState<string>('ALL');
  const [pickerQuery, setPickerQuery] = useState<string>('');

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

  const handleShareToWhatsApp = () => {
    if (!activePlan || !activePlan.dayWorkouts) return;
    const isEn = lang === 'en';
    let text = `🦍 *${activePlan.title || 'BeastMode AI Workout Routine'}* ⚡\n`;
    text += `${isEn ? '🎯 Goal:' : '🎯 الهدف:'} ${activePlan.goal || (isEn ? 'Hypertrophy & Strength' : 'تضخيم وقوة')}\n\n`;

    activePlan.dayWorkouts.forEach((d: any) => {
      if (d.isRestDay) {
        text += `🛌 *${isEn ? `Day ${d.dayIndex}: Rest & Anabolic Recovery` : `اليوم ${d.dayIndex}: راحة واستشفاء`}*\n\n`;
      } else {
        text += `🏋️ *${isEn ? `Day ${d.dayIndex}: ${d.title}` : `اليوم ${d.dayIndex}: ${d.title}`}*\n`;
        (d.exercises || []).forEach((ex: any, idx: number) => {
          const exTitle = isEn ? (ex.name_en || ex.name) : (ex.name_ar || ex.name || ex.name_en);
          text += `  ${idx + 1}. ${exTitle} (${ex.sets} ${isEn ? 'sets' : 'جولات'} × ${ex.reps} ${isEn ? 'reps' : 'تكرار'})\n`;
        });
        text += `\n`;
      }
    });

    text += `⚡ ${isEn ? 'Generated via BeastMode AI:' : 'تم إنشاء الجدول عبر منصة BeastMode AI:'} https://new-beast-mode.vercel.app/`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert(isEn ? '✅ Workout plan copied to clipboard formatted for WhatsApp!' : '✅ تم نسخ الخطة كرسالة واتساب منسقة بنجاح!');
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
    fetchLibraryOnce();
    if (localStorage.getItem('open_manual_builder') === 'true') {
      localStorage.removeItem('open_manual_builder');
      setShowManualBuilder(true);
    }
    const handleCloudSync = () => {
      fetchActivePlan();
      fetchHistory();
    };
    window.addEventListener('beast_cloud_synced', handleCloudSync);
    return () => window.removeEventListener('beast_cloud_synced', handleCloudSync);
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
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const normalized = ((index - 1) % 7 + 7) % 7;
    return lang === 'en' ? daysEn[normalized] : daysAr[normalized];
  };

  const getRestTime = (ex: any) => {
    if (!ex) return lang === 'en' ? '90s' : '90 ثانية';
    if (ex.restSeconds !== undefined && ex.restSeconds !== null && String(ex.restSeconds).trim() !== '') {
      const s = parseInt(String(ex.restSeconds));
      if (s === 0) return lang === 'en' ? 'None' : 'بدون';
      return `${s} ${lang === 'en' ? 's' : 'ثانية'}`;
    }
    if (ex.rest && String(ex.rest).trim()) {
      return String(ex.rest);
    }
    const tips = typeof ex.exerciseTips === 'string'
      ? ex.exerciseTips
      : (typeof ex.exerciseTips === 'object' && ex.exerciseTips !== null ? JSON.stringify(ex.exerciseTips) : String(ex.exerciseTips || ''));
    if (tips) {
      const match = tips.match(/(?:راحة|Rest|rest)[:\s]*(\d+)\s*(?:s|ثانية|seconds|sec)?/i);
      if (match && match[1]) {
        return `${match[1]} ${lang === 'en' ? 's' : 'ثانية'}`;
      }
    }
    const cat = String(ex.category || '').toUpperCase();
    if (cat === 'WARMUP' || cat === 'COOLDOWN' || cat === 'STRETCH') return lang === 'en' ? '15s' : '15 ثانية';
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

  const handlePrintWorkoutPlan = () => {
    if (activePlan?.dayWorkouts) {
      const allOpen: Record<number, boolean> = {};
      activePlan.dayWorkouts.forEach((dw: any) => {
        allOpen[dw.dayIndex] = true;
      });
      setExpandedDays(allOpen);
    }
    setTimeout(() => {
      window.print();
    }, 150);
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
            title: lang === 'en' ? `Day ${i} (${getDayName(i)}): Rest Day` : `اليوم ${i} (${getDayName(i)}): يوم راحة واستشفاء`,
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
      
      // Update local React state immediately so UI refreshes without race condition
      setActivePlan((prevPlan: any) => {
        if (!prevPlan) return prevPlan;
        const days = (prevPlan.dayWorkouts || prevPlan.days || []).map((dw: any) => ({
          ...dw,
          exercises: (dw.exercises || []).map((ex: any) =>
            (editingExercise.id !== undefined && ex.id !== undefined && String(ex.id) === String(editingExercise.id)) ||
            (ex.name && editingExercise.name && ex.name.toLowerCase().trim() === editingExercise.name.toLowerCase().trim() && dw.dayIndex === selectedDayIndex)
              ? { ...ex, ...editingExercise }
              : ex
          )
        }));
        const updated = {
          ...prevPlan,
          dayWorkouts: days,
          days,
          updatedAt: new Date().toISOString()
        };
        cacheStore.set('active_plan', updated);
        return updated;
      });

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

  function normalizeTimedReps(val: any): string {
    if (!val) return '45s';
    const s = String(val).trim().toLowerCase();
    
    if (s.includes('20m') || s.includes('20 min') || s.includes('20 دقيق') || s === '20') return '20 mins';
    if (s.includes('15m') || s.includes('15 min') || s.includes('15 دقيق') || s === '15') return '15 mins';
    if (s.includes('10m') || s.includes('10 min') || s.includes('10 دقيق') || s === '10') return '10 mins';
    if (s.includes('5m') || s.includes('5 min') || s.includes('5 دقيق') || s === '5') return '5 mins';
    if (s.includes('2m') || s.includes('2 min') || s.includes('2 دقيق') || s.includes('دقيقتين') || s.includes('120') || s === '2') return '2 mins';
    if (s.includes('90') || s.includes('1.5')) return '90s';
    if (s.includes('60') || s.includes('1m') || s.includes('1 min') || s.includes('دقيقة واحدة') || s.includes('دقيق') || s === '60' || s === '1') return '60s';
    if (s.includes('45') || s === '45s') return '45s';
    if (s.includes('30') || s === '30s') return '30s';
    
    return '45s';
  }

  function normalizeRestSeconds(val: any): string {
    const num = parseInt(String(val)) || 60;
    if (num <= 35) return '30';
    if (num <= 50) return '45';
    if (num <= 75) return '60';
    if (num <= 105) return '90';
    if (num <= 150) return '120';
    return '180';
  }

  function normalizeEquipment(val: any): string {
    if (!val) return 'Dumbbells';
    const s = String(val).toLowerCase();
    if (s.includes('وزن') || s.includes('bodyweight') || s.includes('body weight')) return 'Bodyweight';
    if (s.includes('بار') || s.includes('barbell')) return 'Barbell';
    if (s.includes('دمبل') || s.includes('دامبل') || s.includes('dumbbell')) return 'Dumbbells';
    if (s.includes('كيبل') || s.includes('كابل') || s.includes('cable')) return 'Cable';
    if (s.includes('جهاز كارديو') || s.includes('cardio machine') || s.includes('treadmill') || s.includes('bike')) return 'Cardio Machine';
    if (s.includes('جهاز') || s.includes('أجهزة') || s.includes('machine')) return 'Machine';
    return val;
  }

  function normalizeTargetMuscle(val: any): string {
    if (!val) return 'Chest';
    const s = String(val).toLowerCase();
    if (s.includes('صدر') || s.includes('chest')) return 'Chest';
    if (s.includes('ظهر') || s.includes('back') || s.includes('lat')) return 'Back';
    if (s.includes('كتف') || s.includes('أكتاف') || s.includes('shoulder') || s.includes('delt')) return 'Shoulders';
    if (s.includes('خلفي') || s.includes('hamstring') || s.includes('glute')) return 'Hamstrings';
    if (s.includes('أرجل') || s.includes('quad') || s.includes('leg') || s.includes('فخذ')) return 'Quadriceps';
    if (s.includes('باي') || s.includes('bicep')) return 'Biceps';
    if (s.includes('تراي') || s.includes('tricep')) return 'Triceps';
    if (s.includes('بطن') || s.includes('abs') || s.includes('core')) return 'Abs';
    if (s.includes('سمانة') || s.includes('calf') || s.includes('calves')) return 'Calves';
    if (s.includes('كارديو') || s.includes('cardio') || s.includes('لياقة')) return 'Cardio';
    if (s.includes('شامل') || s.includes('full')) return 'Full Body';
    return val;
  }

  const handleOpenManualBuilder = (planToLoad?: any) => {
    let plan = planToLoad;
    if (planToLoad === undefined) {
      plan = cacheStore.get('active_plan') || activePlan;
    }

    setManualEditingPlanId(plan ? (plan.id || null) : null);

    if (plan) {
      setManualTitle(plan.title || (lang === 'en' ? 'My Custom Workout Routine' : 'جدولي التدريبي المخصص'));
      const sourceDays = (plan.dayWorkouts && plan.dayWorkouts.length > 0)
        ? plan.dayWorkouts
        : ((plan.days && plan.days.length > 0) ? plan.days : []);
      if (sourceDays.length > 0) {
        setManualDays(sourceDays.map((d: any, idx: number) => {
          const exercises = (d.exercises || []).map((ex: any, eIdx: number) => {
            const rawCat = ex.category ? String(ex.category).trim().toUpperCase() : '';
            const cat = (rawCat === 'WARMUP' || rawCat === 'WARM_UP' || rawCat === 'WARM-UP' || (rawCat === '' && ex.name && (ex.name.includes('إحماء') || ex.name.toLowerCase().includes('warmup') || ex.name.toLowerCase().includes('warm-up'))))
              ? 'WARMUP'
              : (rawCat === 'COOLDOWN' || rawCat === 'RECOVERY' || rawCat === 'STRETCH' || (rawCat === '' && ex.name && (ex.name.includes('استشفاء') || ex.name.includes('إطالة'))))
              ? 'COOLDOWN'
              : (rawCat === 'SUPERSET' || rawCat === 'DROIPSET')
              ? 'SUPERSET'
              : (rawCat === 'CARDIO' || rawCat === 'HIIT')
              ? 'CARDIO'
              : 'MAIN';

            const rawReps = String(ex.reps || '');
            const isTimed = ex.isTimed !== undefined
              ? !!ex.isTimed
              : (rawReps.includes('s') || rawReps.includes('m') || rawReps.includes('sec') || rawReps.includes('ثانية') || rawReps.includes('دقيقة'));

            // Normalize target muscle
            const targetMuscle = normalizeTargetMuscle(ex.targetMuscle || 'Chest');

            // Normalize weight/equipment
            const weight = normalizeEquipment(ex.weight || 'Bodyweight');

            // Normalize rest seconds
            let restSeconds = ex.restSeconds ? parseInt(String(ex.restSeconds)) : 60;
            if (!ex.restSeconds && ex.exerciseTips) {
              const match = String(ex.exerciseTips).match(/(\d+)\s*(ثانية|ثواني|sec|s)/i);
              if (match) restSeconds = parseInt(match[1]) || 60;
            }

            return {
              id: ex.id || (Date.now() + idx * 100 + eIdx),
              name: ex.name || '',
              targetMuscle,
              category: cat,
              isTimed,
              sets: parseInt(String(ex.sets)) || 3,
              reps: ex.reps || (isTimed ? '45s' : '10-12'),
              weight,
              restSeconds,
              exerciseTips: typeof ex.exerciseTips === 'string' ? ex.exerciseTips : (typeof ex.exerciseTips === 'object' && ex.exerciseTips !== null ? JSON.stringify(ex.exerciseTips) : String(ex.exerciseTips || '')),
              imageUrl: ex.imageUrl || '',
              videoUrl: ex.videoUrl || '',
            };
          });

          return {
            dayIndex: d.dayIndex || idx + 1,
            title: d.title || (lang === 'en' ? `Day ${idx + 1}` : `اليوم ${idx + 1}`),
            focusArea: d.focusArea || '',
            isRestDay: !!d.isRestDay,
            exercises,
          };
        }));
      }
    } else {
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
    }
    setManualActiveDayIdx(1);
    setShowManualBuilder(true);
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
      setManualDays(structuredPlan.days.map((d) => ({
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
          imageUrl: ex.imageUrl || '',
          videoUrl: ex.videoUrl || '',
        })),
      })));
      setManualActiveDayIdx(1);
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

        {/* Clean Segmented Quick Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '100%' }}>
          {/* Main Action Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => handleOpenManualBuilder()}
              className="glow-btn"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <Plus size={15} />
              <span>{lang === 'en' ? 'Custom Plan Architect ✍️' : 'تصميم جدول يدوي ✍️'}</span>
            </button>
            
            <button
              onClick={() => setShowPresetPlansModal(true)}
              className="secondary-btn"
              style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
            >
              <Crown size={15} color="#f59e0b" />
              <span>{lang === 'en' ? 'Pro Plans 👑' : 'الخطط الجاهزة 👑'}</span>
            </button>

            <button
              onClick={() => setShowToolsDrawer(!showToolsDrawer)}
              className="secondary-btn"
              style={{
                padding: '8px 14px',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 'bold',
                borderColor: showToolsDrawer ? 'var(--primary)' : 'var(--border-color)',
                background: showToolsDrawer ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                color: showToolsDrawer ? 'var(--primary)' : 'var(--text-primary)',
              }}
            >
              <Layers size={15} color="var(--secondary)" />
              <span>{lang === 'en' ? 'Tools & Management ⚙️' : 'أدوات وإدارة الجداول ⚙️'}</span>
              <ChevronDown size={14} style={{ transform: showToolsDrawer ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {/* Collapsible Unified Tools Drawer */}
          {showToolsDrawer && (
            <div
              className="glass-panel plan-tools-toolbar animated-fade"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                boxShadow: 'var(--glass-shadow)',
              }}
            >
              <button
                onClick={() => { fetchHistory(); setShowMultiPlanModal(true); }}
                className="secondary-btn"
                style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={13} color="var(--secondary)" />
                <span>{lang === 'en' ? `My Plans (${historyList.length || 1})` : `إدارة جداولي (${historyList.length || 1})`}</span>
              </button>

              <button
                onClick={() => setShowStrengthCalcModal(true)}
                className="secondary-btn"
                style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Percent size={13} color="#38bdf8" />
                <span>{lang === 'en' ? '1RM Calc' : 'حاسبة 1RM 🔢'}</span>
              </button>

              <button
                onClick={handleRegeneratePlan}
                className="secondary-btn"
                style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} />
                <span>{lang === 'en' ? 'Regenerate' : 'إعادة توليد ⚡'}</span>
              </button>

              <button
                onClick={handleUpgradePlan}
                className="secondary-btn"
                style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={13} color="#f59e0b" />
                <span>{lang === 'en' ? 'AI Upgrade' : 'ترقية AI ✨'}</span>
              </button>

              <button
                onClick={() => setShowImport(true)}
                className="secondary-btn"
                style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={13} />
                <span>{t.importBtn}</span>
              </button>

              <button
                onClick={() => { setShowHistory(true); fetchHistory(); }}
                className="secondary-btn"
                style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <History size={13} />
                <span>{t.historyBtn}</span>
              </button>

              {activePlan && (
                <>
                  <button
                    onClick={() => exportWorkoutPlanToCSV(activePlan, lang)}
                    className="secondary-btn"
                    style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={13} />
                    <span>CSV 📊</span>
                  </button>

                  <button
                    onClick={handleShareToWhatsApp}
                    className="secondary-btn"
                    style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                  >
                    <Share2 size={13} />
                    <span>WhatsApp 📲</span>
                  </button>

                  <button
                    onClick={handlePrintWorkoutPlan}
                    className="secondary-btn"
                    style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={13} />
                    <span>{lang === 'en' ? 'Print' : 'طباعة 🖨️'}</span>
                  </button>
                </>
              )}
            </div>
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
                <div key={dw.id} className="glass-panel day-workout-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleDayExpanded(dw.dayIndex)}
                    style={{
                      padding: '16px 20px', flexWrap: 'wrap', gap: '12px',
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

                    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🧠</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'CNS Load:' : 'إجهاد الجهاز العصبي:'}</span>
                            <strong style={{ color: cort.color }}>{cort.cnsLoad}</strong>
                          </div>
                          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>⏳</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Recovery Time:' : 'وقت الاستشفاء:'}</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{cort.recoveryTime}</strong>
                          </div>
                          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>💊</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Anti-Catabolic:' : 'مكملات الكبح:'}</span>
                            <strong style={{ color: '#0ea5e9' }}>{cort.supplements}</strong>
                          </div>
                        </div>

                        {/* Recommendation Note */}
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', background: 'var(--bg-card-hover)', padding: '8px 12px', borderRadius: '8px', borderInlineStart: `3px solid ${cort.color}`, lineHeight: 1.5 }}>
                          💡 <strong style={{ color: 'var(--text-primary)' }}>{lang === 'en' ? 'BeastMode Hormonal Protocol:' : 'بروتوكول التحكم الهرموني:'}</strong> {cort.recommendation}
                        </div>
                      </div>

                      {dw.isRestDay ? (
                        <div style={{ textAlign: 'center', padding: '20px 10px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '36px' }}>🧘‍♂️</span>
                          <h4 style={{ fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{t.restDayTitle}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{t.restDayDesc}</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {/* Day Quick Routine Protocol Toolbar */}
                          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <span>⚡</span>
                              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{lang === 'en' ? 'Day Protocols:' : 'بروتوكولات اليوم المخصصة:'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => setDynamicWarmupDay(dw)}
                                className="secondary-btn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#f59e0b', color: '#f59e0b' }}
                                title={lang === 'en' ? '3-min Dynamic Mobility Warmup' : 'الإحماء الحركي الذكي لتليين المفاصل (3 دقائق)'}
                              >
                                <span>🤸‍♂️ {lang === 'en' ? '3-Min Warmup' : 'إحماء حركي (3د)'}</span>
                              </button>
                              <button
                                onClick={() => setRoutineCardDay(dw)}
                                className="secondary-btn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                title={lang === 'en' ? 'Export Gym Routine Card' : 'تصدير بطاقة التمرين السينمائية للجيم'}
                              >
                                <span>📷 {lang === 'en' ? 'Routine Card' : 'بطاقة التمرين 📷'}</span>
                              </button>
                              <button
                                onClick={() => handleAddWarmupToDay(dw)}
                                className="secondary-btn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                                title={lang === 'en' ? 'Add 2 smart warm-up exercises for this day' : 'إضافة تمرينين إحماء مخصصين لليوم'}
                              >
                                <span>🔥 + {lang === 'en' ? 'Add Warm-up' : 'إضافة إحماء'}</span>
                              </button>
                              <button
                                onClick={() => handleAddCooldownToDay(dw)}
                                className="secondary-btn"
                                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#22d3ee' }}
                                title={lang === 'en' ? 'Add 2 recovery/stretching exercises for this day' : 'إضافة تمرينين استشفاء وإطالة لليوم'}
                              >
                                <span>🧊 + {lang === 'en' ? 'Add Recovery' : 'إضافة استشفاء'}</span>
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
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-card-hover)', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                                  <ExerciseImage
                                    src={ex.imageUrl}
                                    alt={ex.name}
                                    muscle={ex.targetMuscle}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{ex.name}</h4>
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
                                      💡 {typeof ex.exerciseTips === 'string' ? ex.exerciseTips : (typeof ex.exerciseTips === 'object' && ex.exerciseTips !== null ? JSON.stringify(ex.exerciseTips) : String(ex.exerciseTips || ''))}
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
                                <div className="no-print" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

      {/* PRO ATHLETIC QUICK EDIT EXERCISE MODAL */}
      {editingExercise && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 16, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setEditingExercise(null)}
        >
          <form
            onSubmit={handleEditExerciseSubmit}
            className="glass-panel animated-fade"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              border: '1px solid var(--primary)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px var(--primary-glow)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Exercise Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚡</span>
                  <span>{lang === 'en' ? 'Quick Exercise Editor' : 'محرر التمرين السريع والذكي'}</span>
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  {lang === 'en' ? 'Customize role, sets, duration, and rest interval' : 'تعديل نوع التمرين، الجولات، الوقت وفترة الراحة'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="secondary-btn"
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* 1. Category / Role Segmented Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                🏷️ {lang === 'en' ? 'Exercise Role & Category:' : 'نوع ودور التمرين في الحصة:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {[
                  { id: 'IRON', labelAr: '🏋️ أساسي / حديد', labelEn: '🏋️ Main / Iron', color: 'var(--primary)', bg: 'rgba(204,255,0,0.1)' },
                  { id: 'WARMUP', labelAr: '🔥 إحماء وتفعيل', labelEn: '🔥 Warm-up', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                  { id: 'COOLDOWN', labelAr: '🧊 استشفاء وإطالة', labelEn: '🧊 Recovery / Stretch', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
                  { id: 'CARDIO', labelAr: '🏃 كارديو ولياقة', labelEn: '🏃 Cardio', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                  { id: 'HIIT', labelAr: '⚡ HIIT حارق', labelEn: '⚡ HIIT Burn', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
                  { id: 'CALISTHENICS', labelAr: '🤸 وزن الجسم', labelEn: '🤸 Calisthenics', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
                ].map((cat) => {
                  const isSelected = (editingExercise.category || 'IRON').toUpperCase() === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditingExercise({ ...editingExercise, category: cat.id })}
                      style={{
                        padding: '8px 10px',
                        fontSize: '11.5px',
                        fontWeight: isSelected ? '800' : '600',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
                        background: isSelected ? cat.bg : 'rgba(255,255,255,0.02)',
                        color: isSelected ? cat.color : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {lang === 'en' ? cat.labelEn : cat.labelAr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Exercise Name & Autocomplete Suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                ✍️ {lang === 'en' ? 'Exercise Name:' : 'اسم التمرين:'}
              </label>
              <input
                type="text"
                value={editingExercise.name}
                onChange={(e) => handleNameChange(e.target.value, 'edit')}
                onBlur={() => setTimeout(() => setEditSuggestions([]), 200)}
                className="input-field"
                required
                style={{ fontSize: '13px', padding: '10px 14px' }}
              />
              {editSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0e111a', border: '1px solid var(--border-color)', borderRadius: '10px', zIndex: 1200, maxHeight: '160px', overflowY: 'auto', marginTop: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                  {editSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item, 'edit')}
                      style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#fff' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {lang === 'en' ? (item.name_en || item.name_ar) : (item.name_ar || item.name_en)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Sets & Reps/Duration Fast Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Sets Fast Counter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  🔄 {t.sets}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingExercise({ ...editingExercise, sets: Math.max(1, (editingExercise.sets || 3) - 1) })}
                    className="secondary-btn"
                    style={{ width: '36px', height: '36px', borderRadius: '8px', padding: 0, fontSize: '16px', fontWeight: 'bold' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={editingExercise.sets}
                    onChange={(e) => setEditingExercise({ ...editingExercise, sets: parseInt(e.target.value) || 1 })}
                    className="input-field num-display"
                    style={{ textAlign: 'center', fontSize: '15px', fontWeight: 'bold', flex: 1, padding: '8px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditingExercise({ ...editingExercise, sets: (editingExercise.sets || 3) + 1 })}
                    className="secondary-btn"
                    style={{ width: '36px', height: '36px', borderRadius: '8px', padding: 0, fontSize: '16px', fontWeight: 'bold' }}
                  >
                    +
                  </button>
                </div>
                {/* Sets Quick Presets */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                  {[2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingExercise({ ...editingExercise, sets: s })}
                      className="secondary-btn"
                      style={{ flex: 1, padding: '3px 0', fontSize: '11px', borderRadius: '6px', opacity: editingExercise.sets === s ? 1 : 0.6, borderColor: editingExercise.sets === s ? 'var(--primary)' : undefined }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reps vs Duration (Timed) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    🔢 {t.reps} / ⏱️ {lang === 'en' ? 'Duration' : 'الوقت'}
                  </label>
                </div>
                <input
                  type="text"
                  value={editingExercise.reps}
                  onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })}
                  className="input-field num-display"
                  placeholder="10-12 or 45s"
                  required
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
                {/* Quick Reps / Time Presets */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {['8-10', '10-12', '12-15', '30s', '45s', '60s', 'Max'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditingExercise({ ...editingExercise, reps: preset })}
                      className="secondary-btn"
                      style={{ padding: '3px 6px', fontSize: '10.5px', borderRadius: '6px', opacity: editingExercise.reps === preset ? 1 : 0.6, borderColor: editingExercise.reps === preset ? 'var(--primary)' : undefined }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Rest Interval Fast Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                ⏱️ {lang === 'en' ? 'Rest Time Between Sets:' : 'فترة الراحة بين الجولات:'}
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '0s (بدون)', val: 0, text: '0s' },
                  { label: '15s', val: 15, text: '15s' },
                  { label: '30s', val: 30, text: '30s' },
                  { label: '45s', val: 45, text: '45s' },
                  { label: '60s', val: 60, text: '60s' },
                  { label: '90s', val: 90, text: '90s' },
                  { label: '120s (2د)', val: 120, text: '120s' },
                  { label: '180s (3د)', val: 180, text: '180s' },
                ].map((item) => {
                  const currentRestStr = getRestTime(editingExercise);
                  const isCurrent = currentRestStr.includes(String(item.val)) || (item.val === 0 && currentRestStr === 'None');
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        const rawTips = typeof editingExercise.exerciseTips === 'string'
                          ? editingExercise.exerciseTips
                          : (typeof editingExercise.exerciseTips === 'object' && editingExercise.exerciseTips !== null ? JSON.stringify(editingExercise.exerciseTips) : String(editingExercise.exerciseTips || ''));
                        const cleanTips = rawTips.replace(/(?:راحة|Rest|rest)[:\s]*\d+\s*(?:s|ثانية|seconds|sec)?\s*[|•-]?\s*/gi, '').trim();
                        const newTips = item.val > 0
                          ? `Rest: ${item.val}s ${cleanTips ? `| ${cleanTips}` : ''}`
                          : cleanTips;
                        setEditingExercise({
                          ...editingExercise,
                          exerciseTips: newTips,
                          restSeconds: item.val,
                          rest: item.text,
                        });
                      }}
                      className="secondary-btn"
                      style={{
                        padding: '5px 8px',
                        fontSize: '11px',
                        borderRadius: '8px',
                        borderColor: isCurrent ? 'var(--primary)' : undefined,
                        background: isCurrent ? 'var(--primary-glow)' : undefined,
                        color: isCurrent ? '#fff' : undefined,
                        fontWeight: isCurrent ? 'bold' : 'normal',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Suggested Weight */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                ⚖️ {t.weight}
              </label>
              <input
                type="text"
                value={editingExercise.weight || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })}
                className="input-field"
                placeholder={lang === 'en' ? 'e.g. 20kg, Dumbbells, Bodyweight' : 'مثال: 20kg، دمبلز، وزن الجسم'}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Bodyweight', 'Dumbbells', 'Barbell', 'Cable', 'Machine', '15kg', '20kg'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setEditingExercise({ ...editingExercise, weight: w })}
                    className="secondary-btn"
                    style={{ padding: '3px 8px', fontSize: '10.5px', borderRadius: '6px' }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Form Tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                💡 {t.perfTip}
              </label>
              <textarea
                value={editingExercise.exerciseTips || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, exerciseTips: e.target.value })}
                className="input-field"
                style={{ minHeight: '65px', resize: 'vertical', fontSize: '12px' }}
                placeholder={lang === 'en' ? 'Form advice, rest notes, cadence...' : 'توجيهات التكنيك، ملاحظات الراحة، سرعة الحركة...'}
              />
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="secondary-btn"
                style={{ flex: 1, justifyContent: 'center', padding: '12px', borderRadius: '10px' }}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="glow-btn"
                style={{ flex: 2, justifyContent: 'center', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
              >
                <span>⚡</span>
                <span>{lang === 'en' ? 'Save & Apply Changes ⚡' : 'حفظ وتطبيق التعديل ⚡'}</span>
              </button>
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
                        style={{ padding: '6px 12px', fontSize: '12px', minWidth: '100px', justifyContent: 'center', borderRadius: '8px' }}
                      >
                        {lang === 'en' ? `Day ${day.dayIndex} (${getDayName(day.dayIndex)})` : `اليوم ${day.dayIndex} (${getDayName(day.dayIndex)})`}
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
            className="glass-card plan-architect-modal"
            style={{
              width: '100%',
              maxWidth: '1020px',
              maxHeight: '94vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              borderRadius: '24px',
              padding: '22px 20px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: 'var(--glass-shadow)',
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
                    <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                      {lang === 'en' ? 'Custom Workout Plan Architect' : 'منشئ ومصمم الجدول التدريبي المتقدم ✍️'}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      {lang === 'en' ? 'Design days 1–7 freely, search 4,100+ exercises with instant autocomplete.' : 'صمم أيامك التدريبية بحرية، مع بحث فوري واقتراحات تلقائية من أكثر من 4,100 تمرين.'}
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
                style={{ padding: '12px 14px', borderRadius: '12px', fontSize: '14px' }}
              />
            </div>

            {/* Day Selector & Navigation Section */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {lang === 'en' ? 'Select Day to Edit Exercises:' : '📅 اختر اليوم التدريبي لتعديل تمارينه:'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    ({manualDays.length} {lang === 'en' ? 'days in routine' : 'أيام في البرنامج'})
                  </span>
                </div>

                {/* Add Day Button */}
                {manualDays.length < 7 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextDayNum = manualDays.length + 1;
                      const newDay = {
                        dayIndex: nextDayNum,
                        title: `اليوم ${nextDayNum} (${getDayName(nextDayNum)})`,
                        focusArea: 'صدر، ظهر',
                        isRestDay: false,
                        exercises: [
                          { name: 'Pushups', targetMuscle: 'Chest', sets: 3, reps: '10-12', weight: 'Bodyweight' }
                        ]
                      };
                      setManualDays([...manualDays, newDay]);
                      setManualActiveDayIdx(nextDayNum);
                    }}
                    className="glow-btn"
                    style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>+ {lang === 'en' ? 'Add Another Day' : 'إضافة يوم جديد'}</span>
                  </button>
                )}
              </div>

              {/* Day Selector Tabs (Days 1 to N) */}
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'thin' }}>
                {manualDays.map((day, idx) => {
                  const dayNum = day.dayIndex !== undefined ? day.dayIndex : idx + 1;
                  const isActive = dayNum === manualActiveDayIdx || (manualActiveDayIdx === undefined && idx === 0);
                  const count = day.exercises ? day.exercises.length : 0;
                  const dayName = getDayName(dayNum);
                  const cleanFocus = day.isRestDay
                    ? (lang === 'en' ? 'Rest' : 'راحة')
                    : (day.focusArea
                        ? (day.focusArea.split('،')[0]?.split(',')[0]?.split('&')[0]?.trim() || (lang === 'en' ? 'Workout' : 'تمرين'))
                        : (lang === 'en' ? 'Workout' : 'تمرين'));

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => {
                        setManualActiveDayIdx(dayNum);
                        setManualRowSuggestions(null);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-card-hover)',
                        color: isActive ? 'var(--primary-contrast, #050710)' : (day.isRestDay ? 'var(--text-muted)' : 'var(--text-primary)'),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        minWidth: '130px',
                        maxWidth: '170px',
                        flex: '0 0 auto',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 16px var(--primary-glow)' : 'none',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                        <span style={{ fontWeight: '900' }}>{lang === 'en' ? `Day ${dayNum}` : `اليوم ${dayNum}`}</span>
                        {day.isRestDay ? (
                          <span style={{ fontSize: '12px' }}>💤</span>
                        ) : (
                          <span style={{
                            background: isActive ? 'rgba(0,0,0,0.25)' : 'var(--border-color)',
                            color: isActive ? '#fff' : 'var(--primary)',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            fontSize: '10.5px',
                            fontWeight: '800',
                            whiteSpace: 'nowrap',
                          }}>
                            {count} {lang === 'en' ? 'ex' : 'تمارين'}
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '11px',
                        opacity: isActive ? 0.95 : 0.7,
                        width: '100%',
                        maxWidth: '145px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        textAlign: 'center',
                      }}>
                        {dayName} • {cleanFocus}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Day Card Editor */}
            {(() => {
              const safeIndex = Math.max(0, manualDays.findIndex(d => (d.dayIndex || 1) === manualActiveDayIdx));
              const dayIdx = safeIndex !== -1 && safeIndex < manualDays.length ? safeIndex : 0;
              const currentDay = manualDays[dayIdx] || manualDays[0];

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
                  category: 'MAIN',
                  restSeconds: 60,
                });
                setManualDays(updated);
              };

              const duplicateExercise = (exIdx: number) => {
                const updated = [...manualDays];
                const item = JSON.parse(JSON.stringify(updated[dayIdx].exercises[exIdx]));
                updated[dayIdx].exercises.splice(exIdx + 1, 0, item);
                setManualDays(updated);
              };

              const removeExercise = (exIdx: number) => {
                const updated = [...manualDays];
                updated[dayIdx].exercises.splice(exIdx, 1);
                setManualDays(updated);
                setManualRowSuggestions(null);
              };

              const moveExerciseUp = (exIdx: number) => {
                if (exIdx === 0) return;
                const updated = [...manualDays];
                const item = updated[dayIdx].exercises.splice(exIdx, 1)[0];
                updated[dayIdx].exercises.splice(exIdx - 1, 0, item);
                setManualDays(updated);
                setManualRowSuggestions(null);
              };

              const moveExerciseDown = (exIdx: number) => {
                if (exIdx >= manualDays[dayIdx].exercises.length - 1) return;
                const updated = [...manualDays];
                const item = updated[dayIdx].exercises.splice(exIdx, 1)[0];
                updated[dayIdx].exercises.splice(exIdx + 1, 0, item);
                setManualDays(updated);
                setManualRowSuggestions(null);
              };

              const updateExercise = (exIdx: number, field: string, val: any) => {
                const updated = [...manualDays];
                const currentEx = updated[dayIdx].exercises[exIdx];
                const nextEx = { ...currentEx, [field]: val };
                if (field === 'reps') {
                  const s = String(val).toLowerCase();
                  if (s.includes('s') || s.includes('min') || s.includes('ثانية') || s.includes('دقيق')) {
                    nextEx.isTimed = true;
                  }
                }
                updated[dayIdx].exercises[exIdx] = nextEx;
                setManualDays(updated);
              };

              const handleRowNameSearch = (val: string, exIdx: number) => {
                updateExercise(exIdx, 'name', val);
                const trimmed = val.trim();
                if (trimmed.length >= 1) {
                  api.searchExercises(trimmed, 8).then((matches) => {
                    setManualRowSuggestions({ dayIdx, exIdx, list: matches });
                  });
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

              const duplicateCurrentDayAsNew = () => {
                if (manualDays.length >= 7) {
                  alert(lang === 'en' ? 'Maximum 7 days reached.' : 'وصلت للحد الأقصى المسموح (7 أيام).');
                  return;
                }
                const nextDayNum = manualDays.length + 1;
                const cloned = {
                  dayIndex: nextDayNum,
                  title: `${currentDay.title} (نسخة)`,
                  focusArea: currentDay.focusArea,
                  isRestDay: currentDay.isRestDay,
                  exercises: JSON.parse(JSON.stringify(currentDay.exercises || [])),
                };
                setManualDays([...manualDays, cloned]);
                setManualActiveDayIdx(nextDayNum);
                alert(lang === 'en' ? `Day duplicated as Day ${nextDayNum}!` : `تم نسخ اليوم بنجاح كـ اليوم ${nextDayNum}!`);
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

              // Compute weekly muscle volume
              const weeklyVolume: Record<string, { sets: number; ar: string; en: string }> = {
                chest: { sets: 0, ar: 'صدر', en: 'Chest' },
                back: { sets: 0, ar: 'ظهر', en: 'Back' },
                shoulders: { sets: 0, ar: 'أكتاف', en: 'Shoulders' },
                legs: { sets: 0, ar: 'أرجل', en: 'Legs' },
                arms: { sets: 0, ar: 'ذراعين', en: 'Arms' },
                core: { sets: 0, ar: 'بطن وكور', en: 'Core' },
              };

              manualDays.forEach((d) => {
                if (d.isRestDay || !d.exercises) return;
                d.exercises.forEach((ex: any) => {
                  const s = parseInt(String(ex.sets)) || 3;
                  const m = (ex.targetMuscle || '').toLowerCase();
                  if (m.includes('chest') || m.includes('صدر')) weeklyVolume.chest.sets += s;
                  else if (m.includes('back') || m.includes('ظهر') || m.includes('lats')) weeklyVolume.back.sets += s;
                  else if (m.includes('shoulder') || m.includes('كتف') || m.includes('أكتاف') || m.includes('delts')) weeklyVolume.shoulders.sets += s;
                  else if (m.includes('leg') || m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('أرجل') || m.includes('فخذ') || m.includes('squat')) weeklyVolume.legs.sets += s;
                  else if (m.includes('bicep') || m.includes('tricep') || m.includes('باي') || m.includes('تراي') || m.includes('arm')) weeklyVolume.arms.sets += s;
                  else if (m.includes('abs') || m.includes('core') || m.includes('بطن') || m.includes('plank')) weeklyVolume.core.sets += s;
                });
              });

              return (
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Current Active Day Header & Navigation */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'var(--bg-card-hover)',
                    padding: '12px 18px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>📌</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>
                          {lang === 'en'
                            ? `Currently Editing: Day ${currentDay.dayIndex || dayIdx + 1} (${getDayName(currentDay.dayIndex || dayIdx + 1)})`
                            : `أنت تعدل حالياً: اليوم ${currentDay.dayIndex || dayIdx + 1} (${getDayName(currentDay.dayIndex || dayIdx + 1)})`}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {currentDay.isRestDay ? (lang === 'en' ? '🛌 Rest & Recovery Day' : '🛌 يوم مخصص للراحة والاستشفاء') : `🏋️ ${currentDay.title || 'تمارين اليوم'}`}
                        </span>
                      </div>
                    </div>

                    {/* Navigation buttons: Prev / Duplicate / Next */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={duplicateCurrentDayAsNew}
                        className="secondary-btn"
                        style={{
                          padding: '7px 12px',
                          fontSize: '12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="نسخ هذا اليوم التدريبي بالكامل كـ يوم إضافي في الجدول"
                      >
                        <Copy size={13} />
                        <span>{lang === 'en' ? 'Clone as New Day' : 'تكرار كـ يوم جديد 📋'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={dayIdx === 0}
                        onClick={() => setManualActiveDayIdx(manualDays[dayIdx - 1]?.dayIndex || dayIdx)}
                        className="secondary-btn"
                        style={{
                          padding: '7px 14px',
                          fontSize: '12.5px',
                          borderRadius: '8px',
                          opacity: dayIdx === 0 ? 0.35 : 1,
                          cursor: dayIdx === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{lang === 'ar' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}{lang === 'en' ? 'Prev Day' : 'اليوم السابق'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={dayIdx >= manualDays.length - 1}
                        onClick={() => setManualActiveDayIdx(manualDays[dayIdx + 1]?.dayIndex || (dayIdx + 2))}
                        className="secondary-btn"
                        style={{
                          padding: '7px 14px',
                          fontSize: '12.5px',
                          borderRadius: '8px',
                          opacity: dayIdx >= manualDays.length - 1 ? 0.35 : 1,
                          cursor: dayIdx >= manualDays.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{lang === 'en' ? 'Next Day' : 'اليوم التالي'}{lang === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Weekly Muscle Volume Breakdown */}
                  <div style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📊 {lang === 'en' ? 'Live Weekly Muscle Volume & Sets:' : 'تحليل الحجم العضلي الأسبوعي (مجموع الجولات):'}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {lang === 'en' ? '🟢 Optimal: 10-20 sets/week' : '🟢 النطاق المثالي للضخامة: 10-20 جولة/أسبوع'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(weeklyVolume).map(([k, v]) => {
                        const isOptimal = v.sets >= 10 && v.sets <= 20;
                        const isHigh = v.sets > 20;
                        const isLow = v.sets > 0 && v.sets < 10;
                        const badgeColor = isOptimal ? '#10b981' : isHigh ? '#f59e0b' : isLow ? '#38bdf8' : '#64748b';
                        const badgeBg = isOptimal ? 'rgba(16, 185, 129, 0.12)' : isHigh ? 'rgba(245, 158, 11, 0.12)' : isLow ? 'rgba(56, 189, 248, 0.12)' : 'rgba(100, 116, 139, 0.12)';
                        const label = lang === 'en' ? v.en : v.ar;

                        return (
                          <div
                            key={k}
                            style={{
                              background: badgeBg,
                              border: `1px solid ${badgeColor}40`,
                              borderRadius: '10px',
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '11.5px',
                            }}
                          >
                            <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
                            <span style={{ fontWeight: '800', color: badgeColor }}>
                              {v.sets} {lang === 'en' ? 'sets' : 'جولات'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Active Day Target Muscles & Estimated Duration / Burn Banner */}
                  {(() => {
                    const activeMuscles = Array.from(new Set(
                      (currentDay.exercises || [])
                        .map((e: any) => e.targetMuscle)
                        .filter(Boolean)
                    ));
                    const totalDaySets = (currentDay.exercises || []).reduce((sum: number, e: any) => sum + (parseInt(String(e.sets)) || 3), 0);
                    const estMinutes = currentDay.isRestDay ? 0 : Math.max(15, Math.round(totalDaySets * 2.5 + ((currentDay.exercises || []).length > 0 ? 5 : 0)));
                    const estCalories = Math.round(estMinutes * 7.5);

                    return (
                      <div style={{
                        background: 'var(--bg-card-hover)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🧬 {lang === 'en' ? 'Day Target Muscles:' : 'العضلات المستهدفة اليوم:'}
                          </span>
                          {activeMuscles.length > 0 ? (
                            activeMuscles.map((m: any) => (
                              <span key={m} style={{
                                background: 'rgba(0, 210, 255, 0.15)',
                                border: '1px solid rgba(0, 210, 255, 0.35)',
                                color: 'var(--text-primary)',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '8px'
                              }}>
                                {m}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              {lang === 'en' ? 'No exercises added yet' : 'لم تتم إضافة تمارين بعد'}
                            </span>
                          )}
                        </div>

                        {!currentDay.isRestDay && (currentDay.exercises || []).length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              ⏱️ {lang === 'en' ? `Est. Duration: ~${estMinutes} min` : `المدة التقديرية: ~${estMinutes} دقيقة`}
                            </span>
                            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🔥 {lang === 'en' ? `~${estCalories} kcal` : `~${estCalories} سعرة`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

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
                          background: 'var(--bg-card-hover)',
                          border: '1px solid var(--border-color)',
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
                            style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="إضافة تمارين إحماء مخصصة لهذا اليوم"
                          >
                            <span>🔥 + {lang === 'en' ? 'Warmup' : 'إحماء'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={injectCooldown}
                            className="secondary-btn"
                            style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
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
                            onClick={() => {
                              setPickerMuscle('ALL');
                              setPickerEquipment('ALL');
                              setPickerQuery('');
                              setShowExercisePickerModal({ dayIdx });
                            }}
                            className="glow-btn"
                            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            title="فتح مكتبة التمارين التفاعلية المصورة لاختيار التمارين بسهولة"
                          >
                            <Search size={13} />
                            <span>{lang === 'en' ? 'Visual Picker (+4,100) ⚡' : 'تصفح واختيار من المكتبة (+4,100) ⚡'}</span>
                          </button>

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

                      {/* Quick 1-Click Recommended Exercises based on Day Focus */}
                      {(() => {
                        const f = (currentDay.focusArea || currentDay.title || '').toLowerCase();
                        let recs = [
                          { name_ar: 'بنش برس مستوي بالبار', name_en: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
                          { name_ar: 'تفتيح صدر بالدمبلز', name_en: 'Dumbbell Flyes', muscle: 'Chest', equipment: 'Dumbbells' },
                          { name_ar: 'سحب ظهر عالي (لاتس)', name_en: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
                          { name_ar: 'سكوات بالبار', name_en: 'Barbell Squat', muscle: 'Quadriceps', equipment: 'Barbell' },
                          { name_ar: 'بايسبس كيرل دمبلز', name_en: 'Dumbbell Bicep Curl', muscle: 'Biceps', equipment: 'Dumbbells' },
                          { name_ar: 'ترايسبس حبل بالكيبل', name_en: 'Tricep Rope Pushdown', muscle: 'Triceps', equipment: 'Cable' },
                        ];

                        if (f.includes('chest') || f.includes('صدر') || f.includes('push') || f.includes('دفع')) {
                          recs = [
                            { name_ar: 'بنش برس مستوي بالبار', name_en: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
                            { name_ar: 'بنش مائل بالدمبلز', name_en: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbells' },
                            { name_ar: 'تفتيح وتجميع بالكيبل', name_en: 'Cable Chest Fly', muscle: 'Chest', equipment: 'Cable' },
                            { name_ar: 'ترايسبس بالكيبل لأسفل', name_en: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable' },
                            { name_ar: 'ضغط متوازي للصدر (ديبس)', name_en: 'Chest Dips', muscle: 'Chest', equipment: 'Bodyweight' },
                          ];
                        } else if (f.includes('back') || f.includes('ظهر') || f.includes('pull') || f.includes('سحب')) {
                          recs = [
                            { name_ar: 'سحب عالي للظهر (لاتس)', name_en: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
                            { name_ar: 'تجديف بالبار منحني (رو)', name_en: 'Bent-Over Barbell Row', muscle: 'Back', equipment: 'Barbell' },
                            { name_ar: 'سحب أرضي بالكيبل (سيتد رو)', name_en: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable' },
                            { name_ar: 'بايسبس كيرل بالدمبلز', name_en: 'Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbells' },
                            { name_ar: 'سحب فيس بول للكتف الخلفي', name_en: 'Face Pulls', muscle: 'Shoulders', equipment: 'Cable' },
                          ];
                        } else if (f.includes('leg') || f.includes('أرجل') || f.includes('سفلي')) {
                          recs = [
                            { name_ar: 'سكوات خلفي بالبار', name_en: 'Barbell Back Squat', muscle: 'Quadriceps', equipment: 'Barbell' },
                            { name_ar: 'دفع أرجل بجهاز المكبس', name_en: 'Leg Press', muscle: 'Quadriceps', equipment: 'Machine' },
                            { name_ar: 'ديدليفت روماني (أرجل خلفية)', name_en: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell' },
                            { name_ar: 'فرد أرجل أمامي بالجهاز', name_en: 'Leg Extension', muscle: 'Quadriceps', equipment: 'Machine' },
                            { name_ar: 'رفع السمانة واقفاً', name_en: 'Standing Calf Raise', muscle: 'Calves', equipment: 'Machine' },
                          ];
                        } else if (f.includes('shoulder') || f.includes('كتف') || f.includes('أكتاف') || f.includes('ذراع')) {
                          recs = [
                            { name_ar: 'ضغط أكتاف بالدمبلز جالس', name_en: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbells' },
                            { name_ar: 'رفرفة كتف جانبي بالدمبلز', name_en: 'Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbells' },
                            { name_ar: 'بايسبس هامر كيرل بالدمبلز', name_en: 'Hammer Curls', muscle: 'Biceps', equipment: 'Dumbbells' },
                            { name_ar: 'ترايسبس بالبار المتعرج (سكال كراشر)', name_en: 'Skullcrushers', muscle: 'Triceps', equipment: 'Barbell' },
                          ];
                        }

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: 'var(--bg-card-hover)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              💡 {lang === 'en' ? 'Quick 1-Click Add:' : 'إضافة سريعة بنقرة واحدة 💡:'}
                            </span>
                            {recs.map((rec, rIdx) => (
                              <button
                                key={rIdx}
                                type="button"
                                onClick={() => {
                                  const updated = [...manualDays];
                                  updated[dayIdx].exercises.push({
                                    name: lang === 'en' ? rec.name_en : rec.name_ar,
                                    targetMuscle: rec.muscle,
                                    weight: rec.equipment,
                                    sets: 3,
                                    reps: '10-12',
                                    restSeconds: 60,
                                  });
                                  setManualDays(updated);
                                }}
                                className="secondary-btn"
                                style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '8px' }}
                                title={lang === 'en' ? `Click to add ${rec.name_en} to this day` : `انقر لإضافة ${rec.name_ar} لهذا اليوم فوراً`}
                              >
                                <span>+ {lang === 'en' ? rec.name_en : rec.name_ar}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })()}

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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                          {currentDay.exercises.map((ex, exIdx) => {
                            const isSugActive = manualRowSuggestions && manualRowSuggestions.dayIdx === dayIdx && manualRowSuggestions.exIdx === exIdx;
                            const isTimed = (ex as any).isTimed || (typeof ex.reps === 'string' && (ex.reps.includes('s') || ex.reps.includes('m') || ex.reps.includes('sec') || ex.reps.includes('ثانية') || ex.reps.includes('دقيقة')));
                            const rawCat = (ex as any).category ? String((ex as any).category).trim().toUpperCase() : '';
                            const role = (rawCat === 'WARMUP' || rawCat === 'WARM_UP' || rawCat === 'WARM-UP' || (rawCat === '' && ex.name && (ex.name.includes('إحماء') || ex.name.toLowerCase().includes('warmup') || ex.name.toLowerCase().includes('warm-up'))))
                              ? 'WARMUP'
                              : (rawCat === 'COOLDOWN' || rawCat === 'RECOVERY' || rawCat === 'STRETCH' || (rawCat === '' && ex.name && (ex.name.includes('استشفاء') || ex.name.includes('إطالة'))))
                              ? 'COOLDOWN'
                              : (rawCat === 'SUPERSET' || rawCat === 'DROIPSET')
                              ? 'SUPERSET'
                              : (rawCat === 'CARDIO' || rawCat === 'HIIT')
                              ? 'CARDIO'
                              : 'MAIN';

                            const roleStyles = {
                              MAIN: { label: lang === 'en' ? '🏋️ Main Lift' : '🏋️ أساسي', color: 'var(--primary)', bg: 'rgba(204, 255, 0, 0.12)', border: 'var(--primary)' },
                              WARMUP: { label: lang === 'en' ? '🔥 Warm-up' : '🔥 إحماء', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b' },
                              COOLDOWN: { label: lang === 'en' ? '🧊 Recovery' : '🧊 استشفاء', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4' },
                              SUPERSET: { label: lang === 'en' ? '⚡ Superset' : '⚡ سوبر سيت', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', border: '#ec4899' },
                              CARDIO: { label: lang === 'en' ? '⏱️ Cardio' : '⏱️ كارديو', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981' },
                            }[role as string] || { label: '🏋️ أساسي', color: 'var(--primary)', bg: 'rgba(204, 255, 0, 0.12)', border: 'var(--primary)' };

                            return (
                              <div
                                key={exIdx}
                                className="glass-card"
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                  padding: '14px 16px',
                                  borderRadius: '16px',
                                  border: `1px solid var(--border-color)`,
                                  transition: 'all 0.2s ease',
                                  width: '100%',
                                }}
                              >
                                {/* Top Bar: Index Number, Role Selector Dropdown, Timed Badge, and Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '8px',
                                      background: 'var(--border-color)',
                                      color: 'var(--text-primary)',
                                      fontSize: '12px',
                                      fontWeight: '900',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}>
                                      #{exIdx + 1}
                                    </span>

                                    <select
                                      value={role}
                                      onChange={(e) => updateExercise(exIdx, 'category', e.target.value)}
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '11.5px',
                                        fontWeight: '800',
                                        borderRadius: '20px',
                                        background: roleStyles.bg,
                                        color: roleStyles.color,
                                        border: `1px solid ${roleStyles.border}`,
                                        cursor: 'pointer',
                                        outline: 'none',
                                      }}
                                    >
                                      <option value="MAIN">🏋️ تمرين أساسي (Main Lift)</option>
                                      <option value="WARMUP">🔥 إحماء وتفعيل (Warm-up)</option>
                                      <option value="COOLDOWN">🧊 استشفاء وإطالة (Recovery)</option>
                                      <option value="SUPERSET">⚡ سوبر سيت / دروب سيت</option>
                                      <option value="CARDIO">⏱️ كارديو ولياقة (Cardio)</option>
                                    </select>

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
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        border: isTimed ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                        background: isTimed ? 'rgba(0, 210, 255, 0.15)' : 'var(--bg-card-hover)',
                                        color: isTimed ? 'var(--primary)' : 'var(--text-secondary)',
                                      }}
                                      title={isTimed ? 'التبديل إلى تكرار عادي' : 'التبديل إلى مؤقت زمني'}
                                    >
                                      {isTimed ? <Timer size={12} /> : <span>🔢</span>}
                                      <span>{isTimed ? (lang === 'en' ? 'Timed' : 'مؤقت') : (lang === 'en' ? 'Reps' : 'تكرار')}</span>
                                    </button>
                                  </div>

                                  {/* Action Controls: Smart Swap, Duplicate, Reorder, Delete */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setManualSwapTarget({ dayIdx, exIdx, exercise: ex });
                                        setManualSwapQuery('');
                                      }}
                                      className="secondary-btn"
                                      style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}
                                      title={lang === 'en' ? 'Smart Exercise Alternative Swap 🔄' : 'المبادلة الذكية للتمرين (بدائل فورية) 🔄'}
                                    >
                                      <span>🔄 {lang === 'en' ? 'Swap' : 'تبديل'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => duplicateExercise(exIdx)}
                                      className="secondary-btn"
                                      style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                      title="تكرار التمرين"
                                    >
                                      <Copy size={12} />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={exIdx === 0}
                                      onClick={() => moveExerciseUp(exIdx)}
                                      className="secondary-btn"
                                      style={{ padding: '5px 6px', fontSize: '11.5px', borderRadius: '8px', opacity: exIdx === 0 ? 0.3 : 1 }}
                                      title="تقديم التمرين لأعلى"
                                    >
                                      <ChevronUp size={12} />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={exIdx >= currentDay.exercises.length - 1}
                                      onClick={() => moveExerciseDown(exIdx)}
                                      className="secondary-btn"
                                      style={{ padding: '5px 6px', fontSize: '11.5px', borderRadius: '8px', opacity: exIdx >= currentDay.exercises.length - 1 ? 0.3 : 1 }}
                                      title="تأخير التمرين لأسفل"
                                    >
                                      <ChevronDown size={12} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => removeExercise(exIdx)}
                                      className="secondary-btn"
                                      style={{ padding: '5px 7px', fontSize: '11.5px', borderRadius: '8px', color: '#ef4444' }}
                                      title="حذف التمرين"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* Exercise Name Input with Autocomplete */}
                                <div style={{ position: 'relative', width: '100%' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="text"
                                      value={ex.name}
                                      onChange={(e) => handleRowNameSearch(e.target.value, exIdx)}
                                      onFocus={() => ex.name && handleRowNameSearch(ex.name, exIdx)}
                                      placeholder={lang === 'en' ? 'Search 4,100+ exercises (e.g. Bench Press, Squat...)' : 'ابحث في +4,100 تمرين (مثال: بنش برس، سكوات، بايسبس...)'}
                                      className="input-field"
                                      style={{
                                        fontSize: '13.5px',
                                        fontWeight: '700',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        width: '100%',
                                      }}
                                    />
                                  </div>

                                  {/* Dropdown Suggestions */}
                                  {isSugActive && manualRowSuggestions.list.length > 0 && (
                                    <div
                                      className="glass-card"
                                      style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                        borderRadius: '12px',
                                        border: '1px solid var(--primary)',
                                        background: 'var(--bg-card)',
                                        boxShadow: '0 12px 35px rgba(0,0,0,0.85)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                      }}
                                    >
                                      {manualRowSuggestions.list.map((sug) => {
                                        const isCardioOrHold = (sug.name_en && (sug.name_en.toLowerCase().includes('plank') || sug.name_en.toLowerCase().includes('run') || sug.name_en.toLowerCase().includes('treadmill') || sug.name_en.toLowerCase().includes('rower') || sug.name_en.toLowerCase().includes('jump') || sug.name_en.toLowerCase().includes('hold')));
                                        return (
                                          <div
                                            key={sug.id || sug.name_en}
                                            onClick={() => selectRowSuggestion(sug, exIdx)}
                                            style={{
                                              padding: '10px 14px',
                                              cursor: 'pointer',
                                              borderBottom: '1px solid var(--border-color)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                          >
                                            <div>
                                              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
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
                                                <span style={{ fontSize: '10px', background: 'var(--bg-card-hover)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '6px' }}>
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

                                {/* Row 2: Fluid Parameters Grid (Muscle, Equipment, Sets, Reps, Rest Interval) */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                  gap: '10px',
                                  alignItems: 'center',
                                  width: '100%',
                                }}>
                                  {/* Muscle Target */}
                                  <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                                      🎯 {lang === 'en' ? 'Muscle Target:' : 'العضلة المستهدفة:'}
                                    </label>
                                    <select
                                      value={normalizeTargetMuscle(ex.targetMuscle)}
                                      onChange={(e) => updateExercise(exIdx, 'targetMuscle', e.target.value)}
                                      className="input-field"
                                      style={{ padding: '8px 10px', fontSize: '12px', width: '100%', borderRadius: '8px' }}
                                    >
                                      <option value="Chest">الصدر (Chest)</option>
                                      <option value="Back">الظهر (Back / Lats)</option>
                                      <option value="Shoulders">الأكتاف (Shoulders)</option>
                                      <option value="Quadriceps">الأرجل الأمامية (Quads)</option>
                                      <option value="Hamstrings">الأرجل الخلفية (Hamstrings)</option>
                                      <option value="Biceps">البايسبس (Biceps)</option>
                                      <option value="Triceps">الترايسبس (Triceps)</option>
                                      <option value="Abs">عضلات البطن والكور (Abs)</option>
                                      <option value="Calves">السمانة (Calves)</option>
                                      <option value="Cardio">كارديو ولياقة (Cardio)</option>
                                      <option value="Full Body">كامل الجسم (Full Body)</option>
                                    </select>
                                  </div>

                                  {/* Equipment */}
                                  <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                                      🏋️ {lang === 'en' ? 'Equipment:' : 'الأداة المستخدمة:'}
                                    </label>
                                    <select
                                      value={normalizeEquipment(ex.weight)}
                                      onChange={(e) => updateExercise(exIdx, 'weight', e.target.value)}
                                      className="input-field"
                                      style={{ padding: '8px 10px', fontSize: '12px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                                    >
                                      <option value="Barbell" style={{ background: '#0f172a' }}>بار حديد (Barbell)</option>
                                      <option value="Dumbbells" style={{ background: '#0f172a' }}>دمبلز (Dumbbells)</option>
                                      <option value="Cable" style={{ background: '#0f172a' }}>كيبل (Cable)</option>
                                      <option value="Machine" style={{ background: '#0f172a' }}>أجهزة (Machine)</option>
                                      <option value="Bodyweight" style={{ background: '#0f172a' }}>وزن الجسم (Bodyweight)</option>
                                      <option value="Cardio Machine" style={{ background: '#0f172a' }}>جهاز كارديو (Cardio)</option>
                                    </select>
                                  </div>

                                  {/* Sets Controls */}
                                  <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                                      🔢 {lang === 'en' ? 'Sets:' : 'الجولات:'}
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <button
                                        type="button"
                                        onClick={() => updateExercise(exIdx, 'sets', Math.max(1, (parseInt(String(ex.sets)) || 3) - 1))}
                                        style={{ width: '28px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={ex.sets}
                                        onChange={(e) => updateExercise(exIdx, 'sets', parseInt(e.target.value) || 3)}
                                        className="input-field"
                                        style={{ padding: '6px 2px', fontSize: '12.5px', width: '40px', textAlign: 'center', borderRadius: '6px', fontWeight: 'bold' }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => updateExercise(exIdx, 'sets', (parseInt(String(ex.sets)) || 3) + 1)}
                                        style={{ width: '28px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Reps or Time Duration */}
                                  <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                                      ⏱️ {isTimed ? (lang === 'en' ? 'Duration:' : 'المدة الزمنية:') : (lang === 'en' ? 'Reps:' : 'التكرار:')}
                                    </label>
                                    {isTimed ? (
                                      <select
                                        value={normalizeTimedReps(ex.reps)}
                                        onChange={(e) => updateExercise(exIdx, 'reps', e.target.value)}
                                        className="input-field"
                                        style={{ padding: '7px 6px', fontSize: '12px', width: '100%', borderRadius: '8px', background: 'rgba(0, 210, 255, 0.08)', color: 'var(--primary)', fontWeight: 'bold' }}
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
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        placeholder="10-12"
                                        value={ex.reps}
                                        onChange={(e) => updateExercise(exIdx, 'reps', e.target.value)}
                                        className="input-field"
                                        style={{ padding: '7px 8px', fontSize: '12px', width: '100%', textAlign: 'center', borderRadius: '8px', fontWeight: 'bold' }}
                                      />
                                    )}
                                  </div>

                                  {/* Rest Interval Selector */}
                                  <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
                                      💤 {lang === 'en' ? 'Rest Time:' : 'راحة الجولة:'}
                                    </label>
                                    <select
                                      value={normalizeRestSeconds((ex as any).restSeconds)}
                                      onChange={(e) => updateExercise(exIdx, 'restSeconds', parseInt(e.target.value) || 60)}
                                      className="input-field"
                                      style={{ padding: '7px 8px', fontSize: '12px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}
                                    >
                                      <option value="30" style={{ background: '#0f172a' }}>30 ثانية</option>
                                      <option value="45" style={{ background: '#0f172a' }}>45 ثانية</option>
                                      <option value="60" style={{ background: '#0f172a' }}>60 ثانية (1 دقيقة)</option>
                                      <option value="90" style={{ background: '#0f172a' }}>90 ثانية (1.5 دقيقة)</option>
                                      <option value="120" style={{ background: '#0f172a' }}>120 ثانية (2 دقيقة)</option>
                                      <option value="180" style={{ background: '#0f172a' }}>180 ثانية (3 دقائق)</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Row 3: 1-Click Fast Reps Preset Pills */}
                                {!isTimed && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '2px' }}>
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                      ⚡ {lang === 'en' ? 'Quick Reps Preset:' : 'تكرار سريع بنقرة:'}
                                    </span>
                                    {[
                                      { label: '8-10 (ضخامة عضلية)', val: '8-10' },
                                      { label: '10-12 (توازن مثالي)', val: '10-12' },
                                      { label: '12-15 (تحمل وضخ)', val: '12-15' },
                                      { label: '4-6 (قوة قصوى)', val: '4-6' },
                                      { label: '15-20 (حرق ونحت)', val: '15-20' },
                                    ].map((preset, pIdx) => (
                                      <button
                                        key={pIdx}
                                        type="button"
                                        onClick={() => updateExercise(exIdx, 'reps', preset.val)}
                                        style={{
                                          background: ex.reps === preset.val ? 'rgba(0, 210, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                                          border: ex.reps === preset.val ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                                          color: ex.reps === preset.val ? 'var(--primary)' : 'var(--text-secondary)',
                                          borderRadius: '12px',
                                          padding: '2px 8px',
                                          fontSize: '10.5px',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                        }}
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
                    const saved = await api.saveStructuredPlan({
                      id: manualEditingPlanId || undefined,
                      title: manualTitle,
                      days: manualDays,
                      dayWorkouts: manualDays,
                    }, lang);
                    setActivePlan(saved);
                    cacheStore.set('active_plan', saved);
                    setSelectedDayIndex(1);
                    alert(lang === 'en' ? 'Custom workout plan saved and activated! ⚡' : 'تم حفظ وتفعيل جدولك الرياضي اليدوي بنجاح! ⚡');
                    setShowManualBuilder(false);
                    fetchHistory();
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

      {/* Smart Exercise Alternative Swap Modal */}
      {manualSwapTarget && (
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
          onClick={() => {
            setManualSwapTarget(null);
            setManualSwapQuery('');
          }}
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
            {/* Swap Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔄</span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    {lang === 'en' ? 'Smart Exercise Alternative Swap' : 'المبادلة الذكية لبدائل التمارين 🔄'}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {lang === 'en' ? `Target Muscle: ${manualSwapTarget.exercise.targetMuscle || 'Muscle'}` : `العضلة المستهدفة: ${manualSwapTarget.exercise.targetMuscle || 'تمرين'}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setManualSwapTarget(null);
                  setManualSwapQuery('');
                }}
                className="secondary-btn"
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Current Exercise Badge */}
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>
                  {lang === 'en' ? 'CURRENT EXERCISE TO REPLACE:' : 'التمرين الحالي المراد استبداله:'}
                </span>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {manualSwapTarget.exercise.name || (lang === 'en' ? 'Empty Slot' : 'تمرين فارغ')}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {manualSwapTarget.exercise.sets} × {manualSwapTarget.exercise.reps}
              </span>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search alternative exercise...' : 'ابحث عن تمرين بديل مخصص...'}
              value={manualSwapQuery}
              onChange={(e) => setManualSwapQuery(e.target.value)}
              className="input-field"
              style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }}
              autoFocus
            />

            {/* Alternatives List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {(() => {
                const targetM = (manualSwapTarget.exercise.targetMuscle || '').toLowerCase().trim();
                const q = manualSwapQuery.toLowerCase().trim()
                  .replace(/[أإآ]/g, 'ا')
                  .replace(/ة/g, 'ه')
                  .replace(/ى/g, 'ي');

                let alts = libraryExercises || [];
                if (q) {
                  alts = alts.filter(ex => {
                    const nameAr = (ex.name_ar || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
                    const nameEn = (ex.name_en || ex.name || '').toLowerCase();
                    const muscleAr = (ex.muscle_ar || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
                    const muscleEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
                    return nameAr.includes(q) || nameEn.includes(q) || muscleAr.includes(q) || muscleEn.includes(q);
                  });
                } else if (targetM) {
                  alts = alts.filter(ex => {
                    const muscleEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
                    const muscleAr = (ex.muscle_ar || '').toLowerCase();
                    return muscleEn.includes(targetM) || targetM.includes(muscleEn) || muscleAr.includes(targetM);
                  });
                }

                if (alts.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {lang === 'en' ? 'No alternatives found. Type a name to search.' : 'لا توجد بدائل مباشرة. اكتب اسم التمرين في مربع البحث أعلاه.'}
                    </div>
                  );
                }

                return alts.slice(0, 15).map((altEx, idx) => {
                  const altName = lang === 'en' ? (altEx.name_en || altEx.name) : (altEx.name_ar || altEx.name_en || altEx.name);
                  const altEquip = lang === 'en' ? (altEx.equipment_en || altEx.equipment) : (altEx.equipment_ar || altEx.equipment_en || altEx.equipment);
                  const altMuscle = lang === 'en' ? (altEx.muscle_en || altEx.targetMuscle) : (altEx.muscle_ar || altEx.muscle_en || altEx.targetMuscle);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const { dayIdx, exIdx } = manualSwapTarget;
                        const updated = [...manualDays];
                        const prevEx = updated[dayIdx].exercises[exIdx];
                        updated[dayIdx].exercises[exIdx] = {
                          ...prevEx,
                          name: altName,
                          targetMuscle: altEx.muscle_en || altEx.targetMuscle || prevEx.targetMuscle,
                          weight: altEx.equipment_en || altEx.equipment || prevEx.weight || 'Dumbbells',
                          imageUrl: altEx.image_url || altEx.imageUrl || '',
                        } as any;
                        setManualDays(updated);
                        setManualSwapTarget(null);
                        setManualSwapQuery('');
                      }}
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
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>
                          {altName}
                        </div>
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
                });
              })()}
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
          handleOpenManualBuilder(null);
        }}
        onOpenManualBuilderForEdit={(plan) => {
          handleOpenManualBuilder(plan);
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

      {/* Routine Card Export Modal */}
      {routineCardDay && (
        <RoutineCardExportModal
          isOpen={Boolean(routineCardDay)}
          lang={lang}
          planTitle={activePlan?.title || (lang === 'en' ? 'BeastMode Routine' : 'جدولي التدريبي')}
          dayTitle={routineCardDay.title}
          dayIndex={routineCardDay.dayIndex || 1}
          focusArea={routineCardDay.focusArea}
          exercises={routineCardDay.exercises || []}
          onClose={() => setRoutineCardDay(null)}
        />
      )}

      {/* Dynamic 3-Min Warmup Modal */}
      {dynamicWarmupDay && (
        <DynamicWarmupModal
          isOpen={Boolean(dynamicWarmupDay)}
          lang={lang}
          focusArea={dynamicWarmupDay.focusArea || ''}
          onClose={() => setDynamicWarmupDay(null)}
        />
      )}

      {/* Interactive Visual Exercise Picker Modal (+4,100 Exercises) */}
      {showExercisePickerModal && (
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
          onClick={() => setShowExercisePickerModal(null)}
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
            {/* Header */}
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
                onClick={() => setShowExercisePickerModal(null)}
                className="secondary-btn"
                style={{ width: '34px', height: '34px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Muscle Category Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'thin' }}>
              {[
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
              ].map((tab) => {
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

            {/* Equipment Filter Chips & Search Bar */}
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

              {/* Equipment Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { key: 'ALL', label: 'الكل' },
                  { key: 'Dumbbells', label: 'دمبلز' },
                  { key: 'Barbell', label: 'بار' },
                  { key: 'Cable', label: 'كيبل' },
                  { key: 'Machine', label: 'أجهزة' },
                  { key: 'Bodyweight', label: 'وزن الجسم' },
                ].map((eq) => {
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

            {/* Visual Exercise Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '12px',
              maxHeight: '440px',
              overflowY: 'auto',
              padding: '4px',
            }}>
              {(() => {
                const q = pickerQuery.toLowerCase().trim()
                  .replace(/[أإآ]/g, 'ا')
                  .replace(/ة/g, 'ه')
                  .replace(/ى/g, 'ي');
                const qWords = q.split(/\s+/).filter(Boolean);

                let list = libraryExercises || [];

                // Filter by Muscle
                if (pickerMuscle !== 'ALL') {
                  const normPickerM = pickerMuscle.toLowerCase();
                  list = list.filter(ex => {
                    const mEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
                    const mAr = (ex.muscle_ar || '').toLowerCase();
                    return mEn.includes(normPickerM) || normPickerM.includes(mEn) || mAr.includes(normPickerM);
                  });
                }

                // Filter by Equipment
                if (pickerEquipment !== 'ALL') {
                  const normPickerEq = pickerEquipment.toLowerCase();
                  list = list.filter(ex => {
                    const eqEn = (ex.equipment_en || ex.equipment || '').toLowerCase();
                    const eqAr = (ex.equipment_ar || '').toLowerCase();
                    return eqEn.includes(normPickerEq) || eqAr.includes(normPickerEq);
                  });
                }

                // Filter by Query
                if (qWords.length > 0) {
                  list = list.filter(ex => {
                    const nameAr = (ex.name_ar || ex.name || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
                    const nameEn = (ex.name_en || ex.name || '').toLowerCase();
                    const muscleAr = (ex.muscle_ar || '').toLowerCase();
                    const muscleEn = (ex.muscle_en || ex.targetMuscle || '').toLowerCase();
                    const combined = `${nameAr} ${nameEn} ${muscleAr} ${muscleEn}`;
                    return qWords.every(w => combined.includes(w));
                  });
                }

                if (list.length === 0) {
                  return (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '32px' }}>🔍</span>
                      <p style={{ margin: '10px 0 0 0', fontSize: '13px' }}>
                        {lang === 'en' ? 'No exercises match your filter. Try changing muscle or search query.' : 'لم نجد تمارين مطابقة للفلتر المحدد. جرب تغيير العضلة أو كتابة اسم آخر.'}
                      </p>
                    </div>
                  );
                }

                return list.slice(0, 40).map((item, idx) => {
                  const nameAr = item.name_ar || item.name_en || item.name;
                  const nameEn = item.name_en || item.name;
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
                        onClick={() => {
                          const { dayIdx, exIdx } = showExercisePickerModal;
                          const updated = [...manualDays];
                          const selectedExData = {
                            name: lang === 'en' ? nameEn : nameAr,
                            targetMuscle: item.muscle_en || item.targetMuscle || 'Chest',
                            weight: item.equipment_en || item.equipment || 'Dumbbells',
                            imageUrl: img,
                            sets: 3,
                            reps: '10-12',
                            restSeconds: 60,
                            exerciseTips: item.instructions_ar || item.instructions_en || '',
                          };

                          if (exIdx !== undefined && updated[dayIdx]?.exercises[exIdx]) {
                            // Update existing row
                            updated[dayIdx].exercises[exIdx] = {
                              ...updated[dayIdx].exercises[exIdx],
                              ...selectedExData,
                            };
                          } else {
                            // Append new exercise
                            if (!updated[dayIdx].exercises) updated[dayIdx].exercises = [];
                            updated[dayIdx].exercises.push(selectedExData);
                          }

                          setManualDays(updated);
                          setShowExercisePickerModal(null);
                        }}
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
                        <span>{showExercisePickerModal.exIdx !== undefined ? (lang === 'en' ? 'Choose This Exercise ⚡' : 'استبدال بهذا التمرين ⚡') : (lang === 'en' ? '+ Add to Routine' : '+ إضافة إلى اليوم التدريبي')}</span>
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

