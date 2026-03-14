"use client";

import PageTransition from "@/components/PageTransition";
import { Bell, Clock, Ticket } from "lucide-react";

export default function AlertsPage() {
  return (
    <PageTransition className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16 pb-6 px-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Alerts</h1>
        <p className="text-slate-500 font-medium mt-1">Updates about your queues</p>
      </header>

      {/* Notifications List */}
      <div className="p-6 space-y-4 max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Your turn is arriving soon!</h3>
            <p className="text-slate-500 text-sm mt-1">Token OPD-005 is currently 3rd in line at City Hospital.</p>
            <span className="text-xs text-slate-400 font-bold mt-2 block">10 mins ago</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 opacity-70">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Token Served</h3>
            <p className="text-slate-500 text-sm mt-1">Token BIL-021 was served successfully at City Hospital.</p>
            <span className="text-xs text-slate-400 font-bold mt-2 block">Yesterday</span>
          </div>
        </div>
      </div>

    </PageTransition>
  );
}
