"use client";

import { useState } from "react";
import { 
  Key, ArrowRight, Loader2, ShieldCheck, 
  Lock, Smartphone, Building2, User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

const supabase = createClient();

export default function StaffLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length < 6) {
      toast.error("Please enter a valid 6-character access code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("staff_login_by_code", {
        p_code: code.toUpperCase()
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Invalid or inactive access code");
      }

      const staffContext = data[0];
      
      // Store staff context
      localStorage.setItem("ql_staff_context", JSON.stringify(staffContext));
      
      toast.success(`Welcome back, ${staffContext.staff_name}!`);
      router.push("/staff/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Invalid Access Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6 selection:bg-primary/30 selection:text-primary">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7000FF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20"
          >
            <ShieldCheck size={40} />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Staff Portal</h1>
          <p className="text-zinc-500 font-medium">Enter your secure access code to manage the queue.</p>
        </div>

        <GlassCard className="p-10 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Access Code</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="A3KZ91"
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-5 px-6 text-2xl font-mono font-black tracking-[0.5em] text-center focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-zinc-800"
                  autoFocus
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Login to Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-500 text-xs font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure Authentication Active
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
              Forgot your code? Please contact your business administrator to regenerate it. 
              Codes are case-sensitive and unique to each staff member.
            </p>
          </div>
        </GlassCard>

        <div className="mt-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
          &copy; 2024 QueueLess India &bull; Enterprise Operations
        </div>
      </div>
    </div>
  );
}
