import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Token as TokenItem } from "@/types/database";

export const useAdminQueue = (orgId: string, counterId?: string) => {
  const supabase = createClient();
  const [queue, setQueue] = useState<TokenItem[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<TokenItem | null>(
    null,
  );
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
        let queuesQuery = (supabase
          .from("queues") as any)
          .select("*")
          .eq("org_id", orgId)
          .eq("session_date", new Date().toISOString().split("T")[0]);

        if (counterId) {
          queuesQuery = queuesQuery.eq("counter_id", counterId);
        }

        const { data: queueRows, error: qErr } = await queuesQuery;

        if (qErr && qErr.code !== "PGRST116") throw qErr;

        // 2. Fetch the active tokens list (WAITING & SERVING)
        let query = (supabase
          .from("tokens") as any)
          .select("*")
          .eq("orgId", orgId)
          .in("status", ["WAITING", "SERVING"])
          .order("createdAt", { ascending: true });

        if (counterId) {
          query = query.eq("counterId", counterId);
        }

        const { data: activeTokens, error: tokensErr } = await query;
        if (tokensErr) throw tokensErr;

        // 3. Process the state
        const fullQueue: TokenItem[] = (activeTokens as TokenItem[]) || [];
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
          queueRows.forEach((row: any) =>
            totalIssued += row.last_issued_number || 0
          );

          setStats({
            totalToday: totalIssued,
            currentlyWaiting: waitingCount, // Derived from active tokens
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
    // Listen to changes on the tokens table (new joins, status updates)
    const tokensChannel = supabase
      .channel(`admin-tokens-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
          filter: `orgId=eq.${orgId}`,
        },
        () => fetchAdminData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tokensChannel);
    };

    function mockData() {
      setCurrentlyServing({
        id: "1",
        orgId,
        counterId: counterId || "opd",
        userId: "",
        customerName: "Rahul S.",
        tokenNumber: "OPD-011",
        status: "SERVING",
        createdAt: new Date().toISOString(),
        estimatedWaitMins: 0,
        queue_id: 'q1',
        isPriority: false,
        servedAt: null,
        customerPhone: null,
        department_id: null
      });
      setQueue([
        {
          id: "2",
          orgId,
          counterId: "opd",
          userId: "",
          customerName: "Anjali M.",
          tokenNumber: "OPD-012",
          status: "WAITING",
          createdAt: new Date().toISOString(),
          estimatedWaitMins: 5,
          queue_id: 'q1',
          isPriority: false,
          servedAt: null,
          customerPhone: null,
          department_id: null
        },
        {
          id: "3",
          orgId,
          counterId: "opd",
          userId: "",
          customerName: "Vikram K.",
          tokenNumber: "OPD-013",
          status: "WAITING",
          createdAt: new Date().toISOString(),
          estimatedWaitMins: 10,
          queue_id: 'q1',
          isPriority: false,
          servedAt: null,
          customerPhone: null,
          department_id: null
        },
      ]);
      setStats({ totalToday: 142, currentlyWaiting: 2, served: 118 });
    }
  }, [orgId, counterId]);

  return { queue, currentlyServing, stats };
};
