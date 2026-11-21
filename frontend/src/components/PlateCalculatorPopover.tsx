import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  BAR_OPTIONS,
  calculateBarbellPlates,
  parseWeightKg,
} from '../utils/plateCalculator';

interface PlateCalculatorPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: string | number;
  lang: 'ar' | 'en';
}

export const PlateCalculatorPopover: React.FC<PlateCalculatorPopoverProps> = ({
  isOpen,
  onClose,
  initialWeight,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [targetWeight, setTargetWeight] = useState<number>(() => {
    const parsed = parseWeightKg(initialWeight);
    return parsed >= 20 ? parsed : 60;
  });
  const [barWeight, setBarWeight] = useState<number>(20);

  const calc = useMemo(
    () => calculateBarbellPlates(targetWeight, barWeight),
    [targetWeight, barWeight]
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'حاسبة طارات البار' : 'Barbell Plate Calculator'}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 16, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 100001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel animated-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(94vw, 440px)',
          padding: '22px',
          borderRadius: '20px',
          border: '1px solid rgba(0, 210, 255, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#fff' }}>
              🏋️ {isAr ? 'حاسبة طارات البار الأولمبي' : 'Olympic Plate Calculator'}
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {isAr ? 'ما تركّبه على كل جهة من البار' : 'Exact plates to load on each side'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '10px',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Target Weight Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setTargetWeight((w) => Math.max(barWeight, Number((w - 2.5).toFixed(1))))}
            className="secondary-btn"
            style={{ padding: '8px 14px', fontSize: '15px', fontWeight: 900, borderRadius: '10px' }}
          >
            -2.5
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <input
              type="number"
              step="2.5"
              min={barWeight}
              max={400}
              value={targetWeight}
              onChange={(e) => setTargetWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              style={{
                width: '90px',
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--primary)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isAr ? 'الوزن الإجمالي (كجم)' : 'Total Weight (kg)'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTargetWeight((w) => Math.min(400, Number((w + 2.5).toFixed(1))))}
            className="secondary-btn"
            style={{ padding: '8px 14px', fontSize: '15px', fontWeight: 900, borderRadius: '10px' }}
          >
            +2.5
          </button>
        </div>

        {/* Bar Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {BAR_OPTIONS.map((b) => {
            const active = barWeight === b.weightKg;
            return (
              <button
                key={b.weightKg}
                type="button"
                onClick={() => setBarWeight(b.weightKg)}
                style={{
                  flex: 1,
                  padding: '7px 6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: active ? 'rgba(0, 210, 255, 0.16)' : 'rgba(255,255,255,0.03)',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {b.weightKg} {isAr ? 'كجم' : 'kg'}
              </button>
            );
          })}
        </div>

        {/* Visual Barbell Side Preview */}
        <div
          dir="ltr"
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '14px',
            padding: '18px 14px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '84px',
            gap: '4px',
          }}
        >
          {/* Bar Sleeve */}
          <div style={{ width: '48px', height: '10px', background: '#94a3b8', borderRadius: '4px 0 0 4px' }} />
          <div style={{ width: '8px', height: '24px', background: '#cbd5e1', borderRadius: '2px' }} />
          {calc.platesPerSide.length === 0 ? (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 10px' }}>
              {isAr ? 'البار الفارغ فقط' : 'Empty bar only'}
            </span>
          ) : (
            calc.platesPerSide.flatMap((plate) =>
              Array.from({ length: plate.count }).map((_, idx) => (
                <div
                  key={`${plate.weightKg}-${idx}`}
                  title={`${plate.weightKg}kg`}
                  style={{
                    width: '22px',
                    height: `${plate.heightPx}px`,
                    background: plate.color,
                    color: plate.textColor,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                >
                  {plate.label}
                </div>
              ))
            )
          )}
          <div style={{ width: '24px', height: '10px', background: '#94a3b8', borderRadius: '0 4px 4px 0' }} />
        </div>

        {/* Per-Side Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span>{isAr ? 'لكل جهة:' : 'Per Side:'}</span>
            <span style={{ color: '#10b981' }}>
              {calc.perSideWeightKg} {isAr ? 'كجم' : 'kg'} ({isAr ? 'الإجمالي الفعلي:' : 'Actual:'} {calc.achievableWeightKg} {isAr ? 'كجم' : 'kg'})
            </span>
          </div>
          {calc.platesPerSide.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {calc.platesPerSide.map((p) => (
                <span
                  key={p.weightKg}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${p.color}`,
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {p.count} × {p.weightKg}kg
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
