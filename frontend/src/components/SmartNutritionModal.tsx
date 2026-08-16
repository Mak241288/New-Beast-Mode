import React, { useState, useMemo } from 'react';
import { X, Flame, Droplets, Utensils, Sliders, Dumbbell, Moon } from 'lucide-react';
import { calculateNutrition, type NutritionProfile } from '../utils/nutritionCalculator';

interface SmartNutritionModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  userProfile: any;
  onClose: () => void;
}

export const SmartNutritionModal: React.FC<SmartNutritionModalProps> = ({
  isOpen,
  lang,
  userProfile,
  onClose,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'macros' | 'meals' | 'foods'>('macros');
  const [dayType, setDayType] = useState<'workout' | 'rest'>('workout');
  const [customProteinPerKg, setCustomProteinPerKg] = useState<number>(2.2);

  const profile: NutritionProfile = useMemo(() => {
    return {
      weightKg: Number(userProfile?.currentWeight) || 75,
      heightCm: Number(userProfile?.height) || 175,
      age: Number(userProfile?.age) || 26,
      gender: userProfile?.gender === 'female' ? 'female' : 'male',
      fitnessGoal: userProfile?.fitnessGoal || 'HYPERTROPHY',
      daysPerWeek: Number(userProfile?.daysPerWeek) || 4,
      proteinPerKg: customProteinPerKg,
    };
  }, [userProfile, customProteinPerKg]);

  const nutrition = useMemo(() => {
    return calculateNutrition(profile);
  }, [profile]);

  if (!isOpen) return null;

  const currentMacros = dayType === 'workout' ? nutrition.workoutDay : nutrition.restDay;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel animated-fade"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #111827)',
          color: 'var(--text-primary)',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '20px 26px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                color: 'var(--primary)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Utensils size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEn ? 'Smart Nutrition & Macro Coach 🥗' : 'حاسبة السعرات والماكروز الذكية 🥗'}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  AI Guided
                </span>
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isEn
                  ? 'Personalized calories & macronutrients adapted to your goal and training cadence'
                  : 'توزيع علمي دقيق للسعرات والبروتين والكارب والدهون مخصص لهدفك وجدول تمرينك'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="secondary-btn"
            style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* TOP TAB SWITCHER */}
        <div
          style={{
            padding: '12px 26px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('macros')}
              className={activeTab === 'macros' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '8px' }}
            >
              {isEn ? '📊 Macro Target' : '📊 الماكروز المستهدفة'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meals')}
              className={activeTab === 'meals' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '8px' }}
            >
              {isEn ? '🍽️ Meal Timing' : '🍽️ توزيع الوجبات'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('foods')}
              className={activeTab === 'foods' ? 'glow-btn' : 'secondary-btn'}
              style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '8px' }}
            >
              {isEn ? '🥩 Clean Food Guide' : '🥩 دليل الأطعمة النظيفة'}
            </button>
          </div>

          {/* User Quick Info */}
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            ⚖️ {profile.weightKg} kg • 📏 {profile.heightCm} cm • 🎯 {profile.fitnessGoal}
          </div>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: MACROS TARGET */}
          {activeTab === 'macros' && (
            <>
              {/* DAY TYPE SELECTOR (WORKOUT VS REST) */}
              <div
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>
                    {isEn ? 'Cycle Strategy:' : 'استراتيجية التدوير:'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {isEn
                      ? '(Higher carbs on workout days for pumps, higher healthy fats on rest days for joint recovery)'
                      : '(كارب أعلى في أيام التمرين للطاقة، ودهون صحية أعلى في أيام الراحة للاستشفاء)'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDayType('workout')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: dayType === 'workout' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      background: dayType === 'workout' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      color: dayType === 'workout' ? 'var(--primary)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Dumbbell size={15} />
                    <span>{isEn ? 'Workout Day 🏋️' : 'يوم التمرين 🏋️'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDayType('rest')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: dayType === 'rest' ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
                      background: dayType === 'rest' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                      color: dayType === 'rest' ? 'var(--secondary)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Moon size={15} />
                    <span>{isEn ? 'Rest & Recovery Day 💤' : 'يوم الراحة والاستشفاء 💤'}</span>
                  </button>
                </div>
              </div>

              {/* CALORIE & ENERGY OVERVIEW */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Daily Calories Target */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--primary)', marginBottom: '6px' }}>
                    <Flame size={20} />
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>
                      {isEn ? 'Daily Energy Target' : 'السعرات اليومية المستهدفة'}
                    </span>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--primary)' }}>
                    {currentMacros.calories}{' '}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>kcal</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isEn ? 'Target based on goal & energy expenditure' : 'محسوبة بدقة لتحقيق أفضل نتيجة بدنية'}
                  </div>
                </div>

                {/* BMR */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {isEn ? 'Basal Metabolic Rate (BMR)' : 'معدل الأيض الأساسي (BMR)'}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '800' }}>
                    {nutrition.bmr}{' '}
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>kcal</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isEn ? 'Calories burned at rest' : 'سعرات الحرق الأساسية للجسم أثناء الراحة'}
                  </div>
                </div>

                {/* TDEE */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {isEn ? 'Maintenance Level (TDEE)' : 'مستوى الثبات اليومي (TDEE)'}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--secondary)' }}>
                    {nutrition.tdee}{' '}
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>kcal</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isEn ? 'Total expenditure including daily steps' : 'إجمالي الحرق اليومي شاملاً الحركة والتمارين'}
                  </div>
                </div>

                {/* Water Goal */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--secondary)', marginBottom: '6px' }}>
                    <Droplets size={18} />
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>
                      {isEn ? 'Daily Water' : 'احتياج الماء اليومي'}
                    </span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--secondary)' }}>
                    {nutrition.waterIntakeLiters}{' '}
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Liters</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isEn ? 'Optimizes cell volumization & pumps' : 'لتحسين ضخ الدم والترطيب العضلي'}
                  </div>
                </div>
              </div>

              {/* MACRONUTRIENT BREAKDOWN CARDS */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* PROTEIN CARD */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>
                      🥩 {isEn ? 'Protein (Muscle Building)' : 'البروتين (البناء العضلي)'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      {currentMacros.proteinPercent}%
                    </span>
                  </div>

                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444' }}>
                    {currentMacros.proteinGrams}{' '}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      g / day
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    🔥 {currentMacros.proteinCalories} kcal • ({customProteinPerKg} g/kg of bodyweight)
                  </div>

                  {/* Visual Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${currentMacros.proteinPercent}%`, height: '100%', background: '#ef4444', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* CARBS CARD */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    background: 'rgba(245, 158, 11, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#f59e0b' }}>
                      🌾 {isEn ? 'Carbohydrates (Energy & ATP)' : 'الكربوهيدرات (طاقة التدريب)'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      {currentMacros.carbsPercent}%
                    </span>
                  </div>

                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b' }}>
                    {currentMacros.carbsGrams}{' '}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      g / day
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    🔥 {currentMacros.carbsCalories} kcal • {dayType === 'workout' ? (isEn ? 'Glycogen Fuel' : 'تعبئة الجليكوجين') : (isEn ? 'Moderate' : 'استشفاء هادئ')}
                  </div>

                  {/* Visual Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${currentMacros.carbsPercent}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* FATS CARD */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                      🥑 {isEn ? 'Healthy Fats (Hormone Support)' : 'الدهون الصحية (الهرمونات والمفاصل)'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      {currentMacros.fatsPercent}%
                    </span>
                  </div>

                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)' }}>
                    {currentMacros.fatsGrams}{' '}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      g / day
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    🔥 {currentMacros.fatsCalories} kcal • {isEn ? 'Testosterone & Joint Health' : 'لدعم التستوستيرون ومرونة المفاصل'}
                  </div>

                  {/* Visual Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${currentMacros.fatsPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* PROTEIN INTAKE CUSTOMIZER SLIDER */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px 22px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color="var(--primary)" />
                    <span style={{ fontSize: '13.5px', fontWeight: '800' }}>
                      {isEn ? 'Adjust Protein Ratio Per Kg:' : 'تعديل نسبة البروتين لكل كغ من وزن الجسم:'}
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)' }}>
                    {customProteinPerKg} g / kg
                  </span>
                </div>

                <input
                  type="range"
                  min="1.6"
                  max="2.6"
                  step="0.1"
                  value={customProteinPerKg}
                  onChange={(e) => setCustomProteinPerKg(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>1.6 g/kg (Moderate / متوازن)</span>
                  <span>2.2 g/kg (Hypertrophy / التضخيم المثالي)</span>
                  <span>2.6 g/kg (Hard Cut / التنشيف الشديد)</span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MEAL TIMING & DISTRIBUTION */}
          {activeTab === 'meals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {isEn
                  ? 'Optimal nutrient distribution spread across 4 key metabolic windows:'
                  : 'توزيع مثالي للعناصر الغذائية على 4 وجبات رئيسية لتحقيق أعلى معدل تخليق بروتين (MPS):'}
              </div>

              {nutrition.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    padding: '18px 22px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '220px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                      {isEn ? meal.name_en : meal.name_ar}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                      ⏱️ {isEn ? meal.time_en : meal.time_ar}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      💡 {isEn ? meal.tips_en : meal.tips_ar}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                        {meal.calories}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>kcal</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>
                        {meal.proteinG}g
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Protein</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#f59e0b' }}>
                        {meal.carbsG}g
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Carbs</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                        {meal.fatsG}g
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Fats</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CLEAN FOOD GUIDE */}
          {activeTab === 'foods' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {nutrition.foodSources.map((cat, catIdx) => (
                <div key={catIdx} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 14px 0', color: catIdx === 0 ? '#ef4444' : catIdx === 1 ? '#f59e0b' : 'var(--primary)' }}>
                    {isEn ? cat.category_en : cat.category_ar}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {cat.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '13.5px' }}>
                          {isEn ? item.name_en : item.name_ar}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          📏 {isEn ? item.portion_en : item.portion_ar}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '8px' }}>
                          <span style={{ color: '#ef4444' }}>P: {item.protein}g</span>
                          <span style={{ color: '#f59e0b' }}>C: {item.carbs}g</span>
                          <span style={{ color: 'var(--primary)' }}>F: {item.fats}g</span>
                          <span>• {item.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
