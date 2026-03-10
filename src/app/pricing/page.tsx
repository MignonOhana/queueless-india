import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">

        {/* 🎉 FREE DURING BETA BANNER */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white text-center p-8 rounded-3xl shadow-xl shadow-emerald-500/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Sparkles size={14} /> Beta Access
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">🎉 100% FREE During Beta Testing!</h2>
              <p className="text-white/90 text-lg font-medium max-w-xl mx-auto">
                All features are completely free. No credit card required. No subscription needed.
              </p>
              <p className="text-white/70 text-sm mt-3">
                Help us improve and get <span className="font-bold text-white">free access for 1 year</span> when we launch.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Pricing</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Start for free. Upgrade when your business grows. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          
          {/* Free Tier */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Free Forever
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 mt-2">Starter</h3>
            <p className="text-slate-500 text-sm mb-6">Perfect for small clinics and salons.</p>
            <div className="mb-6"><span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span><span className="text-slate-500"> /month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> <s className="text-slate-400">100 tokens/day</s> <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">UNLIMITED (Beta)</span></li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> <s className="text-slate-400">1 Counter</s> <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">10 (Beta)</span></li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> AI Wait Predictions <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">FREE (Beta)</span></li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> Advanced Analytics <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">FREE (Beta)</span></li>
            </ul>
            <Link href="/register" className="block w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-center hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Get Started — Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-orange-500 to-rose-500 p-8 rounded-3xl shadow-xl text-white transform md:-translate-y-4 relative">
            <div className="absolute -top-3 left-6 bg-white text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2 mt-2">Professional</h3>
            <p className="text-white/80 text-sm mb-6">For busy hospitals and restaurants.</p>
            <div className="mb-6">
              <span className="text-4xl font-black line-through opacity-50">₹999</span>
              <span className="text-4xl font-black ml-2">₹0</span>
              <span className="text-white/80"> /month</span>
              <div className="text-xs font-bold text-yellow-200 mt-1">FREE during Beta!</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-white"><Check size={16} /> Unlimited tokens</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} /> Up to 10 Counters/Services</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} /> AI Wait Time Predictions</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} /> WhatsApp & SMS Alerts</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} /> Advance Booking</li>
            </ul>
            <Link href="/register" className="block w-full py-3 rounded-xl bg-white text-orange-600 font-bold text-center hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
              Get Started — Free During Beta
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Coming Soon
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 mt-2">Enterprise</h3>
            <p className="text-slate-500 text-sm mb-6">For government offices and large banks.</p>
            <div className="mb-6"><span className="text-4xl font-black text-slate-900 dark:text-white">Custom</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> Multi-branch support</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> Dedicated Account Manager</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> Custom integrations</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500 shrink-0" /> 99.9% Uptime SLA</li>
            </ul>
            <button disabled className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-400 cursor-not-allowed">
              Coming Soon
            </button>
          </div>

        </div>

        {/* FastPass Section */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap size={24} className="text-amber-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">FastPass (Coming Soon)</h3>
            </div>
            <p className="text-slate-500 mb-4">
              Let customers pay to skip the queue. You earn revenue, they save time. Win-win.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-bold">
              <Zap size={14} /> Requires Razorpay integration — launching soon
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
