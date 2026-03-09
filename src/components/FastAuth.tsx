"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck, UserCircle, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface FastAuthProps {
  onSuccess: (userId: string) => void;
  isModal?: boolean;
}

export default function FastAuth({ onSuccess, isModal = false }: FastAuthProps) {
  const [step, setStep] = useState<"phone" | "otp" | "loading">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toE164India(phoneStr: string): string {
    const digits = phoneStr.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length === 12) return '+' + digits
    if (digits.length === 10) return '+91' + digits
    return phoneStr 
  }

  // Real OTP Send
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = toE164India(phone);
    if (!/^\+91[6-9]\d{9}$/.test(formattedPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setError("");
    setIsSubmitting(true);
    setStep("loading");
    
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (authError) {
        if (authError.message.includes('422')) {
          setError("Invalid phone number format");
        } else if (authError.message.includes('429')) {
          setError("Too many attempts. Please wait a minute.");
        } else {
          setError(authError.message);
        }
        setStep("phone");
      } else {
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.message);
      setStep("phone");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real OTP Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) return;
    
    setIsSubmitting(true);
    setStep("loading");
    
    try {
       const formattedPhone = toE164India(phone);
       const { data, error: verifyErr } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: code,
          type: 'sms'
       });
       if (verifyErr) {
          if (verifyErr.message.includes('429')) {
             throw new Error("Too many attempts. Please wait a minute.");
          }
          throw verifyErr;
       }
       if (data.user) onSuccess(data.user.id);
    } catch (err: any) {
       setError(err.message);
       setStep("otp");
    } finally {
       setIsSubmitting(false);
    }
  };

  // Real Guest Login Trigger
  const handleGuestLogin = async () => {
    setStep("loading");
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (data.user) onSuccess(data.user.id);
    } catch (err: any) {
      setError(err.message);
      setStep("phone");
    }
  };

  const wrapClasses = isModal 
    ? "bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md mx-auto overflow-hidden relative"
    : "w-full max-w-md mx-auto";

  return (
    <div className={wrapClasses}>
      <AnimatePresence mode="wait">
        
        {step === "phone" && (
          <motion.div 
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Join the Queue</h2>
              <p className="text-slate-500 dark:text-slate-400">Enter your phone number to track your token live via SMS.</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 font-bold border-r border-slate-200 dark:border-slate-700 pr-3">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Mobile Number"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-16 pr-4 font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <Phone className="absolute right-4 text-slate-400" size={20} />
                </div>
                {error && <p className="text-rose-500 text-sm font-medium mt-2 text-center">{error}</p>}
              </div>

              <button 
                type="submit"
                disabled={phone.length < 10 || isSubmitting}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Sending OTP..." : <><span className="flex items-center gap-2">Send OTP <ArrowRight size={20} /></span></>}
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
               <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-800" />
               <span className="bg-white dark:bg-slate-900 px-4 text-sm text-slate-400 font-medium relative z-10">or in an emergency</span>
            </div>

            <button 
              onClick={handleGuestLogin}
              disabled={isSubmitting}
              className="mt-8 w-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-4 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center justify-center gap-2 transition-colors active:scale-95 border border-indigo-100 dark:border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCircle size={20} />
              Continue as Guest
            </button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verify Number</h2>
              <p className="text-slate-500 dark:text-slate-400">
                We sent a 4-digit code to <br/>
                <strong className="text-slate-900 dark:text-white">+91 {phone.slice(0, 5)} {phone.slice(5)}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-center gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[index] = e.target.value.replace(/\D/g, '');
                      setOtp(newOtp);
                      // Auto-advance
                      if (e.target.value && index < 3) {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-16 h-16 text-center text-2xl font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && <p className="text-rose-500 text-sm font-medium mt-2 text-center">{error}</p>}

              <button 
                type="submit"
                disabled={otp.join("").length < 4 || isSubmitting}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isSubmitting ? "Verifying..." : "Verify & Join Queue"}
              </button>
            </form>

            <button 
              onClick={() => setStep("phone")}
              className="mt-6 text-sm flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              Change Phone Number
            </button>
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full items-center justify-center py-12"
          >
            <div className="relative w-24 h-24 mb-6">
               <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
               <motion.div 
                 className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               />
               <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldCheck className="text-indigo-500 w-8 h-8" />
               </div>
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Authenticating...</h3>
            <p className="text-slate-500 text-sm mt-2">Securing your session</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
