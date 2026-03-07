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

    // Fetch initial data
    const fetchQueue = async () => {
      try {
        const { data, error } = await supabase
          .from("tokens")
          .select("*")
          .eq("orgId", orgId)
          .in("status", ["WAITING", "SERVING"])
          .order("createdAt", { ascending: true });

        if (error) throw error;
        processQueueData(data as TokenItem[]);
      } catch (err) {
        console.warn("Supabase customer fetch failed, using mock data", err);
        applyMockData();
      }
    };

    fetchQueue();

    // Setup Realtime Subscription
    const channel = supabase
      .channel(`customer-queue-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens", filter: `orgId=eq.${orgId}` },
        (payload) => {
          console.log("Customer Realtime Update", payload);
          fetchQueue(); // Refetch to recalculate position
        }
      )
      .subscribe();

    const processQueueData = (docs: TokenItem[]) => {
        let pAhead = 0;
        let myTicketFound = false;

        docs.forEach((data, idx) => {
          if (data.status === "SERVING") {
            setCurrentlyServing(data.tokenNumber);
          }
          if (data.tokenNumber === tokenNumber) {
            myTicketFound = true;
            pAhead = idx; // simple estimation based on index in waiting array
            setTicketStatus(data.status);
            setEstimatedWait(data.estimatedWaitMins || (idx * 5));
          }
        });

        if (myTicketFound) {
            setPeopleAhead(pAhead);
        }
    };

    return () => {
      supabase.removeChannel(channel);
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
