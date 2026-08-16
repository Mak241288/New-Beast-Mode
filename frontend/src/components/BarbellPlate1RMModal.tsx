import React, { useState, useMemo } from 'react';
import { X, Dumbbell, Percent, Layers, Target } from 'lucide-react';
import { calculateBarbellPlates, calculate1RM, AVAILABLE_PLATES } from '../utils/strengthCalculator';

interface BarbellPlate1RMModalProps {
  isOpen: boolean;
  lang: 'ar' | 'en';
  initialWeight?: number;
  initialReps?: number;
  onClose: () => void;
}

export const BarbellPlate1RMModal: React.FC<BarbellPlate1RMModalProps> = ({
  isOpen,
  lang,
  initialWeight = 80,
  initialReps = 8,
  onClose,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'plates' | '1rm'>('plates');

  // Plate Calculator States
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight || 80);
  const [barWeight, setBarWeight] = useState<number>(20);
  const [selectedPlates, setSelectedPlates] = useState<number[]>([25, 20, 15, 10, 5, 2.5, 1.25]);

  // 1RM Calculator States
  const [oneRmWeight, setOneRmWeight] = useState<number>(initialWeight || 80);
  const [oneRmReps, setOneRmReps] = useState<number>(initialReps || 8);

  const plateResult = useMemo(() => {
    return calculateBarbellPlates(targetWeight, barWeight, selectedPlates);
  }, [targetWeight, barWeight, selectedPlates]);

  const oneRmResult = useMemo(() => {
    return calculate1RM(oneRmWeight, oneRmReps);
  }, [oneRmWeight, oneRmReps]);

  if (!isOpen) return null;

  const togglePlateAvailability = (weight: number) => {
    if (selectedPlates.includes(weight)) {
      if (selectedPlates.length > 1) {
        setSelectedPlates(selectedPlates.filter((w) => w !== weight));
      }
    } else {
      setSelectedPlates([...selectedPlates, weight].sort((a, b) => b - a));
    }
  };

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
          maxWidth: '920px',
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
        {/* MODAL HEADER */}
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
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <Dumbbell size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>
                {isEn ? 'Barbell Plate & 1RM Calculator 🔢' : 'حاسبة أوزان البار والصفائح والـ 1RM 🔢'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isEn
                  ? 'Visual barbell plate loading & precise 1-Rep Max percentage tables'
                  : 'محاكي صفائح البار الأولمبي وحساب أقصى وزن لتكرار واحد مع جدول النسب المئوية'}
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

        {/* TAB NAVIGATION */}
        <div
          style={{
            padding: '12px 26px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('plates')}
            className={activeTab === 'plates' ? 'glow-btn' : 'secondary-btn'}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layers size={16} />
            <span>{isEn ? 'Barbell Plate Loader 🏋️' : 'حاسبة صفائح البار 🏋️'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('1rm')}
            className={activeTab === '1rm' ? 'glow-btn' : 'secondary-btn'}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Percent size={16} />
            <span>{isEn ? '1-Rep Max (1RM) Engine 🎯' : 'حاسبة أقصى وزن (1RM) 🎯'}</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* TAB 1: BARBELL PLATES CALCULATOR */}
          {activeTab === 'plates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* TARGET WEIGHT INPUT & BAR SELECTOR */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Total Weight Input */}
                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    {isEn ? 'Total Target Weight (kg):' : 'الوزن الإجمالي المستهدف (كغ):'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      min={barWeight}
                      step="2.5"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(Math.max(barWeight, parseFloat(e.target.value) || barWeight))}
                      className="input-field"
                      style={{ fontSize: '24px', fontWeight: '900', padding: '8px 14px', width: '130px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[60, 80, 100, 120, 140].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setTargetWeight(w)}
                          className="secondary-btn"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          {w} kg
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar Weight Selector */}
                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    {isEn ? 'Barbell Weight:' : 'نوع ووزن البار المستخدم:'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { wt: 20, name_en: '20kg Olympic (Men)', name_ar: '20 كغ أولمبي قياسي' },
                      { wt: 15, name_en: '15kg (Women / Tech)', name_ar: '15 كغ تكنيك / سيدات' },
                      { wt: 10, name_en: '10kg (EZ / Home)', name_ar: '10 كغ زكزاك / منزلي' },
                    ].map((b) => (
                      <button
                        key={b.wt}
                        type="button"
                        onClick={() => setBarWeight(b.wt)}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: '10px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          border: barWeight === b.wt ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                          background: barWeight === b.wt ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                          color: barWeight === b.wt ? '#f59e0b' : 'var(--text-secondary)',
                          textAlign: 'center',
                        }}
                      >
                        {isEn ? b.name_en : b.name_ar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* VISUAL BARBELL SLEEVE GRAPHIC */}
              <div
                className="glass-panel"
                style={{
                  padding: '30px 20px',
                  borderRadius: '18px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.04), rgba(0,0,0,0.3))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b' }}>
                  🏋️ {isEn ? `Weight on Each Side: ${plateResult.weightPerSide} kg` : `الوزن المطلوب وضعه على كل جهة: ${plateResult.weightPerSide} كغ`}
                </div>

                {/* THE VISUAL BARBELL */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '160px',
                    width: '100%',
                    overflowX: 'auto',
                    padding: '20px 0',
                  }}
                >
                  {/* Left Collar (Stop Ring) */}
                  <div
                    style={{
                      width: '14px',
                      height: '70px',
                      background: '#475569',
                      borderRadius: '4px',
                      boxShadow: '0 0 8px rgba(0,0,0,0.6)',
                    }}
                  />

                  {/* Left Sleeve (stacked from inside to outside) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      background: 'linear-gradient(180deg, #94a3b8, #64748b, #334155)',
                      height: '24px',
                      padding: '0 4px',
                      borderRadius: '2px',
                    }}
                  >
                    {plateResult.platesPerSide.length === 0 ? (
                      <div style={{ fontSize: '11px', color: '#cbd5e1', padding: '0 12px', whiteSpace: 'nowrap' }}>
                        {isEn ? 'Empty Bar' : 'البار فارغ'}
                      </div>
                    ) : (
                      plateResult.platesPerSide.map((item, itemIdx) => (
                        <React.Fragment key={itemIdx}>
                          {Array.from({ length: item.countPerSide }).map((_, cIdx) => (
                            <div
                              key={`${itemIdx}-${cIdx}`}
                              style={{
                                width: '22px',
                                height: `${item.plate.diameter}px`,
                                backgroundColor: item.plate.color,
                                color: item.plate.textColor,
                                border: '2px solid rgba(0,0,0,0.5)',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '900',
                                fontSize: '11px',
                                margin: '0 2px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                transform: 'rotate(180deg)',
                                userSelect: 'none',
                              }}
                            >
                              {item.plate.weight}
                            </div>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  {/* End Spring Collar Clip */}
                  {plateResult.platesPerSide.length > 0 && (
                    <div
                      style={{
                        width: '10px',
                        height: '36px',
                        background: '#e2e8f0',
                        borderRadius: '3px',
                        border: '1px solid #64748b',
                        boxShadow: '0 0 6px rgba(255,255,255,0.2)',
                      }}
                      title={isEn ? 'Spring Collar' : 'قفل الأوزان (الكلبس)'}
                    />
                  )}
                </div>

                {/* SUMMARY STATS */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '13px' }}>
                  <span>
                    🏋️ {isEn ? 'Bar:' : 'وزن البار:'} <strong>{plateResult.barWeight} kg</strong>
                  </span>
                  <span>
                    ➕ {isEn ? 'Plates Total:' : 'إجمالي وزن الصفائح:'} <strong>{plateResult.weightPerSide * 2} kg</strong>
                  </span>
                  <span>
                    🎯 {isEn ? 'Actual Total:' : 'الوزن الإجمالي الفعلي:'} <strong style={{ color: 'var(--primary)' }}>{plateResult.actualWeight} kg</strong>
                  </span>
                  {plateResult.remainder > 0 && (
                    <span style={{ color: '#ef4444' }}>
                      ⚠️ {isEn ? `Remainder: ${plateResult.remainder} kg` : `متبقي يتعذر وزنه: ${plateResult.remainder} كغ`}
                    </span>
                  )}
                </div>
              </div>

              {/* PLATES BREAKDOWN CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                  {isEn ? 'Plates Required Per Side (x2 for full bar):' : 'تفاصيل الصفائح لكل جهة (ضع مثلها على الجهة الأخرى):'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {AVAILABLE_PLATES.map((p) => {
                    const match = plateResult.platesPerSide.find((x) => x.plate.weight === p.weight);
                    const countPerSide = match ? match.countPerSide : 0;
                    const isAvailable = selectedPlates.includes(p.weight);

                    return (
                      <div
                        key={p.weight}
                        onClick={() => togglePlateAvailability(p.weight)}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: countPerSide > 0 ? `2px solid ${p.color}` : '1px solid rgba(255,255,255,0.06)',
                          background: countPerSide > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          opacity: isAvailable ? 1 : 0.4,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: p.color,
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          />
                          <span style={{ fontWeight: '800', fontSize: '13px' }}>{p.weight} kg</span>
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: '900', color: countPerSide > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                          x{countPerSide}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: 1-REP MAX (1RM) CALCULATOR */}
          {activeTab === '1rm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* INPUTS ROW */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Weight Lifted */}
                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    {isEn ? 'Weight Lifted (kg):' : 'الوزن المرفوع (كغ):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="2.5"
                    value={oneRmWeight}
                    onChange={(e) => setOneRmWeight(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="input-field"
                    style={{ fontSize: '24px', fontWeight: '900', padding: '8px 14px', width: '100%' }}
                  />
                </div>

                {/* Repetitions Performed */}
                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    {isEn ? 'Repetitions Completed (1-20 reps):' : 'عدد التكرارات المكتملة (1-20 تكرار):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={oneRmReps}
                    onChange={(e) => setOneRmReps(Math.max(1, Math.min(25, parseInt(e.target.value) || 1)))}
                    className="input-field"
                    style={{ fontSize: '24px', fontWeight: '900', padding: '8px 14px', width: '100%' }}
                  />
                </div>

                {/* Estimated 1RM Card */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>
                    🏆 {isEn ? 'Estimated 1-Rep Max (1RM)' : 'أقصى وزن تقديري لتكرار واحد'}
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#f59e0b', margin: '4px 0' }}>
                    {oneRmResult.estimated1RM}{' '}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>kg</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    (Epley: {oneRmResult.epley}kg • Brzycki: {oneRmResult.brzycki}kg)
                  </div>
                </div>
              </div>

              {/* PERCENTAGES BREAKDOWN TABLE */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="var(--primary)" />
                  <span>{isEn ? 'Working Set Percentages & Target Rep Ranges' : 'جدول النسب المئوية والتكرارات المستهدفة للجولات:'}</span>
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px' }}>{isEn ? 'Percentage' : 'النسبة'}</th>
                        <th style={{ padding: '10px 12px' }}>{isEn ? 'Calculated Weight' : 'الوزن المحسوب'}</th>
                        <th style={{ padding: '10px 12px' }}>{isEn ? 'Est. Reps' : 'التكرار التقديري'}</th>
                        <th style={{ padding: '10px 12px' }}>{isEn ? 'Training Focus' : 'الهدف التدريبي'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oneRmResult.percentages.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: item.percent === 80 || item.percent === 85 ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '10px 12px', fontWeight: '800', color: item.percent >= 90 ? '#ef4444' : item.percent >= 75 ? '#f59e0b' : 'var(--primary)' }}>
                            {item.percent}%
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '900', fontSize: '14px' }}>
                            {item.weight} kg
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '700' }}>
                            {item.estimatedReps} {isEn ? 'reps' : 'تكرارات'}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                            {isEn ? item.trainingZone_en : item.trainingZone_ar}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
