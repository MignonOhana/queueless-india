"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-rose-100 dark:border-rose-900/30"
      >
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Oops! Something broke.
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          We encountered an unexpected error while trying to load this page. Don't worry, our team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/30"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 px-6 rounded-2xl font-bold transition-all"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
