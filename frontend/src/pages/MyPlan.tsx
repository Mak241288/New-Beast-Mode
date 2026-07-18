import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Edit2, Trash2, ArrowLeftRight, Plus, Upload, History, Sparkles, AlertCircle } from 'lucide-react';
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
  
  const [customExForm, setCustomExForm] = useState({
    name: '',
    targetMuscle: '',
    category: 'IRON',
    sets: '3',
    reps: '10-12',
    weight: 'Bodyweight',
    exerciseTips: '',
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

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const getSelectedDay = () => {
    if (!activePlan) return null;
    return activePlan.dayWorkouts.find((dw: any) => dw.dayIndex === selectedDayIndex);
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
        setImportPreview(previewPlan);
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
      setImportPreview(previewPlan);
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

  const day = getSelectedDay();

  return (
    <div style={{ padding: '20px 0' }}>
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
          {/* Week Days Selector tabs */}
          <div className="glass-panel" style={{ padding: '15px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {activePlan.dayWorkouts.map((dw: any) => {
              const isActive = dw.dayIndex === selectedDayIndex;
              return (
                <button
                  key={dw.id}
                  onClick={() => setSelectedDayIndex(dw.dayIndex)}
                  className={isActive ? 'glow-btn' : 'secondary-btn'}
                  style={{
                    flex: 1,
                    minWidth: '100px',
                    justifyContent: 'center',
                    padding: '12px 10px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    {lang === 'en' ? `Day ${dw.dayIndex}` : `اليوم ${dw.dayIndex}`}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dw.title.split(' - ')[1] || dw.title.split(': ')[1] || dw.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day details */}
          {day && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{day.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                    🎯 {day.focusArea} | {day.isRestDay ? (lang === 'en' ? 'Rest Day' : 'يوم راحة') : `${day.exercises.length} ${t.exercises}`}
                  </p>
                </div>

                {!day.isRestDay && (
                  <button onClick={() => setAddingCustom(true)} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} />
                    {t.addCustomEx}
                  </button>
                )}
              </div>

              {day.isRestDay ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '48px' }}>🧘‍♂️</span>
                  <h4 style={{ fontWeight: 'bold' }}>{t.restDayTitle}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{t.restDayDesc}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {day.exercises.map((ex: any) => (
                    <div
                      key={ex.id}
                      className="glass-panel animated-fade"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1, minWidth: '250px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#0e111a', flexShrink: 0 }}>
                          <img
                            src={ex.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'}
                            alt={ex.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{ex.name}</h4>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '12px', flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                              🔄 {ex.sets} {t.sets}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              🔢 {ex.reps} {t.reps}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              ⚖️ {ex.weight || 'Bodyweight'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Exercise Actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingExercise(ex)}
                          className="secondary-btn"
                          title={lang === 'en' ? 'Edit Details' : 'تعديل التكرارات والأوزان'}
                          style={{ padding: '8px 12px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleFetchAlternatives(ex.id)}
                          className="secondary-btn"
                          title={lang === 'en' ? 'Swap with Alternative' : 'استبدال بتمرين بديل'}
                          style={{ padding: '8px 12px' }}
                        >
                          <ArrowLeftRight size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="secondary-btn"
                          title={lang === 'en' ? 'Delete' : 'حذف التمرين'}
                          style={{ padding: '8px 12px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* EDIT EXERCISE MODAL */}
      {editingExercise && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setEditingExercise(null)}>
          <form onSubmit={handleEditExerciseSubmit} className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '480px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{lang === 'en' ? 'Edit Exercise details' : 'تعديل جولات وتكرارات التمرين'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{lang === 'en' ? 'Exercise Name' : 'اسم التمرين'}</label>
              <input type="text" value={editingExercise.name} onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })} className="input-field" required />
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

            {alternativesLoading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>{lang === 'en' ? 'Searching alternatives...' : 'جاري البحث عن بدائل رياضية...'}</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                {alternativesList.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => handleSwapExercise(alt)}
                    className="glass-panel"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <div style={{ width: '45px', height: '45px', borderRadius: '6px', overflow: 'hidden', background: '#0e111a' }}>
                      <img src={alt.image_url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100'} alt={alt.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{lang === 'en' ? alt.name_en : alt.name_ar}</h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>🏋️‍♂️ {lang === 'en' ? alt.equipment_en : alt.equipment_ar}</span>
                    </div>
                  </div>
                ))}

                {alternativesList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    {lang === 'en' ? 'No alternatives found in database.' : 'لم نجد تمارين بديلة لنفس العضلة في قاعدة البيانات.'}
                  </div>
                )}
              </div>
            )}
            
            <button onClick={() => setSwapExerciseId(null)} className="secondary-btn" style={{ marginTop: '15px', justifyContent: 'center' }}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* ADD CUSTOM EXERCISE MODAL */}
      {addingCustom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 7, 16, 0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setAddingCustom(false)}>
          <form onSubmit={handleAddCustomSubmit} className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '480px', padding: '24px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{lang === 'en' ? 'Add Custom Exercise' : 'إضافة تمرين يدوي جديد'}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{lang === 'en' ? 'Exercise Name' : 'اسم التمرين'}</label>
              <input
                type="text"
                placeholder={lang === 'en' ? 'E.g., Dumbbell Hammer Curl' : 'مثال: تبادل بايسبس بالدمبلز'}
                value={customExForm.name}
                onChange={(e) => setCustomExForm({ ...customExForm, name: e.target.value })}
                className="input-field"
                required
              />
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {importPreview.days.map((day: any, dayIdx: number) => (
                    <div key={dayIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updatedDays = [...importPreview.days];
                            updatedDays[dayIdx].title = e.target.value;
                            setImportPreview({ ...importPreview, days: updatedDays });
                          }}
                          className="input-field"
                          style={{ fontWeight: '800', fontSize: '14px', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', padding: '2px', width: '70%' }}
                          onFocus={(e) => (e.target.style.borderBottomColor = 'var(--primary)')}
                          onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold' }}>
                          {day.isRestDay ? (lang === 'en' ? 'Rest Day' : 'يوم راحة') : (lang === 'en' ? 'Workout Day' : 'يوم تمرين')}
                        </span>
                      </div>

                      {!day.isRestDay && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(day.exercises || []).map((ex: any, exIdx: number) => (
                            <div key={exIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.5fr', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                              {/* Exercise Name */}
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => handleUpdatePreviewEx(dayIdx, exIdx, 'name', e.target.value)}
                                className="input-field"
                                style={{ fontSize: '12px', padding: '6px' }}
                              />
                              {/* Sets */}
                              <input
                                type="number"
                                value={ex.sets}
                                onChange={(e) => handleUpdatePreviewEx(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 3)}
                                className="input-field"
                                style={{ fontSize: '12px', padding: '6px', textAlign: 'center' }}
                              />
                              {/* Reps */}
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={(e) => handleUpdatePreviewEx(dayIdx, exIdx, 'reps', e.target.value)}
                                className="input-field"
                                style={{ fontSize: '12px', padding: '6px' }}
                              />
                              {/* Target Muscle */}
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: '4px' }}>
                                💪 {ex.targetMuscle}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

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
    </div>
  );
};
