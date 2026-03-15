"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-950 text-white">
      <h1 className="text-4xl font-black mb-8 tracking-tighter">Sentry Test Page</h1>
      <p className="text-slate-400 mb-12 max-w-md text-center">
        Click the button below to trigger a test error and verify your Sentry integration.
      </p>
      
      <button
        onClick={() => {
          throw new Error("Sentry Test Error from QueueLess India Example Page");
        }}
        className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95"
      >
        Trigger Test Error
      </button>

      <div className="mt-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-xs font-mono text-slate-500">
        Check your Sentry dashboard after clicking the button.
      </div>
    </div>
  );
}
