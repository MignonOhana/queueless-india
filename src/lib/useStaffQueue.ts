import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Token as TokenItem } from "@/types/database";

export interface StaffContext {
  staff_id: string;
  staff_name: string;
  business_id: string;
  business_name: string;
  department_id: string;
  dept_name: string;
  queue_id: string;
}

export const useStaffQueue = (context: StaffContext | null) => {
  const supabase = createClient();
  const [waitingTokens, setWaitingTokens] = useState<TokenItem[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<TokenItem | null>(null);
  const [stats, setStats] = useState({
    totalWaiting: 0,
    servedToday: 0,
  });

  useEffect(() => {
    if (!context) return;

    const fetchData = async () => {
      try {
        // 1. Fetch current queue state
        const { data: queueData } = await (supabase
          .from("queues") as any)
          .select("*")
          .eq("id", context.queue_id)
          .single();

        // 2. Fetch all active tokens for this department
        const { data: tokens, error: tErr } = await (supabase
          .from("tokens") as any)
          .select("*")
          .eq("department_id", context.department_id)
          .in("status", ["WAITING", "SERVING"])
          .order("createdAt", { ascending: true });

        if (tErr) throw tErr;

        const allTokens: TokenItem[] = tokens || [];
        const serving = allTokens.find(t => t.status === "SERVING") || null;
        const waiting = allTokens.filter(t => t.status === "WAITING");

        setCurrentlyServing(serving);
        setWaitingTokens(waiting);
        
        // 3. Update Stats
        setStats({
          totalWaiting: waiting.length,
          servedToday: (queueData?.last_issued_number || 0) - waiting.length - (serving ? 1 : 0),
        });

      } catch (err) {
        console.error("Staff fetch error:", err);
      }
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel(`staff-dept-${context.department_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
          filter: `department_id=eq.${context.department_id}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [context?.department_id, context?.queue_id]);

  return { waitingTokens, currentlyServing, stats };
};
