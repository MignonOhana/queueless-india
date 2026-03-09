"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Clock, MapPin, Activity, Zap, CheckCircle2, QrCode, Download, Store, Building2, Quote, Star, Shield, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [100, 0, 0, -100]);

  const [isStandalone, setIsStandalone] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("hospitals");

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    setIsMobile(/iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase()));
  }, []);

  const triggerInstall = () => {
    window.dispatchEvent(new Event('show-pwa-prompt'));
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              QueueLess <span className="text-indigo-600">India</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/home" 
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block"
            >
              Find a Queue
            </Link>
            <Link 
              href="/register" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              For Businesses
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,#e0e7ff_0%,transparent_70%)] -z-10" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-100/50 blur-[100px] mix-blend-multiply -z-10" />
        <div className="absolute top-40 -left-20 w-[600px] h-[600px] rounded-full bg-indigo-100/50 blur-[100px] mix-blend-multiply -z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8 shadow-sm">
              <span className="flex items-center gap-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                Live in 50+ Cities
              </span>
              <span className="hidden sm:inline text-indigo-300">|</span>
              <span>Join over 2M+ smart waiters in India</span>
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto"
          >
            Never wait in a physical line <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ever again.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            The ultimate smart queue system for hospitals, banks, and salons. Join virtually, track live waits, and arrive exactly when it's your turn.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4"
          >
            {isMobile && !isStandalone && (
              <button 
                onClick={triggerInstall}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download App
              </button>
            )}
            <Link 
              href="/customer" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group active:scale-95"
            >
              Skip the Line Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 hover:border-slate-300 rounded-full font-bold text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              Onboard my Business
            </Link>
          </motion.div>
        </div>

        {/* Floating App Mockup (from original classic) */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
          className="max-w-5xl mx-auto px-6 mt-20 relative z-10 hidden sm:block"
        >
          <div className="rounded-[2rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-video relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-20 flex gap-2 justify-center items-center px-2">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=2560&auto=format&fit=crop" 
              alt="QueueLess India Interface" 
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Mock UI Elements rendered over image */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end justify-center p-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl flex items-center justify-between">
                <div>
                   <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">Your Token</p>
                   <p className="text-white font-black text-4xl">H-042</p>
                </div>
                <div className="text-right">
                   <p className="text-emerald-400 font-bold mb-1">Active</p>
                   <p className="text-white/80 font-medium">5 people ahead</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works (New Section, Classic Styling) */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-600">Three simple steps to never waiting in line again.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100 z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border-8 border-white shadow-sm mb-6">
                <MapPin className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Find a Queue</h3>
              <p className="text-slate-600">Use the map to discover businesses nearby and check their live wait times instantly.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 border-8 border-white shadow-sm mb-6">
                <Smartphone className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Join Remotely</h3>
              <p className="text-slate-600">Claim your token digitally from anywhere. Track your precise position in line live.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border-8 border-white shadow-sm mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Arrive on Time</h3>
              <p className="text-slate-600">We send you an SMS alert when it's almost your turn. Just arrive and walk right in.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Original Classic) */}
      <section ref={targetRef} className="py-24 bg-slate-50 relative border-t border-slate-100">
        <motion.div style={{ opacity, y }} className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Built for scale. Designed for humans.</h2>
            <p className="text-lg text-slate-600">The most powerful suite of queue management tools in India.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Live Discovery Map</h3>
              <p className="text-slate-600 leading-relaxed">Find nearby hospitals, banks, and salons. Instantly see their live wait times on a dynamic heat map before you even leave home.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Scan & Join</h3>
              <p className="text-slate-600 leading-relaxed">Arrived at the location? Scan the QR code on the live TV display and instantly claim your token without downloading any app.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Prediction Engine</h3>
              <p className="text-slate-600 leading-relaxed">Our Gemini AI model learns historical traffic patterns to accurately predict the best time of day for you to visit.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Priority Fast Pass</h3>
              <p className="text-slate-600 leading-relaxed">In a rush? Businesses can offer paid premium fast passes via integrated Razorpay for customers who need immediate priority service.</p>
            </div>

            <div className="md:col-span-2 bg-[#0B6EFE] p-8 rounded-3xl shadow-xl shadow-blue-500/20 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-20 mix-blend-overlay" />
              <div className="relative z-10 max-w-md">
                <h3 className="text-2xl font-black mb-4">Are you a Business Owner?</h3>
                <p className="text-blue-100 mb-6 text-lg">Stop losing customers to long physical wait times. Deploy a fully branded live digital queue and TV display in 3 minutes.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-300" /> Export historical CSV Analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-300" /> Cast to any Smart TV automatically</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-300" /> Automated customer SMS alerts</li>
                </ul>
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-2 bg-white text-[#0B6EFE] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                >
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Use Cases (New Section, Classic Styling) */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Perfect for any business</h2>
             <p className="text-lg text-slate-600">QueueLess adapts to the specific needs of your industry.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
             <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-center">
               <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4"><Building2 /></div>
               <h4 className="font-bold tracking-tight text-slate-900 mb-2">Hospitals & Clinics</h4>
               <p className="text-slate-600 text-sm">Keep waiting rooms clear by letting patients wait at home until the doctor is ready.</p>
             </div>
             <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 text-center">
               <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-rose-600 mx-auto mb-4"><Store /></div>
               <h4 className="font-bold tracking-tight text-slate-900 mb-2">Salons & Spas</h4>
               <p className="text-slate-600 text-sm">Let clients book walk-in slots virtually to maximize your chair utilization.</p>
             </div>
             <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 text-center">
               <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-4"><Shield /></div>
               <h4 className="font-bold tracking-tight text-slate-900 mb-2">Banks & Offices</h4>
               <p className="text-slate-600 text-sm">Create organized service lines categorized by transaction types.</p>
             </div>
             <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 text-center">
               <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-amber-600 mx-auto mb-4"><MapPin /></div>
               <h4 className="font-bold tracking-tight text-slate-900 mb-2">Temples & Events</h4>
               <p className="text-slate-600 text-sm">Manage massive crowds efficiently with remote token generation.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing (New Section, Classic Styling) */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600">Designed for scale. Start for free.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Community</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-4xl font-black text-slate-900">₹0</span>
                 <span className="text-slate-500 font-medium">/forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                 <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> Live Queue Generation</li>
                 <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> TV Display Page Cast</li>
                 <li className="flex gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> Basic Web Analytics</li>
                 <li className="flex gap-3 text-slate-400"><X className="w-5 h-5 shrink-0" /> Priority Fast Pass Engine</li>
                 <li className="flex gap-3 text-slate-400"><X className="w-5 h-5 shrink-0" /> Automated SMS Alerts</li>
              </ul>
              <Link href="/register" className="block w-full text-center py-3 rounded-xl border-2 border-slate-200 text-slate-900 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-colors">Get Started Free</Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-800 relative">
              <div className="absolute top-0 right-10 transform -translate-y-1/2">
                <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise Plus</h3>
              <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-4xl font-black text-white">2%</span>
                 <span className="text-slate-400 font-medium">per Fast Pass transaction</span>
              </div>
              <ul className="space-y-4 mb-8">
                 <li className="flex gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Everything in Community</li>
                 <li className="flex gap-3 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Priority Fast Pass Payments</li>
                 <li className="flex gap-3 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Automated Twilio SMS Alerts</li>
                 <li className="flex gap-3 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> AI Waiting Time Predictions</li>
                 <li className="flex gap-3 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> Exportable CSV Analytics</li>
              </ul>
              <Link href="/register" className="block w-full text-center py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors">Upgrade to Enterprise</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (New Section, Classic Styling) */}
      <section className="py-24 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
           <Quote className="w-12 h-12 mx-auto text-indigo-300 mb-6 opacity-50" />
           <h2 className="text-2xl md:text-4xl font-black leading-tight mb-8">"Since installing QueueLess India, our hospital waiting room has never been overcrowded. Patients wait in the comfort of their cars and walk in exactly when called. Incredible."</h2>
           <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-indigo-400 rounded-full flex items-center justify-center font-bold text-indigo-900">Dr. S</div>
              <div className="text-left">
                <p className="font-bold text-lg">Dr. Sharma</p>
                <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer (Original Classic) */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-white">QueueLess India</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link href="/policies" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/policies" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
