import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';

export type ColorTheme = 'volt' | 'crimson' | 'gold' | 'cyan';

const PALETTES: Array<{ id: ColorTheme; nameAr: string; nameEn: string; color: string; icon: string }> = [
  { id: 'volt', nameAr: 'أصفر كهربائي (Volt)', nameEn: 'Cyber Volt', color: '#ccff00', icon: '⚡' },
  { id: 'crimson', nameAr: 'أحمر قرمزي (Crimson)', nameEn: 'Blood & Iron', color: '#ff1744', icon: '🔥' },
  { id: 'gold', nameAr: 'ذهب أولمبيا (Gold)', nameEn: 'Imperial Gold', color: '#f59e0b', icon: '👑' },
  { id: 'cyan', nameAr: 'أزرق جليدي (Cyan)', nameEn: 'Aurora Cyan', color: '#00d2ff', icon: '💎' },
];

export const ThemeToggle: React.FC<{ showPaletteDropdown?: boolean; placement?: 'auto' | 'up' | 'down' }> = ({
  showPaletteDropdown = true,
  placement = 'auto',
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('volt');
  const [showDropdown, setShowDropdown] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    const savedColor = (localStorage.getItem('color_theme') as ColorTheme) || 'volt';

    setTheme(savedTheme);
    setColorTheme(savedColor);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-color-theme', savedColor);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (!showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If there's less than 240px below the element, or placement forced to 'up', open upwards!
      if (placement === 'up' || (placement === 'auto' && spaceBelow < 240)) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setShowDropdown((prev) => !prev);
  };

  return (
    <div ref={dropdownRef} className="theme-toggle" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {/* Light / Dark Mode Toggle Button */}
      <button
        onClick={toggleTheme}
        className="secondary-btn"
        style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={theme === 'dark' ? 'الوضع المضيء' : 'الوضع الداكن'}
      >
        {theme === 'dark' ? <Sun size={17} color="var(--primary)" /> : <Moon size={17} color="#059669" />}
      </button>

      {/* Color Palette Menu Button */}
      {showPaletteDropdown && (
        <button
          onClick={handleToggleDropdown}
          className="secondary-btn"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'var(--primary)',
            background: showDropdown ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            boxShadow: '0 0 10px var(--primary-glow)',
          }}
          title="تغيير ثيم وهوية الألوان الرياضية (Theme Palette)"
        >
          <Palette size={16} color="var(--primary)" />
        </button>
      )}

      {/* Palette Popover Menu with Smart Collision Avoidance */}
      {showDropdown && (
        <div
          className="glass-panel animated-fade"
          style={{
            position: 'absolute',
            ...(openUpwards
              ? { bottom: 'calc(100% + 10px)', top: 'auto' }
              : { top: 'calc(100% + 10px)', bottom: 'auto' }),
            insetInlineEnd: 0,
            minWidth: '200px',
            maxWidth: 'calc(100vw - 32px)',
            padding: '10px',
            borderRadius: '16px',
            border: '1px solid var(--primary)',
            background: 'rgba(10, 14, 26, 0.98)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 25px var(--primary-glow)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎨</span>
            <span>اختر هوية الألوان الرياضية</span>
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
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: isActive ? `1px solid ${p.color}` : '1px solid transparent',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isActive ? '800' : '600',
                  textAlign: 'right',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}`, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{p.nameAr}</span>
                {isActive && <span style={{ fontSize: '12px', color: p.color }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
