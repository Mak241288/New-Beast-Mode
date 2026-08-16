import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface ExerciseImageProps {
  src?: string | null;
  alt?: string;
  muscle?: string | null;
  className?: string;
  style?: React.CSSProperties;
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
  alt = 'Exercise',
  muscle,
  className = '',
  style = {},
}) => {
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(src ? 1 : 2);
  const [imgLoaded, setImgLoaded] = useState(false);

  const fallbackUrl = getMuscleFallback(muscle);
  const effectiveSrc = currentTier === 1 && src ? src : fallbackUrl;

  const handleError = () => {
    if (currentTier === 1) {
      setCurrentTier(2); // Switch to guaranteed CDN muscle fallback
    } else if (currentTier === 2) {
      setCurrentTier(3); // Switch to offline inline SVG badge
    }
  };

  // Tier 3: Offline / zero-network CSS/SVG Glassmorphic Badge
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
          borderRadius: '8px',
          color: 'var(--primary)',
          gap: '4px',
          padding: '4px',
          ...style,
        }}
        title={alt}
      >
        <Dumbbell size={20} />
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>
          {muscle || 'BeastMode'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={handleError}
      onLoad={() => setImgLoaded(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: imgLoaded ? 1 : 0.6,
        transition: 'opacity 0.2s ease-in-out',
        ...style,
      }}
    />
  );
};
