import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { TokenItem } from "./db-schema";

export const useCustomerQueue = (orgId: string, tokenNumber: string | null) => {
  const [ticketStatus, setTicketStatus] = useState<any>(null);
  const [currentlyServing, setCurrentlyServing] = useState<string>("Wait...");
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    if (!orgId || !tokenNumber) return;

    // Helper to get prefix (e.g., 'OPD' from 'OPD-011')
    const prefix = tokenNumber.split('-')[0].toLowerCase();

    const fetchQueueState = async () => {
      try {
        // 1. Fetch the user's specific token for status
        const { data: tokenData, error: tokenErr } = await supabase
          .from("tokens")
          .select("*")
          .eq("orgId", orgId)
          .eq("tokenNumber", tokenNumber)
          .single();

        if (tokenErr) throw tokenErr;

        if (tokenData) {
           setTicketStatus((tokenData as TokenItem).status);
           setEstimatedWait((tokenData as TokenItem).estimatedWaitMins || 0);
        }

        // 2. Fetch the aggregate queue row for currently serving & people ahead calculation
        if (tokenData && tokenData.queue_id) {
           const { data: queueData, error: qErr } = await supabase
             .from("queues")
             .select("last_issued_number, currently_serving_token_id, total_waiting")
             .eq("id", tokenData.queue_id)
             .single();

           if (!qErr && queueData) {
               // If there's an active serving token, fetch its number just for display
               if (queueData.currently_serving_token_id) {
                  const { data: activeToken } = await supabase
                    .from("tokens")
                    .select("tokenNumber")
                    .eq("id", queueData.currently_serving_token_id)
                    .single();
                  
                  if (activeToken) setCurrentlyServing(activeToken.tokenNumber);
               } else {
                  setCurrentlyServing("Wait...");
               }

               // Simplified 'people ahead' calculation using the active tokens ID vs this users ID
               // In a production app, this would be computed on the server side or by difference in token numbers
               // For this MVP, we just use the raw tokens rank since tokenNumber is sequential 'OPD-001'
               const myNum = parseInt(tokenNumber.split('-')[1] || "0", 10);
               let servingNum = 0;
               if (queueData.currently_serving_token_id) {
                    const { data: activeToken } = await supabase
                    .from("tokens")
                    .select("tokenNumber")
                    .eq("id", queueData.currently_serving_token_id)
                    .single();
                    servingNum = parseInt(activeToken?.tokenNumber?.split('-')[1] || "0", 10);
               }

               const ahead = Math.max(0, myNum - servingNum - 1);
               if (tokenData.status === "WAITING") {
                   setPeopleAhead(ahead);
               } else {
                   setPeopleAhead(0);
               }
           }
        }
      } catch (err) {
        console.warn("Supabase customer fetch failed, using mock data", err);
        applyMockData();
      }
    };

    fetchQueueState();

    // Setup Realtime Subscriptions
    // 1. Subscribe to their own token for status changes (WAITING -> SERVING)
    const tokenChannel = supabase
      .channel(`customer-token-${tokenNumber}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tokens", filter: `tokenNumber=eq.${tokenNumber}` },
        () => fetchQueueState() 
      )
      .subscribe();

    // 2. Subscribe to the queues table for movement in the line
    const queueChannel = supabase
      .channel(`queue-aggregate-${orgId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queues", filter: `org_id=eq.${orgId}` },
        () => fetchQueueState() 
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tokenChannel);
      supabase.removeChannel(queueChannel);
    };

    function applyMockData() {
       setCurrentlyServing("OPD-011");
       setPeopleAhead(3);
       setTicketStatus("WAITING");
       setEstimatedWait(15);
    }
  }, [orgId, tokenNumber]);

  return { ticketStatus, currentlyServing, peopleAhead, estimatedWait };
};
