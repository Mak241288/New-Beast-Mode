import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dumbbell } from 'lucide-react';

interface ExerciseImageProps {
  src?: string | null;
  step2?: string | null;
  alt?: string;
  muscle?: string | null;
  className?: string;
  style?: React.CSSProperties;
  autoAnimate?: boolean;
  showBadge?: boolean;
}

// In-Memory Global Image Preload Cache to eliminate mobile flicker
const PRELOAD_CACHE = new Set<string>();

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

// Guaranteed High-Availability HD CDN Images per Muscle Group
const VERIFIED_MUSCLE_FALLBACKS: Record<string, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=85',
  pectoral: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=85',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&auto=format&fit=crop&q=85',
  lat: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&auto=format&fit=crop&q=85',
  shoulder: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=85',
  deltoid: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=85',
  bicep: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=85',
  tricep: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&auto=format&fit=crop&q=85',
  quad: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=85',
  thigh: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=85',
  hamstring: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=85',
  glute: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=85',
  calf: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=85',
  calves: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=85',
  ab: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=85',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=85',
  forearm: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=85',
  cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=85',
  default: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=85'
};

function getMuscleFallback(muscle?: string | null): string {
  if (!muscle) return VERIFIED_MUSCLE_FALLBACKS.default;
  const m = muscle.toLowerCase();
  for (const [key, url] of Object.entries(VERIFIED_MUSCLE_FALLBACKS)) {
    if (m.includes(key)) return url;
  }
  return VERIFIED_MUSCLE_FALLBACKS.default;
}

// Extensive Mapping of Common Bodybuilding Exercise Names to HD 2-Frame CDN Datasets
const EXERCISE_DB_NAME_MAP: Record<string, string> = {
  'seated dumbbell shoulder press': 'Dumbbell_Seated_Shoulder_Press',
  'dumbbell shoulder press': 'Dumbbell_Shoulder_Press',
  'barbell shoulder press': 'Barbell_Shoulder_Press',
  'overhead press': 'Overhead_Press',
  'military press': 'Military_Press',
  'lateral raise': 'Dumbbell_Lateral_Raise',
  'dumbbell lateral raise': 'Dumbbell_Lateral_Raise',
  'front raise': 'Dumbbell_Front_Raise',
  'barbell bench press': 'Barbell_Bench_Press',
  'bench press': 'Barbell_Bench_Press',
  'incline dumbbell press': 'Incline_Dumbbell_Press',
  'incline barbell bench press': 'Incline_Barbell_Bench_Press',
  'incline dumbbell bench press': 'Incline_Dumbbell_Press',
  'dumbbell flyes': 'Dumbbell_Flyes',
  'dumbbell chest flyes': 'Dumbbell_Flyes',
  'cable crossover': 'Cable_Crossover',
  'push up': 'Push_Up',
  'pushups': 'Push_Up',
  'pull up': 'Pull_Up',
  'pullups': 'Pull_Up',
  'lat pulldown': 'Cable_Lat_Pulldown',
  'cable lat pulldown': 'Cable_Lat_Pulldown',
  'barbell bent over row': 'Barbell_Bent_Over_Row',
  'bent over row': 'Barbell_Bent_Over_Row',
  'seated cable row': 'Cable_Seated_Row',
  'deadlift': 'Barbell_Deadlift',
  'barbell squat': 'Barbell_Full_Squat',
  'squat': 'Barbell_Full_Squat',
  'leg press': 'Sled_45_Leg_Press',
  'leg extension': 'Lever_Leg_Extension',
  'leg curl': 'Lever_Lying_Leg_Curl',
  'lying leg curl': 'Lever_Lying_Leg_Curl',
  'calf raise': 'Standing_Calf_Raises',
  'barbell bicep curl': 'Barbell_Curl',
  'dumbbell bicep curl': 'Dumbbell_Bicep_Curl',
  'hammer curl': 'Dumbbell_Hammer_Curl',
  'triceps rope pushdown': 'Cable_Rope_Pushdown',
  'rope pushdown': 'Cable_Rope_Pushdown',
  'skull crusher': 'Barbell_Lying_Triceps_Extension',
  'dips': 'Chest_Dip',
  'plank': 'Plank',
  'hanging leg raise': 'Hanging_Leg_Raise',
  'crunch': 'Crunch',
};

