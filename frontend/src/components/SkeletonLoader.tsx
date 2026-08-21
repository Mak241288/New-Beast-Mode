import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'stats' | 'chart';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 3 }) => {
  if (type === 'stats') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', width: '100%' }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="glass-panel skeleton-shimmer"
            style={{ height: '90px', borderRadius: '16px', padding: '16px' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="glass-panel skeleton-shimmer"
            style={{ height: '65px', borderRadius: '14px', width: '100%' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div
        className="glass-panel skeleton-shimmer"
        style={{ height: '260px', borderRadius: '20px', width: '100%' }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel skeleton-shimmer"
          style={{ height: '120px', borderRadius: '18px', width: '100%' }}
        />
      ))}
    </div>
  );
};
