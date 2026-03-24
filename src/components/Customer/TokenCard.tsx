'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Clock, ChevronRight, Activity, MapPin, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { type Database } from '@/types/database';

type Token = Database['public']['Tables']['tokens']['Row'] & {
  businesses?: {
    name: string;
    category: string;
    serviceMins: number | null;
    avg_rating?: number | null;
  } | null;
};

interface TokenCardProps {
  token: Token;
  onClick?: () => void;
  isHistory?: boolean;
}

const statusConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string; 
  bg: string; 
  glow: string;
}> = {
  'WAITING': {
    label: 'In Queue',
    icon: Clock,
    color: 'text-primary',
    bg: 'bg-primary/10',
    glow: 'shadow-primary/20'
  },
  'SERVING': {
    label: 'Now Serving',
    icon: Activity,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    glow: 'shadow-emerald-500/20'
  },
  'SERVED': {
    label: 'Visited',
    icon: Ticket,
    color: 'text-zinc-500',
    bg: 'bg-white/5',
    glow: 'shadow-transparent'
  },
  'CANCELLED': {
    label: 'Cancelled',
    icon: AlertCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    glow: 'shadow-transparent'
  }
};

export default function TokenCard({ token, onClick, isHistory = false }: TokenCardProps) {
  const config = statusConfig[token.status] || statusConfig['WAITING'];
  const StatusIcon = config.icon;

  if (isHistory) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        onClick={onClick}
        className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
            <StatusIcon size={18} />
          </div>
          <div>
            <h4 className="font-black text-sm text-white tracking-tight group-hover:text-primary transition-colors">
              {token.businesses?.name || 'Unknown Business'}
            </h4>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
              <span>{config.label}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>{token.createdAt ? new Date(token.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}</span>
            </p>
          </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
          View Detail
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassCard className="relative overflow-hidden group border-white/10 hover:border-primary/30 transition-all">
        {/* Decorative Status Gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-80 transition-opacity`} />
        
        {token.status === 'SERVING' && (
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg animate-pulse z-10">
            Current
          </div>
        )}

        <div className="flex flex-col gap-5 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {token.businesses?.category || 'Service'}
                </span>
                {token.isPriority && (
                  <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                    Priority
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-primary transition-colors line-clamp-1">
                {token.businesses?.name}
              </h3>
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold">
                <MapPin size={12} className="text-zinc-600" />
                <span className="line-clamp-1">Live Queue Tracking</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-500 shadow-inner">
              <ChevronRight size={24} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Token ID</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Ticket size={16} />
                  </div>
                  <span className="text-lg font-black text-white leading-none">#{token.tokenNumber}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Status</span>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} border border-white/5`}>
                  <StatusIcon size={14} className={config.color} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>

            {token.status === 'WAITING' && (
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Est. Wait</span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                  <Clock size={16} />
                  <span className="text-lg tracking-tight">~{token.estimatedWaitMins || token.businesses?.serviceMins || 15}m</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
