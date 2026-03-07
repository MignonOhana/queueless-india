"use client";

import { motion } from "framer-motion";
import { Quote, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function TestimonialsAndCTA() {
  return (
    <>
      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Quote size={48} className="mx-auto text-indigo-500 dark:text-indigo-500/50 mb-6 opacity-50" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-16">
              Loved by businesses <br/>and <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">millions of customers.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
               {/* Testimonial 1 */}
               <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow">
                  <div className="flex gap-1 mb-6">
                     {[1,2,3,4,5].map(i => <Star key={i} size={20} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium italic mb-8">
                     "QueueLess reduced our waiting room chaos by 80% in the first week. Our patients are happier, and our staff can finally breathe."
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-inner" />
                     <div>
                        <div className="font-bold text-slate-900 dark:text-white">Dr. Rajesh Kumar</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Head Admin, City Hospital</div>
                     </div>
                  </div>
               </div>

               {/* Testimonial 2 */}
               <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow relative md:-translate-y-4">
                  <div className="flex gap-1 mb-6">
                     {[1,2,3,4,5].map(i => <Star key={i} size={20} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium italic mb-8">
                     "The Fast Pass feature alone generated a completely new revenue stream for our salon while giving VIP clients exactly what they wanted."
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 shadow-inner" />
                     <div>
                        <div className="font-bold text-slate-900 dark:text-white">Priya Sharma</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Owner, Lux Salons</div>
                     </div>
                  </div>
               </div>

               {/* Testimonial 3 */}
               <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow">
                  <div className="flex gap-1 mb-6">
                     {[1,2,3,4,5].map(i => <Star key={i} size={20} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium italic mb-8">
                     "As a customer, I love that I can grab a coffee next door instead of standing in line at the bank. The live alerts are incredibly accurate."
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-inner" />
                     <div>
                        <div className="font-bold text-slate-900 dark:text-white">Arjun Patel</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Verified User</div>
                     </div>
                  </div>
               </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-indigo-600 dark:bg-indigo-900 transition-colors duration-300">
        
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
           <div className="absolute inset-x-0 top-0 h-px bg-white" />
           <div className="absolute inset-x-0 bottom-0 h-px bg-white" />
           <div className="absolute inset-y-0 left-1/4 w-px bg-white" />
           <div className="absolute inset-y-0 right-1/4 w-px bg-white" />
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Stop Making Customers <br/>Wait in Line.
            </h2>
            <p className="text-xl text-indigo-100 font-medium mb-10 max-w-2xl mx-auto">
              Join thousands of businesses that use QueueLess India to manage their crowds digitally and seamlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row shadow-2xl items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                Start for Free
              </Link>
              <Link href="/contact" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-700 dark:bg-indigo-800 text-white border border-indigo-500 dark:border-indigo-700 font-bold text-lg hover:bg-indigo-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center">
                Book a Demo
              </Link>
            </div>
            <p className="text-indigo-200 text-sm mt-6">No credit card required &bull; 14-day free trial for Pro features</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
