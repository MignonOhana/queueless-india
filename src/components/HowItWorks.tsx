"use client";

import { motion } from "framer-motion";
import { QrCode, UserPlus, Eye } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Step 1: Scan QR Code",
      description: "Customer scans the QR code at the store entrance. No app download required.",
      icon: <QrCode size={28} className="text-indigo-600 dark:text-indigo-400" />,
      color: "from-indigo-500/10 to-transparent",
    },
    {
      title: "Step 2: Join Queue",
      description: "Customer gets a digital token instantly and sees their exact position in line.",
      icon: <UserPlus size={28} className="text-purple-600 dark:text-purple-400" />,
      color: "from-purple-500/10 to-transparent",
    },
    {
      title: "Step 3: Track Turn",
      description: "Live updates show estimated wait time. Receive SMS/WhatsApp alerts when turn approaches.",
      icon: <Eye size={28} className="text-pink-600 dark:text-pink-400" />,
      color: "from-pink-500/10 to-transparent",
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-3">
            How It Works
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Get your line moving in 3 simple steps
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A frictionless experience for your customers. They join from their phone, track their status, and arrive exactly when you're ready for them.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              className="relative"
            >
              {/* Card */}
              <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full relative z-10 bg-opacity-95 group">
                
                {/* Background Gradient Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10`} />

                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h4>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
