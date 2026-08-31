import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';

export type ColorTheme = 'volt' | 'crimson' | 'gold' | 'cyan';

const PALETTES: Array<{ id: ColorTheme; nameAr: string; nameEn: string; color: string; icon: string }> = [
  { id: 'volt', nameAr: 'أصفر كهربائي (Volt)', nameEn: 'Cyber Volt (Neon)', color: '#ccff00', icon: '⚡' },
  { id: 'crimson', nameAr: 'أحمر قرمزي (Crimson)', nameEn: 'Crimson Iron (Fire)', color: '#ff1744', icon: '🔥' },
  { id: 'gold', nameAr: 'ذهب أولمبيا (Gold)', nameEn: 'Imperial Gold (Onyx)', color: '#f59e0b', icon: '👑' },
  { id: 'cyan', nameAr: 'أزرق جليدي (Cyan)', nameEn: 'Aurora Cyan (Frost)', color: '#00d2ff', icon: '💎' },
];

export const ThemeToggle: React.FC<{ showPaletteDropdown?: boolean; placement?: 'auto' | 'up' | 'down' }> = ({
  showPaletteDropdown = true,
  placement = 'auto',
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('volt');
  const [showDropdown, setShowDropdown] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left?: number }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    const savedColor = (localStorage.getItem('color_theme') as ColorTheme) || 'volt';

    setTheme(savedTheme);
    setColorTheme(savedColor);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-color-theme', savedColor);
  }, []);

  const calculatePosition = () => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownWidth = 230;
    const viewportWidth = window.innerWidth;
    const spaceBelow = window.innerHeight - rect.bottom;
    const isUp = placement === 'up' || (placement === 'auto' && spaceBelow < 260);

    // Smart horizontal clamping within viewport boundaries
    let calculatedLeft = rect.left;
    if (document.documentElement.dir === 'rtl') {
      calculatedLeft = rect.right - dropdownWidth;
    }

    if (calculatedLeft + dropdownWidth > viewportWidth - 12) {
      calculatedLeft = viewportWidth - dropdownWidth - 12;
    }
    if (calculatedLeft < 12) {
      calculatedLeft = 12;
    }

    if (isUp) {
      setCoords({
        bottom: window.innerHeight - rect.top + 8,
        left: calculatedLeft,
      });
    } else {
      setCoords({
        top: rect.bottom + 8,
        left: calculatedLeft,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    const handleScrollOrResize = () => {
      if (showDropdown) {
        calculatePosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [showDropdown]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleSelectColorTheme = (id: ColorTheme) => {
    setColorTheme(id);
    document.documentElement.setAttribute('data-color-theme', id);
    localStorage.setItem('color_theme', id);
    setShowDropdown(false);
  };

  const handleToggleDropdown = () => {
    if (!showDropdown) {
      calculatePosition();
    }
    setShowDropdown((prev) => !prev);
  };

  const isRtl = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : true;

  return (
    <div ref={dropdownRef} className="theme-toggle" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {/* Light / Dark Mode Toggle Button */}
      <button
        onClick={toggleTheme}
        className="secondary-btn"
        style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        aria-label={theme === 'dark' ? (isRtl ? 'الوضع المضيء' : 'Light Mode') : (isRtl ? 'الوضع الداكن' : 'Dark Mode')}
      >
        {theme === 'dark' ? <Sun size={18} color="var(--primary)" /> : <Moon size={18} color="#059669" />}
      </button>

      {/* Color Palette Menu Button */}
      {showPaletteDropdown && (
        <button
          onClick={handleToggleDropdown}
          className="secondary-btn"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'var(--primary)',
            background: showDropdown ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
            boxShadow: '0 0 10px var(--primary-glow)',
            flexShrink: 0,
          }}
          aria-label={isRtl ? 'تغيير ثيم وهوية الألوان الرياضية' : 'Change Visual Theme Palette'}
        >
          <Palette size={17} color="var(--primary)" />
        </button>
      )}

      {/* Palette Popover Menu with 100% Mobile Viewport Clamping (Zero Screen Overflow) */}
      {showDropdown && (
        <div
          ref={popoverRef}
          className="glass-panel animated-fade"
          style={{
            position: 'fixed',
            top: coords.top !== undefined ? `${coords.top}px` : 'auto',
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
            left: coords.left !== undefined ? `${coords.left}px` : '12px',
            width: '230px',
            maxWidth: 'calc(100vw - 24px)',
            padding: '10px 12px',
            borderRadius: '16px',
            border: '1px solid var(--primary)',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 25px var(--primary-glow)',
            zIndex: 9999999,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '4px 6px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Palette size={13} color="var(--primary)" />
            <span>{isRtl ? 'اختر هوية الألوان الرياضية' : 'Curated Visual Themes'}</span>
          </div>

          {PALETTES.map((p) => {
            const isActive = colorTheme === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectColorTheme(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: isActive ? `1px solid ${p.color}` : '1px solid transparent',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isActive ? '800' : '600',
                  textAlign: isRtl ? 'right' : 'left',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}`, flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? p.nameAr : p.nameEn}</span>
                {isActive && <span style={{ fontSize: '13px', color: p.color, fontWeight: '900' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

