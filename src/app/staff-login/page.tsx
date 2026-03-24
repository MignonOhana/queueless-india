"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";

const supabase = createClient();

export default function StaffLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-character code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc("staff_login_by_code", {
        p_code: code.toUpperCase()
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("Invalid access code. Please check with your manager.");
        return;
      }

      const staffSession = data[0];
      
      // Store in localStorage as requested
      localStorage.setItem("queueless_staff_session", JSON.stringify({
        staff_id: staffSession.id,
        staff_name: staffSession.staff_name,
        staff_role: staffSession.role,
        business_id: staffSession.business_id,
        business_name: staffSession.business_name,
        department_id: staffSession.department_id,
        dept_name: staffSession.dept_name,
        // icon and queue_id will be fetched/handled in the dashboard
      }));

      toast.success(`Welcome back, ${staffSession.staff_name}!`);
      router.push("/staff/queue");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2 mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black font-black mx-auto mb-6">QL</div>
          <h1 className="text-3xl font-black tracking-tight">Staff Login</h1>
          <p className="text-zinc-500 font-medium text-sm">Enter your 6-character access code</p>
        </div>

        <GlassCard className="p-10 rounded-[3rem] border border-white/10">
          <form itemID="staff_login_form" onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="staff_code" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Access Code</label>
              <div className="relative">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input 
                  id="staff_code"
                  type="text" 
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-6 pl-16 pr-6 text-2xl font-mono font-black tracking-[0.5em] text-primary focus:border-primary outline-none transition-all placeholder:text-zinc-800"
                  placeholder="******"
                  autoFocus
                  title="Access Code"
                />
              </div>
            </div>

            <button
              itemID="staff_login_submit"
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Login to My Queue <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <div className="text-center">
          <Link href="/login" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            Business Owner? Login here →
          </Link>
        </div>
      </div>
    </div>
  );
}
