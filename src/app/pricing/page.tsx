import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
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
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
            <p className="text-slate-500 text-sm mb-6">Perfect for small clinics and salons.</p>
            <div className="mb-6"><span className="text-4xl font-black">₹0</span><span className="text-slate-500"> /month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> Up to 100 tokens/day</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> 1 Counter/Service</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> Basic Analytics</li>
            </ul>
            <button className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Get Started</button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-orange-500 to-rose-500 p-8 rounded-3xl shadow-xl text-white transform md:-translate-y-4">
            <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Most Popular</div>
            <h3 className="text-xl font-bold mb-2">Professional</h3>
            <p className="text-white/80 text-sm mb-6">For busy hospitals and restaurants.</p>
            <div className="mb-6"><span className="text-4xl font-black">₹999</span><span className="text-white/80"> /month</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-white"><Check size={16} className="text-white" /> Unlimited tokens</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} className="text-white" /> Up to 5 Counters/Services</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} className="text-white" /> AI Wait Time Predictions</li>
              <li className="flex items-center gap-2 text-white"><Check size={16} className="text-white" /> Customer SMS Alerts</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white text-orange-600 font-bold hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">Start 14-Day Trial</button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
            <p className="text-slate-500 text-sm mb-6">For government offices and large banks.</p>
            <div className="mb-6"><span className="text-4xl font-black">Custom</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> Multi-branch support</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> Dedicated Account Manager</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> Custom integrations</li>
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Check size={16} className="text-emerald-500" /> 99.9% Uptime SLA</li>
            </ul>
            <button className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Contact Sales</button>
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
