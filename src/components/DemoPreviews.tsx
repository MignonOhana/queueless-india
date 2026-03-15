"use client";

import { motion } from "framer-motion";
import { CheckCircle2, LayoutDashboard, MonitorPlay, Smartphone, MapIcon, TrendingDown, HeartHandshake, Zap, Smile } from "lucide-react";
import { useState } from "react";

export default function DemoAndBenefits() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: "Customer App", icon: <Smartphone size={16} /> },
    { id: 1, label: "Business Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: 2, label: "TV Display", icon: <MonitorPlay size={16} /> },
    { id: 3, label: "City Map", icon: <MapIcon size={16} /> },
  ];

  const benefits = [
    { title: "Reduce crowd chaos", icon: <TrendingDown size={24} className="text-emerald-500" /> },
    { title: "Improve customer experience", icon: <Smile size={24} className="text-emerald-500" /> },
    { title: "Track service efficiency", icon: <Zap size={24} className="text-emerald-500" /> },
    { title: "Eliminate physical waiting", icon: <HeartHandshake size={24} className="text-emerald-500" /> },
  ];

  return (
    <>
      {/* Interactive Demo Section */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-3">
              Live Preview
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              A seamless experience for everyone.
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Explore how QueueLess looks for your customers, your staff, and on your displays.
            </p>
          </div>

          <div className="flex flex-col items-center">
            {/* Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id 
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Display Window */}
            <div className="w-full max-w-5xl aspect-video bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 p-2 md:p-4 shadow-2xl relative overflow-hidden flex items-center justify-center">
               
               {/* Browser Chrome Header */}
               <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-4 gap-2 z-20 rounded-t-[1.8rem]">
                 <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                 <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                 <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                 <div className="ml-4 px-3 py-1 bg-white dark:bg-slate-800 rounded-md text-[10px] text-slate-400 font-mono shadow-sm hidden sm:block">
                   preview.queueless.in
                 </div>
               </div>

               {/* Inner Content Area */}
               <div className="w-full h-full bg-white dark:bg-[#050505] rounded-xl md:rounded-2xl mt-8 relative overflow-hidden flex items-center justify-center">
                  
                  {/* Dynamic Content Based on Tab selection */}
                  {activeTab === 0 && (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full">
                       <div className="w-[280px] h-[580px] bg-[#f8fafc] border-[6px] border-slate-800 rounded-[2.5rem] shadow-xl relative overflow-hidden scale-75 md:scale-95">
                         <div className="w-full h-32 bg-indigo-600 p-6 flex items-end">
                            <div className="text-white font-bold text-xl">Your Token</div>
                         </div>
                         <div className="p-6 flex flex-col items-center">
                           <div className="text-7xl font-black text-slate-900 tracking-tighter my-4">A-42</div>
                           <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                             <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Currently Serving</span><span className="font-bold">A-38</span></div>
                             <div className="w-full h-2 bg-slate-100 rounded-full"><div className="w-3/4 h-full bg-indigo-500 rounded-full" /></div>
                           </div>
                         </div>
                       </div>
                     </motion.div>
                  )}

                  {activeTab === 1 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full p-8 bg-slate-50 dark:bg-[#0a0a0a] flex">
                        <div className="w-64 h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hidden md:block mr-6">
                          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
                          <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />)}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                           <div className="w-full h-32 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-6 flex items-center justify-between">
                             <div>
                               <div className="h-4 w-24 bg-indigo-200 dark:bg-indigo-800/50 rounded mb-2" />
                               <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">A-38</div>
                             </div>
                             <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold">Call Next Token (A-39)</button>
                           </div>
                           <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                             <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded mb-6" />
                             <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg" />)}
                             </div>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === 2 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-slate-900 p-8 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <div className="text-white text-2xl font-bold">Counter 1</div>
                           <div className="text-slate-400 text-xl">Please note your token</div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                           <div className="text-[10rem] font-black text-white leading-none tracking-tighter flex items-center gap-8">
                             <span className="animate-pulse text-indigo-500">&bull;</span> A-38
                           </div>
                        </div>
                        <div className="h-24 bg-slate-800 rounded-2xl flex items-center justify-between px-8 text-white mt-auto">
                           <div>Next: A-39</div>
                           <div>Next: A-40</div>
                           <div>Next: A-41</div>
                        </div>
                     </motion.div>
                  )}

                  {activeTab === 3 && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.2090,28.6139,13,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJDSU5lLVlnIn0.123')] bg-cover bg-center relative grayscale opacity-70">
                       <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-xl animate-bounce" />
                       <div className="absolute top-1/3 left-2/3 w-6 h-6 bg-indigo-500 rounded-full border-4 border-white shadow-xl animate-bounce" style={{ animationDelay: '0.5s' }} />
                       <div className="absolute top-2/3 left-1/2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-xl animate-bounce" style={{ animationDelay: '0.2s' }} />
                     </motion.div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="w-full bg-indigo-900 dark:bg-indigo-950 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 disabled:rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                  Better for business. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Better for customers.
                  </span>
                </h2>
                <p className="text-lg text-indigo-200 font-medium mb-10 max-w-lg leading-relaxed">
                  Turn a frustrating wait into a seamless digital journey. Businesses that use QueueLess report higher customer satisfaction and staff efficiency.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                   {benefits.map((benefit, idx) => (
                     <div key={idx} className="flex items-center gap-4 bg-white/5 dark:bg-white/10 p-4 rounded-xl border border-white/10 bg-opacity-95">
                       {benefit.icon}
                       <span className="text-white font-medium">{benefit.title}</span>
                     </div>
                   ))}
                </div>
              </div>

              {/* Stat Card Visual */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg rotate-[-10deg]">
                    80%
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wait Time Drop</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Average reduction in physical waiting room crowding across all partners.</p>
                  
                  {/* Fake Graph */}
                  <div className="h-32 w-full flex items-end gap-2 text-indigo-500">
                     {[80, 75, 50, 40, 30, 15, 10].map((h, i) => (
                       <motion.div 
                         key={i} 
                         initial={{ height: 0 }} 
                         whileInView={{ height: `${h}%` }} 
                         viewport={{ once: true }} 
                         transition={{ delay: i * 0.1, duration: 0.5 }}
                         className={`flex-1 rounded-t-sm ${i > 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} 
                       />
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
