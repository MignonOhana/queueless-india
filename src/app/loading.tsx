import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] bg-slate-50/95 dark:bg-slate-950/95 flex flex-col items-center justify-center animate-in fade-in duration-500">
      
      {/* Massive subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Floating Orb */}
        <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 opacity-20"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-orange-500 border-r-rose-500 border-b-transparent border-l-transparent animate-spin"></div>
          
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center">
            <span className="text-white font-black text-xl">Q</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Connecting to QueueLess</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-orange-500" />
          Synchronizing Live Data...
        </p>
      </div>

    </div>
  );
}
