'use client';

import React from 'react';

export default function SkeletonLoader({ className = '', height = '20px', width = '100%' }: { className?: string; height?: string; width?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--skeleton-height', height);
      ref.current.style.setProperty('--skeleton-width', width);
    }
  }, [height, width]);

  return (
    <div 
      ref={ref}
      className={`bg-white/5 rounded-lg animate-pulse overflow-hidden relative h-[var(--skeleton-height)] w-[var(--skeleton-width)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}
