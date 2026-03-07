import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ShieldCheck, FileText, LockKeyhole } from "lucide-react";

export default function Policies() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300">
      <Navigation />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 sm:px-12 max-w-4xl mx-auto w-full text-center">
         <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
            Legal & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Policies</span>
         </h1>
         <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Transparency is at the core of QueueLess India. Please review our terms, privacy policies, and security commitments.
         </p>
      </section>

      {/* Content */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full space-y-12">
         
         {/* Privacy Policy */}
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6 relative">
               <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <ShieldCheck size={24} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Privacy Policy</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed">
               <p>Your privacy is important to us. QueueLess India only collects information necessary to facilitate your queue management, such as your phone number (for SMS routing) and real-time location (when utilizing the Discovery Map).</p>
               <p>We do not sell personal data to third parties. Location data is stored ephemerally and only processed to show you the closest available venues. By using the Fast Pass feature, payment details are tokenized and securely handled by our PCI-compliant payment gateways.</p>
            </div>
         </div>

         {/* Terms of Service */}
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileText size={24} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Terms of Service</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed">
               <p>By accessing the QueueLess platform via our Customer App or Business Dashboard, you agree to comply with our acceptable use standards.</p>
               <p><strong>For Users:</strong> You agree not to exploit the Fast Pass framework or repeatedly book and abandon queues. Accounts flagged for excessive no-shows may be temporarily suspended to preserve business efficiency.</p>
               <p><strong>For Businesses:</strong> You are responsible for ensuring the physical fulfillment of tokens generated digitally. Fast Pass prices must truthfully reflect priority access and not be used disruptively.</p>
            </div>
         </div>

         {/* Security Policy */}
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <LockKeyhole size={24} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Security & Infrastructure</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed">
               <p>All data transmitted across the QueueLess ecosystem is encrypted in transit utilizing TLS 1.3 and at rest securing our database architecture.</p>
               <p>We utilize edge-routing to ensure maximum uptime, even during peak consumer hours in densely populated regions. Our infrastructure routinely undergoes vulnerability scoping to preemptively neutralize risks.</p>
            </div>
         </div>

      </section>

      <Footer />
    </main>
  );
}
