"use client";

import { motion } from "framer-motion";
import { QrCode, Eye, BrainCircuit, Map, MessageSquare, Monitor, Layers, Building2, Landmark, Scissors, Utensils, Plane } from "lucide-react";

export default function FeaturesAndIndustries() {
  const features = [
    {
      title: "Smart QR Queue",
      desc: "Customers scan and join instantly without downloading any extra apps.",
      icon: <QrCode size={24} className="text-white" />,
      bg: "bg-indigo-500 shadow-indigo-500/30"
    },
    {
      title: "Live Queue Tracking",
      desc: "Customers see people ahead of them and get accurate estimated wait times.",
      icon: <Eye size={24} className="text-white" />,
      bg: "bg-purple-500 shadow-purple-500/30"
    },
    {
      title: "AI Wait Prediction",
      desc: "Predict busy hours and intelligently route crowd patterns using AI.",
      icon: <BrainCircuit size={24} className="text-white" />,
      bg: "bg-rose-500 shadow-rose-500/30"
    },
    {
      title: "City Queue Map",
      desc: "Users can find the shortest queues nearby directly on the map.",
      icon: <Map size={24} className="text-white" />,
      bg: "bg-orange-500 shadow-orange-500/30"
    },
    {
      title: "SMS & WhatsApp Alerts",
      desc: "Automatically notify customers when their turn is approaching.",
      icon: <MessageSquare size={24} className="text-white" />,
      bg: "bg-emerald-500 shadow-emerald-500/30"
    },
    {
      title: "Public Display Screen",
      desc: "Show live token numbers on large TVs in your waiting areas.",
      icon: <Monitor size={24} className="text-white" />,
      bg: "bg-blue-500 shadow-blue-500/30"
    },
    {
      title: "Multi-Counter Support",
      desc: "Manage different services like OPD, billing, and lab queues seamlessly.",
      icon: <Layers size={24} className="text-white" />,
      bg: "bg-pink-500 shadow-pink-500/30"
    }
  ];

  const industries = [
    { name: "Hospitals", icon: <Building2 size={24} className="text-slate-600 dark:text-slate-400" /> },
    { name: "Banks", icon: <Landmark size={24} className="text-slate-600 dark:text-slate-400" /> },
    { name: "Salons", icon: <Scissors size={24} className="text-slate-600 dark:text-slate-400" /> },
    { name: "Restaurants", icon: <Utensils size={24} className="text-slate-600 dark:text-slate-400" /> },
    { name: "Govt Offices", icon: <Building2 size={24} className="text-slate-600 dark:text-slate-400" /> },
    { name: "Airports", icon: <Plane size={24} className="text-slate-600 dark:text-slate-400" /> },
  ];

  return (
    <>
      {/* Product Features Section */}
      <section className="py-24 bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
             <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-3">
              Power Features
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Everything you need to <br/>manage lines efficiently.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-2xl hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${feature.bg}`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve Section */}
      <section className="py-24 border-y border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-12">
             Trusted by businesses across all industries
           </h3>
           
           <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
             {industries.map((ind, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 grayscale hover:grayscale-0 hover:border-indigo-500/30 transition-all duration-300 cursor-default"
               >
                 {ind.icon}
                 <span className="font-semibold text-slate-900 dark:text-slate-300">{ind.name}</span>
               </motion.div>
             ))}
           </div>
        </div>
      </section>
    </>
  );
}
