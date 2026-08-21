import React, { useState } from 'react';
import { X, Search, Crown, Sparkles, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { PRESET_WORKOUT_PLANS } from '../utils/presetWorkoutPlans';
import type { PresetPlan } from '../utils/presetWorkoutPlans';

interface PresetPlansModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  onClose: () => void;
  onSelectPlan: (plan: PresetPlan, openManualBuilder?: boolean) => void;
}

export const PresetPlansModal: React.FC<PresetPlansModalProps> = ({
  isOpen,
  lang,
  onClose,
  onSelectPlan,
}) => {
  const isEn = lang === 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [previewDayIdx, setPreviewDayIdx] = useState<number>(1);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: isEn ? '🌐 All Plans' : '🌐 جميع الخطط' },
    { id: 'LEGENDARY', label: isEn ? '👑 Legendary & Pro' : '👑 خطط الأساطير' },
    { id: 'MUSCLE_FOCUS', label: isEn ? '🎯 Muscle Focus' : '🎯 تركيز عضلي' },
    { id: 'EQUIPMENT', label: isEn ? '🏠 Equipment Based' : '🏠 حسب الأدوات' },
  ];

  const filteredPlans = PRESET_WORKOUT_PLANS.filter((plan) => {
    const matchesCategory = selectedCategory === 'ALL' || plan.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      plan.title_ar.toLowerCase().includes(q) ||
      plan.title_en.toLowerCase().includes(q) ||
      plan.coach_or_source.toLowerCase().includes(q) ||
      plan.description_ar.toLowerCase().includes(q) ||
      plan.description_en.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '1050px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card, #111827)',
          color: 'var(--text-primary)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '22px 28px',
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
              <Crown size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>
                {isEn ? 'Curated Pro Workout Plans Library' : 'مكتبة الخطط والبرامج التدريبية المعتمدة'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isEn
                  ? 'Gold-standard workout routines from legendary champions and sports scientists'
                  : 'أقوى المناهج التدريبية العالمية لأساطير كمال الأجسام وعلماء الميكانيكا الحيوية'}
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

        {/* CONTROLS BAR (SEARCH & CATEGORIES) */}
        <div
          style={{
            padding: '16px 28px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                [isEn ? 'left' : 'right']: '14px',
                color: 'var(--text-secondary)',
              }}
            />
            <input
              type="text"
              placeholder={
                isEn
                  ? 'Search by plan name, coach, muscle, or goal...'
                  : 'ابحث باسم الخطة، المدرب، العضلة المستهدفة، أو الهدف...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: isEn ? '42px' : '14px',
                paddingRight: isEn ? '14px' : '42px',
                fontSize: '13.5px',
                borderRadius: '10px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? 'glow-btn' : 'secondary-btn'}
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  border: selectedCategory === cat.id ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {cat.label}
              </button>
            ))}
            <span style={{ marginInlineStart: 'auto', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {isEn ? `${filteredPlans.length} plans available` : `${filteredPlans.length} خطة متوفرة`}
            </span>
          </div>
        </div>

        {/* PLANS SCROLLABLE LIST */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '15px' }}>{isEn ? 'No workout plans match your search.' : 'لا توجد خطط مطابقة لبحثك الحالي.'}</p>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const isExpanded = expandedPlanId === plan.id;
              const activeDay = isExpanded
                ? plan.days.find((d) => d.dayIndex === previewDayIdx) || plan.days[0]
                : plan.days[0];

              return (
                <div
                  key={plan.id}
                  className="glass-panel"
                  style={{
                    padding: '22px',
                    borderRadius: '16px',
                    border: isExpanded ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* PLAN CARD HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {isEn ? plan.badge_en : plan.badge_ar}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: 'var(--secondary)',
                          }}
                        >
                          <Calendar size={11} style={{ display: 'inline', marginInlineEnd: '4px' }} />
                          {plan.daysPerWeek} {isEn ? 'Days/Week' : 'أيام / أسبوع'}
                        </span>

                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          👤 {plan.coach_or_source}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '17.5px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                        {isEn ? plan.title_en : plan.title_ar}
                      </h3>

                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {isEn ? plan.description_en : plan.description_ar}
                      </p>
                    </div>

                    {/* ACTION BUTTONS ON CARD */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedPlanId(null);
                          } else {
                            setExpandedPlanId(plan.id);
                            setPreviewDayIdx(1);
                          }
                        }}
                        className="secondary-btn"
                        style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        <span>{isExpanded ? (isEn ? 'Hide Details' : 'إخفاء التفاصيل') : (isEn ? 'Preview Days 👁️' : 'معاينة التمارين 👁️')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectPlan(plan, true)}
                        className="secondary-btn"
                        style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <span>{isEn ? 'Customize ✏️' : 'تعديل وتخصيص ✏️'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectPlan(plan, false)}
                        className="glow-btn"
                        style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      >
                        <Sparkles size={15} />
                        <span>{isEn ? 'Apply This Plan ⚡' : 'تطبيق هذا الجدول ⚡'}</span>
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED INTERACTIVE PREVIEW ACCORDION */}
                  {isExpanded && (
                    <div
                      className="animated-fade"
                      style={{
                        marginTop: '8px',
                        padding: '18px',
                        borderRadius: '14px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      {/* Day Tabs */}
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {plan.days.map((d) => (
                          <button
                            key={d.dayIndex}
                            type="button"
                            onClick={() => setPreviewDayIdx(d.dayIndex)}
                            className={previewDayIdx === d.dayIndex ? 'glow-btn' : 'secondary-btn'}
                            style={{
                              padding: '6px 14px',
                              fontSize: '12px',
                              borderRadius: '8px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              cursor: 'pointer',
                              border: previewDayIdx === d.dayIndex ? 'none' : '1px solid var(--border-color)',
                            }}
                          >
                            {isEn ? `Day ${d.dayIndex}` : `اليوم ${d.dayIndex}`}: {d.title.split('(')[0].trim()}
                          </button>
                        ))}
                      </div>

                      {/* Active Day Content */}
                      {activeDay && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>
                              🎯 {activeDay.title} ({activeDay.focusArea})
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {activeDay.isRestDay ? (isEn ? '💤 Rest & Recovery' : '💤 يوم راحة واستشفاء') : `${activeDay.exercises.length} ${isEn ? 'exercises' : 'تمارين'}`}
                            </div>
                          </div>

                          {activeDay.isRestDay ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                              <p style={{ margin: 0, fontSize: '13.5px' }}>
                                {isEn ? '🧘‍♂️ Rest Day: Focus on hydration, 8+ hours sleep, and clean nutrition.' : '🧘‍♂️ يوم راحة: مخصص للاستشفاء العضلي، النوم العميق، وشرب السوائل.'}
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                              {activeDay.exercises.map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{ex.name}</span>
                                    <span style={{ fontSize: '11px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '6px' }}>
                                      {ex.targetMuscle}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                    <span>🔢 <strong>{ex.sets}</strong> {isEn ? 'Sets' : 'جولات'}</span>
                                    <span>⚡ <strong>{ex.reps}</strong> {isEn ? 'Reps' : 'تكرار'}</span>
                                    {ex.weight && <span>🏋️ {ex.weight}</span>}
                                  </div>

                                  {ex.exerciseTips && (
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', opacity: 0.9 }}>
                                      💡 {ex.exerciseTips}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
