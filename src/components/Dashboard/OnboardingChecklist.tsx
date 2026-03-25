"use client";

import React, { useState } from 'react';
import { CheckCircle2, Building2, Users, Play, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/types/database';
import BusinessCreationModal from './BusinessCreationModal';
import Link from 'next/link';

const supabase = createClient();

interface OnboardingChecklistProps {
  business: Database['public']['Tables']['businesses']['Row'] | null;
  onUpdate: () => void;
}

export default function OnboardingChecklist({ business, onUpdate }: OnboardingChecklistProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derived Steps
  const step1Complete = !!business;
  const step2Complete = step1Complete && (business.onboarding_step ?? 1) >= 2;
  const step3Complete = step1Complete && (business.onboarding_step ?? 1) >= 3;
  const step4Complete = step1Complete && business.claim_status === 'active';

  const currentStep = !step1Complete ? 1 : (step2Complete ? (step3Complete ? 4 : 3) : 2);

  const handleActivateQueue = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const { error: rpcErr } = await supabase.rpc('activate_queue_for_today', {
        p_org_id: business.id
      });

      if (rpcErr) throw rpcErr;
      
      const { error: upErr } = await supabase
        .from('businesses')
        .update({ claim_status: 'active', onboarding_step: 4 })
        .eq('id', business.id);

      if (upErr) throw upErr;

      toast.success('Queue is now LIVE! 🚀');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6 font-sans">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-4">🏢 Launch Your Queue</h1>
        <p className="text-zinc-500 font-medium">Follow these steps to get your digital queue production-ready.</p>
      </div>

      <div className="space-y-6">
        {/* STEP 1: Registry */}
        <StepCard 
          step={1} 
          title="Register Business Listing" 
          description="Create your business profile to get a unique Business ID."
          isComplete={step1Complete} 
          isActive={currentStep === 1}
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-3 bg-primary text-black rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:brightness-110 transition-all"
          >
            Create Listing <ArrowRight size={14} />
          </button>
        </StepCard>

        {/* STEP 2: Departments */}
        <StepCard 
          step={2} 
          title="Configure Departments" 
          description="Create your first department (e.g., Doctors OPD, Cashier) to enable queuing."
          isComplete={step2Complete} 
          isActive={currentStep === 2}
          disabled={!step1Complete}
        >
          <Link 
            href="/dashboard/departments"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Add Department <Building2 size={14} />
          </Link>
        </StepCard>

        {/* STEP 3: Staff */}
        <StepCard 
          step={3} 
          title="Onboard Your Team" 
          description="Add staff members and generate secure access codes for their portals."
          isComplete={step3Complete} 
          isActive={currentStep === 3}
          disabled={!step2Complete}
        >
          <Link 
            href="/dashboard/staff"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#7000FF] text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:brightness-110"
          >
            Manage Staff <Users size={14} />
          </Link>
        </StepCard>

        {/* STEP 4: Activation */}
        <StepCard 
          step={4} 
          title="Activate Live Queue" 
          description="Initialize today's queue and get your QR code to share with customers."
          isComplete={step4Complete} 
          isActive={currentStep === 4}
          disabled={!step3Complete}
        >
          <button 
            onClick={handleActivateQueue}
            disabled={loading}
            className="mt-6 w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-[2rem] flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Play size={18} fill="currentColor" /> Activate Now</>}
          </button>
        </StepCard>
      </div>

      <BusinessCreationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onUpdate}
      />
    </div>
  );
}

function StepCard({ 
  step, 
  title, 
  description, 
  isComplete, 
  isActive, 
  disabled, 
  children 
}: { 
  step: number; 
  title: string; 
  description: string;
  isComplete: boolean; 
  isActive: boolean; 
  disabled?: boolean;
  children?: React.ReactNode 
}) {
  return (
    <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${
      isComplete 
        ? 'bg-primary/5 border-primary/20 scale-[0.98] opacity-80' 
        : isActive 
          ? 'bg-white/5 border-primary/40 shadow-2xl shadow-primary/10 scale-100 ring-2 ring-primary/10' 
          : 'bg-white/[0.02] border-white/5 opacity-50'
    } ${disabled ? 'pointer-events-none' : ''}`}>
      <div className="flex items-start gap-6">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
          isComplete 
            ? 'bg-primary text-black' 
            : isActive 
              ? 'bg-primary/10 text-primary animate-pulse' 
              : 'bg-zinc-800 text-zinc-600'
        }`}>
          {isComplete ? <CheckCircle2 size={24} /> : <span className="font-black text-sm">{step}</span>}
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-black mb-1 transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>{title}</h3>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">{description}</p>
          {isActive && !isComplete && children}
        </div>
      </div>
    </div>
  );
}
