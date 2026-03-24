'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Clock, Zap, TrendingUp,
  Download, BrainCircuit 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, Tooltip, 
  ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { FEATURES } from '@/lib/features';
import GlassCard from '@/components/ui/GlassCard';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

// --- MOCK DATA FOR UI PREVIEW ---
const MOCK_HOURLY = Array.from({ length: 15 }, (_, i) => ({
  hour: `${i + 6}:00`,
  count: Math.floor(Math.random() * 20) + 5,
  isPeak: (i + 6) >= 10 && (i + 6) <= 12
}));

const MOCK_LINE = Array.from({ length: 7 }, (_, i) => ({
  day: format(subDays(new Date(), 6 - i), 'EEE'),
  wait: Math.floor(Math.random() * 15) + 10
}));

const MOCK_PIE = [
  { name: 'Returning', value: 36, color: '#00F5A0' },
  { name: 'First-time', value: 64, color: 'rgba(255,255,255,0.1)' }
];

interface HourlyData {
  hour: string;
  count: number;
  isPeak: boolean;
}

interface DailyStatsTrend {
  day: string;
  wait: number;
}

export default function AnalyticsDashboard({ businessId }: { businessId: string }) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>(MOCK_HOURLY);
  const [dailyStats, setDailyStats] = useState<DailyStatsTrend[]>(MOCK_LINE);
  const [isLocked, setIsLocked] = useState(false);
  const [summaryStats, setSummaryStats] = useState({ totalServed: 0, avgWait: 0, noShowRate: 0, completionRate: 0 });
  
  useEffect(() => {
    if (!businessId) return;

    const fetchData = async () => {
      try {
        // 1. Check Subscription Gate (bypassed during testing phase)
        if (!FEATURES.IS_TESTING_PHASE) {
          const { data: biz }: any = await supabase.from('businesses').select('plan').eq('id', businessId).single();
          if (biz?.plan === 'free') {
            setIsLocked(true);
            setIsLoading(false);
            return;
          }
        }

        // 1b. Fetch real metrics from daily_stats (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: statsRows } = await supabase
          .from('daily_stats')
          .select('*')
          .eq('business_id', businessId)
          .gte('stat_date', sevenDaysAgo)
          .order('stat_date', { ascending: true });

        if (statsRows && statsRows.length > 0) {
          const stats = statsRows as Database['public']['Tables']['daily_stats']['Row'][];
          const totalServed = stats.reduce((sum, s) => sum + (s.total_served || 0), 0);
          const avgWait = Math.round(stats.reduce((sum, s) => sum + (s.avg_wait_mins || 0), 0) / stats.length);
          const totalIssued = stats.reduce((sum, s) => sum + (s.total_tokens_issued || 0), 0);
          const totalNoShows = stats.reduce((sum, s) => sum + (s.total_no_shows || 0), 0);
          const noShowRate = totalIssued > 0 ? Math.round((totalNoShows / totalIssued) * 100) : 0;
          const completionRate = totalIssued > 0 ? Math.round((totalServed / totalIssued) * 100) : 0;

          setSummaryStats({ totalServed, avgWait, noShowRate, completionRate });

          // Update daily trend chart from real data
          setDailyStats(stats.map((d) => ({
            day: format(new Date(d.stat_date), 'EEE'),
            wait: d.avg_wait_mins || 0
          })));
        }

        // 2. Fetch Hourly Data
        const today = new Date().toISOString().split('T')[0];
        const { data: hourly }: any = await (supabase as any).rpc('get_hourly_distribution', { 
          p_org_id: businessId, 
          p_date: today 
        });
        
        if (hourly) {
          const formattedHourly = Array.from({ length: 15 }, (_, i) => {
             const h = i + 6;
             const found = (hourly as any[]).find((d) => d.hour_val === h);
             return {
               hour: `${h}:00`,
               count: found ? found.token_count : 0,
               isPeak: h >= 10 && h <= 12
             };
          });
          setHourlyData(formattedHourly);
        }

        try {
          const { data: trend }: any = await (supabase as any).rpc('get_wait_time_trend', {
            p_org_id: businessId,
            p_days: 7
          });
          if (trend && Array.isArray(trend)) {
             setDailyStats((trend as any[]).map((d) => ({
               day: format(new Date(d.date_val), 'EEE'),
               wait: d.avg_wait
             })));
          }
        } catch (e) {
          console.warn("Wait time trend RPC not found, using daily stats instead");
        }

        // 4. AI Insights via Edge Function
        const { data: aiResponse } = await supabase.functions.invoke('predict-queue', {
          body: { orgId: businessId, stats: { currentlyWaiting: 5, totalToday: 47 } }
        });

        if (aiResponse && aiResponse.strategies) {
          setInsights(aiResponse.strategies);
        } else {
          setInsights([
            "📈 Tuesdays are 40% busier than average. Consider adding staff.",
            "⚡ Fast Pass adoption is low (3%). Try reducing price to ₹49.",
            "🎯 Your service time improved by 2 mins this week. Great work!"
          ]);
        }

      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("QueueLess India", 20, 20);
    
    doc.setFontSize(10);
    doc.text("PERFORMANCE INTELLIGENCE REPORT", 20, 28);
    
    doc.setTextColor(150, 150, 150);
    doc.text(`Business ID: ${businessId}`, 190, 28, { align: 'right' });
    
    // Grid Lines & Content
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 45, 190, 45);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Daily Snapshot", 20, 55);
    
    const stats = [
      ["Metric", "Value", "Daily Trend"],
      ["Total Tokens", "47", "+12%"],
      ["Avg Wait Time", "18 mins", "-3 mins"],
      ["Peak Hour", "11:00 AM", "Stable"],
      ["Completion Rate", "94%", "+2%"]
    ];
    
    let y = 65;
    stats.forEach((row, i) => {
      doc.setFont("helvetica", i === 0 ? "bold" : "normal");
      doc.text(row[0], 25, y);
      doc.text(row[1], 80, y);
      doc.text(row[2], 130, y);
      y += 10;
    });
    
    // Insights Section
    y += 10;
    doc.setFillColor(240, 255, 250);
    doc.rect(20, y, 170, 45, 'F');
    
    doc.setTextColor(0, 100, 80);
    doc.setFont("helvetica", "bold");
    doc.text("AI SERVICE RECOMMENDATIONS", 25, y + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    insights.forEach((insight, idx) => {
      doc.text(`• ${insight}`, 30, y + 20 + (idx * 7));
    });
    
    doc.save(`QueueLess_Report_${businessId}.pdf`);
    toast.success("Report downloaded successfully");
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-8">
          <Zap size={40} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Growth Plan Required</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          Unlock business intelligence, AI insights, and professional PDF reports to optimize your queue and increase revenue.
        </p>
        <button 
          className="px-8 py-4 rounded-xl bg-[#00F5A0] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)]"
          onClick={() => { /* Trigger Upgrade Modal in parent if needed */ }}
        >
          Upgrade for ₹2,499/mo
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00F5A0]/20 border-t-[#00F5A0] rounded-full animate-spin" />
        <p className="text-[#00F5A0] font-black uppercase tracking-widest text-xs">Syncing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Business Intelligence</h2>
          <p className="text-slate-500 mt-1 font-medium">Real-time performance metrics for {businessId}</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs hover:bg-white hover:text-black transition-all active:scale-95"
        >
          <Download size={18} /> Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SNAPSHOTS */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
           {[
             { label: "Customers Served", value: `${summaryStats.totalServed}`, delta: "7d", color: "emerald", icon: Users },
             { label: "Avg Wait Time", value: `${summaryStats.avgWait}m`, delta: "avg", color: "blue", icon: Clock },
             { label: "No-Show Rate", value: `${summaryStats.noShowRate}%`, delta: "7d", color: "amber", icon: Zap },
             { label: "Completion", value: `${summaryStats.completionRate}%`, delta: "7d", color: "purple", icon: TrendingUp }
           ].map((stat, i) => (
             <OverviewCard key={i} {...stat} />
           ))}
        </div>

        {/* AI PANEL */}
        <div className="lg:col-span-4">
          <GlassCard className="h-full bg-gradient-to-br from-[#00F5A0]/5 to-transparent border-[#00F5A0]/10">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="text-[#00F5A0]" size={20} />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-[13px] font-medium text-slate-300 leading-relaxed"
                >
                  {insight}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* HOURLY CHART */}
        <div className="lg:col-span-12">
          <GlassCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Hourly Traffic</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Peak Period: 10:00 AM - 12:00 PM</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} accessibilityLayer aria-label="Hourly Traffic Bar Chart">
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {hourlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPeak ? '#00F5A0' : 'rgba(255,255,255,0.05)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* WAIT TREND */}
        <div className="lg:col-span-8">
           <GlassCard>
              <h3 className="text-xl font-black text-white tracking-tight mb-8">7-Day Wait Trend</h3>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyStats} accessibilityLayer aria-label="7-Day Wait Time Trend Chart">
                       <defs>
                          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 800 }} />
                       <Tooltip contentStyle={{ backgroundColor: '#111118', borderRadius: '16px' }} />
                       <ReferenceLine y={15} stroke="#FF4D6D" strokeDasharray="3 3" />
                       <Area type="monotone" dataKey="wait" stroke="#38BDF8" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </GlassCard>
        </div>

        {/* RETENTION PIE */}
        <div className="lg:col-span-4">
           <GlassCard className="flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Users size={80} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-2 self-start">New vs Returning</h3>
              <p className="text-[10px] text-slate-500 font-bold mb-8 self-start uppercase">Customer Loyalty</p>
              
              <div className="relative w-48 h-48">
                 <ResponsiveContainer width="100%" height="100%">
                     <PieChart accessibilityLayer aria-label="Customer Retention Pie Chart">
                       <Pie data={MOCK_PIE} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                          {MOCK_PIE.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">36%</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase transition-transform">Loyal</span>
                 </div>
              </div>
           </GlassCard>
        </div>

        {/* WEEKLY HEATMAP */}
        <div className="lg:col-span-12">
           <GlassCard>
              <h3 className="text-xl font-black text-white tracking-tight mb-8">Weekly Heatmap</h3>
              <div className="grid grid-cols-8 gap-1 overflow-x-auto pb-4">
                 <div className="flex flex-col gap-1 justify-end pb-1 pr-2">
                    {['8am', '12pm', '4pm', '8pm'].map(h => (
                       <span key={h} className="h-6 text-[10px] font-bold text-zinc-600 uppercase text-right leading-6">{h}</span>
                    ))}
                 </div>
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="flex flex-col gap-1 flex-1 min-w-[50px]">
                       <span className="text-[10px] font-black text-zinc-500 uppercase text-center mb-2">{day}</span>
                       {Array.from({ length: 14 }).map((_, i) => {
                          const intensity = Math.random();
                          return (
                             <div 
                               key={i} 
                               className={`h-6 rounded-md transition-all hover:scale-110 cursor-help ${
                                 intensity > 0.8 ? 'bg-[#00F5A0]' : 
                                 intensity > 0.5 ? 'bg-[#00A86B]' : 
                                 intensity > 0.2 ? 'bg-[#003322]' : 'bg-white/5'
                               }`} 
                             />
                          );
                       })}
                    </div>
                 ))}
              </div>
              <div className="flex items-center gap-4 mt-8 justify-end">
                 <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Queue Volume</span>
                 <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-white/5" />
                    <div className="w-4 h-4 rounded-sm bg-[#003322]" />
                    <div className="w-4 h-4 rounded-sm bg-[#00A86B]" />
                    <div className="w-4 h-4 rounded-sm bg-[#00F5A0]" />
                 </div>
              </div>
           </GlassCard>
        </div>

      </div>
    </div>
  );
}

interface OverviewCardProps {
  label: string;
  value: string | number;
  delta: string;
  color: string;
  icon: any;
}

function OverviewCard({ label, value, delta, color, icon: Icon }: OverviewCardProps) {
  const isPositive = delta.startsWith('+');
  
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500/10 bg-emerald-500/5',
    blue: 'border-blue-500/10 bg-blue-500/5',
    amber: 'border-amber-500/10 bg-amber-500/5',
    purple: 'border-purple-500/10 bg-purple-500/5'
  };

  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500'
  };

  return (
    <GlassCard 
      className={`relative overflow-hidden group border ${colorMap[color] || 'border-white/10'}`}
    >
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
          <div className="flex items-end gap-3">
             <h2 className="text-3xl font-black text-white tracking-tighter">{value}</h2>
             <span className={`text-[10px] font-black mb-1.5 flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
               {delta}
             </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${iconColorMap[color] || 'text-zinc-400'}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-20 ${
        color === 'emerald' ? 'bg-emerald-500' :
        color === 'blue' ? 'bg-blue-500' :
        color === 'amber' ? 'bg-amber-500' :
        color === 'purple' ? 'bg-purple-500' : 'bg-white/10'
      }`} />
    </GlassCard>
  );
}

