import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RefreshCw, Timer } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { translations } from '../utils/translations';

interface DashboardProps {
  lang: 'ar' | 'en';
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onLanguageChange?: (lang: 'ar' | 'en') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, onLogout, onNavigate, onLanguageChange }) => {
  const t = translations[lang] || translations.ar;
  const [activePlan, setActivePlan] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Player state
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [completedReps, setCompletedReps] = useState<string[]>([]);
  const [loggedWeight, setLoggedWeight] = useState<string[]>([]);
  const [exerciseLogNotes, setExerciseLogNotes] = useState('');

  // Manual Edit State
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [manualCustomInput, setManualCustomInput] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customExForm, setCustomExForm] = useState({
    name: '',
    targetMuscle: '',
    category: 'IRON',
    sets: '3',
    reps: '10-12',
    weight: 'Bodyweight',
    exerciseTips: '',
  });

  // Advanced Features State
  const [showImport, setShowImport] = useState(false);
  const [importListText, setImportListText] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTree, setLibraryTree] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [selectedLibraryEx, setSelectedLibraryEx] = useState<any>(null);
  
  // Search state in library
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [expandedDivisions, setExpandedDivisions] = useState<string[]>([]);
  const [expandedMuscles, setExpandedMuscles] = useState<string[]>([]);

  // Redesign premium states
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<any | null>(null);
  const [swapExerciseId, setSwapExerciseId] = useState<number | null>(null);
  const [alternativesList, setAlternativesList] = useState<any[]>([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'progression'>('schedule');

  const fetchActivePlan = async () => {
    setLoading(true);
    setError('');
    try {
      const plan = await api.getActivePlan();
      setActivePlan(plan);
      // Default to day 1 or current day of week if exists
      if (plan && plan.dayWorkouts.length > 0) {
        // Calculate day index based on today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(plan.startDate);
        start.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        let calculatedDay = (diffDays % 7) + 1;
        if (calculatedDay < 1) calculatedDay = 1;
        setSelectedDayIndex(calculatedDay <= 7 ? calculatedDay : 1);
      }
    } catch (err: any) {
      setError(err.message || 'لم نتمكن من تحميل جدول التمارين النشط.');
    } finally {
      setLoading(false);
    }
  };

  const getStreakCount = () => {
    if (!activePlan || !activePlan.dayWorkouts) return 1;
    let loggedDates = new Set<string>();
    activePlan.dayWorkouts.forEach((day: any) => {
      day.exercises.forEach((ex: any) => {
        if (ex.progressLogs) {
          ex.progressLogs.forEach((log: any) => {
            const dateStr = new Date(log.date).toDateString();
            loggedDates.add(dateStr);
          });
        }
      });
    });
    return loggedDates.size > 0 ? loggedDates.size : 1;
  };

  const getXPLevel = () => {
    if (!activePlan || !activePlan.dayWorkouts) return { level: lang === 'en' ? 'Newbie' : 'مبتدئ', xp: 0 };
    let totalLogs = 0;
    activePlan.dayWorkouts.forEach((day: any) => {
      day.exercises.forEach((ex: any) => {
        if (ex.progressLogs) {
          totalLogs += ex.progressLogs.length;
        }
      });
    });
    const xp = totalLogs * 10;
    let levelName = lang === 'en' ? 'Newbie' : 'مبتدئ';
    if (xp >= 100 && xp < 500) levelName = lang === 'en' ? 'Challenger' : 'متحدي';
    else if (xp >= 500) levelName = lang === 'en' ? 'Beast Mode' : 'الوحش ⚡';
    return { level: levelName, xp };
  };

  const handleFetchAlternatives = async (exerciseId: number) => {
    setSwapExerciseId(exerciseId);
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

  const handleImportBulk = async () => {
    if (!importListText.trim()) return;
    setImportLoading(true);
    setError('');
    try {
      const plan = await api.importBulkPlan(importListText, lang);
      setActivePlan(plan);

      setShowImport(false);
      setImportListText('');
      setSelectedDayIndex(1);
    } catch (err: any) {
      setError(err.message || 'فشل استيراد الجدول المجمع وتحليله.');
    } finally {
      setImportLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getPlanHistory();
      setHistoryList(res || []);
    } catch (err: any) {
      setError('فشل جلب سجل الخطط السابقة.');
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
      setError('فشل تفعيل هذا البرنامج الرياضي.');
    }
  };

  const fetchLibraryTree = async () => {
    setLibraryLoading(true);
    try {
      const tree = await api.getLibraryTree();
      setLibraryTree(tree || []);
      if (tree) {
        setExpandedDivisions(tree.map((d: any) => d.key));
      }
    } catch (err: any) {
      setError('فشل جلب مكتبة التمارين.');
    } finally {
      setLibraryLoading(false);
    }
  };

  const toggleDivision = (key: string) => {
    if (expandedDivisions.includes(key)) {
      setExpandedDivisions(expandedDivisions.filter((d) => d !== key));
    } else {
      setExpandedDivisions([...expandedDivisions, key]);
    }
  };

  const toggleMuscle = (key: string) => {
    if (expandedMuscles.includes(key)) {
      setExpandedMuscles(expandedMuscles.filter((m) => m !== key));
    } else {
      setExpandedMuscles([...expandedMuscles, key]);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  // Web Audio Api to play sound natively (glowing beep)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep failed:', e);
    }
  };

  // Exercise countdown timer (for time-based exercises like Plank)
  const [exerciseSeconds, setExerciseSeconds] = useState(0);
  const [isExerciseTimerActive, setIsExerciseTimerActive] = useState(false);

  // Helper to parse duration from reps text (e.g. "60s" or "30 ثانية")
  const parseRepsToSeconds = (repsText: string): number | null => {
    const match = repsText.match(/(\d+)\s*(ثانية|s|second|sec|ثوان|دقيقة|min)/i);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.includes('دقيقة') || unit.includes('min')) {
      return value * 60;
    }
    return value;
  };

  const checkAndInitExerciseTimer = (ex: any) => {
    if (!ex) return;
    const secs = parseRepsToSeconds(ex.reps);
    if (secs !== null) {
      setExerciseSeconds(secs);
      setIsExerciseTimerActive(false);
    } else {
      setExerciseSeconds(0);
      setIsExerciseTimerActive(false);
    }
  };

  // Active workout rest timer
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restSeconds === 0) {
      setIsResting(false);
      playBeep();
      // Initialize the exercise timer for the next set if it's time-based
      const exercises = getSelectedDay()?.exercises || [];
      const currentEx = exercises[activeExerciseIndex];
      checkAndInitExerciseTimer(currentEx);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds, activeExerciseIndex, selectedDayIndex]);

  // Exercise countdown timer ticking
  useEffect(() => {
    let interval: any = null;
    if (isExerciseTimerActive && exerciseSeconds > 0) {
      interval = setInterval(() => {
        setExerciseSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isExerciseTimerActive && exerciseSeconds === 0) {
      setIsExerciseTimerActive(false);
      playBeep();
      // Auto trigger set completion
      handleFinishSet();
    }
    return () => clearInterval(interval);
  }, [isExerciseTimerActive, exerciseSeconds]);

  useEffect(() => {
    if (addingCustom && libraryTree.length === 0) {
      fetchLibraryTree();
    }
  }, [addingCustom]);

  const handleStartWorkout = () => {
    const exercises = getSelectedDay()?.exercises || [];
    if (exercises.length === 0) return;
    
    // Init sets logging arrays
    setCompletedReps([]);
    setLoggedWeight([]);
    setExerciseLogNotes('');
    setActiveExerciseIndex(0);
    setCurrentSet(1);
    setIsResting(false);
    setShowPlayer(true);
    
    // Check if first exercise is time-based
    checkAndInitExerciseTimer(exercises[0]);
  };

  const handleFinishSet = () => {
    const exercises = getSelectedDay()?.exercises || [];
    const currentEx = exercises[activeExerciseIndex];
    
    // Save sets input
    let currentRepVal = '';
    let currentWeightVal = '';

    const isTimeBased = parseRepsToSeconds(currentEx.reps) !== null;
    if (isTimeBased) {
      currentRepVal = `${currentEx.reps}`;
      currentWeightVal = currentEx.weight || 'Bodyweight';
    } else {
      currentRepVal = (document.getElementById('rep-input') as HTMLInputElement)?.value || '10';
      currentWeightVal = (document.getElementById('weight-input') as HTMLInputElement)?.value || 'Bodyweight';
    }

    const newReps = [...completedReps];
    newReps[currentSet - 1] = currentRepVal;
    setCompletedReps(newReps);

    const newWeights = [...loggedWeight];
    newWeights[currentSet - 1] = currentWeightVal;
    setLoggedWeight(newWeights);

    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
      setRestSeconds(60); // 60 seconds rest
      setIsResting(true);
    } else {
      // Finished all sets of this exercise
      handleNextExercise(newReps, newWeights);
    }
  };

  const handleNextExercise = async (finalReps?: string[], finalWeights?: string[]) => {
    const exercises = getSelectedDay()?.exercises || [];
    const currentEx = exercises[activeExerciseIndex];

    const repsToLog = finalReps || completedReps;
    const weightsToLog = finalWeights || loggedWeight;

    // Log progress to backend
    try {
      await api.logProgress(currentEx.id, {
        completedSets: currentEx.sets,
        repsCompleted: repsToLog.join(','),
        weightUsed: weightsToLog.join(','),
        notes: exerciseLogNotes,
      });
    } catch (err) {
      console.error('Failed to log exercise progress:', err);
    }

    if (activeExerciseIndex < exercises.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedReps([]);
      setLoggedWeight([]);
      setExerciseLogNotes('');
      setIsResting(false);
      
      // Check if next exercise is time-based
      checkAndInitExerciseTimer(exercises[activeExerciseIndex + 1]);
    } else {
      // Finished entire day workout
      setShowPlayer(false);
      alert('تهانينا! لقد أنهيت تمرين اليوم بنجاح. استمر في هذا الزخم للوحوش!');
      fetchActivePlan();
    }
  };

  const getSelectedDay = () => {
    if (!activePlan) return null;
    return activePlan.dayWorkouts.find((dw: any) => dw.dayIndex === selectedDayIndex);
  };



  // Manual Edit Submits
  const handleEditExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateExercise(editingExercise.id, editingExercise);
      setEditingExercise(null);
      fetchActivePlan();
    } catch (err) {
      alert('فشل تعديل تفاصيل التمرين.');
    }
  };

  const handleDeleteExercise = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التمرين من جدولك؟')) return;
    try {
      await api.deleteExercise(id);
      fetchActivePlan();
    } catch (err) {
      alert('فشل حذف التمرين.');
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
      });
      fetchActivePlan();
    } catch (err) {
      alert('فشل إضافة التمرين المخصص.');
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

  const renderTimelineExerciseRow = (ex: any, idx: number) => {
    const isEn = lang === 'en';
    const animationDelay = `${(idx % 10) * 0.05}s`;

    return (
      <div 
        key={ex.id} 
        className="routine-exercise-card"
        style={{ animationDelay }}
        onClick={() => setActiveExerciseDetail(ex)}
      >
        {/* Thumbnail animation */}
        <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', background: '#090a0f', flexShrink: 0, position: 'relative' }}>
          {ex.imageUrl ? (
            <img src={ex.imageUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🏋️‍♂️</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{ex.name}</h4>
            <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>{ex.targetMuscle}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isEn ? `${ex.sets} sets` : `${ex.sets} جولات`} | {ex.reps} | {ex.weight}
          </p>
        </div>

        {/* Replace & Edit Actions */}
        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleFetchAlternatives(ex.id)}
            className="secondary-btn"
            style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.2)', color: 'var(--secondary)' }}
            title={isEn ? 'Replace' : 'استبدال'}
          >
            🔄 {isEn ? 'Replace' : 'استبدال'}
          </button>
          
          <button
            onClick={() => setEditingExercise(ex)}
            className="secondary-btn"
            style={{ padding: '6px 8px', borderRadius: '8px' }}
            title="تعديل"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDeleteExercise(ex.id)}
            className="secondary-btn"
            style={{ padding: '6px 8px', borderRadius: '8px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
            title="حذف"
          >
            🗑️
          </button>
        </div>

        {/* Right Arrow chevron */}
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          ▶
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '0 0 20px 20px', borderTop: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BEASTMODE
          </h2>
        </div>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => onNavigate('dashboard')} className="glow-btn" style={{ padding: '8px 16px' }}>{t.workout}</button>
          <button onClick={() => onNavigate('nutrition')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.nutrition}</button>
          <button onClick={() => onNavigate('stats')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.stats}</button>
          <button onClick={() => onNavigate('chat')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.consultation}</button>
          <button onClick={() => onNavigate('profile')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.profile}</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onLanguageChange && (
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value as 'ar' | 'en')}
              className="input-field"
              style={{ width: 'fit-content', padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <option value="ar" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>🌐 ع</option>
              <option value="en" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>🌐 EN</option>
            </select>
          )}
          <ThemeToggle />
          <button onClick={onLogout} className="secondary-btn" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>{t.logout}</button>
        </div>
      </header>

      <main className="container">
        {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>جاري تحميل جدولك الرياضي وتفاصيل اللياقة...</div>}
        
        {error && (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
            <button onClick={() => onNavigate('onboarding')} className="glow-btn" style={{ marginTop: '20px' }}>توليد جدول جديد بالذكاء الاصطناعي</button>
          </div>
        )}

        {!loading && activePlan && (
          <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Curved Header Section */}
            <div className="curved-header">
              {/* Inline SVG Athlete Overlay to look incredibly premium and works offline */}
              <svg className="curved-header-athlete" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ right: lang === 'en' ? 'auto' : '15px', left: lang === 'en' ? '15px' : 'auto' }}>
                <path d="M50 15C53.866 15 57 11.866 57 8C57 4.13401 53.866 1 50 1C46.134 1 43 4.13401 43 8C43 11.866 46.134 15 50 15Z" fill="var(--primary)" opacity="0.6"/>
                <path d="M50 18C44.4772 18 40 22.4772 40 28V45C40 46.1046 40.8954 47 42 47H44V70C44 72.7614 46.2386 75 49 75H51C53.7614 75 56 72.7614 56 70V47H58C59.1046 47 60 46.1046 60 45V28C60 22.4772 55.5228 18 50 18Z" fill="var(--primary)" opacity="0.4"/>
                <path d="M35 25C33 28 28 32 24 32C20 32 18 28 22 25C26 22 30 22 35 25Z" fill="var(--secondary)" opacity="0.8"/>
                <path d="M65 25C67 28 72 32 76 32C80 32 82 28 78 25C74 22 70 22 65 25Z" fill="var(--secondary)" opacity="0.8"/>
              </svg>
              
              <div style={{ position: 'relative', zIndex: 3 }}>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                  {lang === 'en' ? 'Active Plan' : 'الخطة التدريبية النشطة'}
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {activePlan.title}
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
                  {lang === 'en' ? 'Start Date: ' : 'تاريخ البدء: '} 
                  {new Date(activePlan.startDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')} 
                  {' | '} 
                  {lang === 'en' ? `Duration: ${activePlan.durationWeeks} Weeks` : `المدة: ${activePlan.durationWeeks} أسابيع`}
                </p>

                {/* Stats row */}
                <div className="stats-row" style={{ flexDirection: lang === 'en' ? 'row' : 'row' }}>
                  <div className="stat-badge-glass">
                    <span>🔥</span>
                    <span>
                      {lang === 'en' ? `Streak: ${getStreakCount()} Days` : `الالتزام: ${getStreakCount()} أيام متتالية`}
                    </span>
                  </div>
                  <div className="stat-badge-glass">
                    <span>🛡️</span>
                    <span>
                      {lang === 'en' ? `Level: ${getXPLevel().level}` : `المستوى: ${getXPLevel().level}`}
                    </span>
                  </div>
                  <div className="stat-badge-glass" style={{ color: 'var(--primary)' }}>
                    <span>⚡</span>
                    <span>
                      {getXPLevel().xp} XP
                    </span>
                  </div>
                </div>

                {activePlan.weeklyTips && (
                  <p style={{ fontSize: '13px', color: '#60a5fa', marginTop: '16px', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    💡 <strong>{lang === 'en' ? 'Coach Tip: ' : 'نصيحة الكوتش: '}</strong> {activePlan.weeklyTips}
                  </p>
                )}
              </div>
            </div>

            {/* Actions panel */}
            <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800' }}>
                ⚙️ {lang === 'en' ? 'Plan Controls' : 'لوحة التحكم بالبرنامج'}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleUpgradePlan} className="secondary-btn" style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '8px 16px', fontSize: '13px' }}>
                  <RefreshCw size={14} />
                  {lang === 'en' ? 'Upgrade Plan' : 'ترقية الجدول'}
                </button>
                <button onClick={() => { fetchHistory(); setShowHistory(true); }} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  {lang === 'en' ? 'History' : 'سجل الخطط'}
                </button>
                <button onClick={() => setShowImport(true)} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  {lang === 'en' ? 'Import Bulk' : 'استيراد جدول'}
                </button>
                <button onClick={() => { fetchLibraryTree(); setShowLibrary(true); }} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  {lang === 'en' ? 'Exercise Library' : 'مكتبة التمارين'}
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.02)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)', width: 'fit-content', margin: '0 auto', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('schedule')}
                className={activeTab === 'schedule' ? 'glow-btn' : 'secondary-btn'}
                style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px' }}
              >
                📅 {lang === 'en' ? 'Daily Schedule' : 'الجدول اليومي'}
              </button>
              <button
                onClick={() => setActiveTab('progression')}
                className={activeTab === 'progression' ? 'glow-btn' : 'secondary-btn'}
                style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px' }}
              >
                📈 {lang === 'en' ? 'Weekly Progression' : 'خطة التقدم الأسبوعي'}
              </button>
              <button
                onClick={() => onNavigate('onboarding')}
                className="secondary-btn"
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  borderColor: 'var(--primary)', 
                  color: 'var(--primary)',
                  marginLeft: lang === 'en' ? 'auto' : '0',
                  marginRight: lang === 'ar' ? 'auto' : '0'
                }}
              >
                🔄 {lang === 'en' ? 'New Routine (AI)' : 'توليد جدول جديد بالذكاء الاصطناعي 🚀'}
              </button>
            </div>

            {activeTab === 'schedule' && (
              <div className="timeline-container">
                <div className="timeline-line"></div>
              {activePlan.dayWorkouts.map((day: any) => {
                const isSelected = day.dayIndex === selectedDayIndex;
                const isRest = day.isRestDay;
                
                // Determine circle timeline status
                const isCompleted = day.exercises.length > 0 && day.exercises.every((ex: any) => ex.progressLogs && ex.progressLogs.length > 0);
                const circleClass = isCompleted 
                  ? 'timeline-circle-completed' 
                  : isSelected 
                    ? 'timeline-circle-active' 
                    : '';

                // Calculate estimated time and calories
                const totalExercises = day.exercises.length;
                const estimatedMins = isRest ? 0 : totalExercises * 2 + 10;
                const estimatedKcal = isRest ? 0 : totalExercises * 15 + 40;

                // Group exercises into Warm up, Main, Cool down
                const warmUpEx = day.exercises.filter((ex: any) => 
                  ['YOGA', 'PILATES', 'HIIT', 'CARDIO'].includes(ex.category) || ex.order < 1
                );
                const mainEx = day.exercises.filter((ex: any) => 
                  !warmUpEx.includes(ex) && ex.order < totalExercises - 1
                );
                const coolDownEx = day.exercises.filter((ex: any) => 
                  !warmUpEx.includes(ex) && !mainEx.includes(ex)
                );

                return (
                  <div key={day.id} className="timeline-item">
                    {/* The circle on the timeline */}
                    <div className={`timeline-circle ${circleClass}`}></div>

                    {/* The day card itself */}
                    <div 
                      className={`day-timeline-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDayIndex(day.dayIndex)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {/* Left Avatar / preview */}
                          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            {isRest ? (
                              <span style={{ fontSize: '24px' }}>🧘‍♂️</span>
                            ) : day.exercises[0]?.imageUrl ? (
                              <img src={day.exercises[0].imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '24px' }}>🏋️‍♂️</span>
                            )}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                              {lang === 'en' ? `Day ${day.dayIndex}: ${day.focusArea}` : `اليوم ${day.dayIndex}: ${day.title}`}
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              ⏱️ {estimatedMins} {lang === 'en' ? 'mins' : 'دقيقة'} | 🔥 {estimatedKcal} {lang === 'en' ? 'kcal' : 'سعرة'}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isCompleted && (
                            <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                              ✅ {lang === 'en' ? 'Completed' : 'مكتمل'}
                            </span>
                          )}
                          <span style={{ color: 'var(--text-muted)', transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>
                            ▶
                          </span>
                        </div>
                      </div>

                      {/* Expanded Day Details */}
                      {isSelected && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }} onClick={(e) => e.stopPropagation()}>
                          
                          {/* Start Workout Button */}
                          {!isRest && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                              <button 
                                onClick={handleStartWorkout}
                                className="glow-btn"
                                style={{
                                  width: '100%',
                                  maxWidth: '350px',
                                  padding: '16px 24px',
                                  borderRadius: '30px',
                                  fontSize: '16px',
                                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                                  justifyContent: 'center',
                                }}
                              >
                                🚀 {lang === 'en' ? 'Start Workout' : 'ابدأ الحصة الرياضية'}
                              </button>
                            </div>
                          )}

                          {isRest ? (
                            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px' }}>
                              <div style={{ fontSize: '40px' }}>🧘‍♂️</div>
                              <h4 style={{ fontSize: '16px', marginTop: '12px' }}>
                                {lang === 'en' ? 'Rest & Muscle Recovery Day' : 'يوم راحة مخصص للاستشفاء العضلي'}
                              </h4>
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0' }}>
                                {lang === 'en' 
                                  ? 'Active recovery day. Focus on light walking, stretching, drinking water, and nourishing your body for the next challenges.'
                                  : 'الاستشفاء جزء لا يتجزأ من التطور الرياضي. ركز على التمدد الخفيف، شرب الماء، والتغذية السليمة استعداداً للحصة القادمة.'}
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              
                              {/* 1. Warm Up Segment */}
                              {warmUpEx.length > 0 && (
                                <div>
                                  <div className="routine-phase-header">
                                    <span>🔥 {lang === 'en' ? 'Warm Up' : 'محطة الإحماء والتسخين'}</span>
                                    <span>{warmUpEx.length} {lang === 'en' ? 'exercises' : 'تمارين'}</span>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {warmUpEx.map((ex: any, idx: number) => renderTimelineExerciseRow(ex, idx))}
                                  </div>
                                </div>
                              )}

                              {/* 2. Main Routine Segment */}
                              {mainEx.length > 0 && (
                                <div>
                                  <div className="routine-phase-header">
                                    <span>🏋️‍♂️ {lang === 'en' ? 'Main Routine' : 'الجدول التدريبي الأساسي'}</span>
                                    <span>{mainEx.length} {lang === 'en' ? 'exercises' : 'تمارين'}</span>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {mainEx.map((ex: any, idx: number) => renderTimelineExerciseRow(ex, idx + 10))}
                                  </div>
                                </div>
                              )}

                              {/* 3. Cool Down Segment */}
                              {coolDownEx.length > 0 && (
                                <div>
                                  <div className="routine-phase-header">
                                    <span>🧘‍♂️ {lang === 'en' ? 'Cool Down' : 'محطة التهدئة والاطالات'}</span>
                                    <span>{coolDownEx.length} {lang === 'en' ? 'exercises' : 'تمارين'}</span>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {coolDownEx.map((ex: any, idx: number) => renderTimelineExerciseRow(ex, idx + 20))}
                                  </div>
                                </div>
                              )}

                              {/* Add custom manually */}
                              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                <button 
                                  onClick={() => setAddingCustom(true)} 
                                  className="secondary-btn" 
                                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px' }}
                                >
                                  ➕ {lang === 'en' ? 'Add Custom Exercise' : 'إضافة تمرين يدوي مخصص'}
                                </button>
                              </div>

                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {activeTab === 'progression' && (
              <div className="glass-panel animated-fade" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>📈 خطة التقدم الأسبوعي وزيادة الأحمال (Progressive Overload Plan)</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    يوضح الجدول التالي آلية تدرج شدة التدريب وتوزيع المجهود الرياضي على مدار الأسابيع الأربعة للبرنامج.
                  </p>
                </div>
                
                {/* General Progression Strategy Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div className="glass-panel" style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>الأسبوع 1: التأسيس والاستقرار</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>تهيئة الجسم وتثبيت الأداء السليم بالوزن الأساسي المقترح.</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>الأسبوع 2: زيادة الكثافة (Intensity)</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>زيادة التكرارات بمقدار (+2 تكرار) أو إضافة وزن (+2.5 كجم) مع الحفاظ على الأداء.</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)' }}>الأسبوع 3: زيادة الحجم (Volume)</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>زيادة عدد جولات التمارين الرئيسية بمقدار جولة إضافية (+1 جولة) لتحفيز الخلايا العضلية.</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--danger)' }}>الأسبوع 4: الاستشفاء النشط (Deload)</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>تخفيض الأوزان والجولات بنسبة 20% لتجنب الإجهاد وتفعيل النمو العضلي المعوض.</p>
                  </div>
                </div>

                {/* Day-by-Day Progression List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                  {activePlan.dayWorkouts.map((day: any) => {
                    if (day.isRestDay) return null;
                    return (
                      <div key={day.id} className="glass-panel" style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.01)' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>
                          📅 {day.title}
                        </h4>
                        
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '8px', textAlign: 'right' }}>التمرين</th>
                                <th style={{ padding: '8px' }}>الأسبوع 1</th>
                                <th style={{ padding: '8px', color: '#10b981' }}>الأسبوع 2 (+تكرارات/أوزان)</th>
                                <th style={{ padding: '8px', color: 'var(--secondary)' }}>الأسبوع 3 (+جولات)</th>
                                <th style={{ padding: '8px', color: 'var(--danger)' }}>الأسبوع 4 (الاستشفاء)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {day.exercises.map((ex: any) => {
                                const isTime = parseRepsToSeconds(ex.reps) !== null;
                                return (
                                  <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '10px 8px', fontWeight: '700' }}>
                                      {ex.name}
                                    </td>
                                    {/* W1 */}
                                    <td style={{ padding: '10px 8px' }}>
                                      {ex.sets} جولات × {ex.reps} ({ex.weight})
                                    </td>
                                    {/* W2 */}
                                    <td style={{ padding: '10px 8px', color: '#10b981', fontWeight: '600' }}>
                                      {ex.sets} جولات × {isTime ? `${parseInt(ex.reps) + 15}ث` : `${ex.reps.replace(/(\d+)/g, (m: string) => String(parseInt(m) + 2))} تكرار`} ({ex.weight})
                                    </td>
                                    {/* W3 */}
                                    <td style={{ padding: '10px 8px', color: 'var(--secondary)', fontWeight: '600' }}>
                                      {ex.sets + 1} جولات × {ex.reps} ({ex.weight})
                                    </td>
                                    {/* W4 */}
                                    <td style={{ padding: '10px 8px', color: 'var(--danger)', fontWeight: '600' }}>
                                      {ex.sets - 1} جولات × {isTime ? '20ث' : '8 تكرارات'} (خفيف 60%)
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ACTIVE WORKOUT PLAYER MODAL */}
      {showPlayer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', border: '1px solid var(--primary)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px' }}>مشغل التمرين التفاعلي 🏋️‍♂️</h3>
              <button onClick={() => setShowPlayer(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {(() => {
              const exercises = getSelectedDay()?.exercises || [];
              const ex = exercises[activeExerciseIndex];
              if (!ex) return null;

              return (
                <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <span className="badge badge-primary">تمرين {activeExerciseIndex + 1} من {exercises.length}</span>
                    <h2 style={{ fontSize: '22px', marginTop: '10px' }}>{ex.name}</h2>
                    <span className="badge badge-secondary" style={{ marginTop: '5px' }}>{ex.targetMuscle}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    {ex.imageUrl && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>توضيح الحركة</span>
                        <img src={ex.imageUrl} alt={ex.name} style={{ width: '100%', height: '140px', borderRadius: '10px', objectFit: 'contain', background: '#090a0f', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                    {ex.anatomyImageUrl && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>الخريطة التشريحية</span>
                        <img src={ex.anatomyImageUrl} alt="Target Muscle Anatomy" style={{ width: '100%', height: '140px', borderRadius: '10px', objectFit: 'contain', background: '#090a0f', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الجولة الحالية</span>
                      <h3 style={{ fontSize: '32px', color: 'var(--primary)' }}>{currentSet} / {ex.sets}</h3>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الهدف المقترح</span>
                      <h3 style={{ fontSize: '20px' }}>{ex.reps} تكرار @ {ex.weight}</h3>
                    </div>
                  </div>

                  {/* Rest countdown */}
                  {isResting ? (
                    <div className="glass-panel" style={{ padding: '20px', borderColor: 'var(--secondary)', animation: 'pulse 1.5s infinite' }}>
                      <div style={{ display: 'flex', justifySelf: 'center', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
                        <Timer size={24} />
                        <h3 style={{ fontSize: '16px' }}>وقت الراحة والاستشفاء</h3>
                      </div>
                      <h2 style={{ fontSize: '48px', color: 'var(--secondary)', marginTop: '10px' }}>{restSeconds} ثانية</h2>
                      <button onClick={() => setIsResting(false)} className="secondary-btn" style={{ marginTop: '10px', fontSize: '12px' }}>تخطي الراحة</button>
                    </div>
                  ) : (
                    parseRepsToSeconds(ex.reps) !== null ? (
                      <div className="glass-panel" style={{ padding: '20px', borderColor: 'var(--primary)' }}>
                        <div style={{ display: 'flex', justifySelf: 'center', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                          <Timer size={24} />
                          <h3 style={{ fontSize: '16px' }}>عداد التمرين التنازلي</h3>
                        </div>
                        <h2 style={{ fontSize: '48px', color: 'var(--primary)', marginTop: '10px' }}>{exerciseSeconds} ثانية</h2>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setIsExerciseTimerActive(!isExerciseTimerActive)}
                            className="glow-btn"
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                          >
                            {isExerciseTimerActive ? 'إيقاف مؤقت' : 'بدء المؤقت'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExerciseTimerActive(false);
                              setExerciseSeconds(parseRepsToSeconds(ex.reps) || 0);
                            }}
                            className="secondary-btn"
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                          >
                            إعادة تعيين
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>التكرارات الفعلية</label>
                          <input id="rep-input" type="number" defaultValue={ex.reps.split('-')[0]} className="input-field" style={{ textAlign: 'center' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>الوزن المستعمل</label>
                          <input id="weight-input" type="text" defaultValue={ex.weight} className="input-field" style={{ textAlign: 'center' }} />
                        </div>
                      </div>
                    )
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }}>ملاحظات الجولة (اختياري)</label>
                    <input
                      type="text"
                      placeholder="كيف كان الشعور؟ (سلس، صعب، ألم طفيف...)"
                      value={exerciseLogNotes}
                      onChange={(e) => setExerciseLogNotes(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {!isResting && (
                    <button onClick={handleFinishSet} className="glow-btn" style={{ justifyContent: 'center', padding: '14px', fontSize: '16px' }}>
                      إتمام الجولة {currentSet}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* EDIT EXERCISE MODAL */}
      {editingExercise && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setEditingExercise(null)}
        >
          <form 
            onSubmit={handleEditExerciseSubmit} 
            className="glass-panel" 
            style={{ width: '100%', maxWidth: '450px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>تعديل تفاصيل التمرين 🛠️</h3>
              <button type="button" onClick={() => setEditingExercise(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>اسم التمرين</label>
              <input
                type="text"
                value={editingExercise.name}
                onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>الجولات</label>
                <input
                  type="number"
                  value={editingExercise.sets}
                  onChange={(e) => setEditingExercise({ ...editingExercise, sets: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>التكرارات</label>
                <input
                  type="text"
                  value={editingExercise.reps}
                  onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>الوزن المقترح</label>
              <input
                type="text"
                value={editingExercise.weight || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>العضلة المستهدفة</label>
              <input
                type="text"
                value={editingExercise.targetMuscle || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, targetMuscle: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>إرشادات الأداء</label>
              <textarea
                value={editingExercise.exerciseTips || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, exerciseTips: e.target.value })}
                className="input-field"
                style={{ minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>حفظ التعديلات</button>
              <button type="button" onClick={() => setEditingExercise(null)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* ADD CUSTOM EXERCISE MODAL */}
      {addingCustom && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => { setAddingCustom(false); setManualCustomInput(false); }}
        >
          <div 
            className="glass-panel animated-fade" 
            style={{ width: '100%', maxWidth: '950px', height: '80vh', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--primary)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>إضافة تمرين للجدول ➕</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setManualCustomInput(!manualCustomInput)} 
                  className="secondary-btn"
                  style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--secondary)', color: 'var(--secondary)' }}
                >
                  {manualCustomInput ? '🔍 تصفح مكتبة التمارين' : '✏️ كتابة يدوية بالكامل'}
                </button>
                <button onClick={() => { setAddingCustom(false); setManualCustomInput(false); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>×</button>
              </div>
            </div>

            {manualCustomInput ? (
              /* Manual Input Form */
              <form onSubmit={handleAddCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, overflowY: 'auto', padding: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700' }}>اسم التمرين</label>
                  <input
                    type="text"
                    placeholder="مثال: رفرفة رف جانبي بالدمبلز"
                    value={customExForm.name}
                    onChange={(e) => setCustomExForm({ ...customExForm, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700' }}>الجولات</label>
                    <input
                      type="number"
                      value={customExForm.sets}
                      onChange={(e) => setCustomExForm({ ...customExForm, sets: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700' }}>التكرارات</label>
                    <input
                      type="text"
                      placeholder="10-12"
                      value={customExForm.reps}
                      onChange={(e) => setCustomExForm({ ...customExForm, reps: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700' }}>الوزن</label>
                  <input
                    type="text"
                    placeholder="10 كجم أو وزن الجسم"
                    value={customExForm.weight}
                    onChange={(e) => setCustomExForm({ ...customExForm, weight: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700' }}>العضلة المستهدفة</label>
                    <input
                      type="text"
                      placeholder="الأكتاف الجانبية"
                      value={customExForm.targetMuscle}
                      onChange={(e) => setCustomExForm({ ...customExForm, targetMuscle: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700' }}>نوع التمرين</label>
                    <select
                      value={customExForm.category}
                      onChange={(e) => setCustomExForm({ ...customExForm, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="IRON">حديد جيم (IRON)</option>
                      <option value="CALISTHENICS">مقاومة ووزن جسم (CALISTHENICS)</option>
                      <option value="YOGA">يوجا (YOGA)</option>
                      <option value="PILATES">بيلاتس (PILATES)</option>
                      <option value="HIIT">تمارين شدة عالية (HIIT)</option>
                      <option value="CARDIO">كارديو (CARDIO)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700' }}>نصائح الأداء</label>
                  <textarea
                    placeholder="حافظ على استقامة الظهر ولا تقم بمرجحة الوزن..."
                    value={customExForm.exerciseTips}
                    onChange={(e) => setCustomExForm({ ...customExForm, exerciseTips: e.target.value })}
                    className="input-field"
                    style={{ minHeight: '80px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>إضافة التمرين</button>
                  <button type="button" onClick={() => { setAddingCustom(false); setManualCustomInput(false); }} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
                </div>
              </form>
            ) : (
              /* Tree & Selector Panel */
              <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                {/* Left side: Search & Tree list */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '10px' }}>
                  <input
                    type="text"
                    placeholder="🔍 ابحث في الـ 4,206 تمرين..."
                    value={customSearchQuery}
                    onChange={(e) => setCustomSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px' }}
                  />
                  
                  {libraryLoading ? (
                    <div style={{ textAlign: 'center', padding: '30px' }}>جاري تحميل التمارين شجرياً...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {libraryTree.map((div: any) => {
                        const filteredChildren = div.children.map((muscle: any) => {
                          const filteredExercises = muscle.exercises.filter((ex: any) =>
                            ex.name_en.toLowerCase().includes(customSearchQuery.toLowerCase()) ||
                            ex.name_ar.toLowerCase().includes(customSearchQuery.toLowerCase())
                          );
                          return { ...muscle, exercises: filteredExercises };
                        }).filter((muscle: any) => muscle.exercises.length > 0);

                        if (filteredChildren.length === 0 && customSearchQuery) return null;

                        const isDivExpanded = expandedDivisions.includes(div.key);

                        return (
                          <div key={div.key} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
                            <div 
                              onClick={() => toggleDivision(div.key)}
                              style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: '800', fontSize: '13px', color: 'var(--primary)' }}
                            >
                              <span>📂 {div.label_ar}</span>
                              <span>{isDivExpanded ? '▼' : '▲'}</span>
                            </div>
                            
                            {isDivExpanded && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingRight: '10px' }}>
                                {filteredChildren.map((muscle: any) => {
                                  const isMuscleExpanded = expandedMuscles.includes(muscle.key) || !!customSearchQuery;
                                  return (
                                    <div key={muscle.key}>
                                      <div 
                                        onClick={() => toggleMuscle(muscle.key)}
                                        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: '700', fontSize: '12px', color: 'var(--secondary)' }}
                                      >
                                        <span>💪 {muscle.label_ar}</span>
                                        <span style={{ fontSize: '10px' }}>{muscle.exercises.length}</span>
                                      </div>
                                      
                                      {isMuscleExpanded && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', marginTop: '6px', paddingRight: '10px' }}>
                                          {muscle.exercises.map((ex: any) => {
                                            const isSelected = customExForm.name.startsWith(ex.name_ar);
                                            return (
                                              <div
                                                key={ex.id}
                                                onClick={() => {
                                                  setCustomExForm({
                                                    name: `${ex.name_ar} (${ex.name_en})`,
                                                    targetMuscle: ex.muscle_ar || ex.muscle_en,
                                                    category: ex.category || 'IRON',
                                                    sets: '3',
                                                    reps: ex.category === 'YOGA' || ex.category === 'CARDIO' ? '30s' : '10-12',
                                                    weight: 'Bodyweight',
                                                    exerciseTips: ex.instructions_ar || ex.instructions_en || 'أداء هادئ وتركيز كامل.',
                                                  });
                                                }}
                                                style={{
                                                  padding: '6px 10px',
                                                  background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                                  border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                                  borderRadius: '5px',
                                                  cursor: 'pointer',
                                                  fontSize: '12px',
                                                  display: 'flex',
                                                  justifyContent: 'space-between'
                                                }}
                                              >
                                                <span>{ex.name_ar}</span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ex.equipment_ar}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right side: Parameters configuration */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                  {customExForm.name ? (
                    <form onSubmit={handleAddCustomSubmit} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <span className="badge badge-primary">{customExForm.category}</span>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px' }}>{customExForm.name}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>العضلة: {customExForm.targetMuscle}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '700' }}>الجولات</label>
                          <input
                            type="number"
                            value={customExForm.sets}
                            onChange={(e) => setCustomExForm({ ...customExForm, sets: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '700' }}>التكرارات</label>
                          <input
                            type="text"
                            value={customExForm.reps}
                            onChange={(e) => setCustomExForm({ ...customExForm, reps: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700' }}>الوزن المقترح</label>
                        <input
                          type="text"
                          value={customExForm.weight}
                          onChange={(e) => setCustomExForm({ ...customExForm, weight: e.target.value })}
                          className="input-field"
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700' }}>ملاحظات/إرشادات</label>
                        <textarea
                          value={customExForm.exerciseTips}
                          onChange={(e) => setCustomExForm({ ...customExForm, exerciseTips: e.target.value })}
                          className="input-field"
                          style={{ minHeight: '60px', fontSize: '12px' }}
                        />
                      </div>

                      <button type="submit" className="glow-btn" style={{ justifyContent: 'center', padding: '12px', marginTop: '10px' }}>
                        أضف هذا التمرين للجدول ➕
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <span style={{ fontSize: '32px' }}>👈</span>
                      <p style={{ marginTop: '10px', fontSize: '13px' }}>اختر تمريناً من الشجرة التفاعلية لتعديل جولاته وإضافته لجدولك اليومي.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showImport && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowImport(false)}
        >
          <div 
            className="glass-panel" 
            style={{ width: '100%', maxWidth: '550px', padding: '30px', border: '1px solid var(--primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px' }}>استيراد قائمة تمارين خارجية 📥</h3>
              <button onClick={() => setShowImport(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              انسخ قائمة تمارينك من أي ملف نصي أو تطبيق آخر والزقها هنا (اسم تمرين في كل سطر). سيقوم محرك التوليد بمطابقة الأسماء محلياً، واقتراح الأوزان والصور التشريحية، بالإضافة إلى **تحليل ونقد فني من كوتش الذكاء الاصطناعي**.
            </p>

            <textarea
              placeholder="مثال:&#10;Bench Press&#10;Bicep Curl&#10;Squats"
              value={importListText}
              onChange={(e) => setImportListText(e.target.value)}
              className="input-field"
              style={{ minHeight: '180px', width: '100%', fontFamily: 'monospace', fontSize: '14px', padding: '15px' }}
              disabled={importLoading}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handleImportBulk}
                className="glow-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={importLoading || !importListText.trim()}
              >
                {importLoading ? 'جاري الاستيراد والتحليل الذكي...' : 'استورد وحلل الجدول'}
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="secondary-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={importLoading}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKOUT PLANS HISTORY MODAL */}
      {showHistory && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowHistory(false)}
        >
          <div 
            className="glass-panel" 
            style={{ width: '100%', maxWidth: '700px', padding: '30px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px' }}>أرشيف وسجل جداولك الرياضية 📅</h3>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>جاري جلب سجل الجداول...</div>
            ) : historyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>لا توجد جداول سابقة مسجلة في هذا الحساب.</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '5px' }}>
                {historyList.map((plan) => (
                  <div
                    key={plan.id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      border: plan.active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '15px',
                      background: plan.active ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{plan.title}</h4>
                        {plan.active && <span className="badge badge-primary">نشط حالياً</span>}
                        {plan.isManual && <span className="badge badge-secondary" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>مستورد / يدوي</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                        تاريخ الإنشاء: {new Date(plan.createdAt).toLocaleDateString('ar-EG')} | عدد الأيام: {plan.dayWorkouts.length} أيام
                      </p>
                      {plan.weeklyTips && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '450px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📝 نقد/إرشادات: {plan.weeklyTips}
                        </p>
                      )}
                    </div>
                    {!plan.active && (
                      <button
                        onClick={() => handleActivatePlan(plan.id)}
                        className="glow-btn"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        تنشيط هذا الجدول
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXERCISES LIBRARY TREE BROWSER */}
      {showLibrary && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowLibrary(false)}
        >
          <div 
            className="glass-panel" 
            style={{ width: '100%', maxWidth: '1100px', height: '90vh', padding: '30px', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>مكتبة التمارين الهيكلية (الشجرة التفاعلية) 🌳</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>تصفح واستكشف 4,206 تمرين رياضي مصنف ومترجم باحترافية حسب جزء الجسم والعضلات.</p>
              </div>
              <button onClick={() => setShowLibrary(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن تمرين باسمه العربي أو الإنجليزي أو الأداة المستخدمة..."
                value={librarySearchQuery}
                onChange={(e) => setLibrarySearchQuery(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '12px 18px', fontSize: '14px' }}
              />
            </div>

            {/* Main Content Area: Left list (scrollable), Right details (panel) */}
            <div style={{ display: 'flex', gap: '25px', flex: 1, overflow: 'hidden' }}>
              {/* Left Side: Tree Structure */}
              <div style={{ flex: 1.2, overflowY: 'auto', borderRight: '1px solid var(--border-color)', paddingRight: '15px' }}>
                {libraryLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>جاري قراءة وتصنيف التمارين شجرياً...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {libraryTree.map((div: any) => {
                      // Filter down to matching query
                      const filteredChildren = div.children.map((muscle: any) => {
                        const filteredExercises = muscle.exercises.filter((ex: any) =>
                          ex.name_en.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                          ex.name_ar.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                          ex.equipment_en.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                          ex.equipment_ar.toLowerCase().includes(librarySearchQuery.toLowerCase())
                        );
                        return { ...muscle, exercises: filteredExercises };
                      }).filter((muscle: any) => muscle.exercises.length > 0);

                      if (filteredChildren.length === 0 && librarySearchQuery) return null;

                      const isDivExpanded = expandedDivisions.includes(div.key);

                      return (
                        <div key={div.key} className="glass-panel" style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.01)' }}>
                          {/* Division Header (Level 1) */}
                          <div
                            onClick={() => toggleDivision(div.key)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '800', fontSize: '15px', color: 'var(--primary)', borderBottom: isDivExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: isDivExpanded ? '8px' : '0' }}
                          >
                            <span>📂 {div.label_ar} ({div.label_en})</span>
                            <span style={{ fontSize: '12px' }}>{isDivExpanded ? '▼ إخفاء' : '▲ عرض'}</span>
                          </div>

                          {/* Muscles List (Level 2) */}
                          {isDivExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', paddingRight: '15px' }}>
                              {filteredChildren.map((muscle: any) => {
                                const isMuscleExpanded = expandedMuscles.includes(muscle.key) || !!librarySearchQuery;

                                return (
                                  <div key={muscle.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                                    <div
                                      onClick={() => toggleMuscle(muscle.key)}
                                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: 'var(--secondary)' }}
                                    >
                                      <span>💪 {muscle.label_ar} ({muscle.label_en})</span>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {muscle.exercises.length} تمرين {isMuscleExpanded ? '▼' : '▲'}
                                      </span>
                                    </div>

                                    {/* Exercises List (Level 3) */}
                                    {isMuscleExpanded && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', marginTop: '8px', paddingRight: '15px' }}>
                                        {muscle.exercises.map((ex: any) => (
                                          <div
                                            key={ex.id}
                                            onClick={() => setSelectedLibraryEx(ex)}
                                            style={{
                                              padding: '8px 12px',
                                              background: selectedLibraryEx?.id === ex.id ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                                              border: selectedLibraryEx?.id === ex.id ? '1px solid var(--primary)' : '1px solid transparent',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              fontSize: '13px',
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              alignItems: 'center',
                                              transition: 'all 0.15s',
                                            }}
                                          >
                                            <span style={{ fontWeight: '600' }}>{ex.name_ar}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.equipment_ar}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Side: Exercise Detail Panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedLibraryEx ? (
                  <div className="glass-panel animated-fade" style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div>
                      <span className="badge badge-primary">{selectedLibraryEx.equipment_ar}</span>
                      <h2 style={{ fontSize: '20px', fontWeight: '800', marginTop: '8px' }}>{selectedLibraryEx.name_ar}</h2>
                      <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedLibraryEx.name_en}</h3>
                    </div>

                    {/* Dual Images Side-by-Side (Exercise execution + Anatomical diagram) */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {selectedLibraryEx.image_url && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>شرح الحركة</span>
                          <img
                            src={selectedLibraryEx.image_url}
                            alt={selectedLibraryEx.name_en}
                            style={{ width: '100%', height: '110px', borderRadius: '8px', objectFit: 'contain', background: '#090a0f', border: '1px solid var(--border-color)' }}
                          />
                        </div>
                      )}
                      {selectedLibraryEx.anatomy_image_url && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>الخريطة التشريحية</span>
                          <img
                            src={selectedLibraryEx.anatomy_image_url}
                            alt="Muscle Anatomy Map"
                            style={{ width: '100%', height: '110px', borderRadius: '8px', objectFit: 'contain', background: '#090a0f', border: '1px solid var(--border-color)' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>📋 طريقة الأداء بالتفصيل:</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '6px', whiteSpace: 'pre-line' }}>
                        {selectedLibraryEx.instructions_ar || selectedLibraryEx.instructions_en || 'لا توجد تعليمات مسجلة لهذا التمرين حالياً.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                      {selectedLibraryEx.video_url && (
                        <a
                          href={selectedLibraryEx.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="glow-btn"
                          style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '12px' }}
                        >
                          🎥 شاهد شرح يوتيوب شورتس
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '15px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    👈 اختر أي تمرين من الشجرة لعرض الصور والتعليمات والخرائط التشريحية.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* PREMIUM SLIDE-UP EXERCISE DETAIL SHEET */}
      {activeExerciseDetail && (
        <div className="slide-up-modal-overlay" onClick={() => setActiveExerciseDetail(null)}>
          <div className="slide-up-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                {activeExerciseDetail.category || 'IRON'}
              </span>
              <button 
                onClick={() => setActiveExerciseDetail(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer', outline: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* Exercise Animation / GIF */}
            <div style={{ width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden', background: '#090a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              {activeExerciseDetail.imageUrl ? (
                <img 
                  src={activeExerciseDetail.imageUrl} 
                  alt={activeExerciseDetail.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
                <span style={{ fontSize: '60px' }}>🏋️‍♂️</span>
              )}
            </div>

            {/* Title & target muscle */}
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>
              {activeExerciseDetail.name}
            </h2>

            {/* Video demonstration button */}
            {activeExerciseDetail.videoUrl && (
              <a
                href={activeExerciseDetail.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="glow-btn"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '13px', marginBottom: '15px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', color: '#fff' }}
              >
                🎥 {lang === 'en' ? 'Watch Video Demonstration (YouTube)' : 'شاهد طريقة الأداء بالفيديو (يوتيوب)'}
              </a>
            )}
            
            {/* Target Muscle anatomical badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              {activeExerciseDetail.anatomyImageUrl && (
                <img 
                  src={activeExerciseDetail.anatomyImageUrl} 
                  alt="Anatomy map" 
                  style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#090a0f', border: '1px solid var(--border-color)', objectFit: 'contain' }}
                />
              )}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {lang === 'en' ? 'Target Area' : 'العضلة المستهدفة'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                  {activeExerciseDetail.targetMuscle}
                </div>
              </div>
            </div>

            {/* Structured details: How to do it */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  📖 {lang === 'en' ? 'How to do it' : 'كيفية أداء التمرين'}
                </h4>
                <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', paddingRight: '20px', lineHeight: '1.6' }}>
                  {(activeExerciseDetail.exerciseTips || '')
                    .split('\n')
                    .filter((line: string) => line.trim())
                    .map((step: string, sIdx: number) => (
                      <li key={sIdx} style={{ marginBottom: '4px' }}>{step}</li>
                    ))}
                </ul>
              </div>

              {/* Dynamic Breathing & benefits based on category */}
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  🫁 {lang === 'en' ? 'Breathing Tips' : 'نصائح التنفس المرافقة'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {lang === 'en' 
                    ? 'Inhale during the lowering/eccentric phase, and exhale as you lift/contract the muscle. Keep breathing controlled.'
                    : 'اسحب شهيقاً عميقاً عند مرحلة إنزال الوزن أو بسط العضلة، وازفر زفيراً قوياً عند مرحلة رفع الوزن والانقباض العضلي.'}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  🛡️ {lang === 'en' ? 'Key Benefits' : 'فوائد التمرين الرئيسية'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {lang === 'en'
                    ? `Strengthens the ${activeExerciseDetail.targetMuscle || 'muscles'}, improves joint stability, and stimulates athletic power.`
                    : `يعزز قوة عضلات ${activeExerciseDetail.targetMuscle || 'المستهدفة'}، ويقوي المفاصل المرافقة، ويزيد المدى الحركي والأداء.`}
                </p>
              </div>
            </div>

            {/* Bottom action button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  const exercises = getSelectedDay()?.exercises || [];
                  const idx = exercises.findIndex((ex: any) => ex.id === activeExerciseDetail.id);
                  if (idx !== -1) {
                    setActiveExerciseIndex(idx);
                    setShowPlayer(true);
                  }
                  setActiveExerciseDetail(null);
                }}
                className="glow-btn"
                style={{ width: '100%', padding: '14px 20px', borderRadius: '30px', justifyContent: 'center' }}
              >
                ▶ {lang === 'en' ? 'Start Exercise' : 'ابدأ الحركات الآن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALTERNATIVE SWAP SHEET MODAL */}
      {swapExerciseId && (
        <div className="slide-up-modal-overlay" onClick={() => setSwapExerciseId(null)}>
          <div className="slide-up-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                🔄 {lang === 'en' ? 'Choose Alternative Exercise' : 'اختر التمرين البديل المناسب'}
              </h3>
              <button 
                onClick={() => setSwapExerciseId(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {alternativesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px' }}>{lang === 'en' ? 'Searching for matched alternatives...' : 'جاري البحث في قاعدة البيانات عن بدائل مكافئة...'}</p>
              </div>
            ) : alternativesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                {lang === 'en' ? 'No alternatives found for this target area.' : 'لم نجد تمارين بديلة لهذه العضلة حالياً.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '5px' }}>
                {alternativesList.map((altEx: any) => (
                  <div 
                    key={altEx.id}
                    className="glass-panel"
                    style={{ display: 'flex', padding: '12px', gap: '15px', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => handleSwapExercise(altEx)}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', background: '#090a0f', flexShrink: 0 }}>
                      {altEx.image_url ? (
                        <img src={altEx.image_url} alt={altEx.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🏋️‍♂️</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800' }}>
                        {lang === 'en' ? altEx.name_en : altEx.name_ar}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        💪 {lang === 'en' ? 'Equipment: ' : 'الأداة: '} {lang === 'en' ? altEx.equipment_en : altEx.equipment_ar}
                      </p>
                    </div>
                    <button 
                      className="glow-btn"
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      {lang === 'en' ? 'Select' : 'اختيار'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
