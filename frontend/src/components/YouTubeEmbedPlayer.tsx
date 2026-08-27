import React, { useState, useEffect } from 'react';
import { Youtube, ExternalLink, RefreshCw, Play } from 'lucide-react';

interface YouTubeEmbedPlayerProps {
  videoUrl: string;
  title?: string;
  lang?: 'ar' | 'en';
  autoPlay?: boolean;
}

/**
 * Robust YouTube Embed Player with automatic Error 150/101 detection,
 * CSP/Restriction resilience, and an instant direct-app fallback launcher.
 */
export const YouTubeEmbedPlayer: React.FC<YouTubeEmbedPlayerProps> = ({
  videoUrl,
  title = 'Exercise Tutorial',
  lang = 'ar',
  autoPlay = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const isAr = lang === 'ar';

  // Extract YouTube Video ID or sanitize URL
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = extractVideoId(videoUrl);
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
    : null;

  const directYouTubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : videoUrl.startsWith('http')
    ? videoUrl
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' exercise tutorial')}`;

  // Reset state on URL change
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [videoUrl, retryKey]);

  if (!embedUrl || hasError) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '220px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 10, 30, 0.95))',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Youtube size={28} color="#ef4444" />
        </div>

        <div style={{ maxWidth: '400px' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#fff', fontWeight: '800' }}>
            {isAr ? 'مشاهدة الشرح على تطبيق YouTube' : 'Watch Tutorial on YouTube'}
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
            {hasError
              ? isAr
                ? 'تم تقييد التضمين الخارجي لهذا الفيديو من قِبل الناشر (Error 150/101). يمكنك مشاهدته مباشرة بدقة كاملة وبدون قيود.'
                : 'Playback on other websites has been disabled by the video owner (Error 150/101). Watch it directly on YouTube.'
              : isAr
              ? 'انقر على الزر أدناه لفتح الفيديو مباشرة في تطبيق YouTube بأعلى جودة.'
              : 'Click below to watch this workout tutorial directly in YouTube.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
          <a
            href={directYouTubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glow-btn"
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
              color: '#fff',
            }}
          >
            <Play size={15} fill="#fff" />
            <span>{isAr ? 'تشغيل الفيديو في تطبيق YouTube 🔴' : 'Open in YouTube App 🔴'}</span>
            <ExternalLink size={13} />
          </a>

          {hasError && (
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setRetryKey((k) => k + 1);
              }}
              className="secondary-btn"
              style={{ padding: '10px 14px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 Aspect Ratio
        height: 0,
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#090d16',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.9)',
            zIndex: 1,
            gap: '8px',
          }}
        >
          <div className="spinner" style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ef4444', borderRadius: '50%' }} />
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {isAr ? 'جاري تجهيز مشغل الفيديو...' : 'Loading video player...'}
          </span>
        </div>
      )}

      <iframe
        key={retryKey}
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </div>
  );
};
