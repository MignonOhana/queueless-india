"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Clock, Sparkles, CheckCircle2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { createBusiness } from "@/lib/queueService";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailOTPModal } from "@/components/auth/EmailOTPModal";

export default function BusinessRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    location: "",
    serviceMins: "15",
    opHours: "09:00-17:00",
    aiEnabled: true,
    smsEnabled: true,
    email: "",
  });
  
  const [showOTP, setShowOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => Math.min(5, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const supabase = createClient();
  const handleFinalSubmit = async (_verifiedUser: any) => {
    setIsSubmitting(true);
    try {
      // CRITICAL: Always get the authenticated user from the session, not the callback param
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Create Business Record linked to verified User
      await createBusiness({
        name: formData.businessName,
        category: formData.category,
        location: formData.location,
        serviceMins: parseInt(formData.serviceMins) || 15,
        opHours: formData.opHours,
        aiEnabled: formData.aiEnabled,
        smsEnabled: formData.smsEnabled,
        owner_id: user.id  // ← from getUser(), never null
      }, supabase);

      // Tag user as business_owner in user_profiles
      await supabase.from('user_profiles').upsert({
        id: user.id,
        role: 'business_owner',
        full_name: user.email?.split('@')[0] || 'Business Owner',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      
      setShowOTP(false);
      setStep(5); // Success step
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error creating business");
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <PageTransition className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      
      {/* Header */}
      <nav className="h-20 bg-white/50 dark:bg-slate-900/50 bg-opacity-95 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 shrink-0 absolute top-0 left-0 right-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
            Q
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            QueueLess<span className="text-blue-600 dark:text-blue-400"> Business</span>
          </span>
        </Link>
      </nav>

      {/* Main Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative pt-24">
        
        {/* Progress Bar */}
        {step < 5 && (
          <div className="w-full max-w-md mb-8">
            <div className="flex justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Step {step} of 4</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                {step === 1 ? "Basics" : step === 2 ? "Queue Setup" : step === 3 ? "Account" : "Smart Features"}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: `${(step - 1) * 25}%` }}
                animate={{ width: `${step * 25}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden min-h-[450px] flex flex-col">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Basics */}
            {step === 1 && (
              <motion.div 
                key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-6 text-blue-600 dark:text-blue-400">
                   <Building2 size={28} />
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Business Basics</h2>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
                    <input 
                      type="text" 
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      placeholder="e.g. City Hospital OPD"
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-medium transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-medium transition-colors"
                    >
                      <option value="">Select Category</option>
                      <option value="Hospital">Hospital / Clinic</option>
                      <option value="Bank">Bank Branch</option>
                      <option value="Salon">Salon / Spa</option>
                      <option value="Government">Government Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">City Location</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Mumbai, Bandra West"
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-medium transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  disabled={!formData.businessName}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl mt-6 flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Settings */}
            {step === 2 && (
              <motion.div 
                key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                className="flex flex-col h-full"
              >
                <button onClick={handleBack} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors hidden md:block"><ArrowLeft size={20}/></button>
                <div className="flex items-center gap-3 mb-6 text-orange-600 dark:text-orange-400">
                   <Clock size={28} />
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Queue Settings</h2>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Service time per customer (mins)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="1" max="60" 
                        value={formData.serviceMins}
                        onChange={(e) => setFormData({...formData, serviceMins: e.target.value})}
                        className="flex-1 cursor-pointer accent-orange-500 bg-slate-200 dark:bg-slate-700 h-2 rounded-lg appearance-none"
                      />
                      <span className="font-black text-xl text-slate-900 dark:text-white w-12">{formData.serviceMins}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Operating Hours</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="time" defaultValue="09:00"
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-orange-500 outline-none font-medium"
                      />
                      <input 
                        type="time" defaultValue="17:00"
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-orange-500 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                    Back
                  </button>
                  <button onClick={handleNext} className="w-2/3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Account */}
            {step === 3 && (
              <motion.div 
                key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-6 text-indigo-600 dark:text-indigo-400">
                   <Users size={28} />
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Account Security</h2>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div className="mb-4">
                    <GoogleSignInButton redirectTo="/dashboard" role="business_owner" />
                    <div className="relative mt-8 mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-500 bg-white dark:bg-slate-900 px-4">
                        — or continue with email —
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Work Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="admin@business.com"
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 outline-none font-medium transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                    Back
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={!formData.email || !formData.email.includes('@')}
                    className="w-2/3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Smart Features */}
            {step === 4 && (
              <motion.div 
                key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-6 text-purple-600 dark:text-purple-400">
                   <Sparkles size={28} />
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Smart Features</h2>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div 
                    onClick={() => setFormData(f => ({...f, aiEnabled: !f.aiEnabled}))}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${formData.aiEnabled ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${formData.aiEnabled ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                      {formData.aiEnabled && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">AI Queue Predictions</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Let QueueLess AI automatically calculate accurate wait times based on live staff pacing and history.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setFormData(f => ({...f, smsEnabled: !f.smsEnabled}))}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${formData.smsEnabled ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${formData.smsEnabled ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                      {formData.smsEnabled && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">SMS & WhatsApp Alerts</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Automatically notify customers when their turn is approaching to minimize waiting room crowds.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
                    Back
                  </button>
                  <button 
                    onClick={() => setShowOTP(true)} 
                    disabled={isSubmitting}
                    className="w-2/3 bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                  >
                    {isSubmitting ? "Generating Workspace..." : "Complete Setup"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Success */}
            {step === 5 && (
              <motion.div 
                key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                className="flex flex-col items-center justify-center text-center h-full"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">You're All Set!</h2>
                <p className="text-slate-500 dark:text-slate-400">Taking you to your business dashboard...</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {showOTP && (
        <EmailOTPModal 
          defaultEmail={formData.email}
          onClose={() => setShowOTP(false)}
          onSuccess={handleFinalSubmit}
        />
      )}
    </PageTransition>
  );
}
