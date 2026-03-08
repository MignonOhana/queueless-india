'use client';

import { Inter } from 'next/font/google';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased min-h-screen flex items-center justify-center p-4`}>
        <div className="bg-zinc-900/80 p-8 md:p-12 rounded-3xl max-w-lg w-full text-center space-y-6 border border-zinc-800 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          
          <h1 className="text-3xl font-black tracking-tight">
            Fatal Error
          </h1>
          
          <p className="text-zinc-400 text-lg">
            A critical application error occurred. We apologize for the inconvenience.
          </p>

          <div className="pt-6">
            <button
              onClick={() => reset()}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-all duration-300 active:scale-[0.98]"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
