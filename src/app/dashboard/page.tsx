"use client";

import { Users, Clock, CheckCircle2, QrCode, Lock, LogOut, ChevronRight, ArrowRight, Globe, AlertCircle, TrendingUp, Settings, MoreVertical, LayoutDashboard, Activity, CalendarCheck, BarChart3, Loader2, UserCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAdminQueue } from "@/lib/useAdminQueue";
import { callNextToken, skipToken, recallToken } from "@/lib/queueService";
import { createClient } from "@/lib/supabase/client";
import QRCodeModal from "@/components/QR/QRCodeModal";
import AIPredictionCard from "@/components/Dashboard/AIPredictionCard";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { EmailOTPModal } from "@/components/auth/EmailOTPModal";
import { MOCK_BUSINESSES } from "@/lib/mockHomeData";
import dynamic from "next/dynamic";
import PlanBadge from "@/components/Dashboard/PlanBadge";
import UpgradeModal from "@/components/pricing/UpgradeModal";
import { PLAN_LIMITS, isFeatureLocked } from "@/lib/planGating";
import QueueRow from "@/components/Dashboard/QueueRow";
import GlassCard from "@/components/ui/GlassCard";
import LiveIndicator from "@/components/ui/LiveIndicator";
import CountUp from "@/components/ui/CountUp";
import StaffManagement from "@/components/Dashboard/StaffManagement";
import BusinessOnboarding from "@/components/Onboarding/BusinessOnboarding";
import AnalyticsDashboard from "@/components/Analytics/AnalyticsDashboard";
import OnboardingChecklist from "@/components/Dashboard/OnboardingChecklist";

const QueueChart = dynamic(() => import("@/components/Analytics/QueueChart"), { 
  ssr: false, 
  loading: () => <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div> 
});