function resolveExerciseFramesByName(name?: string): { frame0: string; frame1: string } | null {
  if (!name) return null;
  let clean = name.toLowerCase().trim();
  const parenMatch = clean.match(/\(([^)]+)\)/);
  if (parenMatch && /[a-z]/.test(parenMatch[1])) {
    clean = parenMatch[1].trim();
  }

  for (const [key, folder] of Object.entries(EXERCISE_DB_NAME_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      const base = `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${folder}`;
      return { frame0: `${base}/0.jpg`, frame1: `${base}/1.jpg` };
    }
  }

  const normalized = clean.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
  if (normalized.length > 3) {
    const base = `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${normalized}`;
    return { frame0: `${base}/0.jpg`, frame1: `${base}/1.jpg` };
  }
  return null;
}

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  src,
  step2,
  alt = 'Exercise',
  muscle,
  className = '',
  style = {},
  autoAnimate = true,
  showBadge = false,
}) => {
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(1);
  const [activeFrame, setActiveFrame] = useState<0 | 1>(0);
  const [frame0Loaded, setFrame0Loaded] = useState(false);
  const [frame1Loaded, setFrame1Loaded] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Compute 2-Phase Frames from 0.jpg/1.jpg or name matching
  const { frame0, frame1 } = useMemo(() => {
    const cSrc = toCdnUrl(src);
    const cStep2 = toCdnUrl(step2);

    if (cSrc && (cSrc.includes('/0.jpg') || cSrc.includes('/1.jpg'))) {
      const f0 = cSrc.includes('/1.jpg') ? cSrc.replace('/1.jpg', '/0.jpg') : cSrc;
      return { frame0: f0, frame1: f0.replace('/0.jpg', '/1.jpg') };
    }

    if (cStep2 && cSrc && cStep2 !== cSrc) {
      return { frame0: cSrc, frame1: cStep2 };
    }

    const resolvedByName = resolveExerciseFramesByName(alt);
    if (resolvedByName) {
      return resolvedByName;
    }

    if (cSrc && !cSrc.includes('unsplash.com')) {
      return { frame0: cSrc, frame1: null };
    }

    return { frame0: cSrc || getMuscleFallback(muscle), frame1: null };
  }, [src, step2, alt, muscle]);

  // Preload frames in parallel with instant memory caching
  useEffect(() => {
    if (frame0) {
      if (PRELOAD_CACHE.has(frame0)) {
        setFrame0Loaded(true);
      } else {
        const img0 = new Image();
        img0.src = frame0;
        img0.onload = () => {
          PRELOAD_CACHE.add(frame0);
          if (isMountedRef.current) setFrame0Loaded(true);
        };
      }
    }

    if (frame1 && currentTier === 1) {
      if (PRELOAD_CACHE.has(frame1)) {
        setFrame1Loaded(true);
      } else {
        const img1 = new Image();
        img1.src = frame1;
        img1.onload = () => {
          PRELOAD_CACHE.add(frame1);
          if (isMountedRef.current) setFrame1Loaded(true);
        };
      }
    }
  }, [frame0, frame1, currentTier]);

  // Smooth Motion Loop (1.2s cadence)
  useEffect(() => {
    if (!autoAnimate || !frame1 || frame1 === frame0 || currentTier !== 1) {
      setActiveFrame(0);
      return;
    }

    const interval = setInterval(() => {
      if (isMountedRef.current) {
        setActiveFrame((prev) => (prev === 0 ? 1 : 0));
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [autoAnimate, frame0, frame1, currentTier]);

  const fallbackUrl = getMuscleFallback(muscle);

  const handleError = () => {
    if (currentTier === 1) {
      setCurrentTier(2); // Fallback to verified HD muscle photography
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
          background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.12), rgba(124, 58, 237, 0.18))',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          borderRadius: '16px',
          color: 'var(--primary)',
          gap: '8px',
          padding: '12px',
          ...style,
        }}
        title={alt}
      >
        <Dumbbell size={28} />
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>
          {muscle || 'BeastMode Exercise'}
        </span>
      </div>
    );
  }

  // Tier 2: Muscle Photography Fallback
  if (currentTier === 2) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '14px', ...style }}>
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
            transition: 'transform 0.3s ease',
          }}
        />
        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '6px', fontSize: '9px', color: '#94a3b8', fontWeight: 'bold' }}>
          {muscle || 'Exercise'}
        </div>
      </div>
    );
  }

  const isVideo = frame0 && (frame0.endsWith('.mp4') || frame0.endsWith('.webm') || frame0.includes('/videos/'));

  // Tier 1: High-Performance Animated Video Loop
  if (isVideo) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#060a16', borderRadius: '14px', ...style }}>
        <video
          src={frame0}
          autoPlay
          loop
          muted
          playsInline
          onError={handleError}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  const isGif = frame0 && (frame0.includes('.gif') || frame0.includes('.webp'));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#060a16', borderRadius: '14px', ...style }}>
      {/* Sleek Skeleton Shimmer until loaded */}
      {!frame0Loaded && currentTier === 1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(0,210,255,0.06) 50%, rgba(255,255,255,0.02) 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.5s infinite linear',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Dumbbell size={24} style={{ opacity: 0.25, color: '#00d2ff' }} />
        </div>
      )}

      {/* Frame 0: Starting Motion Position */}
      <img
        src={frame0}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        onError={handleError}
        onLoad={() => setFrame0Loaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: activeFrame === 0 || !frame1 || isGif ? 1 : 0,
          transform: activeFrame === 0 ? 'scale(1)' : 'scale(0.98)',
          transition: isGif ? 'none' : 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out',
        }}
      />

      {/* Frame 1: Peak Muscle Contraction (Smooth Crossfade Morph) */}
      {frame1 && !isGif && (
        <img
          src={frame1}
          alt={`${alt} peak contraction`}
          className={className}
          referrerPolicy="no-referrer"
          onLoad={() => setFrame1Loaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: activeFrame === 1 && frame1Loaded ? 1 : 0,
            transform: activeFrame === 1 ? 'scale(1.02)' : 'scale(1)',
            filter: activeFrame === 1 ? 'drop-shadow(0 0 10px rgba(0, 210, 255, 0.3))' : 'none',
            transition: 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out, filter 0.35s ease',
          }}
        />
      )}

      {/* Dynamic Phase Indicator Badge (START -> PEAK 🔥) */}
      {showBadge && frame1 && !isGif && autoAnimate && (
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: activeFrame === 0 ? 'rgba(0, 210, 255, 0.25)' : 'rgba(245, 158, 11, 0.25)',
            border: activeFrame === 0 ? '1px solid rgba(0, 210, 255, 0.6)' : '1px solid rgba(245, 158, 11, 0.7)',
            color: activeFrame === 0 ? '#00d2ff' : '#f59e0b',
            fontSize: '9.5px',
            fontWeight: '900',
            padding: '3px 8px',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
            boxShadow: activeFrame === 1 ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {activeFrame === 0 ? '1. START' : '2. PEAK CONTRACTION 🔥'}
        </span>
      )}

      {/* 60 FPS Badge for Animated Loops */}
      {showBadge && isGif && (
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0, 210, 255, 0.25)',
            border: '1px solid rgba(0, 210, 255, 0.5)',
            color: '#00d2ff',
            fontSize: '9px',
            fontWeight: '900',
            padding: '2px 7px',
            borderRadius: '6px',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
          }}
        >
          HD MOTION ⚡
        </span>
      )}
    </div>
  );
};
