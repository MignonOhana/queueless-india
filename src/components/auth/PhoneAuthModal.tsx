"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "phone" | "otp" | "name";

export default function PhoneAuthModal({ isOpen, onClose, onSuccess }: PhoneAuthModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(30);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Auto-submit OTP when all 6 digits are filled
  useEffect(() => {
    if (otp.every(d => d !== "") && step === "otp") {
      handleVerifyOtp();
    }
  }, [otp]);

  const formatPhone = (rawInput: string) => {
    const digits = rawInput.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 5) return digits;
    return digits.slice(0, 5) + " " + digits.slice(5);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(formatPhone(digits));
    if (phoneError) setPhoneError("");
  };

  const handleSendOtp = async () => {
    const stripped = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(stripped)) {
      setPhoneError("Please enter a valid Indian mobile number");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: "+91" + stripped });
      if (error) throw error;
      setStep("otp");
    } catch (e: any) {
      setPhoneError(e.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const nextIdx = Math.min(index + pasted.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (otpError) setOtpError("");

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setIsLoading(true);
    try {
      const stripped = phone.replace(/\D/g, "");
      const { data, error } = await supabase.auth.verifyOtp({
        phone: "+91" + stripped,
        token: code,
        type: "sms",
      });
      if (error) throw error;

      // Check if this is a new user (no full_name in metadata)
      const isNewUser = !data.user?.user_metadata?.full_name;
      if (isNewUser) {
        setStep("name");
      } else {
        onSuccess?.();
        handleClose();
      }
    } catch (e: any) {
      setOtpError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [otp, phone, onSuccess]);

  const handleResendOtp = async () => {
    if (!canResend) return;
    const stripped = phone.replace(/\D/g, "");
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOtp({ phone: "+91" + stripped });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (e) {
      // silent fail
    } finally {
      setIsLoading(false);
      setStep("otp"); // reset countdown via useEffect
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setNameError("Please enter your name");
      return;
    }
    setIsLoading(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: name.trim(), role: "CUSTOMER" } });
      onSuccess?.();
      handleClose();
    } catch (e: any) {
      setNameError(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setOtp(["", "", "", "", "", ""]);
    setPhoneError("");
    setOtpError("");
    setName("");
    setNameError("");
    onClose();
  };

  const maskedPhone = "+91 " + phone.slice(0, 5) + "X ".repeat(Math.max(0, phone.replace(/\D/g,"").length - 5)).trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm bg-slate-950 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Top pill handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>

            <div className="px-8 pb-10 pt-4">
              <AnimatePresence mode="wait">

                {/* ---- STEP 1: PHONE ---- */}
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-8">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Welcome to</p>
                      <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">QueueLess India</h2>
                      <p className="text-slate-400 font-medium text-sm mt-2">Enter your mobile to continue</p>
                    </div>

                    <div className={`flex items-center bg-white/5 border rounded-xl overflow-hidden transition-all ${phoneError ? 'border-rose-500' : 'border-white/10 focus-within:border-indigo-500'}`}>
                      <div className="flex items-center gap-2 px-4 py-4 border-r border-white/10 flex-shrink-0">
                        <span className="text-lg">🇮🇳</span>
                        <span className="text-white font-bold text-sm">+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={handlePhoneChange}
                        onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                        autoFocus
                        className="flex-1 bg-transparent text-white font-semibold text-lg px-4 py-4 focus:outline-none placeholder:text-slate-600 tracking-widest"
                      />
                    </div>
                    {phoneError && (
                      <p className="text-rose-400 text-xs font-bold mt-2 ml-1">{phoneError}</p>
                    )}

                    <button
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="w-full mt-6 bg-indigo-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-60"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Continue <ChevronRight size={20} /></>
                      )}
                    </button>

                    <p className="text-center text-[11px] font-medium text-slate-500 mt-5 leading-relaxed">
                      By continuing, you agree to our <span className="text-indigo-400 underline cursor-pointer">Terms</span> and <span className="text-indigo-400 underline cursor-pointer">Privacy Policy</span>
                    </p>
                  </motion.div>
                )}

                {/* ---- STEP 2: OTP ---- */}
                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-slate-400 text-xs font-bold mb-6 hover:text-white transition-colors">
                      <ChevronRight size={14} className="rotate-180" /> Change number
                    </button>

                    <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Enter OTP</h2>
                    <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
                      Sent to <span className="text-white font-bold">+91 {phone}</span>
                    </p>

                    {/* OTP Boxes */}
                    <div className="flex gap-3 justify-between mb-6">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="tel"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          onFocus={e => e.target.select()}
                          autoFocus={i === 0}
                          className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 bg-white/5 text-white focus:outline-none transition-all ${
                            otpError
                              ? "border-rose-500 bg-rose-500/10"
                              : digit
                              ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                              : "border-white/10 focus:border-indigo-500 focus:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-rose-400 text-xs font-bold mb-4 text-center">{otpError}</p>
                    )}

                    {isLoading && (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-indigo-400 rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Resend */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {canResend ? (
                        <button
                          onClick={handleResendOtp}
                          className="flex items-center gap-1.5 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-colors"
                        >
                          <RotateCcw size={14} /> Resend OTP
                        </button>
                      ) : (
                        <p className="text-slate-500 text-sm font-medium">
                          Resend in <span className="text-white font-bold">{countdown}s</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ---- STEP 3: NAME ---- */}
                {step === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4">🎉</div>
                      <h2 className="text-2xl font-black text-white tracking-tighter mb-2">You're in!</h2>
                      <p className="text-slate-400 font-medium text-sm">What should we call you?</p>
                    </div>

                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      autoFocus
                      onChange={e => { setName(e.target.value); if (nameError) setNameError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSaveName()}
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white font-semibold text-lg focus:outline-none transition-all placeholder:text-slate-600 ${nameError ? 'border-rose-500' : 'border-white/10 focus:border-indigo-500'}`}
                    />
                    {nameError && <p className="text-rose-400 text-xs font-bold mt-2 ml-1">{nameError}</p>}

                    <button
                      onClick={handleSaveName}
                      disabled={isLoading}
                      className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Start Queue-less Journey 🚀"
                      )}
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
