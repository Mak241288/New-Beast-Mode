import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sparkles, Trash2, Calendar, Coffee, Utensils, Moon, HelpCircle, Droplet } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { translations } from '../utils/translations';

interface NutritionProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onLanguageChange?: (lang: 'ar' | 'en') => void;
}

export const Nutrition: React.FC<NutritionProps> = ({ lang, onNavigate, onLogout, onLanguageChange }) => {
  const t = translations[lang] || translations.ar;
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // AI Meal text logger
  const [mealText, setMealText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Manual Meal logger
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const fetchNutritionPlan = async () => {
    setLoading(true);
    try {
      const plan = await api.getNutritionPlan(selectedDate);
      setNutritionPlan(plan);
    } catch (err: any) {
      console.error(err.message || 'فشل تحميل خطة التغذية.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionPlan();
  }, [selectedDate]);

  const handleAiMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText) return;
    setAiLoading(true);
    try {
      await api.logMealText({ mealText, date: selectedDate });
      setMealText('');
      fetchNutritionPlan();
    } catch (err: any) {
      alert(err.message || 'فشل تحليل الوجبة بالذكاء الاصطناعي.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleManualMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logMealManual({ ...manualForm, date: selectedDate });
      setShowManualForm(false);
      setManualForm({ description: '', calories: '', protein: '', carbs: '', fat: '' });
      fetchNutritionPlan();
    } catch (err) {
      alert('فشل إضافة الوجبة يدوياً.');
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await api.deleteMealLog(id);
      fetchNutritionPlan();
    } catch (err) {
      alert('فشل حذف الوجبة.');
    }
  };

  const handleLogWater = async (amount: number) => {
    try {
      await api.logWater({ amountMl: amount, date: selectedDate });
      fetchNutritionPlan();
    } catch (err) {
      alert('فشل تسجيل المياه.');
    }
  };

  // Calculations for Macros
  const getMacrosSummary = () => {
    if (!nutritionPlan) return { cal: 0, p: 0, c: 0, f: 0, calPct: 0, pPct: 0, cPct: 0, fPct: 0 };
    
    const cal = nutritionPlan.mealsLogged.reduce((sum: number, m: any) => sum + m.calories, 0);
    const p = nutritionPlan.mealsLogged.reduce((sum: number, m: any) => sum + m.protein, 0);
    const c = nutritionPlan.mealsLogged.reduce((sum: number, m: any) => sum + m.carbs, 0);
    const f = nutritionPlan.mealsLogged.reduce((sum: number, m: any) => sum + m.fat, 0);

    return {
      cal,
      p,
      c,
      f,
      calPct: Math.min((cal / nutritionPlan.caloriesGoal) * 100, 100),
      pPct: Math.min((p / nutritionPlan.proteinGoal) * 100, 100),
      cPct: Math.min((c / nutritionPlan.carbsGoal) * 100, 100),
      fPct: Math.min((f / nutritionPlan.fatGoal) * 100, 100),
    };
  };

  const macros = getMacrosSummary();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '0 0 20px 20px', borderTop: 'none' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BEASTMODE
        </h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => onNavigate('dashboard')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.workout}</button>
          <button onClick={() => onNavigate('nutrition')} className="glow-btn" style={{ padding: '8px 16px' }}>{t.nutrition}</button>
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
        {/* Date selection */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '22px' }}>سجل التغذية اليومي 🥑</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>نظام وجبات متزامن مع أيام تمرينك وصحتك</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
              style={{ width: '170px' }}
            />
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>جاري تحميل أو توليد خطة الوجبات بالذكاء الاصطناعي...</div>}

        {!loading && nutritionPlan && (
          <div className="grid-responsive animated-fade" style={{ gridTemplateColumns: '2fr 1fr' }}>
            
            {/* Right Column: AI Recommendations & Text Loggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 1. Macro Progress Tracking */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>تتبع السعرات والماكروز اليومي</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', textAlign: 'center' }}>
                  
                  {/* Calories Progress */}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>السعرات</span>
                    <h2 style={{ fontSize: '20px', margin: '6px 0', color: 'var(--primary)' }}>{macros.cal} / {nutritionPlan.caloriesGoal}</h2>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${macros.calPct}%`, height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{macros.calPct.toFixed(0)}% مكتمل</span>
                  </div>

                  {/* Protein */}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>بروتين</span>
                    <h2 style={{ fontSize: '20px', margin: '6px 0' }}>{macros.p}g / {nutritionPlan.proteinGoal}g</h2>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${macros.pPct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{macros.pPct.toFixed(0)}%</span>
                  </div>

                  {/* Carbs */}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>كربوهيدرات</span>
                    <h2 style={{ fontSize: '20px', margin: '6px 0' }}>{macros.c}g / {nutritionPlan.carbsGoal}g</h2>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${macros.cPct}%`, height: '100%', background: 'var(--secondary)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{macros.cPct.toFixed(0)}%</span>
                  </div>

                  {/* Fat */}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>دهون</span>
                    <h2 style={{ fontSize: '20px', margin: '6px 0' }}>{macros.f}g / {nutritionPlan.fatGoal}g</h2>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${macros.fPct}%`, height: '100%', background: 'var(--info)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{macros.fPct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* 2. AI Recommended Plan */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <Sparkles size={20} color="var(--secondary)" />
                  <h3 style={{ fontSize: '18px' }}>خطة وجباتك الذكية لهذا اليوم (خبير 50 سنة خبرة)</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Breakfast */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '10px', borderRadius: '8px' }}><Coffee size={18} color="var(--secondary)" /></div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>وجبة الفطور المقترحة</h4>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>{nutritionPlan.breakfast}</p>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px' }}><Utensils size={18} color="var(--primary)" /></div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>وجبة الغداء المقترحة</h4>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>{nutritionPlan.lunch}</p>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px' }}><Moon size={18} color="var(--info)" /></div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>وجبة العشاء المقترحة</h4>
                      <p style={{ fontSize: '13px', marginTop: '4px' }}>{nutritionPlan.dinner}</p>
                    </div>
                  </div>

                  {/* Snacks */}
                  {nutritionPlan.snacks && (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px' }}><HelpCircle size={18} color="var(--warning)" /></div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>الوجبات الخفيفة والسناك المقترح</h4>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>{nutritionPlan.snacks}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. AI Text Meal Logger */}
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color-glow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '16px' }}>تسجيل الوجبة السريع بالذكاء الاصطناعي (محلل الوجبات)</h3>
                </div>
                <form onSubmit={handleAiMealSubmit} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="مثال: أكلت 150 جرام صدر دجاج مع كوب رز وعلبة زبادي"
                    value={mealText}
                    onChange={(e) => setMealText(e.target.value)}
                    className="input-field"
                    required
                  />
                  <button type="submit" disabled={aiLoading} className="glow-btn" style={{ whiteSpace: 'nowrap' }}>
                    {aiLoading ? 'جاري التحليل...' : 'سجل بالذكاء الاصطناعي'}
                  </button>
                </form>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  اكتب جملة حرة تصف وجبتك، وسيقوم Gemini بتقدير السعرات والماكروز تلقائياً!
                </span>
              </div>
            </div>

            {/* Left Column: Logged Food Lists & Water */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 1. Water Tracker */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifySelf: 'center', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--info)' }}>
                  <Droplet size={20} />
                  <h3 style={{ fontSize: '16px' }}>تتبع شرب الماء 💧</h3>
                </div>
                <h2 style={{ fontSize: '32px', color: 'var(--info)' }}>{nutritionPlan.waterLoggedMl} / 3000 مل</h2>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', margin: '15px 0', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((nutritionPlan.waterLoggedMl / 3000) * 100, 100)}%`, height: '100%', background: 'var(--info)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={() => handleLogWater(250)} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>+ 250 مل (كوب)</button>
                  <button onClick={() => handleLogWater(500)} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '13px' }}>+ 500 مل (قنينة)</button>
                </div>
              </div>

              {/* 2. Logged Meals List */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '16px' }}>الوجبات المسجلة اليوم</h3>
                  <button onClick={() => setShowManualForm(true)} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    + إضافة وجبة يدوياً
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {nutritionPlan.mealsLogged.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>لم تسجل أي وجبات بعد اليوم.</p>
                  ) : (
                    nutritionPlan.mealsLogged.map((meal: any) => (
                      <div
                        key={meal.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>{meal.description}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            🔥 {meal.calories} سعرة | 🥩 {meal.protein}g بروتين | 🍞 {meal.carbs}g كارب | 🥑 {meal.fat}g دهون
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MANUAL MEAL LOG MODAL */}
      {showManualForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 10, 15, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleManualMealSubmit} className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>تسجيل الوجبة يدوياً 📝</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>وصف الوجبة</label>
              <input
                type="text"
                placeholder="مثال: صدر دجاج مشوي مع أرز"
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>السعرات الحرارية (كيلو كالوري)</label>
              <input
                type="number"
                placeholder="450"
                value={manualForm.calories}
                onChange={(e) => setManualForm({ ...manualForm, calories: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>بروتين (g)</label>
                <input
                  type="number"
                  placeholder="35"
                  value={manualForm.protein}
                  onChange={(e) => setManualForm({ ...manualForm, protein: e.target.value })}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>كارب (g)</label>
                <input
                  type="number"
                  placeholder="40"
                  value={manualForm.carbs}
                  onChange={(e) => setManualForm({ ...manualForm, carbs: e.target.value })}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label>دهون (g)</label>
                <input
                  type="number"
                  placeholder="10"
                  value={manualForm.fat}
                  onChange={(e) => setManualForm({ ...manualForm, fat: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="glow-btn" style={{ flex: 1, justifyContent: 'center' }}>تسجيل</button>
              <button type="button" onClick={() => setShowManualForm(false)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
