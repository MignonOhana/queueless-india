'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Zap, ArrowRight, Loader2, Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();
import BusinessCreationModal from './BusinessCreationModal';

import { Database } from '@/types/database';

interface OnboardingChecklistProps {
  business: Database['public']['Tables']['businesses']['Row'];
  onUpdate: () => void;
}

export default function OnboardingChecklist({ business, onUpdate }: OnboardingChecklistProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step2Data, setStep2Data] = useState({
    serviceMins: business?.serviceMins || 15,
    open: '09:00',
    close: '18:00'
  });

  const step1Complete = !!business;
  const step2Complete = step1Complete && ((business.onboarding_step ?? 0) >= 3 || business.claim_status === 'active');
  const currentStep = !step1Complete ? 1 : (business.claim_status === 'claimed' ? 2 : 3);

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await (supabase as any).from('businesses')
        .update({
          serviceMins: step2Data.serviceMins,
          opHours: JSON.stringify({ open: step2Data.open, close: step2Data.close }),
          onboarding_step: 3
        })
        .eq('id', business.id);

      if (error) throw error;
      toast.success('Queue settings saved!');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateQueue = async () => {
    setLoading(true);
    try {
      const { error } = await (supabase.rpc as any)('activate_queue_for_today', {
        p_org_id: business.id
      });

      if (error) throw error;
      
      await (supabase.from('businesses') as any).update({ claim_status: 'active' }).eq('id', business.id);

      toast.success('Queue is now LIVE! 🚀');
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-4">🏢 Welcome to QueueLess Business</h1>
        <p className="text-zinc-500 font-medium">Let's get your queue live in 3 simple steps</p>
      </div>

      <div className="space-y-6">
        {/* STEP 1 */}
        <div className={`p-6 rounded-[2rem] border transition-all ${step1Complete ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step1Complete ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-500'}`}>
              {step1Complete ? <CheckCircle2 size={18} /> : 1}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${step1Complete ? 'text-white' : 'text-zinc-400'}`}>Step 1: Create or claim your business listing</h3>
              {currentStep === 1 && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 btn-primary py-3 px-6 text-xs flex items-center gap-2"
                >
                  Get Started <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2 */}
        <div className={`p-6 rounded-[2rem] border transition-all ${step2Complete ? 'bg-primary/5 border-primary/20' : currentStep === 2 ? 'bg-white/5 border-primary/30' : 'bg-white/5 border-white/10 opacity-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step2Complete ? 'bg-primary text-black' : currentStep === 2 ? 'bg-primary/10 text-primary' : 'bg-zinc-800 text-zinc-500'}`}>
              {step2Complete ? <CheckCircle2 size={18} /> : 2}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${currentStep >= 2 ? 'text-white' : 'text-zinc-400'}`}>Step 2: Set your queue hours and service time</h3>
              {currentStep === 2 && (
                <form onSubmit={handleStep2Submit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="serviceMins" className="block text-[8px] font-black uppercase text-zinc-500 mb-1">Service Mins</label>
                      <input 
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                        id="serviceMins" value={step2Data.serviceMins}
                        onChange={e => setStep2Data({...step2Data, serviceMins: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="opensAt" className="block text-[8px] font-black uppercase text-zinc-500 mb-1">Opens at</label>
                      <input 
                        type="time"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                        id="opensAt" value={step2Data.open}
                        onChange={e => setStep2Data({...step2Data, open: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="closesAt" className="block text-[8px] font-black uppercase text-zinc-500 mb-1">Closes at</label>
                      <input 
                        type="time"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                        id="closesAt" value={step2Data.close}
                        onChange={e => setStep2Data({...step2Data, close: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn-primary py-3 px-6 text-xs flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <>Save Settings <ArrowRight size={14} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className={`p-6 rounded-[2rem] border transition-all ${currentStep === 3 ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10' : 'bg-white/5 border-white/10 opacity-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-primary text-black animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
              3
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${currentStep === 3 ? 'text-white' : 'text-zinc-400'}`}>Step 3: Activate today's queue and get your QR code</h3>
              {currentStep === 3 && (
                <div className="mt-6">
                  <p className="text-zinc-400 text-sm mb-6">Everything looks good! Ready to welcome your first digital customer?</p>
                  <button 
                    onClick={handleActivateQueue}
                    disabled={loading}
                    className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Play size={20} fill="currentColor" /> Activate Queue for Today</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BusinessCreationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onUpdate}
      />
    </div>
  );
}
