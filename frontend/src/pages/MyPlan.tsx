import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Edit2, Trash2, ArrowLeftRight, Plus, Upload, History, Sparkles, AlertCircle, Info, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { translations } from '../utils/translations';

interface MyPlanProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
}

export const MyPlan: React.FC<MyPlanProps> = ({ lang, onNavigate }) => {
  const t = translations[lang] || translations.ar;
  const [activePlan, setActivePlan] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Views state
  const [editingExercise, setEditingExercise] = useState<any | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
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

  // Workout Session Player States
  const [sessionDay, setSessionDay] = useState<any | null>(null);
  const [sessionExIdx, setSessionExIdx] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionSetsDone, setSessionSetsDone] = useState<boolean[]>([]);
  const [sessionSetsReps, setSessionSetsReps] = useState<string[]>([]);
  const [sessionSetsWeights, setSessionSetsWeights] = useState<string[]>([]);
  const [sessionLogs, setSessionLogs] = useState<Record<number, { reps: string[]; weights: string[]; completedSets: number }>>({});
  
  // Workout Timer States
  const [sessionRestSeconds, setSessionRestSeconds] = useState(60);
  const [sessionRestDuration, setSessionRestDuration] = useState(60);
  const [sessionIsResting, setSessionIsResting] = useState(false);

  // Workout Summary States
  const [sessionShowSummary, setSessionShowSummary] = useState(false);
  const [sessionSummaryData, setSessionSummaryData] = useState<any | null>(null);

  const [viewingExercise, setViewingExercise] = useState<any | null>(null);
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

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
    setLoading(true);
    setError('');
    try {
      const plan = await api.getActivePlan();
      setActivePlan(plan);
    } catch (err: any) {
      setError(err.message || (lang === 'en' ? 'No active plan loaded.' : 'لم نتمكن من تحميل جدول التمارين النشط.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraryOnce = async () => {
    try {
      const tree = await api.getLibraryTree();
      const list: any[] = [];
      tree.forEach((division: any) => {
        division.children.forEach((muscleGroup: any) => {
          muscleGroup.exercises.forEach((ex: any) => {
            list.push(ex);
          });
        });
      });
      setLibraryExercises(list);
    } catch (err) {
      console.error('Failed to load library for smart fill:', err);
    }
  };

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

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep failed:', e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (sessionIsResting && sessionRestSeconds > 0) {
      interval = setInterval(() => {
        setSessionRestSeconds(prev => prev - 1);
      }, 1000);
    } else if (sessionIsResting && sessionRestSeconds === 0) {
      setSessionIsResting(false);
      playBeep();
    }
    return () => clearInterval(interval);
  }, [sessionIsResting, sessionRestSeconds]);

  const handleStartWorkoutSession = (dw: any) => {
    if (!dw.exercises || dw.exercises.length === 0) {
      alert(lang === 'en' ? 'This day has no exercises to perform.' : 'لا توجد تمارين مضافة في هذا اليوم.');
      return;
    }
    setSessionDay(dw);
    setSessionExIdx(0);
    setSessionStartTime(new Date());
    setSessionShowSummary(false);
    setSessionSummaryData(null);
    setSessionLogs({});
    
    initSessionExerciseSets(dw.exercises[0]);
  };

  const initSessionExerciseSets = (ex: any) => {
    const numSets = ex.sets || 3;
    setSessionSetsDone(new Array(numSets).fill(false));
    
    const targetReps = ex.reps || '10';
    setSessionSetsReps(new Array(numSets).fill(targetReps));

    const targetWeight = ex.weight || 'Bodyweight';
    setSessionSetsWeights(new Array(numSets).fill(targetWeight));

    setSessionIsResting(false);
    setSessionRestSeconds(sessionRestDuration);
  };

  const saveCurrentExerciseLogs = () => {
    if (!sessionDay) return;
    const currentEx = sessionDay.exercises[sessionExIdx];
    const completedSets = sessionSetsDone.filter(Boolean).length;
    const repsList = sessionSetsReps.map((r, i) => sessionSetsDone[i] ? r : '');
    const weightsList = sessionSetsWeights.map((w, i) => sessionSetsDone[i] ? w : '');

    setSessionLogs(prev => ({
      ...prev,
      [currentEx.id]: {
        reps: repsList,
        weights: weightsList,
        completedSets
      }
    }));
  };

  const handleNextExercise = () => {
    saveCurrentExerciseLogs();
    
    if (sessionExIdx < sessionDay.exercises.length - 1) {
      const nextIdx = sessionExIdx + 1;
      setSessionExIdx(nextIdx);
      const nextEx = sessionDay.exercises[nextIdx];
      
      const existing = sessionLogs[nextEx.id];
      if (existing) {
        setSessionSetsDone(nextEx.sets ? new Array(nextEx.sets).fill(false).map((_, i) => existing.reps[i] !== '') : []);
        setSessionSetsReps(existing.reps);
        setSessionSetsWeights(existing.weights);
      } else {
        initSessionExerciseSets(nextEx);
      }
    }
  };

  const handlePrevExercise = () => {
    saveCurrentExerciseLogs();
    
    if (sessionExIdx > 0) {
      const prevIdx = sessionExIdx - 1;
      setSessionExIdx(prevIdx);
      const prevEx = sessionDay.exercises[prevIdx];
      
      const existing = sessionLogs[prevEx.id];
      if (existing) {
        setSessionSetsDone(prevEx.sets ? new Array(prevEx.sets).fill(false).map((_, i) => existing.reps[i] !== '') : []);
        setSessionSetsReps(existing.reps);
        setSessionSetsWeights(existing.weights);
      } else {
        initSessionExerciseSets(prevEx);
      }
    }
  };

  const handleFinishWorkout = async () => {
    if (!sessionDay) return;
    
    const currentEx = sessionDay.exercises[sessionExIdx];
    const completedSets = sessionSetsDone.filter(Boolean).length;
    const repsList = sessionSetsReps.map((r, i) => sessionSetsDone[i] ? r : '');
    const weightsList = sessionSetsWeights.map((w, i) => sessionSetsDone[i] ? w : '');

    const finalLogs = {
      ...sessionLogs,
      [currentEx.id]: {
        reps: repsList,
        weights: weightsList,
        completedSets
      }
    };

    setAiSwapLoading(true);
    try {
      const durationMins = sessionStartTime 
        ? Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000) 
        : 30;

      const logPromises = sessionDay.exercises.map((ex: any) => {
        const log = finalLogs[ex.id];
        if (log && log.completedSets > 0) {
          const repsStr = log.reps.filter(Boolean).join(',');
          const weightsStr = log.weights.filter(Boolean).join(',');
          return api.logProgress(ex.id, {
            completedSets: log.completedSets,
            repsCompleted: repsStr,
            weightUsed: weightsStr,
            notes: `Session duration: ${durationMins} mins`
          });
        }
        return Promise.resolve();
      });

      await Promise.all(logPromises);

      setSessionSummaryData({
        title: sessionDay.title,
        focusArea: sessionDay.focusArea,
        duration: durationMins,
        exercisesCount: sessionDay.exercises.length,
        loggedCount: Object.values(finalLogs).filter((l: any) => l.completedSets > 0).length,
        logs: finalLogs
      });
      setSessionShowSummary(true);
    } catch (err: any) {
      alert(lang === 'en' ? 'Failed to save workout logs.' : 'فشل حفظ وتخزين تفاصيل التمرين.');
    } finally {
      setAiSwapLoading(false);
    }
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

    let list = libraryExercises;
    if (list.length === 0) {
      try {
        const tree = await api.getLibraryTree();
        const flattened: any[] = [];
        tree.forEach((division: any) => {
          division.children.forEach((muscleGroup: any) => {
            muscleGroup.exercises.forEach((ex: any) => {
              flattened.push(ex);
            });
          });
        });
        list = flattened;
        setLibraryExercises(flattened);
      } catch (err) {
        alert(lang === 'en' ? 'Failed to access exercise database.' : 'فشل الاتصال بقاعدة بيانات التمارين.');
        return;
      }
    }

    const searchTerm = exName.trim().toLowerCase();
    const match = list.find((ex: any) => 
      (ex.name_ar && ex.name_ar.toLowerCase() === searchTerm) ||
      (ex.name_en && ex.name_en.toLowerCase() === searchTerm) ||
      (ex.name_ar && ex.name_ar.toLowerCase().includes(searchTerm)) ||
      (ex.name_en && ex.name_en.toLowerCase().includes(searchTerm))
    );

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
        imageUrl: match.image_url || '',
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
    let list = libraryExercises;
    if (list.length === 0) {
      try {
        const tree = await api.getLibraryTree();
        const flattened: any[] = [];
        tree.forEach((division: any) => {
          division.children.forEach((muscleGroup: any) => {
            muscleGroup.exercises.forEach((item: any) => {
              flattened.push(item);
            });
          });
        });
        list = flattened;
        setLibraryExercises(flattened);
      } catch (err) {
        alert(lang === 'en' ? 'Failed to access exercise database.' : 'فشل الاتصال بقاعدة بيانات التمارين.');
        return;
      }
    }

    const searchTerm = ex.name.trim().toLowerCase();
    const match = list.find((item: any) => 
      (item.name_ar && item.name_ar.toLowerCase() === searchTerm) ||
      (item.name_en && item.name_en.toLowerCase() === searchTerm) ||
      (item.name_ar && item.name_ar.toLowerCase().includes(searchTerm)) ||
      (item.name_en && item.name_en.toLowerCase().includes(searchTerm))
    );

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
          imageUrl: match.image_url || null,
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
    setError('');

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
    setError('');
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
      setError(lang === 'en' ? 'Failed to fetch history.' : 'فشل جلب سجل الخطط السابقة.');
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
      setError(lang === 'en' ? 'Failed to activate plan.' : 'فشل تفعيل هذا البرنامج الرياضي.');
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRegeneratePlan} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} />
            {lang === 'en' ? 'Regenerate Plan' : 'إعادة توليد الجدول ⚡'}
          </button>
          <button onClick={handleUpgradePlan} className="glow-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} />
            {lang === 'en' ? 'AI Upgrade (Next Level)' : 'ترقية الذكاء الاصطناعي'}
          </button>
          <button onClick={() => setShowImport(true)} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} />
            {t.importBtn}
          </button>
          <button onClick={() => { setShowHistory(true); fetchHistory(); }} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={16} />
            {t.historyBtn}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          {lang === 'en' ? 'Loading workout schedule...' : 'جاري تحميل جدول التمارين...'}
        </div>
      )}

      {error && !activePlan && (
        <div className="glass-panel text-center" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ opacity: 0.8 }} />
          <h3>{lang === 'en' ? 'No Active Plan Found' : 'لا يوجد جدول رياضي نشط'}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {lang === 'en' 
              ? 'You have not configured a workout routine yet. Let the AI generate one for you now!' 
              : 'لم تقم بتهيئة جدول تمارينك الرياضية بعد. دع الذكاء الاصطناعي يقوم بتوليد جدول تمارين مناسب لك الآن!'}
          </p>
          <button onClick={() => onNavigate('onboarding')} className="glow-btn">
            {lang === 'en' ? 'Create My Plan' : 'إنشاء جدول تمارين جديد'}
          </button>
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
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
                        🎯 {dw.focusArea} | ⏱️ {duration}
                      </p>
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
                      {dw.isRestDay ? (
                        <div style={{ textAlign: 'center', padding: '20px 10px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '36px' }}>🧘‍♂️</span>
                          <h4 style={{ fontWeight: 'bold', margin: 0 }}>{t.restDayTitle}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{t.restDayDesc}</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                                  <img
                                    src={ex.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'}
                                    alt={ex.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#fff' }}>{ex.name}</h4>
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
                            <img src={alt.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'} alt={alt.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  {lang === 'en'
                    ? 'Paste any text, table rows or lists containing your workouts. AI will intelligently extract exercises and days:'
                    : 'الصق أي نصوص أو جداول تمارين منسوخة، وسيتولى الذكاء الاصطناعي تنظيمها وتوزيعها:'}
                </p>

                <textarea
                  className="input-field"
                  rows={8}
                  style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
                  placeholder={lang === 'en' ? "Day 1: Chest & Shoulders\nBench Press - 3 sets - 12 reps\nShoulder Press - 3 sets - 10 reps" : "اليوم 1: دفع (صدر وتراي)\nبنش برس بالبار - 3 جولات - 12 تكرار\nرفرفة جانبي دمبلز - 4 جولات - 15 تكرار"}
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

      {/* WORKOUT SESSION PLAYER OVERLAY */}
      {sessionDay && !sessionShowSummary && (() => {
        const currentEx = sessionDay.exercises[sessionExIdx];
        const isLastEx = sessionExIdx === sessionDay.exercises.length - 1;
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.98)', zIndex: 1200, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ maxWidth: '650px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>
                    ⚡ {lang === 'en' ? 'Active Workout Session' : 'جلسة التمرين النشطة'}
                  </h2>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{sessionDay.title}</span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(lang === 'en' ? 'Are you sure you want to end this workout session? Your progress will not be saved.' : 'هل أنت متأكد من إنهاء جلسة التمرين؟ لن يتم حفظ البيانات.')) {
                      setSessionDay(null);
                    }
                  }}
                  className="secondary-btn"
                  style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                  {lang === 'en' ? 'End Session' : 'إنهاء الجلسة'}
                </button>
              </div>

              {/* Progress Indicator */}
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>{lang === 'en' ? `Exercise ${sessionExIdx + 1} of ${sessionDay.exercises.length}` : `تمرين ${sessionExIdx + 1} من ${sessionDay.exercises.length}`}</span>
                  <span>{Math.round(((sessionExIdx) / sessionDay.exercises.length) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1c1e2d', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${((sessionExIdx + 1) / sessionDay.exercises.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
                </div>
              </div>

              {/* Exercise Card & Sets Logger */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '5px' }}>
                
                {/* Exercise Info Box */}
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '15px', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', background: '#0e111a', flexShrink: 0 }}>
                    <img
                      src={currentEx.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'}
                      alt={currentEx.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{currentEx.name}</h3>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>🎯 {currentEx.targetMuscle}</span>
                      <span>🏋️‍♂️ {currentEx.weight || 'Bodyweight'}</span>
                      <span>🔄 {currentEx.sets} Sets</span>
                    </div>
                  </div>
                </div>

                {/* Sets Logging Table */}
                <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1fr', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>
                    <div>{lang === 'en' ? 'SET' : 'الجولة'}</div>
                    <div>{lang === 'en' ? 'WEIGHT' : 'الوزن'}</div>
                    <div>{lang === 'en' ? 'REPS' : 'التكرار'}</div>
                    <div>{lang === 'en' ? 'STATUS' : 'الحالة'}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {sessionSetsDone.map((done, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1fr', gap: '10px', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: done ? 'var(--primary)' : '#fff' }}>{index + 1}</span>
                        <div>
                          <input
                            type="text"
                            value={sessionSetsWeights[index] || ''}
                            onChange={(e) => {
                              const newWeights = [...sessionSetsWeights];
                              newWeights[index] = e.target.value;
                              setSessionSetsWeights(newWeights);
                            }}
                            disabled={done}
                            placeholder="kg"
                            className="input-field"
                            style={{ padding: '8px', fontSize: '13px', textAlign: 'center', background: done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', borderColor: done ? 'transparent' : 'var(--border-color)' }}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={sessionSetsReps[index] || ''}
                            onChange={(e) => {
                              const newReps = [...sessionSetsReps];
                              newReps[index] = e.target.value;
                              setSessionSetsReps(newReps);
                            }}
                            disabled={done}
                            placeholder="Reps"
                            className="input-field"
                            style={{ padding: '8px', fontSize: '13px', textAlign: 'center', background: done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', borderColor: done ? 'transparent' : 'var(--border-color)' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newDone = [...sessionSetsDone];
                              const newStatus = !newDone[index];
                              newDone[index] = newStatus;
                              setSessionSetsDone(newDone);
                              
                              if (newStatus) {
                                // Auto start rest timer
                                setSessionRestSeconds(sessionRestDuration);
                                setSessionIsResting(true);
                              }
                            }}
                            className={done ? 'glow-btn' : 'secondary-btn'}
                            style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', width: '100%', justifyContent: 'center' }}
                          >
                            {done ? '✓ Done' : (lang === 'en' ? 'Log' : 'سجل')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rest Timer Widget */}
                <div className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>⏱️ {lang === 'en' ? 'Rest Timer' : 'مؤقت الراحة'}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[30, 45, 60, 90, 120].map((dur) => (
                        <button
                          key={dur}
                          onClick={() => {
                            setSessionRestDuration(dur);
                            setSessionRestSeconds(dur);
                          }}
                          className="secondary-btn"
                          style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px', borderColor: sessionRestDuration === dur ? 'var(--primary)' : 'var(--border-color)' }}
                        >
                          {dur}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '5px' }}>
                    <button
                      onClick={() => setSessionRestSeconds(prev => Math.max(0, prev - 10))}
                      className="secondary-btn"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    >
                      -10s
                    </button>
                    
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: sessionIsResting ? 'var(--primary)' : '#fff', minWidth: '80px', textAlign: 'center' }}>
                      {Math.floor(sessionRestSeconds / 60)}:{(sessionRestSeconds % 60).toString().padStart(2, '0')}
                    </div>

                    <button
                      onClick={() => setSessionRestSeconds(prev => prev + 10)}
                      className="secondary-btn"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    >
                      +10s
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      onClick={() => setSessionIsResting(!sessionIsResting)}
                      className={sessionIsResting ? 'secondary-btn' : 'glow-btn'}
                      style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
                    >
                      {sessionIsResting ? (lang === 'en' ? 'Pause Timer' : 'إيقاف المؤقت مؤقتاً') : (lang === 'en' ? 'Start Rest Timer' : 'بدء الاستراحة ⏱️')}
                    </button>
                    <button
                      onClick={() => {
                        setSessionIsResting(false);
                        setSessionRestSeconds(sessionRestDuration);
                      }}
                      className="secondary-btn"
                      style={{ padding: '8px 16px' }}
                    >
                      {lang === 'en' ? 'Reset' : 'إعادة ضبط'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Navigation Footer */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button
                  onClick={handlePrevExercise}
                  disabled={sessionExIdx === 0}
                  className="secondary-btn"
                  style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                >
                  ⬅️ {lang === 'en' ? 'Prev Exercise' : 'التمرين السابق'}
                </button>
                
                {isLastEx ? (
                  <button
                    onClick={handleFinishWorkout}
                    disabled={aiSwapLoading}
                    className="glow-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px', background: 'linear-gradient(90deg, #10b981, #059669)', border: 'none' }}
                  >
                    🏁 {aiSwapLoading ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : (lang === 'en' ? 'Finish Workout 🏁' : 'إنهاء التمرين 🏁')}
                  </button>
                ) : (
                  <button
                    onClick={handleNextExercise}
                    className="glow-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                  >
                    {lang === 'en' ? 'Next Exercise' : 'التمرين التالي'} ➡️
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* SUMMARY SCREEN OVERLAY */}
      {sessionShowSummary && sessionSummaryData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.99)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '520px', padding: '30px', border: '1px solid var(--primary)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            
            {/* Completion Animation / Header */}
            <div className="animated-bounce" style={{ fontSize: '64px', margin: '0 auto' }}>🏆</div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 5px 0' }}>
                {lang === 'en' ? 'Workout Completed!' : 'تهانينا، لقد أنهيت التمرين! ⚡'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                {lang === 'en' ? 'Outstanding work! Your stats have been saved.' : 'عمل رائع جداً! تم حفظ وإدراج تقدمك في السجل.'}
              </p>
            </div>

            {/* Stats Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '10px 0' }}>
              <div className="glass-panel" style={{ padding: '15px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⏱️ {lang === 'en' ? 'Duration' : 'مدة التمرين'}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{sessionSummaryData.duration} Mins</div>
              </div>
              <div className="glass-panel" style={{ padding: '15px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>💪 {lang === 'en' ? 'Exercises' : 'التمارين المنجزة'}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{sessionSummaryData.loggedCount} / {sessionSummaryData.exercisesCount}</div>
              </div>
            </div>

            {/* Exercises List Summary */}
            <div style={{ flex: 1, overflowY: 'auto', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)', margin: '0 0 5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                📋 {lang === 'en' ? 'Workout Log Summary' : 'ملخص جولات التمارين'}
              </h4>
              {sessionDay.exercises.map((ex: any) => {
                const log = sessionSummaryData.logs[ex.id];
                if (!log || log.completedSets === 0) return null;
                return (
                  <div key={ex.id} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{ex.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {log.completedSets} Sets ({log.reps.filter(Boolean).length} logged)
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setSessionDay(null);
                setSessionShowSummary(false);
                setSessionSummaryData(null);
              }}
              className="glow-btn"
              style={{ padding: '14px', width: '100%', justifyContent: 'center', fontSize: '14px' }}
            >
              {lang === 'en' ? 'Back to My Plan' : 'العودة لبرنامجي الرياضي 🔙'}
            </button>
          </div>
        </div>
      )}

      {/* EXERCISE DETAILS MODAL */}
      {viewingExercise && (
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
            padding: '20px' 
          }} 
          onClick={() => setViewingExercise(null)}
        >
          <div 
            className="glass-panel animated-fade" 
            style={{ 
              width: '100%', 
              maxWidth: '520px', 
              padding: '24px', 
              border: '1px solid var(--primary)', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{viewingExercise.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  🎯 {viewingExercise.targetMuscle} | {viewingExercise.category}
                </span>
              </div>
              <button 
                onClick={() => setViewingExercise(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '5px' }}>
              {/* Image Preview */}
              <div style={{ width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden', background: '#0e111a', border: '1px solid var(--border-color)', position: 'relative' }}>
                <img 
                  src={viewingExercise.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'} 
                  alt={viewingExercise.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              {/* Stats Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.sets}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>{viewingExercise.sets}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.reps}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>{viewingExercise.reps}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.weight}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>{viewingExercise.weight || 'Bodyweight'}</div>
                </div>
              </div>

              {/* Performance Tips / Instructions */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  💡 {lang === 'en' ? 'Performance Instructions' : 'تعليمات ونقاط أداء التمرين'}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', whiteSpace: 'pre-wrap' }}>
                  {viewingExercise.exerciseTips || (lang === 'en' ? 'No detailed tips configured for this exercise.' : 'لا توجد تعليمات مسجلة لهذا التمرين حالياً.')}
                </p>
              </div>

              {/* Video Play Button */}
              {viewingExercise.videoUrl && (
                <a 
                  href={viewingExercise.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="glow-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', padding: '12px' }}
                >
                  <span>📺</span>
                  {lang === 'en' ? 'Watch Video Guide' : 'مشاهدة الفيديو التعليمي'}
                </a>
              )}
            </div>

            <button 
              onClick={() => setViewingExercise(null)} 
              className="secondary-btn" 
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              {lang === 'en' ? 'Close' : 'إغلاق'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
