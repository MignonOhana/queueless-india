"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-6 bg-[#0A0A0F] text-white">
      <div className="text-6xl animate-pulse">📡</div>
      <h1 className="text-3xl font-black tracking-tighter">You're offline</h1>
      <p className="text-slate-400 max-w-xs">
        Check your internet connection and try again. 
      </p>
      <div className="mt-4 p-4 bg-slate-900/50 border border-white/5 rounded-2xl text-sm text-slate-500">
        Your last queue token is saved on this device.
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
      >
        Retry Connection
      </button>
    </div>
  )
}
