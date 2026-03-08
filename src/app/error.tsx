'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-lg w-full text-center space-y-6 relative z-10 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto w-20 h-20 bg-rose-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Something went wrong!
        </h1>
        
        <p className="text-muted-foreground text-lg">
          An unexpected error has occurred. We've been notified and are looking into it.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="group flex flex-1 w-full sm:w-auto items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-full font-bold transition-all duration-300 active:scale-[0.98]"
          >
            <RefreshCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link 
            href="/home" 
            className="group flex flex-1 w-full sm:w-auto items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
