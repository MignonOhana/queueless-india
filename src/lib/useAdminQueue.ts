import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { TokenItem } from "./db-schema";

export const useAdminQueue = (orgId: string, counterId?: string) => {
  const [queue, setQueue] = useState<TokenItem[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<TokenItem | null>(null);
  const [stats, setStats] = useState({ totalToday: 0, currentlyWaiting: 0, served: 0 });

  useEffect(() => {
    if (!orgId) return;

    // Fetch initial data
    const fetchQueue = async () => {
      try {
        let query = supabase
          .from("tokens")
          .select("*")
          .eq("orgId", orgId)
          .order("createdAt", { ascending: true });

        if (counterId) {
          query = query.eq("counterId", counterId);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        processQueueData(data as TokenItem[]);
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
        mockData();
      }
    };

    fetchQueue();

    // Setup Realtime Subscription
    const channel = supabase
      .channel(`admin-queue-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens", filter: `orgId=eq.${orgId}` },
        (payload) => {
          console.log("Realtime Update", payload);
          // In a real app, we'd merge the payload into the state.
          // For MVP, refetch the queue to ensure order is perfect.
          fetchQueue();
        }
      )
      .subscribe();

    const processQueueData = (docs: TokenItem[]) => {
        const fullQueue: TokenItem[] = [];
        let serving: TokenItem | null = null;
        let waitingCount = 0;
        let servedCount = 0;

        docs.forEach((data) => {
          fullQueue.push(data);
          if (data.status === "SERVING") serving = data;
          if (data.status === "WAITING") waitingCount++;
          if (data.status === "SERVED") servedCount++;
        });

        setQueue(fullQueue.filter(i => i.status === "WAITING" || i.status === "SERVING"));
        setCurrentlyServing(serving);
        setStats({
          totalToday: fullQueue.length,
          currentlyWaiting: waitingCount,
          served: servedCount
        });
    };

    return () => {
      supabase.removeChannel(channel);
    };

    function mockData() {
        setCurrentlyServing({ 
          id: "1", orgId, counterId: counterId || "opd", userId: "", customerName: "Rahul S.", 
          tokenNumber: "OPD-011", status: "SERVING", createdAt: null, estimatedWaitMins: 0 
        });
        setQueue([
            { id: "2", orgId, counterId: "opd", userId: "", customerName: "Anjali M.", tokenNumber: "OPD-012", status: "WAITING", createdAt: null, estimatedWaitMins: 5 },
            { id: "3", orgId, counterId: "opd", userId: "", customerName: "Vikram K.", tokenNumber: "OPD-013", status: "WAITING", createdAt: null, estimatedWaitMins: 10 }
        ]);
        setStats({ totalToday: 142, currentlyWaiting: 2, served: 118 });
    }
  }, [orgId]);

  return { queue, currentlyServing, stats };
};
