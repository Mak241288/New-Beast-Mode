import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell } from 'lucide-react';

interface ExerciseImageProps {
  src?: string | null;
  step2?: string | null;
  alt?: string;
  muscle?: string | null;
  className?: string;
  style?: React.CSSProperties;
  autoAnimate?: boolean;
}

// Convert GitHub raw URLs to ultra-fast jsDelivr CDN to bypass CORS & rate limits
function toCdnUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.includes('raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')) {
    return trimmed.replace(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/',
      'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'
    );
  }
  return trimmed;
}

// Guaranteed High-Availability CDN Images per Muscle Group
const VERIFIED_MUSCLE_FALLBACKS: Record<string, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80',
  pectoral: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&auto=format&fit=crop&q=80',
  lat: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&auto=format&fit=crop&q=80',
  shoulder: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80',
  deltoid: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80',
  bicep: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
  tricep: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&auto=format&fit=crop&q=80',
  quad: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80',
  thigh: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80',
  hamstring: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
  glute: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
  calf: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
  calves: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
  ab: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80',
  forearm: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
  cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80'
};

function getMuscleFallback(muscle?: string | null): string {
  if (!muscle) return VERIFIED_MUSCLE_FALLBACKS.default;
  const m = muscle.toLowerCase();
  for (const [key, url] of Object.entries(VERIFIED_MUSCLE_FALLBACKS)) {
    if (m.includes(key)) return url;
  }
  return VERIFIED_MUSCLE_FALLBACKS.default;
}

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  src,
  step2,
  alt = 'Exercise',
  muscle,
  className = '',
  style = {},
  autoAnimate = true,
}) => {
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(src ? 1 : 2);
  const [activeFrame, setActiveFrame] = useState<0 | 1>(0);
  const [frame0Loaded, setFrame0Loaded] = useState(false);
  const [frame1Loaded, setFrame1Loaded] = useState(false);

  // Compute 2-Phase Frames from either 0.jpg, 1.jpg, or direct URLs
  const { frame0, frame1 } = useMemo(() => {
    const cSrc = toCdnUrl(src);
    const cStep2 = toCdnUrl(step2);

    if (!cSrc) {
      return { frame0: '', frame1: null };
    }

    if (cStep2 && cStep2 !== cSrc) {
      return { frame0: cSrc, frame1: cStep2 };
    }

    if (cSrc.includes('/0.jpg')) {
      return {
        frame0: cSrc,
        frame1: cSrc.replace('/0.jpg', '/1.jpg'),
      };
    }

    if (cSrc.includes('/1.jpg')) {
      return {
        frame0: cSrc.replace('/1.jpg', '/0.jpg'),
        frame1: cSrc,
      };
    }

    return { frame0: cSrc, frame1: null };
  }, [src, step2]);

  // Preload frame 1 for instant zero-flicker transitions
  useEffect(() => {
    if (frame1 && currentTier === 1) {
      const img = new Image();
      img.src = frame1;
      img.onload = () => setFrame1Loaded(true);
    }
  }, [frame1, currentTier]);

  // Auto Animation Loop
  useEffect(() => {
    if (!autoAnimate || !frame1 || frame1 === frame0 || currentTier !== 1) {
      setActiveFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveFrame((prev) => (prev === 0 ? 1 : 0));
    }, 1100);

    return () => clearInterval(interval);
  }, [autoAnimate, frame0, frame1, currentTier]);

  const fallbackUrl = getMuscleFallback(muscle);

  const handleError = () => {
    if (currentTier === 1) {
      setCurrentTier(2); // Fallback to verified muscle photography
    } else if (currentTier === 2) {
      setCurrentTier(3); // Fallback to offline SVG card
    }
  };

  // Tier 3: Offline / zero-network SVG Badge
  if (currentTier === 3) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.15), rgba(124, 58, 237, 0.2))',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          borderRadius: '12px',
          color: 'var(--primary)',
          gap: '6px',
          padding: '8px',
          ...style,
        }}
        title={alt}
      >
        <Dumbbell size={24} />
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>
          {muscle || 'BeastMode'}
        </span>
      </div>
    );
  }

  // Tier 2: Muscle Photography Fallback
  if (currentTier === 2) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
        <img
          src={fallbackUrl}
          alt={alt}
          className={className}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // Tier 1: High-Performance 2-Frame Animated Display
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0a0d16', ...style }}>
      {/* Frame 0 (Start Position) */}
      <img
        src={frame0}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={handleError}
        onLoad={() => setFrame0Loaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: activeFrame === 0 || !frame1 ? (frame0Loaded ? 1 : 0.6) : 0,
          transition: 'opacity 0.25s ease-in-out',
        }}
      />

      {/* Frame 1 (Peak Contraction) */}
      {frame1 && (
        <img
          src={frame1}
          alt={`${alt} peak`}
          className={className}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setFrame1Loaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: activeFrame === 1 ? (frame1Loaded ? 1 : 0.6) : 0,
            transition: 'opacity 0.25s ease-in-out',
          }}
        />
      )}

      {/* Motion Phase Badge (START / PEAK) */}
      {frame1 && autoAnimate && (
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: activeFrame === 0 ? 'rgba(0, 210, 255, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            border: activeFrame === 0 ? '1px solid rgba(0, 210, 255, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
            color: activeFrame === 0 ? 'var(--primary)' : '#10b981',
            fontSize: '9.5px',
            fontWeight: '900',
            padding: '2px 8px',
            borderRadius: '6px',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
          }}
        >
          {activeFrame === 0 ? '1. START' : '2. PEAK 🔥'}
        </span>
      )}
    </div>
  );
};

