import React, { useState } from 'react';

interface InteractiveBodyMapProps {
  lang: 'ar' | 'en';
  selectedMuscle: string;
  onSelectMuscle: (muscleKey: string) => void;
}

export const InteractiveBodyMap: React.FC<InteractiveBodyMapProps> = ({
  lang,
  selectedMuscle,
  onSelectMuscle,
}) => {
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  // Muscle labels in AR/EN
  const muscleLabels: Record<string, { ar: string; en: string }> = {
    ALL: { ar: 'كافة العضلات', en: 'All Muscles' },
    chest: { ar: 'الصدر (Chest)', en: 'Chest' },
    shoulders: { ar: 'الأكتاف (Shoulders)', en: 'Shoulders' },
    biceps: { ar: 'البايسبس (Biceps)', en: 'Biceps' },
    triceps: { ar: 'الترايسبس (Triceps)', en: 'Triceps' },
    abs: { ar: 'البطن (Abs)', en: 'Abs & Core' },
    back: { ar: 'الظهر (Lats & Back)', en: 'Back & Lats' },
    traps: { ar: 'الترابيس (Traps)', en: 'Traps' },
    legs: { ar: 'الفخذ الأمامي (Quads)', en: 'Quadriceps' },
    hamstrings: { ar: 'الفخذ الخلفي (Hamstrings)', en: 'Hamstrings' },
    glutes: { ar: 'الأرداف (Glutes)', en: 'Glutes' },
    calves: { ar: 'السمانة (Calves)', en: 'Calves' },
    forearms: { ar: 'السواعد (Forearms)', en: 'Forearms' },
  };

  const isSelected = (key: string) => selectedMuscle.toLowerCase() === key.toLowerCase();

  return (
    <div className="body-map-container glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
      {/* Header & Toggle Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {lang === 'ar' ? '🗺️ خريطة الجسم التفاعلية (MuscleWiki Map)' : '🗺️ Interactive Muscle Map'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {lang === 'ar' ? 'انقر على أي عضلة في الجسم لاستعراض التمارين المستهدفة فوراً' : 'Click on any muscle to filter targeted exercises immediately'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Front / Back Toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('front')}
              className={`btn-sm ${viewMode === 'front' ? 'primary-btn' : 'secondary-btn'}`}
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', border: 'none' }}
            >
              {lang === 'ar' ? 'الجزء الأمامي' : 'Front View'}
            </button>
            <button
              onClick={() => setViewMode('back')}
              className={`btn-sm ${viewMode === 'back' ? 'primary-btn' : 'secondary-btn'}`}
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', border: 'none' }}
            >
              {lang === 'ar' ? 'الجزء الخلفي' : 'Back View'}
            </button>
          </div>

          {/* Reset button */}
          {selectedMuscle !== 'ALL' && (
            <button
              onClick={() => onSelectMuscle('ALL')}
              className="secondary-btn"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', color: 'var(--primary)' }}
            >
              {lang === 'ar' ? 'إظهار الكل 🔄' : 'Show All 🔄'}
            </button>
          )}
        </div>
      </div>

      {/* Selected Muscle Indicator */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          {lang === 'ar' ? 'العضلة المحددة حالياً:' : 'Active Targeted Muscle:'}
        </span>
        <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)' }}>
          {muscleLabels[selectedMuscle] ? (lang === 'ar' ? muscleLabels[selectedMuscle].ar : muscleLabels[selectedMuscle].en) : selectedMuscle}
        </span>
      </div>

      {/* Muscle Anatomy Vector Map */}
      <div className="body-map-interactive-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '340px', padding: '10px' }}>
        <svg
          viewBox="0 0 400 520"
          style={{ width: '100%', maxWidth: '360px', height: 'auto', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}
        >
          {/* Human Body Silhouette Background Outline */}
          <g opacity="0.15" fill="var(--text-primary)" stroke="var(--text-secondary)" strokeWidth="2">
            {/* Head */}
            <circle cx="200" cy="45" r="28" />
            {/* Neck */}
            <path d="M188 72 L212 72 L216 90 L184 90 Z" />
            {/* Torso & Legs Base Contour */}
            <path d="M130 110 C130 90 270 90 270 110 L280 230 L250 320 L230 500 L205 500 L200 340 L195 500 L170 500 L150 320 L120 230 Z" />
          </g>

          {/* FRONT VIEW ANATOMY MAP */}
          {viewMode === 'front' && (
            <g className="body-map-front">
              {/* Shoulders (Left & Right Deltoids) */}
              <g
                onClick={() => onSelectMuscle('shoulders')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('shoulders') ? 'active-muscle' : ''}`}
              >
                <path d="M130 100 Q115 115 125 140 Q145 135 142 108 Z" fill={isSelected('shoulders') ? 'var(--primary)' : 'rgba(59, 130, 246, 0.4)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M270 100 Q285 115 275 140 Q255 135 258 108 Z" fill={isSelected('shoulders') ? 'var(--primary)' : 'rgba(59, 130, 246, 0.4)'} stroke="#fff" strokeWidth="1.5" />
                <text x="110" y="120" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="end">{lang === 'ar' ? 'كتف' : 'Shoulder'}</text>
              </g>

              {/* Chest (Pectoralis Major) */}
              <g
                onClick={() => onSelectMuscle('chest')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('chest') ? 'active-muscle' : ''}`}
              >
                <path d="M145 105 C160 105 195 112 196 142 C170 150 144 140 142 110 Z" fill={isSelected('chest') ? 'var(--primary)' : 'rgba(239, 68, 68, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M255 105 C240 105 205 112 204 142 C230 150 256 140 258 110 Z" fill={isSelected('chest') ? 'var(--primary)' : 'rgba(239, 68, 68, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="125" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'الصدر' : 'Chest'}</text>
              </g>

              {/* Biceps (Left & Right Biceps Brachii) */}
              <g
                onClick={() => onSelectMuscle('biceps')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('biceps') ? 'active-muscle' : ''}`}
              >
                <path d="M122 142 Q112 165 125 185 Q136 168 135 142 Z" fill={isSelected('biceps') ? 'var(--primary)' : 'rgba(16, 185, 129, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M278 142 Q288 165 275 185 Q264 168 265 142 Z" fill={isSelected('biceps') ? 'var(--primary)' : 'rgba(16, 185, 129, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <text x="95" y="165" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="end">{lang === 'ar' ? 'بايسبس' : 'Biceps'}</text>
              </g>

              {/* Forearms (Left & Right) */}
              <g
                onClick={() => onSelectMuscle('forearms')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('forearms') ? 'active-muscle' : ''}`}
              >
                <path d="M120 190 L105 235 L120 240 L128 192 Z" fill={isSelected('forearms') ? 'var(--primary)' : 'rgba(245, 158, 11, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M280 190 L295 235 L280 240 L272 192 Z" fill={isSelected('forearms') ? 'var(--primary)' : 'rgba(245, 158, 11, 0.5)'} stroke="#fff" strokeWidth="1.5" />
              </g>

              {/* Abs & Core (Abdominals) */}
              <g
                onClick={() => onSelectMuscle('abs')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('abs') ? 'active-muscle' : ''}`}
              >
                <rect x="170" y="148" width="28" height="70" rx="6" fill={isSelected('abs') ? 'var(--primary)' : 'rgba(168, 85, 247, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <text x="184" y="188" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'البطن' : 'Abs'}</text>
              </g>

              {/* Quadriceps (Front Legs/Quads) */}
              <g
                onClick={() => onSelectMuscle('legs')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('legs') ? 'active-muscle' : ''}`}
              >
                <path d="M152 245 C145 270 155 350 174 350 C185 330 185 260 178 245 Z" fill={isSelected('legs') ? 'var(--primary)' : 'rgba(236, 72, 153, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M248 245 C255 270 245 350 226 350 C215 330 215 260 222 245 Z" fill={isSelected('legs') ? 'var(--primary)' : 'rgba(236, 72, 153, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="300" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'الفخذ' : 'Quads'}</text>
              </g>

              {/* Calves Front */}
              <g
                onClick={() => onSelectMuscle('calves')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('calves') ? 'active-muscle' : ''}`}
              >
                <path d="M165 375 Q158 420 172 455 Q180 420 178 375 Z" fill={isSelected('calves') ? 'var(--primary)' : 'rgba(14, 165, 233, 0.5)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M235 375 Q242 420 228 455 Q220 420 222 375 Z" fill={isSelected('calves') ? 'var(--primary)' : 'rgba(14, 165, 233, 0.5)'} stroke="#fff" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {/* BACK VIEW ANATOMY MAP */}
          {viewMode === 'back' && (
            <g className="body-map-back">
              {/* Trapezius (Traps) */}
              <g
                onClick={() => onSelectMuscle('traps')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('traps') ? 'active-muscle' : ''}`}
              >
                <path d="M184 75 L216 75 L235 105 L165 105 Z" fill={isSelected('traps') ? 'var(--primary)' : 'rgba(245, 158, 11, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="93" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'ترابيس' : 'Traps'}</text>
              </g>

              {/* Triceps (Rear Arms) */}
              <g
                onClick={() => onSelectMuscle('triceps')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('triceps') ? 'active-muscle' : ''}`}
              >
                <path d="M125 110 Q112 140 122 175 Q135 150 138 115 Z" fill={isSelected('triceps') ? 'var(--primary)' : 'rgba(16, 185, 129, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M275 110 Q288 140 278 175 Q265 150 262 115 Z" fill={isSelected('triceps') ? 'var(--primary)' : 'rgba(16, 185, 129, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="95" y="145" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="end">{lang === 'ar' ? 'ترايسبس' : 'Triceps'}</text>
              </g>

              {/* Lats & Upper/Lower Back */}
              <g
                onClick={() => onSelectMuscle('back')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('back') ? 'active-muscle' : ''}`}
              >
                <path d="M145 110 C160 110 240 110 255 110 L235 220 C200 230 200 230 165 220 Z" fill={isSelected('back') ? 'var(--primary)' : 'rgba(59, 130, 246, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="160" fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'الظهر (Lats)' : 'Back & Lats'}</text>
              </g>

              {/* Glutes (Arse / Buttocks) */}
              <g
                onClick={() => onSelectMuscle('glutes')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('glutes') ? 'active-muscle' : ''}`}
              >
                <circle cx="172" cy="255" r="26" fill={isSelected('glutes') ? 'var(--primary)' : 'rgba(236, 72, 153, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <circle cx="228" cy="255" r="26" fill={isSelected('glutes') ? 'var(--primary)' : 'rgba(236, 72, 153, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="260" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'مؤخرة' : 'Glutes'}</text>
              </g>

              {/* Hamstrings (Rear Thighs) */}
              <g
                onClick={() => onSelectMuscle('hamstrings')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('hamstrings') ? 'active-muscle' : ''}`}
              >
                <path d="M150 285 Q145 330 168 360 Q180 330 178 285 Z" fill={isSelected('hamstrings') ? 'var(--primary)' : 'rgba(168, 85, 247, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M250 285 Q255 330 232 360 Q220 330 222 285 Z" fill={isSelected('hamstrings') ? 'var(--primary)' : 'rgba(168, 85, 247, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="325" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'فخذ خلفي' : 'Hamstrings'}</text>
              </g>

              {/* Calves (Gastrocnemius Rear) */}
              <g
                onClick={() => onSelectMuscle('calves')}
                style={{ cursor: 'pointer' }}
                className={`muscle-node ${isSelected('calves') ? 'active-muscle' : ''}`}
              >
                <path d="M162 375 Q152 420 170 460 Q182 420 178 375 Z" fill={isSelected('calves') ? 'var(--primary)' : 'rgba(14, 165, 233, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <path d="M238 375 Q248 420 230 460 Q218 420 222 375 Z" fill={isSelected('calves') ? 'var(--primary)' : 'rgba(14, 165, 233, 0.6)'} stroke="#fff" strokeWidth="1.5" />
                <text x="200" y="420" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">{lang === 'ar' ? 'سمانة' : 'Calves'}</text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Quick Muscle Selector Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
        {Object.keys(muscleLabels).map((key) => (
          <button
            key={key}
            onClick={() => onSelectMuscle(key)}
            className={`btn-chip ${isSelected(key) ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '20px',
              border: isSelected(key) ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: isSelected(key) ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
              color: isSelected(key) ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {lang === 'ar' ? muscleLabels[key].ar : muscleLabels[key].en}
          </button>
        ))}
      </div>
    </div>
  );
};
