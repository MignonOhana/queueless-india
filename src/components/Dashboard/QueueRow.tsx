'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FastForward, UserMinus, Zap, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatusBadge from '../ui/StatusBadge';

interface QueueRowProps {
  token: any;
  onServe: (id: string) => void;
  onSkip: (id: string) => void;
  onNoShow: (id: string) => void;
  onPriority: (id: string) => void;
}

export default function QueueRow({ token, onServe, onSkip, onNoShow, onPriority }: QueueRowProps) {
  const [waitTime, setWaitTime] = useState(0);
  const [showConfirm, setShowConfirm] = useState<'skip' | 'noshow' | null>(null);

  useEffect(() => {
    if (!token.createdAt) return;
    const start = new Date(token.createdAt).getTime();
    const interval = setInterval(() => {
      setWaitTime(Math.floor((Date.now() - start) / 60000));
    }, 10000);
    setWaitTime(Math.floor((Date.now() - start) / 60000));
    return () => clearInterval(interval);
  }, [token.created_at]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 mb-3 hover:bg-white/[0.08] transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <span className="text-2xl font-black text-[#00F5A0] tracking-tighter">{token.tokenNumber}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white">{token.customerName}</h4>
              {token.isPriority && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase">
                  <Zap size={10} fill="currentColor" /> Priority
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <Clock size={12} /> {waitTime}m waiting
              </span>
              <StatusBadge status={token.status} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showConfirm ? (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onServe(token.id)}
                className="p-3 rounded-xl bg-[#00F5A0] text-black hover:shadow-[0_0_20px_rgba(0,245,160,0.3)] transition-shadow"
                title="Serve Now"
              >
                <CheckCircle2 size={20} />
              </motion.button>
              
              <div className="hidden group-hover:flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConfirm('skip')}
                  className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Skip"
                >
                  <FastForward size={20} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConfirm('noshow')}
                  className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  title="No Show"
                >
                  <UserMinus size={20} />
                </motion.button>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <button 
                onClick={() => setShowConfirm(null)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (showConfirm === 'skip') onSkip(token.id);
                  if (showConfirm === 'noshow') onNoShow(token.id);
                  setShowConfirm(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white text-xs font-black uppercase"
              >
                Confirm
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
