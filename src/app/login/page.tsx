"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Loader2, ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { EmailOTPModal } from "@/components/auth/EmailOTPModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [step, setStep] = useState<"role" | "auth">("role");
  const [intendedRole, setIntendedRole] = useState<string | null>(null);

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
      const role = intendedRole || localStorage.getItem("ql_intended_role") || "customer";
      
      // Update profile in DB
      await supabase.from('user_profiles').update({ role }).eq('id', user.id);
      
      // Sync localStorage
      localStorage.setItem("ql_user_role", role);
      
      toast.success("Welcome back!");
      router.push(role === "business_owner" ? "/dashboard" : "/home");
    } catch (err: any) {
      toast.error("Error updating profile");
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
      <nav className="h-20 bg-background/50 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
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
        
        <div className="w-full max-w-2xl relative z-10">
          {step === "role" ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2 text-center mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight mb-3 italic">Welcome to QueueLess</h1>
                <p className="text-slate-400 font-medium">Please select how you want to use the platform</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("customer")}
                className="bg-surface/80 backdrop-blur-xl border border-border p-10 rounded-brand text-left group hover:border-primary/50 transition-all duration-300 shadow-2xl"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🧑</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 italic">I'm a Customer</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Join queues, track tokens, and skip the wait at your favorite places.</p>
                <div className="mt-8 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Get Started <ArrowRight size={14} />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("business_owner")}
                className="bg-surface/80 backdrop-blur-xl border border-border p-10 rounded-brand text-left group hover:border-primary/50 transition-all duration-300 shadow-2xl"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🏢</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 italic">I'm a Business Owner</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Manage your queue, serve customers faster, and grow your business.</p>
                <div className="mt-8 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                   Manage Workspace <ArrowRight size={14} />
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto bg-surface/80 backdrop-blur-xl rounded-brand p-8 sm:p-12 shadow-2xl border border-border relative z-10"
            >
              <button 
                onClick={() => setStep("role")}
                className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"
                title="Go back"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 text-primary">
                  <LogIn size={32} />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-3">
                  {intendedRole === "business_owner" ? "Admin Login" : "Sign In"}
                </h1>
                <p className="text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {intendedRole === "business_owner" ? "Manage your virtual queue" : "Track your spot & join queues"}
                </p>
              </div>

              <div className="mb-8">
                <GoogleSignInButton 
                  redirectTo={intendedRole === "business_owner" ? "/dashboard" : "/home"} 
                  role={intendedRole || "customer"}
                />
                <div className="relative mt-8 mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-surface px-4">
                    — or continue with email —
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest text-[10px]">Your Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                    required
                  />
                </div>

                <button 
                  onClick={() => {
                    if (!email || !email.includes('@')) {
                      toast.error("Please enter a valid email");
                      return;
                    }
                    setShowOTP(true);
                  }}
                  className="btn-primary w-full py-5 text-sm"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-slate-500 text-sm font-medium">
                  {intendedRole === "business_owner" ? "Need a business account?" : "Ready to join?"} {" "}
                  <Link href="/register" className="text-primary font-bold hover:underline">
                    Get Started Free
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showOTP && (
        <EmailOTPModal 
          defaultEmail={email}
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