export default function BusinessDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [isCalling, setIsCalling] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Bookings" | "Analytics" | "Settings" | "QR">("Overview");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const [selectedCounter, setSelectedCounter] = useState<string>("all");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [fastPassStats, setFastPassStats] = useState({ today: 0, month: 0, net: 0 });
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const plan = businessData?.plan || 'free';

  useEffect(() => {
    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
          setIsAdminLoggedIn(true);
          const { data: biz } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', session.user.id)
            .maybeSingle();
          
          if (biz) {
             setBusinessData(biz);
          }
       }
    };
    checkSession();
  }, []);
  
  const { queue, currentlyServing, stats } = useAdminQueue(
    isAdminLoggedIn ? businessData?.id : "",
    selectedCounter === "all" ? undefined : selectedCounter
  );
  
  // Custom manual fetching state to ensure skeleton shows before real empty state
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    if (isAdminLoggedIn && businessData?.id) {
       const timer = setTimeout(() => setInitialLoading(false), 2000);
       
       // Fetch Fast Pass Stats
       (async () => {
         const today = new Date().toISOString().split('T')[0];
         const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
         
         const { data: logs } = await supabase.from('fastpass_logs')
           .select('amount')
           .eq('business_id', businessData?.id)
           .gte('created_at', firstDay);
           
         if (logs) {
           const totalMonth = logs.reduce((acc, curr) => acc + Number(curr.amount), 0);
           // Mock today for now or filter strictly
           setFastPassStats({
             today: Math.floor(totalMonth * 0.2), // Mock
             month: totalMonth,
             net: Math.floor(totalMonth * 0.975) // 2.5% platform fee
           });
         }
       })();

       return () => clearTimeout(timer);
    }
  }, [isAdminLoggedIn, businessData?.id]);

  const statCards = [
    { label: "Total Tokens Today", value: stats.totalToday, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Currently Waiting", value: stats.currentlyWaiting, icon: Clock, color: "bg-orange-100 text-orange-600" },
    { label: "Tokens Served", value: stats.served, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
  ];

  // --- Admin Login Screen ---
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
        
        <nav className="h-20 bg-background/95 border-b border-border flex items-center justify-between px-6 shrink-0 absolute top-0 left-0 right-0 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              Q
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              QueueLess<span className="text-blue-500"> Business</span>
            </span>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="w-full max-w-md bg-surface rounded-brand p-8 sm:p-10 shadow-2xl border border-border relative z-10 text-center">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 text-blue-500">
                <Lock size={40} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h1>
              <p className="text-slate-400 font-medium">Please sign in to access your business dashboard</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Business Email</label>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@business.com"
                  className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
                  required
                />
              </div>

              <button 
                onClick={() => {
                  if (!adminEmail || !adminEmail.includes('@')) {
                    toast.error("Please enter a valid email");
                    return;
                  }
                  setShowOTP(true);
                }}
                className="btn-primary w-full py-4 text-lg"
              >
                Sign In to Dashboard <ArrowRight size={18} />
              </button>

              <button 
                onClick={() => {
                  setIsDemoMode(true);
                  setBusinessData({
                    id: "demo-aiims",
                    name: "AIIMS Delhi (Demo)",
                    category: "Hospital",
                    location: "Ansari Nagar, Delhi",
                    owner_id: "demo-user",
                    is_accepting_tokens: true,
                    fastPassPrice: 50,
                    serviceMins: 15
                  });
                  setIsAdminLoggedIn(true);
                  toast.success("Welcome to Demo Mode!");
                }}
                className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Activity size={18} className="text-blue-500" /> Try Demo Dashboard
              </button>

              <div className="mt-8 pt-8 border-t border-white/5">
                <Link href="/register" className="text-slate-500 text-sm hover:text-white transition-colors">
                  Don't have a business account? <span className="text-primary font-bold">Register Now</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {showOTP && (
          <EmailOTPModal 
            defaultEmail={adminEmail}
            onClose={() => setShowOTP(false)}
            onSuccess={async (user) => {
              setShowOTP(false);
              const { data: biz } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle();
              
              if (biz) {
                setBusinessData(biz);
                setIsAdminLoggedIn(true);
                toast.success("Welcome back!");
              } else {
                setIsAdminLoggedIn(true);
                toast.success("Please create your business profile");
              }
            }}
          />
        )}
      </div>
    );
  }

  const triggerUpdate = async () => {
    setOnboardingLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id)
        .maybeSingle();
      setBusinessData(biz);
    }
    setOnboardingLoading(false);
  };

  // Onboarding View
  if (!businessData || businessData.claim_status === 'claimed') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="h-20 bg-background/95 border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              Q
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              QueueLess<span className="text-blue-500"> Business</span>
            </span>
          </Link>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-zinc-500 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </nav>
        
        {onboardingLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <OnboardingChecklist business={businessData} onUpdate={triggerUpdate} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-32">
      
      {/* 🟢 DEMO MODE BANNER */}
      {isDemoMode && (
        <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-6 py-2 flex items-center justify-center gap-2 relative z-[70]">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            Preview Mode: You are exploring the dashboard with mock data.
          </span>
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] font-bold text-white underline ml-2 hover:text-indigo-300"
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* 🚀 DASHBOARD HEADER */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 sticky top-0 z-40 bg-background/95 py-4 border-b border-white/5 px-4 md:px-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
               <h1 className="text-2xl font-black text-white tracking-tight">{businessData?.name || "Business Dashboard"}</h1>
               <PlanBadge currentPlan={businessData?.plan || 'free'} tokensUsed={stats.totalToday} />
            </div>
             <div className="flex items-center gap-3 mt-1">
                <LiveIndicator />
                <button 
                   onClick={async () => {
                      try {
                        const newVal = !businessData?.is_verified; // Using is_verified as a proxy or just toggling UI for now
                        setBusinessData({...businessData, is_verified: newVal});
                        const { error } = await supabase.from('businesses').update({ is_verified: newVal }).eq('id', businessData?.id);
                        if (error) throw error;
                        toast.success(`Business status updated: ${newVal ? 'Verified' : 'Unverified'}`);
                      } catch (err: any) {
                        toast.error(`Update failed: ${err.message}`);
                      }
                    }}
                   className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                     businessData?.is_accepting_tokens 
                       ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                       : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                   }`}
                >
                   {businessData?.is_accepting_tokens ? '🟢 ACCEPTING' : '⚪ STOPPED'}
                </button>
             </div>
          </div>
        </div>

        {/* Unified Nav Bar in Header */}
        <div className="hidden lg:flex items-center bg-zinc-900/50 border border-white/5 rounded-2xl p-1 gap-1">
           <button 
              onClick={() => setActiveTab('Overview')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Overview' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
           >
              Overview
           </button>
           <button 
              onClick={() => router.push('/dashboard/queue')}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
           >
              Queue
           </button>
           <button 
              onClick={() => router.push('/dashboard/qr')}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
           >
              QR Code
           </button>
           <button 
              onClick={() => setActiveTab('Analytics')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Analytics' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
           >
              Analytics
           </button>
           <button 
              onClick={() => setActiveTab('Settings')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Settings' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
           >
              Settings
           </button>
        </div>

        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-xl font-black text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Today
              </p>
           </div>
           
           <div className="h-10 w-px bg-white/10 hidden sm:block mx-1" />
           
           {/* Role Switcher */}
           <button 
              onClick={() => router.push('/home')}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors hover:scale-105 active:scale-95"
              title="Switch to Customer Mode"
           >
              <UserCircle size={20} />
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-0">
        
        {activeTab === "Overview" && (
          <div className="space-y-8">
            
            {/* ⚡ HERO STATS ROW */}
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
               {/* 1. Currently Serving */}
               <GlassCard className="min-w-[300px] flex-shrink-0 snap-center bg-gradient-to-br from-primary/10 to-transparent">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Currently Serving</p>
                  <div className="flex items-end justify-between">
                     <div>
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-2">
                           {currentlyServing ? currentlyServing.tokenNumber : '--'}
                        </h2>
                        <p className="text-sm font-bold text-zinc-400">
                           {currentlyServing ? currentlyServing.customerName : 'No active token'}
                        </p>
                     </div>
                     {currentlyServing && (
                        <motion.button 
                           id="serve-next-btn"
                           whileTap={{ scale: 0.9 }}
                           onClick={async () => {
                             if (!currentlyServing) return;
                             await callNextToken(businessData?.id, currentlyServing.counterId || undefined);
                             toast.success(`Token ${currentlyServing.tokenNumber} marked as served`);
                           }}
                           className="px-4 py-2 rounded-xl bg-primary text-black font-black text-[10px] uppercase shadow-[0_0_20px_rgba(0,245,160,0.3)]"
                        >
                           Mark Served
                        </motion.button>
                     )}
                  </div>
               </GlassCard>

               {/* 2. Waiting Now */}
               <GlassCard className="min-w-[300px] flex-shrink-0 snap-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">Waiting Now</p>
                  <div className="flex items-end justify-between">
                     <div>
                        <h2 id="token-count-stats" className="text-5xl font-black text-white tracking-tighter mb-2">
                           <CountUp end={stats.currentlyWaiting} />
                        </h2>
                        <div className="flex -space-x-2">
                           {queue.slice(0, 3).map((item: any, i: number) => (
                             <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                               {item.tokenNumber}
                             </div>
                           ))}
                           {stats.currentlyWaiting > 3 && (
                             <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-background flex items-center justify-center text-[10px] font-bold text-zinc-500">
                               +{stats.currentlyWaiting - 3}
                             </div>
                           )}
                        </div>
                     </div>
                     <ChevronRight className="text-zinc-500" />
                  </div>
               </GlassCard>

               {/* 3. Served Today */}
               <GlassCard className="min-w-[300px] flex-shrink-0 snap-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Served Today</p>
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-2">
                     <CountUp end={stats.served} />
                  </h2>
                  <p className="text-sm font-bold text-zinc-400">Avg. 12m / service</p>
               </GlassCard>

               {/* 4. Fast Pass Revenue */}
               <GlassCard className="min-w-[300px] flex-shrink-0 snap-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">Fast Pass Revenue</p>
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-2">₹{fastPassStats.today}</h2>
                  <p className="text-sm font-bold text-zinc-400">₹{fastPassStats.month} this month</p>
               </GlassCard>
            </div>

            {/* 🛠️ QUEUE COMMAND CENTER */}
            <div className="bg-surface/95 border border-border rounded-brand p-6 lg:p-8 min-h-[60vh]">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-white tracking-tight">Queue Command Center</h3>
                  <select 
                    value={selectedCounter}
                    onChange={(e) => setSelectedCounter(e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <option value="all">All Departments</option>
                    <option value="opd" className="text-zinc-300">OPD (General)</option>
                    <option value="spl" className="text-zinc-300">Specialist</option>
                  </select>
               </div>

               <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {queue.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                      >
                         <p className="text-zinc-500 font-bold">The queue is empty. Relax!</p>
                      </motion.div>
                    ) : (
                      queue.map((token: any) => (
                        <QueueRow 
                          key={token.id}
                          token={token}
                          onServe={async (id) => {
                            await callNextToken(businessData?.id, token.counterId, supabase);
                            toast.success(`Token ${token.tokenNumber} is next!`);
                          }}
                          onSkip={async (id) => {
                            await skipToken(businessData?.id, id, supabase);
                            toast.error(`Token ${token.tokenNumber} skipped`);
                          }}
                          onNoShow={async (id) => {
                            await skipToken(businessData?.id, id, supabase);
                            toast.error(`Token ${token.tokenNumber} marked as no-show`);
                          }}
                          onPriority={() => {}}
                        />
                      ))
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        )}

        {activeTab === "Analytics" && (
            <AnalyticsDashboard businessId={businessData?.id} />
        )}

        {activeTab === "Settings" && (
           <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StaffManagement businessId={businessData?.id} />
              
              <GlassCard>
                 <h2 className="text-xl font-black text-white mb-6">Marketplace Settings</h2>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border">
                       <div>
                          <p className="font-bold text-white flex items-center gap-2">
                             WhatsApp Notifications
                             {plan === 'free' && <Lock size={12} className="text-zinc-500" />}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">Send automated alerts to customers</p>
                       </div>
                       <input 
                          type="checkbox" 
                          disabled={plan === 'free'}
                          checked={businessData?.whatsapp_enabled || false}
                          onChange={async (e) => {
                            if (plan === 'free') {
                               setIsUpgradeModalOpen(true);
                               return;
                            }
                            const val = e.target.checked;
                            try {
                              setBusinessData({...businessData, whatsapp_enabled: val});
                              const { error } = await supabase.from("businesses").update({ whatsapp_enabled: val }).eq("id", businessData?.id).select();
                              if (error) throw error;
                              toast.success(`WhatsApp Alerts ${val ? 'Enabled' : 'Disabled'}`);
                            } catch (err: any) {
                              toast.error(`Update failed: ${err.message}`);
                              setBusinessData({...businessData, whatsapp_enabled: !val});
                            }
                          }}
                          className="w-5 h-5 accent-primary cursor-pointer"
                       />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border">
                       <div>
                          <p className="font-bold text-white">Enable Fast Pass</p>
                          <p className="text-xs text-zinc-500 mt-1">Allow customers to pay for priority</p>
                       </div>
                       <input 
                          type="checkbox" 
                          checked={businessData?.fastPassEnabled || false}
                          onChange={async (e) => {
                            const val = e.target.checked;
                            try {
                              setBusinessData({...businessData, fastPassEnabled: val});
                              const { error } = await supabase.from("businesses").update({ fastPassEnabled: val }).eq("id", businessData?.id).select();
                              if (error) throw error;
                              toast.success(`Fast Pass ${val ? 'Enabled' : 'Disabled'}`);
                            } catch (err: any) {
                              toast.error(`Update failed: ${err.message}`);
                              setBusinessData({...businessData, fastPassEnabled: !val});
                            }
                          }}
                       />
                    </div>
                    <div className="space-y-2">
                       <p className="text-xs font-black text-zinc-500 uppercase px-1">Fast Pass Price (₹)</p>
                       <div className="flex gap-2">
                          <input 
                            type="number" 
                            min="25"
                            value={businessData?.fastPassPrice || 50}
                            onChange={(e) => setBusinessData({...businessData, fastPassPrice: parseInt(e.target.value) || 25})}
                            className="bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none flex-1 focus:border-primary"
                          />
                          <button 
                            onClick={async () => {
                              try {
                                const { error } = await supabase.from("businesses").update({ fastPassPrice: businessData?.fastPassPrice || 50 }).eq("id", businessData?.id).select();
                                if (error) throw error;
                                toast.success("Price updated");
                              } catch (err: any) {
                                toast.error(`Update failed: ${err.message}`);
                              }
                            }}
                            className="px-6 py-3 rounded-xl bg-primary text-black font-black uppercase text-[10px]"
                          >
                             Save
                          </button>
                       </div>
                    </div>
                 </div>
              </GlassCard>
              
              <button 
                onClick={() => {
                  localStorage.removeItem("admin_org");
                  window.location.reload();
                }}
                className="w-full p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all"
              >
                 <LogOut size={16} /> Log Out Business
              </button>
           </div>
        )}
        {activeTab === "QR" && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <QRCodeGenerator business={{ id: businessData?.id, name: businessData?.name || 'Your Business' }} />
           </div>
        )}
      </div>

      {/* MODALS */}
      <QRCodeModal orgId={businessData?.id} isOpen={showQR} onClose={() => setShowQR(false)} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      
      {/* Onboarding */}
      <BusinessOnboarding businessName={businessData?.name || businessData?.id} businessId={businessData?.id} />
    </div>
  );
}
