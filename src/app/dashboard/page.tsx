"use client";

import { ArrowRight, Users, Clock, CheckCircle2, QrCode, Loader2, Pause, Star, X, Zap, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAdminQueue } from "@/lib/useAdminQueue";
import { callNextToken, skipToken, recallToken } from "@/lib/queueService";
import { supabase } from "@/lib/supabaseClient";
import QRCodeModal from "@/components/QR/QRCodeModal";
import AIPredictionCard from "@/components/Dashboard/AIPredictionCard";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { MOCK_BUSINESSES } from "@/lib/mockHomeData";
import dynamic from "next/dynamic";

const QueueChart = dynamic(() => import("@/components/Analytics/QueueChart"), { 
  ssr: false, 
  loading: () => <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div> 
});

export default function BusinessDashboard() {
  const [isCalling, setIsCalling] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"Overview" | "Bookings" | "Analytics" | "Settings" | "QR Code">("Overview");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const [selectedCounter, setSelectedCounter] = useState<string>("all");

  useEffect(() => {
    const savedOrg = localStorage.getItem("admin_org");
    if (savedOrg) {
      setAdminUsername(savedOrg);
    }
  }, []);
  
  const { queue, currentlyServing, stats } = useAdminQueue(
    isAdminLoggedIn ? adminUsername : "",
    selectedCounter === "all" ? undefined : selectedCounter
  );
  
  // Custom manual fetching state to ensure skeleton shows before real empty state
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    if (isAdminLoggedIn) {
       const timer = setTimeout(() => setInitialLoading(false), 2000);
       return () => clearTimeout(timer);
    }
  }, [isAdminLoggedIn]);

  const statCards = [
    { label: "Total Tokens Today", value: stats.totalToday, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Currently Waiting", value: stats.currentlyWaiting, icon: Clock, color: "bg-orange-100 text-orange-600" },
    { label: "Tokens Served", value: stats.served, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
  ];

  // --- Mock Login Screen ---
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
        
        <nav className="h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 shrink-0 absolute top-0 left-0 right-0 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              Q
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
              QueueLess<span className="text-blue-600 dark:text-blue-400"> Business</span>
            </span>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center p-6 relative">
          {/* Decorative background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Log into your business dashboard</p>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoggingIn(true);
                try {
                  const { data, error } = await supabase.from('businesses').select('*').eq('id', adminUsername).maybeSingle();
                  
                  if (error || !data) {
                    // Fallback to check if it's a known Mock ID for demo purposes
                    const mockBiz = MOCK_BUSINESSES.find(b => b.id === adminUsername);
                    if (mockBiz) {
                      setBusinessData({ name: mockBiz.name, id: mockBiz.id });
                      setIsAdminLoggedIn(true);
                      localStorage.setItem("admin_org", mockBiz.id);
                    } else {
                      alert("Business ID not found!");
                    }
                  } else {
                    setBusinessData(data);
                    setIsAdminLoggedIn(true);
                    localStorage.setItem("admin_org", adminUsername);
                  }
                } catch(err) {
                  alert("Error validating business.");
                }
                setIsLoggingIn(false);
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Organization ID</label>
                <input 
                  type="text" 
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. city-hospital"
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors font-medium"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4 disabled:opacity-50"
              >
                {isLoggingIn ? "Validating..." : "Sign In to Dashboard"}
              </button>

              <div className="text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-6">(Mock Login: Any ID works for the demo)</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard Screen ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Nav */}
      <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold">
            Q
          </div>
          <span className="font-extrabold tracking-tight text-slate-800 dark:text-slate-100">QueueLess</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{businessData?.name || adminUsername || "City Hospital"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reception Desk</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400">
            {businessData?.name ? businessData.name.substring(0, 2).toUpperCase() : "CH"}
          </div>
        </div>
      </nav>

      {/* Vercel-style Sub Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-8 max-w-7xl mx-auto h-12">
          {["Overview", "Bookings", "Analytics", "QR Code", "Settings"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`relative h-full flex items-center font-semibold text-sm transition-colors ${
                activeTab === tab 
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8 relative">
        
        {/* Overview Tab Content */}
        {activeTab === "Overview" && (
          <>
            {/* Main Action Area */}
            <div className="lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center transition-colors">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Currently Serving</p>
            <h2 className="text-7xl font-black text-slate-900 dark:text-slate-100 tracking-tighter mb-4">{currentlyServing ? currentlyServing.tokenNumber : "None"}</h2>
            
            {currentlyServing && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-8 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </div>
            )}

            <button 
              onClick={async () => {
                if (selectedCounter === "all") return;
                
                setIsCalling(true);
                await callNextToken(adminUsername, selectedCounter);
                
                // Trigger SMS notification to the called person
                if (queue.length > 0) {
                  await fetch("/api/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tokenNumber: queue[0].tokenNumber,
                      phoneNumber: "+919876543210", // Example Indian number
                      orgName: businessData?.name || adminUsername,
                      event: "CALLED"
                    })
                  }).catch(e => console.error("Notification failed", e));
                }
                
                // Trigger APPROACHING SMS to the NEXT person in line (queue index 1)
                if (queue.length > 1) {
                  await fetch("/api/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tokenNumber: queue[1].tokenNumber,
                      phoneNumber: "+919876543210",
                      orgName: businessData?.name || adminUsername,
                      event: "APPROACHING"
                    })
                  }).catch(e => console.error("Notification failed", e));
                }

                setIsCalling(false);
              }}
              disabled={isCalling || selectedCounter === "all"}
              className={`w-full font-bold text-xl py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group ${
                 selectedCounter === "all" 
                   ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                   : "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              }`}
            >
              {isCalling ? <Loader2 size={24} className="animate-spin" /> : 
                selectedCounter === "all" ? "Select Department to Call" : "Call Next Token"}
              {!isCalling && selectedCounter !== "all" && <ArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-4">
               {selectedCounter === "all" ? "You must pick a specific counter/department from the dropdown to continue." : "This marks the current as Served and calls the next."}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-500 rounded-2xl hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors group">
                <Star size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">VIP Token</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-500 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors group">
                <Pause size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Pause Queue</span>
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowQR(true)}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md transition-all text-left group hover:scale-105 active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Print Store QR Code</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customers scan this to join the queue</p>
            </div>
          </button>

          <Link 
            href={`/display/${adminUsername}`} 
            target="_blank"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4 hover:border-orange-400 dark:hover:border-orange-500/50 hover:shadow-md transition-all text-left group hover:scale-105 active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Open TV Display</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Launch the public waiting room screen</p>
            </div>
          </Link>

        </div>

        {/* List and Stats Area */}
        <div className="lg:w-2/3 flex flex-col gap-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-start shadow-sm transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color} dark:bg-opacity-20`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{stat.value}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* AI Predictor */}
          <AIPredictionCard orgId={adminUsername} stats={stats} />

          {/* Queue Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">Live Waiting List</h3>
              <div className="flex gap-2">
                <select 
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <option value="all">All Departments</option>
                  <option value="opd">OPD (General)</option>
                  <option value="spl">Specialist</option>
                  <option value="billing">Billing</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4 pl-6 font-medium">Token</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Service</th>
                    <th className="p-4 font-medium">Wait Time</th>
                    <th className="p-4 pr-6 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {initialLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                       <tr key={`skel-${i}`} className="border-b border-slate-100 dark:border-slate-800/50">
                         <td className="p-4 pl-6"><div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div></td>
                         <td className="p-4"><div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div></td>
                         <td className="p-4"><div className="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div></td>
                         <td className="p-4"><div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse"></div></td>
                         <td className="p-4 pr-6 flex justify-end"><div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div></td>
                       </tr>
                     ))
                  ) : queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No customers currently waiting.</td>
                    </tr>
                  ) : (
                    queue.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 pl-6 text-slate-900 dark:text-slate-200 font-bold">{item.tokenNumber}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{item.customerName}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 uppercase">{item.counterId}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={14} className="text-slate-400 dark:text-slate-500" /> {item.estimatedWaitMins} min
                      </td>
                      <td className="p-4 pr-6 flex items-center justify-end gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'SERVING' 
                            ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                        
                        {/* New Action Buttons */}
                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => recallToken(adminUsername, item.id || "")}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors"
                            title="Force Recall (Set to Serving)"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => skipToken(adminUsername, item.id || "")}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 transition-colors"
                            title="Mark No-Show (Skip)"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mt-auto">
              View all {stats.currentlyWaiting} waiting customers
            </div>
          </div>
        </div>
        </>
        )}

        {/* Analytics Tab Content */}
        {activeTab === "Analytics" && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                   <div key={`analytics-${idx}`} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 shadow-sm">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color} dark:bg-opacity-20`}>
                       <Icon size={24} />
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</h3>
                       <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">{stat.label}</p>
                     </div>
                   </div>
                );
              })}
              {/* Extra mock analytics cards */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center shadow-sm relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h3 className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1">₹4,250</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Fast Pass Revenue</p>
              </div>
            </div>

            <QueueChart />
          </div>
        )}

        {/* Bookings Tab Content */}
        {activeTab === "Bookings" as any && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CalendarClock className="text-indigo-500" />
                  Advance Bookings
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4 pl-6 font-medium">Date & Time</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Service</th>
                      <th className="p-4 font-medium">Contact</th>
                      <th className="p-4 pr-6 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {/* Mock Bookings Data for UI validation */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="text-slate-900 dark:text-slate-200 font-bold">Today, 10:30 AM</p>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">Rahul Sharma</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 uppercase">OPD</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">--</td>
                      <td className="p-4 pr-6 flex items-center justify-end gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                          CONFIRMED
                        </span>
                        <div className="flex items-center gap-1 ml-2 opacity-0 hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors cursor-pointer" title="Convert to Live Token">
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors opacity-60">
                      <td className="p-4 pl-6">
                        <p className="text-slate-900 dark:text-slate-200 font-bold">Tomorrow, 02:00 PM</p>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">Priya Patel</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 uppercase">SPL</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">+91 98765*****</td>
                      <td className="p-4 pr-6 flex justify-end">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          PENDING
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab Content */}
        {activeTab === "Settings" && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-2xl">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Marketplace Settings</h2>
            
            <div className="space-y-8">
               
               {/* Fast Pass Toggle */}
               <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div>
                     <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" /> Enable Fast Pass
                     </h3>
                     <p className="text-sm text-slate-500 mt-1 max-w-sm">Allow customers to pay a premium fee to skip the regular queue. Priority tokens are called next.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={businessData?.fastPassEnabled || false}
                       onChange={async (e) => {
                         const val = e.target.checked;
                         setBusinessData({...businessData, fastPassEnabled: val});
                         await supabase.from("businesses").update({ fastPassEnabled: val }).eq("id", adminUsername);
                       }} 
                     />
                     <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
               </div>

               {/* Fast Pass Pricing */}
               <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Fast Pass Pricing (₹)</h3>
                  <div className="flex items-center gap-4">
                     <input 
                       type="number" 
                       value={businessData?.fastPassPrice || 50}
                       onChange={(e) => setBusinessData({...businessData, fastPassPrice: parseInt(e.target.value) || 0})}
                       className="w-32 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-lg focus:border-indigo-500 outline-none" 
                     />
                     <button 
                       onClick={async () => {
                         await supabase.from("businesses").update({ fastPassPrice: businessData?.fastPassPrice || 50 }).eq("id", adminUsername);
                         alert("Price Saved");
                       }}
                       className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                     >
                        Save Price
                     </button>
                  </div>
               </div>

               {/* Advanced Booking */}
               <div className="flex items-start justify-between">
                  <div>
                     <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <CalendarClock size={18} className="text-indigo-500" /> Advance Booking
                     </h3>
                     <p className="text-sm text-slate-500 mt-1 max-w-sm">Allow users to book specific time slots in the marketplace instead of joining the live queue.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                     <input 
                       type="checkbox" 
                       className="sr-only peer" 
                       checked={businessData?.advanceBookingEnabled || false}
                       onChange={async (e) => {
                         const val = e.target.checked;
                         setBusinessData({...businessData, advanceBookingEnabled: val});
                         await supabase.from("businesses").update({ advanceBookingEnabled: val }).eq("id", adminUsername);
                       }}
                     />
                     <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
               </div>
            </div>
            
          </div>
        )}

        {/* QR Code Tab Content */}
        {activeTab === "QR Code" as any && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <QRCodeGenerator business={{ id: adminUsername, name: businessData?.name || adminUsername || "City Hospital" }} />
          </div>
        )}

      </div>

      <QRCodeModal 
        orgId={adminUsername} 
        isOpen={showQR} 
        onClose={() => setShowQR(false)} 
      />
    </div>
  );
}
