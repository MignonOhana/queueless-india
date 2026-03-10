'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  const [adminOrg, setAdminOrg] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
          const { data: biz } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', session.user.id)
            .maybeSingle();
          
          if (biz) {
             setAdminOrg(biz.id);
          }
       }
    };
    checkSession();
  }, []);

  if (!adminOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-[#00F5A0]/20 border-t-[#00F5A0] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        <AnalyticsDashboard businessId={adminOrg} />
      </div>
    </div>
  );
}
