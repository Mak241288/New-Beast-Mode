import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Dumbbell, Sparkles, ChevronRight, X } from 'lucide-react';
import { normalizeSearchText, getExerciseAliases } from '../utils/searchNormalizer';
import { ExerciseImage } from './ExerciseImage';

export interface ExerciseItem {
  id: number | string;
  name_en: string;
  name_ar: string;
  muscle_en: string;
  muscle_ar: string;
  equipment_en?: string;
  equipment_ar?: string;
  image_url?: string;
  gif_url?: string;
  [key: string]: any;
}

interface ExerciseSearchAutocompleteProps {
  exercises: ExerciseItem[];
  onSelect: (exercise: ExerciseItem) => void;
  placeholder?: string;
  lang: 'ar' | 'en';
}

export const ExerciseSearchAutocomplete: React.FC<ExerciseSearchAutocompleteProps> = ({
  exercises,
  onSelect,
  placeholder,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prepare normalized items with phonetic aliases for Fuse.js
  const preparedExercises = useMemo(() => {
    return exercises.map((item) => ({
      ...item,
      normalizedNameEn: normalizeSearchText(item.name_en || ''),
      normalizedNameAr: normalizeSearchText(item.name_ar || ''),
      aliases: getExerciseAliases(item.name_en || '', item.name_ar || '', item.muscle_en || ''),
    }));
  }, [exercises]);

  // Configure Fuse.js Fuzzy Engine
  const fuse = useMemo(() => {
    return new Fuse(preparedExercises, {
      keys: [
        { name: 'name_ar', weight: 0.35 },
        { name: 'name_en', weight: 0.35 },
        { name: 'aliases', weight: 0.2 },
        { name: 'muscle_ar', weight: 0.05 },
        { name: 'muscle_en', weight: 0.05 },
      ],
      threshold: 0.4, // Fuzzy threshold (0.0 exact, 1.0 match anything)
      distance: 100,
      ignoreLocation: true,
    });
  }, [preparedExercises]);

  // Compute Direct Matches & Related Suggestions
  const { directMatches, relatedSuggestions } = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { directMatches: [], relatedSuggestions: [] };
    }

    const fuseResults = fuse.search(trimmed);
    const matchedItems = fuseResults.map((r) => r.item);

    const direct = matchedItems.slice(0, 5);
    const directIds = new Set(direct.map((d) => d.id));

    // Find related exercises based on top matched muscle group
    let related: ExerciseItem[] = [];
    if (direct.length > 0) {
      const topTargetMuscle = direct[0].muscle_en;
      related = preparedExercises
        .filter((ex) => ex.muscle_en === topTargetMuscle && !directIds.has(ex.id))
        .slice(0, 3);
    }

    return { directMatches: direct, relatedSuggestions: related };
  }, [query, fuse, preparedExercises]);

  const allListItems = useMemo(() => {
    return [...directMatches, ...relatedSuggestions];
  }, [directMatches, relatedSuggestions]);

  // Open dropdown when query is 2+ chars
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsOpen(true);
      setHighlightedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || allListItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % allListItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + allListItems.length) % allListItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allListItems[highlightedIndex]) {
        handleSelectItem(allListItems[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: ExerciseItem) => {
    onSelect(item);
    setQuery(lang === 'en' ? item.name_en : item.name_ar || item.name_en);
    setIsOpen(false);
  };

  const isRtl = lang === 'ar';

  return (
    <div ref={containerRef} className="autocomplete-container" style={{ position: 'relative', width: '100%' }}>
      {/* Search Input Box */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={18}
          color="var(--text-muted)"
          style={{
            position: 'absolute',
            [isRtl ? 'right' : 'left']: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (isRtl ? 'ابحث عن تمرين (مثال: سكوات، Bench...)' : 'Search exercise (e.g. Squat, Bench...)')}
          className="input-field"
          style={{
            width: '100%',
            paddingRight: isRtl ? '45px' : '38px',
            paddingLeft: isRtl ? '38px' : '45px',
            fontSize: '14px',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              position: 'absolute',
              [isRtl ? 'left' : 'right']: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Real-Time Dropdown Suggestions */}
      {isOpen && allListItems.length > 0 && (
        <div
          className="glass-panel animated-fade"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            maxHeight: '380px',
            overflowY: 'auto',
            borderRadius: '12px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '8px 0',
            backdropFilter: 'blur(16px)',
            background: 'var(--glass-bg, rgba(18, 24, 38, 0.95))',
          }}
        >
          {/* Direct Matches Section */}
          {directMatches.length > 0 && (
            <div>
              <div
                style={{
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '4px',
                }}
              >
                <Sparkles size={13} color="var(--primary)" />
                {isRtl ? 'مطابقات مباشرة' : 'Direct Matches'}
              </div>

              {directMatches.map((item, idx) => {
                const isSelected = highlightedIndex === idx;
                return (
                  <div
                    key={`direct-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-glow, rgba(16, 185, 129, 0.15))' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.05)', flexShrink: 0 }}>
                        <ExerciseImage
                          src={item.gif_url || item.image_url}
                          alt={item.name_en}
                          muscle={item.muscle_en || item.muscle_ar}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {isRtl ? item.name_ar || item.name_en : item.name_en}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {isRtl ? item.name_en : item.name_ar || item.name_en}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        {isRtl ? item.muscle_ar || item.muscle_en : item.muscle_en}
                      </span>
                      {item.equipment_en && (
                        <span className="badge" style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                          {isRtl ? item.equipment_ar || item.equipment_en : item.equipment_en}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Related Suggestions Section */}
          {relatedSuggestions.length > 0 && (
            <div style={{ marginTop: directMatches.length > 0 ? '8px' : 0 }}>
              <div
                style={{
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--secondary, #f97316)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '4px',
                }}
              >
                <ChevronRight size={13} color="var(--secondary, #f97316)" />
                {isRtl ? 'تمارين مقترحة ذات صلة' : 'Related Suggestions'}
              </div>

              {relatedSuggestions.map((item, idx) => {
                const actualIndex = directMatches.length + idx;
                const isSelected = highlightedIndex === actualIndex;
                return (
                  <div
                    key={`related-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setHighlightedIndex(actualIndex)}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--secondary, #f97316)' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Dumbbell size={18} color="var(--secondary, #f97316)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {isRtl ? item.name_ar || item.name_en : item.name_en}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {isRtl ? item.muscle_ar || item.muscle_en : item.muscle_en}
                        </div>
                      </div>
                    </div>

                    <span className="badge" style={{ fontSize: '10px', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--secondary, #f97316)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                      {isRtl ? 'مقترح' : 'Suggested'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
