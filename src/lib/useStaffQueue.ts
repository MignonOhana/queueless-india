import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Token } from "@/types/database";

export interface StaffContext {
  staff_id: string;
  staff_name: string;
  business_id: string;
  business_name: string;
  department_id: string;
  dept_name: string;
  queue_id: string;
}

const supabase = createClient();

export const useStaffQueue = (context: StaffContext | null) => {
  const [waitingTokens, setWaitingTokens] = useState<Token[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<Token | null>(null);
  const [stats, setStats] = useState({
    totalWaiting: 0,
    servedToday: 0,
  });

  const fetchData = useCallback(async () => {
    if (!context) return;
    try {
      // 1. Fetch current queue state
      const { data: queueData } = await supabase
        .from("queues")
        .select("*")
        .eq("id", context.queue_id)
        .single();

      // 2. Fetch all tokens for this department today
      const { data: tokens, error: tErr } = await supabase
        .from("tokens")
        .select("*")
        .eq("department_id", context.department_id)
        .order("createdAt", { ascending: true });

      if (tErr) throw tErr;

      const allTokens: Token[] = tokens || [];
      const serving = allTokens.find(t => t.status === "SERVING") || null;
      const waiting = allTokens.filter(t => t.status === "WAITING");
      const served = allTokens.filter(t => t.status === "SERVED");

      setCurrentlyServing(serving);
      setWaitingTokens(waiting);
      
      setStats({
        totalWaiting: waiting.length,
        servedToday: served.length,
      });

    } catch (err) {
      console.error("Staff fetch error:", err);
    }
  }, [context]);

  useEffect(() => {
    if (!context) return;

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
  }, [context, fetchData]);

  return { waitingTokens, currentlyServing, stats, refresh: fetchData };
};
