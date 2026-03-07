"use client";

import { useAIPrediction } from "@/lib/useAIPrediction";
import { Sparkles, Clock, TrendingUp, CalendarDays, AlertCircle } from "lucide-react";

interface Props {
  orgId: string;
  stats: {
    currentlyWaiting: number;
    totalToday: number;
  };
}

export default function AIPredictionCard({ orgId, stats }: Props) {
  const { prediction, loading, error } = useAIPrediction(orgId, stats);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-100 dark:border-blue-900/40 p-6 shadow-xl shadow-blue-500/5 relative overflow-hidden group min-h-[250px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/10 dark:from-blue-900/10 dark:to-indigo-900/5"></div>
        <div className="flex flex-col items-center gap-3 relative z-10 text-slate-400 dark:text-slate-500">
          <Sparkles className="w-8 h-8 animate-pulse text-blue-400" />
          <p className="font-medium animate-pulse">Gemini AI analyzing queue data...</p>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-6 shadow-sm flex items-center justify-center text-red-500 gap-2 min-h-[250px]">
        <AlertCircle size={20} />
        <span className="font-semibold">Unable to generate AI prediction at this time.</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-500">
      
      {/* Decorative gradient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/20 transition-colors"></div>
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl text-blue-600 dark:text-blue-400">
          <Sparkles size={20} />
        </div>
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          AI Crowd Prediction
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        
        {/* Metric 1 */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Clock size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Current Wait</span>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{prediction.currentWaitTime} <span className="text-sm font-semibold text-slate-500">mins</span></p>
        </div>

        {/* Metric 2 */}
        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-2xl p-4 border border-orange-100 dark:border-orange-500/20 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-orange-600/80 dark:text-orange-400/80 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Next 1 Hour</span>
          </div>
          <p className="text-2xl font-black text-orange-700 dark:text-orange-400">{prediction.predictedWaitNextHour} <span className="text-sm font-semibold opacity-70">mins</span></p>
        </div>

      </div>

      <div className="mt-4 flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <CalendarDays size={18} className="text-blue-500" />
            Best time to visit today:
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{prediction.bestTimeToVisit}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <TrendingUp size={18} className="text-rose-500" />
            Predicted peak hours:
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{prediction.predictedPeakHours}</span>
        </div>
      </div>

    </div>
  );
}
