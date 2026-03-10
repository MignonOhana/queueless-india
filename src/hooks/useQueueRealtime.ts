"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Real-time queue subscription hook.
 * Subscribes to live INSERT/UPDATE/DELETE events on the `tokens` table
 * for a given queueId, keeping the token list in sync without polling.
 */
export function useQueueRealtime(queueId: string) {
  const [tokens, setTokens] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!queueId) return;

    // Initial fetch
    supabase
      .from("tokens")
      .select("*")
      .eq("queue_id", queueId)
      .order("createdAt", { ascending: true })
      .then(({ data }) => setTokens(data || []));

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`queue-${queueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
          filter: `queue_id=eq.${queueId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTokens((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setTokens((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTokens((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueId]);

  return tokens;
}
