"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Customer Dashboard Error:", error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-xl dark:bg-slate-900"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertTriangle size={36} strokeWidth={2.5} />
        </div>
        
        <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
          Connection Interrupted
        </h2>
        <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          We lost connection to the live queue. Please check your internet connection and try again.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <RefreshCcw size={18} />
            Recover Connection
          </button>
          
          <Link
            href="/customer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Home size={18} />
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
