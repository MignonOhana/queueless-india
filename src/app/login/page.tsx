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

export default function BusinessLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setInitialChecking(false);
      }
    }
    checkSession();
  }, [router]);

  // handleLogin removed in favor of EmailOTPModal

  if (initialChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F5A0] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col font-sans selection:bg-[#00F5A0]/30">
      {/* Navigation */}
      <nav className="h-20 bg-[#0A0A0F]/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00F5A0] to-[#00D4FF] text-black flex items-center justify-center shadow-lg">
            <Clock size={18} strokeWidth={3} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            QueueLess <span className="text-[#00F5A0]">Business</span>
          </span>
        </Link>
        <Link href="/register" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
          Create Account
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F5A0]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-[#111118]/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white/10 relative z-10"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#00F5A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#00F5A0]/20 text-[#00F5A0]">
              <LogIn size={32} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Admin Login</h1>
            <p className="text-slate-400 font-medium">Manage your virtual queue and staff</p>
          </div>

          <div className="mb-8">
            <GoogleSignInButton redirectTo="/dashboard" />
            <div className="relative mt-8 mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-[#111118] px-4">
                — or continue with email —
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest text-[10px]">Business Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@business.com"
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F5A0] focus:ring-1 focus:ring-[#00F5A0] transition-all font-medium text-sm"
                required
              />
            </div>

            <button 
              onClick={() => {
                if (!email || !email.includes('@')) {
                  toast.error("Please enter a valid business email");
                  return;
                }
                setShowOTP(true);
              }}
              className="w-full group relative bg-[#00F5A0] text-black font-black text-sm uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_30px_rgba(0,245,160,0.2)] hover:shadow-[0_0_40px_rgba(0,245,160,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              Enter Workspace <ArrowRight size={18} className="relative z-10" />
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Don't have a business account? {" "}
              <Link href="/register" className="text-[#00F5A0] font-bold hover:underline">
                Get Started Free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {showOTP && (
        <EmailOTPModal 
          defaultEmail={email}
          onClose={() => setShowOTP(false)}
          onSuccess={async (user) => {
            setShowOTP(false);
            setLoading(true);
            try {
              const { data: biz } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .maybeSingle();
              
              if (biz) {
                toast.success("Welcome back!");
                router.push("/dashboard");
              } else {
                toast.error("No business associated with this account. Please register.");
                await supabase.auth.signOut();
              }
            } catch (err: any) {
              toast.error("Error checking business account");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
      
      {/* Footer minimal */}
      <footer className="py-8 text-center text-slate-600 text-xs font-medium border-t border-white/5 bg-[#050508]">
        © 2026 QueueLess India. Secure Business Authentication.
      </footer>
    </div>
  );
}
