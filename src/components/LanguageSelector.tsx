'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, LANGUAGE_LABELS, Language } from '@/context/LanguageContext';

const LANGUAGES: Language[] = ['en', 'hi', 'ta', 'te', 'mr', 'pa', 'bn'];

export default function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-xl transition-all ${
          variant === 'compact'
            ? 'p-2 hover:bg-white/10'
            : 'px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10'
        }`}
        aria-label="Change language"
      >
        <Globe size={16} className="text-slate-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {LANGUAGE_LABELS[language].native}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-[#111118] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                language === lang
                  ? 'bg-[#00F5A0]/10 text-[#00F5A0]'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="font-bold">{LANGUAGE_LABELS[lang].native}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                {LANGUAGE_LABELS[lang].english}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
