'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, AlertCircle, ArrowUpCircle } from 'lucide-react';
import UpgradeModal from '../pricing/UpgradeModal';

interface PlanBadgeProps {
  currentPlan: 'free' | 'growth' | 'enterprise';
  tokensUsed: number;
}

export default function PlanBadge({ currentPlan = 'free', tokensUsed = 0 }: PlanBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const LIMIT = 50;
  const isNearLimit = currentPlan === 'free' && tokensUsed > 40;

  return (
    <div className="flex items-center gap-4">
      {/* Nudge Banner for Free Users */}
      {isNearLimit && (
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 hover:bg-amber-500/20 transition-all pointer-events-auto"
        >
          <AlertCircle size={16} />
          <span className="text-xs font-bold leading-none">
            {tokensUsed}/{LIMIT} daily tokens used. Upgrade for unlimited.
          </span>
          <ArrowUpCircle size={16} className="ml-1" />
        </motion.button>
      )}

      {/* Plan Badge */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all hover:scale-105 ${
          currentPlan === 'enterprise' 
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
            : currentPlan === 'growth'
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              : 'bg-white/5 border-white/10 text-zinc-400'
        }`}
      >
        {currentPlan !== 'free' && <Crown size={12} className="fill-current" />}
        <span className="text-[10px] font-black uppercase tracking-[0.1em]">
          {currentPlan} Plan
        </span>
      </div>

      <UpgradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
