"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Bell, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function GlobalTurnAlert() {
  const { user } = useAuth();
  const router = useRouter();
  const [servingToken, setServingToken] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchActiveServing = async () => {
      const { data } = await (supabase
        .from('tokens') as any)
        .select('*, businesses(name)')
        .eq('userId', user.id)
        .eq('status', 'SERVING')
        .order('updatedAt', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setServingToken(data);
      } else {
        setServingToken(null);
      }
    };

    fetchActiveServing();

    // Subscribe to changes on user's tokens
    const channel = supabase
      .channel(`global_token_alert_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tokens',
        filter: `userId=eq.${user.id}`
      }, (payload) => {
        if (payload.new.status === 'SERVING') {
          fetchActiveServing(); // refetch to get business name
        } else if (payload.new.status === 'SERVED' || payload.new.status === 'CANCELLED') {
          setServingToken(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <AnimatePresence>
      {servingToken && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-2 left-2 right-2 md:top-6 md:left-1/2 md:-translate-x-1/2 md:w-max md:max-w-md z-[100]"
        >
          <div 
            onClick={() => router.push(`/customer/queue/${servingToken.orgId}/${servingToken.id}`)}
            className="bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
               <Bell className="animate-[ring_2s_ease-in-out_infinite]" size={20} />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-black uppercase tracking-widest text-xs mb-0.5">It&apos;s Your Turn!</h3>
              <p className="font-bold text-sm truncate bg-black/10 px-2 py-0.5 rounded-md inline-block">
                Token {servingToken.tokenNumber} @ {servingToken.businesses?.name || 'Counter'}
              </p>
            </div>
            <ArrowRight size={20} className="shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
