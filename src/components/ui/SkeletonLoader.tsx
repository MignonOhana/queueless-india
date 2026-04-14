'use client';

export default function SkeletonLoader({ className = '', height = '20px', width = '100%' }: { className?: string; height?: string; width?: string }) {
  return (
    <div 
      className={`bg-white/5 rounded-lg animate-pulse overflow-hidden relative h-[var(--skeleton-height)] w-[var(--skeleton-width)] ${className}`}
      style={{ '--skeleton-height': height, '--skeleton-width': width } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}
