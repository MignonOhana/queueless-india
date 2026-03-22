"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Loader2, ArrowRight, LogIn, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailOTPModal } from "@/components/auth/EmailOTPModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [step, setStep] = useState<"role" | "auth">("role");
  const [intendedRole, setIntendedRole] = useState<"customer" | "business_owner" | null>(null);

  useEffect(() => {
    // Parse URL for direct role selection (e.g. from Register Business link)
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const roleParam = search.get("role");
      const modeParam = search.get("mode");
      if (roleParam === "business_owner" || roleParam === "customer") {
        setIntendedRole(roleParam);
        localStorage.setItem("ql_intended_role", roleParam);
        setStep("auth");
      }
      if (modeParam === "register" || roleParam === "business_owner") {
        setIsRegister(true);
      }
    }
  }, []);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = localStorage.getItem("ql_user_role");
        router.push(role === "business_owner" ? "/dashboard" : "/home");
      } else {
        setInitialChecking(false);
      }
    }
    checkSession();
  }, [router]);

  const handleRoleSelect = (role: "customer" | "business_owner") => {
    setIntendedRole(role);
    localStorage.setItem("ql_intended_role", role);
    setStep("auth");
  };

  const handleAuthSuccess = async (user: any) => {
    setShowOTP(false);
    setLoading(true);
    try {
      const role = (intendedRole || localStorage.getItem("ql_intended_role") || "customer") as "customer" | "business_owner";
      
      // 1. Fetch profile
      const { data: profile } = await (supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle() as any);

      // 2. Update role if needed
      if (!profile || profile.role !== role) {
        await (supabase.from('user_profiles').upsert({ 
          id: user.id, 
          role, 
          email: user.email,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'id' }) as any);
      }
      
      // Sync localStorage for legacy hooks
      localStorage.setItem("ql_user_role", role);
      
      toast.success("Welcome back!");

      // 3. Routing Logic
      if (role === "business_owner") {
        router.push("/dashboard");
      } else {
        // Customer flow
        if ((profile as any)?.profile_completed) {
          router.push("/home");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      toast.error("Error setting up your profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="h-20 bg-background/50 bg-opacity-95 border-b border-border flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-400 text-black flex items-center justify-center shadow-lg">
            <Clock size={18} strokeWidth={3} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            QueueLess <span className="text-primary">{intendedRole === "business_owner" ? "Business" : ""}</span>
          </span>
        </Link>
        <Link href="/register" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
          Register Business
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-4xl relative z-10">
          {step === "role" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="md:col-span-2 text-center mb-10">
                <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic">Welcome to QueueLess 🇮🇳</h1>
                <p className="text-slate-400 font-bold text-lg">Select your path to continue</p>
              </div>

              {/* Customer Card */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("customer")}
                className="bg-surface/80 bg-opacity-95 border-2 border-border p-10 rounded-[3rem] text-left group hover:border-emerald-500/50 transition-all duration-300 shadow-2xl relative overflow-hidden h-full min-h-[220px]"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-9xl">🧑</span>
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                   <Users size={32} />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 italic">Customer</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Join queues from your phone, track tokens live, and save hours of waiting time.</p>
                <div className="mt-10 flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                  Join a Queue <ArrowRight size={14} />
                </div>
              </motion.button>

              {/* Business Card */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("business_owner")}
                className="bg-surface/80 bg-opacity-95 border-2 border-border p-10 rounded-[3rem] text-left group hover:border-primary/50 transition-all duration-300 shadow-2xl relative overflow-hidden h-full min-h-[220px]"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-9xl">🏢</span>
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                   <LogIn size={32} />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 italic">Business</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Manage your workspace, digitize your counter, and delight your customers with zero wait.</p>
                <div className="mt-10 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage Queue <ArrowRight size={14} />
                </div>
              </motion.button>

              <div className="md:col-span-2 text-center mt-8">
                <button 
                  onClick={() => {
                    localStorage.setItem("ql_intended_role", "customer");
                    setStep("auth");
                  }}
                  className="text-slate-500 hover:text-white transition-colors font-bold text-sm"
                >
                  Already have an account? <span className="text-primary hover:underline">Sign in</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto bg-surface/80 bg-opacity-95 rounded-[3rem] p-10 sm:p-14 shadow-2xl border border-border relative z-10"
            >
              <button 
                onClick={() => setStep("role")}
                className="absolute top-10 left-10 p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5"
                title="Go back"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>

              <div className="text-center mb-12">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 shadow-xl ${intendedRole === 'business_owner' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                   <span className="text-4xl">{intendedRole === 'business_owner' ? '🏢' : '🧑'}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
                  <span className={`w-1.5 h-1.5 rounded-full ${intendedRole === 'business_owner' ? 'bg-primary' : 'bg-emerald-500'} animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Signing in as {intendedRole === 'business_owner' ? 'Business Owner' : 'Customer'}
                  </span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                  {isRegister ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-slate-500 font-bold text-sm">
                  Continue with your phone or email
                </p>
              </div>

              <div className="mb-10">
                <GoogleSignInButton 
                  redirectTo={intendedRole === "business_owner" ? "/dashboard" : "/home"} 
                  role={intendedRole || "customer"}
                />
                <div className="relative mt-10 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-zinc-600 bg-surface px-6">
                    secure OTP access
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {isRegister && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-8 py-5 rounded-2xl border-2 border-white/5 bg-black/20 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 transition-all font-bold text-base"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-8 py-5 rounded-2xl border-2 border-white/5 bg-black/20 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 transition-all font-bold text-base"
                    required
                  />
                </div>

                <button 
                  onClick={() => {
                    if (!email || !email.includes('@')) {
                      toast.error("Please enter a valid email");
                      return;
                    }
                    if (isRegister && !fullName.trim()) {
                      toast.error("Please enter your full name");
                      return;
                    }
                    setShowOTP(true);
                  }}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 ${intendedRole === 'business_owner' ? 'bg-primary text-black shadow-primary/20 hover:bg-indigo-400' : 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400'}`}
                >
                  Send OTP <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="mt-8 text-center border-t border-white/5 pt-6 flex flex-col items-center gap-4">
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-slate-500 hover:text-white transition-colors font-bold text-sm"
                >
                  {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>

                {intendedRole !== "business_owner" && (
                  <button 
                    onClick={() => {
                      localStorage.setItem("ql_user_role", "customer");
                      router.push('/home');
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 p-2 bg-emerald-500/10 rounded-md transition-colors"
                  >
                    Skip and continue as Guest →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showOTP && (
        <EmailOTPModal 
          defaultEmail={email}
          defaultName={fullName}
          onClose={() => setShowOTP(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
      
      {/* Footer minimal */}
      <footer className="py-8 text-center text-slate-600 text-xs font-medium border-t border-white/5 bg-background">
        © 2026 QueueLess India. Secure {intendedRole === "business_owner" ? "Business" : ""} Authentication.
      </footer>
    </div>
  );
}
