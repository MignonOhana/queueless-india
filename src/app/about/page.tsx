import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Target, Lightbulb, Users, Globe2 } from "lucide-react";

export default function About() {
  return (
    <main className="min-[100vh] bg-slate-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center">
         <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 relative z-10">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">QueueLess</span>
         </h1>
         <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            We are redefining how India waits. By transforming physical lines into digital discovery experiences, we save millions of hours of human potential every day.
         </p>
      </section>

      {/* Vision & Mission */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Vision */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-colors" />
               <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                  <Lightbulb size={32} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Our Vision</h2>
               <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  To create a seamlessly connected India where waiting time is zero, and physical infrastructure scales infinitely through digital convenience. We envision a society that values every individual's time as their most precious asset.
               </p>
            </div>

            {/* Mission */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mb-20 group-hover:bg-indigo-500/20 transition-colors" />
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                  <Target size={32} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Our Mission</h2>
               <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  To build the most accessible, invisible, and intelligent Queue Discovery Marketplace. We strive to empower businesses with predictive analytics while giving consumers the freedom to track, anticipate, and manage their physical interactions from anywhere.
               </p>
            </div>

         </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 md:px-12 bg-white dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-16 text-center">Core Pillars</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
               <div className="flex gap-6">
                  <div className="w-16 h-16 flex-shrink-0 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
                     <Users size={28} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User First</h3>
                     <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Every feature we build starts with how it returns control and transparency back to the end consumer. Simple, accessible, and fast.</p>
                  </div>
               </div>

               <div className="flex gap-6">
                  <div className="w-16 h-16 flex-shrink-0 rounded-[2rem] bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                     <Globe2 size={28} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hyper-Local Discovery</h3>
                     <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">We don't just solve lines; we surface the best nearby services available immediately, connecting communities to real-time local demand.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
