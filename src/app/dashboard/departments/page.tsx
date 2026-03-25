"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Search, 
  Trash2, Power, Users, Clock, 
  ChevronRight, Store, Loader2,
  X, Info, User
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

const supabase = createClient();

const EMOJIS = ["🏥", "🔬", "💊", "🦷", "🧪", "👁️", "🩺", "🏦", "⚖️", "📋", "🧾", "🏢", "🏫", "🏪", "🏠"];


export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<(Department & { queue_stats?: { waiting: number; staffCount: number } })[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    icon: "🏥",
    description: "",
    serviceMins: 15,
    openTime: "09:00",
    closeTime: "18:00",
    maxCapacity: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInitialData = useCallback(async () => {
    if (!user?.id) return;
    try {
      // 1. Get Business ID
      const { data: profile, error: pError } = await supabase
        .from("user_profiles")
        .select("primary_business_id")
        .eq("id", user.id)
        .single();

      if (pError || !profile?.primary_business_id) {
        toast.error("Please register your business first");
        router.push("/register-business");
        return;
      }

      setBusinessId(profile.primary_business_id);

      // 2. Fetch Departments
      const { data: depts, error: dError } = await supabase
        .from("departments")
        .select(`
          *,
          queues (
            total_waiting,
            is_active
          )
        `)
        .eq("business_id", profile.primary_business_id)
        .order("created_at", { ascending: true });

      if (dError) throw dError;

      // 3. Fetch Staff counts 
      const { data: staffCounts } = await supabase
        .from("staff_members")
        .select("department_id")
        .eq("business_id", profile.primary_business_id);

      const mappedDepts = (depts || []).map((d) => ({
        ...d,
        queue_stats: {
          waiting: (d.queues as any)?.[0]?.total_waiting || 0,
          staffCount: staffCounts?.filter(s => s.department_id === d.id).length || 0
        }
      }));

      setDepartments(mappedDepts);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCreate = async () => {
    if (!businessId || !form.name) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc("create_department", {
        p_business_id: businessId,
        p_name: form.name,
        p_description: form.description,
        p_icon: form.icon,
        p_service_mins: form.serviceMins,
        p_op_hours: `${form.openTime}-${form.closeTime}`,
        p_max_capacity: form.maxCapacity
      });

      if (error) throw error;

      toast.success("Department created!");
      setIsModalOpen(false);
      setForm({ name: "", icon: "🏥", description: "", serviceMins: 15, openTime: "09:00", closeTime: "18:00", maxCapacity: 50 });
      fetchInitialData();
    } catch (err: any) {
      console.error("Creation error:", err);
      toast.error(err.message || "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("departments")
        .update({ is_active: !current })
        .eq("id", id);

      if (error) throw error;
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, is_active: !current } : d));
      toast.success(`Department ${!current ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the department and its queues.")) return;
    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success("Department deleted");
    } catch (error) {
      toast.error("Failed to delete department");
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
              <Link href="/dashboard/departments" className="text-primary text-xs font-black uppercase tracking-widest">Departments</Link>
              <Link href="/dashboard/staff" className="text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Staff</Link>
            </div>
          </div>
          <button 
            onClick={() => router.push("/profile")} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            title="My Profile"
          >
            <User size={18} className="text-primary" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Management</h1>
            <p className="text-zinc-500 font-medium">Create and manage your business departments and queues.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Department
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.length > 0 ? (
            departments.map((dept) => (
              <DepartmentCard 
                key={dept.id} 
                dept={dept} 
                onToggle={() => toggleStatus(dept.id, dept.is_active)}
                onDelete={() => handleDelete(dept.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-500">
                <Store size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No departments yet</h3>
              <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Create departments to start managing queues for different services.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Create Your First Department
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Department Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#111118] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 sticky top-0 bg-[#111118] z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">New Setup</h3>
                  <h2 className="text-2xl font-black">Create Department</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Field label="Department Name" id="dept_name">
                      <input 
                        id="dept_name"
                        type="text" 
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="form-input" 
                        placeholder="E.g. Cardiology OPD"
                        title="Department Name"
                      />
                    </Field>

                    <Field label="Choose Icon">
                      <div className="grid grid-cols-5 gap-3" role="group" aria-label="Icon selection">
                        {EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                            className={`w-12 h-12 flex items-center justify-center text-xl rounded-xl transition-all ${
                              form.icon === emoji ? "bg-primary text-black transform scale-110" : "bg-white/5 hover:bg-white/10"
                            }`}
                            title={`Select ${emoji} icon`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>

                  <div className="space-y-6">
                    <Field label="Average Service Time (Mins)" id="service_mins">
                      <div className="relative">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input 
                          id="service_mins"
                          type="number" 
                          value={form.serviceMins}
                          onChange={e => setForm(f => ({ ...f, serviceMins: parseInt(e.target.value) }))}
                          className="form-input pl-12" 
                          title="Service Time"
                        />
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Open Time" id="open_time">
                        <input 
                          id="open_time"
                          type="time" 
                          value={form.openTime}
                          onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))}
                          className="form-input" 
                          title="Opening Time"
                        />
                      </Field>
                      <Field label="Close Time" id="close_time">
                        <input 
                          id="close_time"
                          type="time" 
                          value={form.closeTime}
                          onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))}
                          className="form-input" 
                          title="Closing Time"
                        />
                      </Field>
                    </div>

                    <Field label="Max Instant Capacity" id="max_capacity">
                      <input 
                        id="max_capacity"
                        type="number" 
                        value={form.maxCapacity}
                        onChange={e => setForm(f => ({ ...f, maxCapacity: parseInt(e.target.value) }))}
                        className="form-input" 
                        title="Maximum Capacity"
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Description (Optional)" id="dept_desc">
                  <textarea 
                    id="dept_desc"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="form-input resize-none h-24" 
                    placeholder="Briefly describe what this department does..."
                    title="Department Description"
                  />
                </Field>

                <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-start gap-3">
                  <Info size={20} className="text-primary mt-0.5" />
                  <p className="text-sm text-zinc-400">Creating this will auto-generate a unique Department ID and seed a live queue for today.</p>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="flex-3 py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save & Initialize Queue"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DepartmentCard({ dept, onToggle, onDelete }: { dept: Department; onToggle: () => void; onDelete: () => void }) {
  return (
    <motion.div layout>
      <GlassCard className={`p-8 border border-white/10 hover:border-primary/50 transition-all group relative overflow-hidden ${!dept.is_active ? "opacity-60 grayscale-[0.5]" : ""}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
            {dept.icon}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggle}
              title={dept.is_active ? "Deactivate" : "Activate"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                dept.is_active ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-zinc-500 hover:bg-white/10"
              }`}
            >
              <Power size={18} />
            </button>
            <button 
              onClick={onDelete}
              className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500/20 transition-all"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black tracking-tight">{dept.name}</h3>
            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-black text-zinc-500 font-mono">{dept.id}</span>
          </div>
          {dept.description && <p className="text-zinc-500 text-sm line-clamp-1">{dept.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Users size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Waiting</span>
            </div>
            <p className="text-xl font-black">{dept.queue_stats?.waiting || 0}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-[#7000FF] mb-1">
              <Users size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Staff</span>
            </div>
            <p className="text-xl font-black">{dept.queue_stats?.staffCount || 0}</p>
          </div>
        </div>

        <Link 
          href={`/dashboard/staff?department=${dept.id}`}
          className="w-full mt-6 py-4 bg-white/5 group-hover:bg-primary group-hover:text-black rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all"
        >
          Assign Staff <ChevronRight size={14} />
        </Link>
      </GlassCard>
    </motion.div>
  );
}

function Field({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">{label}</label>
      {children}
    </div>
  );
}
