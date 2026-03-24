"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, MoreVertical, Edit2, 
  Trash2, Power, Users, Shield, 
  ChevronRight, LayoutDashboard, 
  Loader2, Check, X, Copy, 
  Key, RefreshCw, Smartphone, 
  Building2, User
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

const supabase = createClient();

interface StaffMember {
  id: string;
  name: string;
  phone: string | null;
  role: string;
  department_id: string | null;
  access_code: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  departments?: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export default function StaffManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState<{name: string, code: string} | null>(null);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    departmentId: searchParams.get("department") || "",
    role: "operator"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("primary_business_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.primary_business_id) {
        toast.error("Business not found");
        return;
      }
      setBusinessId(profile.primary_business_id);

      // Fetch Departments
      const { data: depts } = await supabase
        .from("departments")
        .select("id, name")
        .eq("business_id", profile.primary_business_id);
      setDepartments(depts || []);

      // Fetch Staff
      const { data: staffMembers } = await supabase
        .from("staff_members")
        .select(`
          *,
          departments:department_id (name)
        `)
        .eq("business_id", profile.primary_business_id)
        .order("created_at", { ascending: false });
      
      setStaff(staffMembers as any || []);
    } catch (err) {
      toast.error("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!businessId || !form.name || !form.departmentId) {
      toast.error("Please fill Name and Select Department");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("add_staff_member", {
        p_business_id: businessId,
        p_department_id: form.departmentId,
        p_name: form.name,
        p_phone: form.phone,
        p_role: form.role
      });

      if (error) throw error;

      const newStaff = data[0];
      setShowCodeModal({ name: form.name, code: newStaff.access_code });
      setIsAddModalOpen(false);
      setForm({ name: "", phone: "", departmentId: "", role: "operator" });
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("staff_members")
        .update({ is_active: !current })
        .eq("id", id);
      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast.success(`Staff ${!current ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const regenerateCode = async (id: string, name: string) => {
    if (!confirm(`Regenerate access code for ${name}? The old code will stop working.`)) return;
    try {
      // 1. Generate new code
      const { data: newCode, error: genErr } = await supabase.rpc("generate_staff_access_code");
      if (genErr) throw genErr;

      // 2. Update staff member
      const { error: upErr } = await supabase
        .from("staff_members")
        .update({ access_code: newCode })
        .eq("id", id);
      if (upErr) throw upErr;

      setShowCodeModal({ name, code: newCode });
      fetchInitialData();
      toast.success("Code regenerated!");
    } catch (err) {
      toast.error("Regeneration failed");
    }
  };

  const changeDepartment = async (staffId: string, deptId: string) => {
    try {
      const { error } = await supabase
        .from("staff_members")
        .update({ department_id: deptId })
        .eq("id", staffId);
      if (error) throw error;
      toast.success("Department updated");
      fetchInitialData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-primary/30 selection:text-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-black">QL</div>
              <span className="font-display font-black tracking-tighter text-xl">QueueLess</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Overview</Link>
              <Link href="/dashboard/departments" className="text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Departments</Link>
              <Link href="/dashboard/staff" className="text-primary text-xs font-black uppercase tracking-widest">Staff</Link>
            </div>
          </div>
          <button onClick={() => router.push("/profile")} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
            <User size={18} className="text-primary" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Staffing</h1>
            <p className="text-zinc-500 font-medium">Manage your team and generate secure access codes.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Staff Member
          </button>
        </div>

        {/* Staff Table */}
        <GlassCard className="overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Name</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Department</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Access Code</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Last Login</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{s.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={s.department_id || ""}
                        onChange={(e) => changeDepartment(s.id, e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer hover:underline"
                        title="Change Department"
                      >
                        <option value="" disabled className="bg-[#0A0A0F]">Select</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id} className="bg-[#0A0A0F]">{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/10 text-zinc-400'
                      }`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-500 tracking-wider">
                          {s.access_code ? `${s.access_code.substring(0, 2)}****` : "N/A"}
                        </span>
                        <button 
                          onClick={() => regenerateCode(s.id, s.name)}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-primary transition-all"
                          title="Regenerate"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-500 font-medium">
                      {s.last_login_at ? new Date(s.last_login_at).toLocaleString() : "Never"}
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleStatus(s.id, s.is_active)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                          s.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}
                        title={s.is_active ? "Deactivate" : "Activate"}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <button className="p-2 bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {staff.length === 0 && (
            <div className="py-20 text-center text-zinc-500">
              <Users size={32} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest op-50">No staff members found</p>
            </div>
          )}
        </GlassCard>
      </main>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111118] border border-white/10 rounded-[3rem] w-full max-w-md relative z-10 shadow-2xl p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-2">Add Staff</h2>
                <p className="text-sm text-zinc-500">Grant portal access to your team.</p>
              </div>

              <div className="space-y-6">
                <Field label="Staff Member Name">
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input pl-12" placeholder="Full Name" />
                  </div>
                </Field>

                <Field label="Phone Number (Optional)">
                  <div className="relative">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input pl-12" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </Field>

                <Field label="Department">
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="form-input pl-12 appearance-none">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </Field>

                <Field label="Role">
                  <div className="relative">
                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="form-input pl-12 appearance-none">
                      <option value="operator">Operator (Queue Management)</option>
                      <option value="supervisor">Supervisor (All Depts)</option>
                      <option value="admin">Admin (Full Control)</option>
                    </select>
                  </div>
                </Field>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                <button 
                  onClick={handleAddStaff} 
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Generate Access Code"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Code Display Modal (One-time) */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111118] border border-primary/30 rounded-[3rem] w-full max-w-sm relative z-10 shadow-2xl p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <Key size={32} />
              </div>
              <h2 className="text-2xl font-black mb-2">{showCodeModal.name}'s Access Code</h2>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Share this code with your staff member. It will only be shown once for security.</p>
              
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">One-time Code</p>
                <p className="text-3xl font-mono font-black text-white tracking-[0.4em]">{showCodeModal.code}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(showCodeModal.code);
                    toast.success("Code copied!");
                  }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                >
                  <Copy size={12} /> Copy Code
                </button>
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-8 flex items-start gap-3 text-left">
                <Shield size={16} className="text-rose-500 mt-1 flex-shrink-0" />
                <p className="text-[10px] leading-relaxed font-bold text-rose-200">WARNING: This code is encrypted. If lost, you must regenerate it, which will void the old one.</p>
              </div>

              <button 
                onClick={() => setShowCodeModal(null)}
                className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all"
              >
                I've Saved It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">{label}</label>
      {children}
    </div>
  );
}
