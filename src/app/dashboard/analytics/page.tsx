"use client";

import { Download, Users, Clock, Zap, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

// Mock Data
const MOCK_PEAK_HOURS = [
  { hour: "8 AM", customers: 12 },
  { hour: "9 AM", customers: 25 },
  { hour: "10 AM", customers: 45 },
  { hour: "11 AM", customers: 60 },
  { hour: "12 PM", customers: 35 },
  { hour: "1 PM", customers: 20 },
  { hour: "2 PM", customers: 15 },
  { hour: "3 PM", customers: 30 },
  { hour: "4 PM", customers: 55 },
  { hour: "5 PM", customers: 40 },
];

const QueueChart = dynamic(() => import("@/components/Analytics/QueueChart"), { 
  ssr: false, 
  loading: () => <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div> 
});

const DynamicBarChart = dynamic<{ data: { hour: string; customers: number }[] }>(() => import("./ChartComponents").then(mod => mod.PeakHoursChart), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center text-slate-400 font-bold text-sm">Loading Chart Data...</div>
});

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("Last 7 Days");

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Hour,Customers\n" 
      + MOCK_PEAK_HOURS.map(e => `${e.hour},${e.customers}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "queueless_analytics_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Nav */}
      <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-extrabold tracking-tight text-slate-800 dark:text-slate-100 text-lg">Analytics Overview</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
             <Calendar size={14} className="text-slate-500" />
             <select 
               className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
             >
               <option>Today</option>
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
             </select>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
             <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
               <Users size={24} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">Total Customers</p>
             <div className="flex items-end gap-3">
               <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">1,248</h3>
               <span className="text-emerald-500 font-bold text-sm mb-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">+12%</span>
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
             <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6">
               <Clock size={24} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">Average Wait Time</p>
             <div className="flex items-end gap-3">
               <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">14<span className="text-2xl text-slate-400 ml-1">min</span></h3>
               <span className="text-emerald-500 font-bold text-sm mb-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">-3m faster</span>
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
             <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
               <Zap size={24} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">Staff Efficiency</p>
             <div className="flex items-end gap-3">
               <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">94<span className="text-2xl text-slate-400 ml-1">%</span></h3>
               <span className="text-slate-400 font-bold text-sm mb-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Stable</span>
             </div>
           </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           
           {/* Primary Area Chart Component */}
           <div className="lg:col-span-2">
             <QueueChart />
           </div>

           {/* Peak Hours Bar Chart */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col">
             <div className="mb-6">
               <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Peak Hours</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">Customer volume distribution</p>
             </div>
             
             <div className="flex-1 w-full min-h-[300px]">
                <DynamicBarChart data={MOCK_PEAK_HOURS} />
             </div>
           </div>

        </div>
        
      </div>
    </div>
  );
}
