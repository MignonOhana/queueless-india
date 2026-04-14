'use client';

import React, { useRef, useEffect } from 'react';

interface DynamicProgressBarProps {
  progress: number;
  className?: string;
  variableName: string;
}

export default function DynamicProgressBar({ progress, className = '', variableName }: DynamicProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty(variableName, `${Math.min(100, progress)}%`);
    }
  }, [progress, variableName]);

  return (
    <div 
      ref={ref}
      className={className}
    />
  );
}
