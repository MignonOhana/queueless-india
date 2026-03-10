'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, X, Shield, ToggleRight, ToggleLeft, Trash2, CheckCircle2, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  counter_id: string;
  is_active: boolean;
}

export default function StaffManagement({ businessId }: { businessId: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Operator', counter_id: 'default' });

  useEffect(() => {
    fetchStaff();
  }, [businessId]);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to fetch staff');
    } else {
      setStaff(data || []);
    }
    setIsLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('staff_members')
      .insert([{ ...newStaff, business_id: businessId, is_active: true }])
      .select()
      .single();

    if (error) {
      toast.error('Error adding staff');
    } else {
      setStaff([...staff, data]);
      setShowAddForm(false);
      setNewStaff({ name: '', role: 'Operator', counter_id: 'default' });
      toast.success('Staff member added');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('staff_members')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      setStaff(staff.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast.success('Status updated');
    }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    
    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error removing staff');
    } else {
      setStaff(staff.filter(s => s.id !== id));
      toast.success('Staff removed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[#00F5A0]/20 border-t-[#00F5A0] rounded-full animate-spin" />
        <p className="text-[#00F5A0] font-black uppercase tracking-widest text-[10px]">Loading Team...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Team Management</h2>
          <p className="text-xs text-zinc-500 font-medium">Manage operators and their assigned counters.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F5A0] text-[#0A0A0F] font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-[#00F5A0]/20"
        >
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-3xl bg-[#111118] border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">New Staff Member</h3>
              <button onClick={() => setShowAddForm(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="Full Name"
                required
                value={newStaff.name}
                onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                className="bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00F5A0]"
              />
              <select 
                value={newStaff.role}
                onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                className="bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00F5A0]"
              >
                <option value="Operator" className="text-black">Operator</option>
                <option value="Manager" className="text-black">Manager</option>
                <option value="Admin" className="text-black">Admin</option>
              </select>
              <button 
                type="submit"
                className="bg-[#00F5A0] text-[#0A0A0F] font-black uppercase text-[10px] rounded-xl hover:brightness-110"
              >
                Save Member
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map((member) => (
          <GlassCard key={member.id} className="relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${member.is_active ? 'bg-[#00F5A0]/10 text-[#00F5A0]' : 'bg-zinc-500/10 text-zinc-500'}`}>
                {member.is_active ? <UserCheck size={24} /> : <Users size={24} />}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-white tracking-tight">{member.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{member.role}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Counter: {member.counter_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(member.id, member.is_active)}
                  className={`p-2 rounded-lg transition-colors ${member.is_active ? 'text-[#00F5A0] hover:bg-[#00F5A0]/10' : 'text-zinc-500 hover:bg-white/5'}`}
                  title={member.is_active ? 'Deactivate' : 'Activate'}
                >
                  {member.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <button 
                  onClick={() => deleteStaff(member.id)}
                  className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            {/* Busy Status Indicator Overlay */}
            {member.is_active && (
              <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {staff.length === 0 && !showAddForm && (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
           <Users size={40} className="text-zinc-800 mx-auto mb-4" />
           <p className="text-zinc-500 font-bold">No staff members added yet.</p>
           <button 
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-[#00F5A0] text-xs font-black uppercase tracking-widest hover:brightness-110"
            >
              + Add your first operator
            </button>
        </div>
      )}
    </div>
  );
}
