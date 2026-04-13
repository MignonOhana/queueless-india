import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Token as TokenItem } from "@/types/database";

export const useAdminQueue = (orgId: string, counterId?: string) => {
  const supabase = createClient();
  const [queue, setQueue] = useState<TokenItem[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<TokenItem | null>(null);
  const [stats, setStats] = useState({
    totalToday: 0,
    currentlyWaiting: 0,
    served: 0,
  });

  useEffect(() => {
    if (!orgId) return;

    const fetchAdminData = async () => {
      if (orgId.startsWith("demo-")) {
        mockData();
        return;
      }
      try {
        // 1. Fetch active queue stats
        let queuesQuery = supabase
          .from("queues")
          .select("*")
          .eq("org_id", orgId)
          .eq("session_date", new Date().toISOString().split("T")[0]);

        if (counterId && counterId !== 'all') {
          queuesQuery = queuesQuery.eq("department_id", counterId);
        }

        const { data: queueRows, error: qErr } = await queuesQuery;
        if (qErr && qErr.code !== "PGRST116") throw qErr;

        // 2. Fetch the active tokens list (WAITING & SERVING)
        let query = (supabase as any)
          .from("tokens")
          .select("*")
          .eq("orgId", orgId)
          .in("status", ["WAITING", "SERVING"])
          .order("createdAt", { ascending: true });

        if (counterId && counterId !== 'all') {
          query = query.eq("department_id", counterId);
        }

        const { data: activeTokens, error: tokensErr } = await query;
        if (tokensErr) throw tokensErr;

        // 3. Process the state
        const fullQueue: TokenItem[] = (activeTokens as any[]) || [];
        let serving: TokenItem | null = null;
        let waitingCount = 0;

        fullQueue.forEach((data) => {
          if (data.status === "SERVING") serving = data;
          if (data.status === "WAITING") waitingCount++;
        });

        setQueue(fullQueue);
        setCurrentlyServing(serving);

        // Derive stats directly from the queues row to save counting
        if (queueRows && queueRows.length > 0) {
          let totalIssued = 0;
          (queueRows as any[]).forEach((row) =>
            totalIssued += row.last_issued_number || 0
          );

          setStats({
            totalToday: totalIssued,
            currentlyWaiting: waitingCount,
            served: totalIssued - waitingCount - (serving ? 1 : 0),
          });
        } else {
          setStats({ totalToday: 0, currentlyWaiting: 0, served: 0 });
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to mock", err);
        mockData();
      }
    };

    fetchAdminData();

    // Setup Realtime Subscriptions
    const tokensChannel = supabase
      .channel(`admin-tokens-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
        },
        () => fetchAdminData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tokensChannel);
    };

    function mockData() {
      const mockServing: TokenItem = {
        id: "1",
        orgId,
        counterId: counterId || "opd",
        userId: "demo-user",
        customerName: "Rahul S.",
        tokenNumber: "OPD-011",
        status: "SERVING",
        createdAt: new Date().toISOString(),
        estimatedWaitMins: 0,
        isPriority: false,
        servedAt: null,
        customerPhone: null,
        queue_id: 'q1',
        department_id: null,
        paymentId: null
      };
      
      const mockQueue: TokenItem[] = [
        {
          id: "2",
          orgId,
          counterId: "opd",
          userId: "demo-user",
          customerName: "Anjali M.",
          tokenNumber: "OPD-012",
          status: "WAITING",
          createdAt: new Date().toISOString(),
          estimatedWaitMins: 5,
          isPriority: false,
          servedAt: null,
          customerPhone: null,
          queue_id: 'q1',
          department_id: null,
          paymentId: null
        },
        {
          id: "3",
          orgId,
          counterId: "opd",
          userId: "demo-user",
          customerName: "Vikram K.",
          tokenNumber: "OPD-013",
          status: "WAITING",
          createdAt: new Date().toISOString(),
          estimatedWaitMins: 10,
          isPriority: false,
          servedAt: null,
          customerPhone: null,
          queue_id: 'q1',
          department_id: null,
          paymentId: null
        },
      ];

      setCurrentlyServing(mockServing);
      setQueue(mockQueue);
      setStats({ totalToday: 142, currentlyWaiting: 2, served: 118 });
    }
  }, [orgId, counterId, supabase]);

  return { queue, currentlyServing, stats };
};
