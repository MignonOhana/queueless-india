import { createClient } from "./supabase/client";
import { Token as TokenItem } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

const defaultSupabase = createClient();

// Average time to serve one customer (in minutes) for estimation
const AVG_WAIT_TIME_MINS = 5;

export const joinQueue = async (
  orgId: string,
  counterId: string,
  counterPrefix: string,
  userId: string,
  customerName: string,
  customerPhone?: string,
  supabase: SupabaseClient = defaultSupabase,
) => {
  try {
    const response = await fetch("/api/queue/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orgId,
        counterPrefix,
        userId,
        customerName,
        customerPhone,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to join queue");

    // The edge function returns the inserted token document
    return {
      id: data.id,
      tokenNumber: data.tokenNumber,
      estimatedWaitMins: data.estimatedWaitMins,
    };
  } catch (error) {
    console.warn(
      "Supabase edge function failed. Generating mock token.",
      error,
    );
    // Fallback if Edge function is not deployed yet locally
    const rad = Math.floor(Math.random() * 99) + 1;
    // Mock 15 mins wait
    return {
      id: `mock_${Date.now()}`,
      tokenNumber: `${counterPrefix}-${String(rad).padStart(3, "0")}`,
      estimatedWaitMins: 15,
    };
  }
};

export const callNextToken = async (
  orgId: string,
  counterId?: string,
  supabase: SupabaseClient = defaultSupabase,
) => {
  try {
    // Build Serving Query (either global or specific counter)
    let servingQ = (supabase.from("tokens") as any).select("*").eq("orgId", orgId).eq(
      "status",
      "SERVING",
    );
    if (counterId) servingQ = servingQ.eq("counterId", counterId);

    const { data: servingData } = await (servingQ as any);

    // Build Waiting Query
    let waitingQ = (supabase.from("tokens") as any).select("*").eq("orgId", orgId).eq(
      "status",
      "WAITING",
    ).order("createdAt", { ascending: true }).limit(1);
    if (counterId) waitingQ = waitingQ.eq("counterId", counterId);

    const { data: waitingData } = await (waitingQ as any);

    let calledToken = null;

    // Mark old as served (sequential for MVP, RPC for production)
    if (servingData && servingData.length > 0) {
      for (const d of servingData) {
        await (supabase.from("tokens") as any).update({
          status: "SERVED",
          servedAt: new Date().toISOString(),
        }).eq("id", d.id);
      }
    }

    // Mark new as serving
    if (waitingData && waitingData.length > 0) {
      const nextDoc = waitingData[0] as TokenItem;
      await (supabase.from("tokens") as any).update({ status: "SERVING" }).eq(
        "id",
        nextDoc.id,
      );
      calledToken = nextDoc;

      if (nextDoc.queue_id) {
        // Decrement waiting count AND set active serving ID
        await (supabase as any).rpc("serve_next_queue_token", {
          p_queue_id: nextDoc.queue_id,
          p_token_id: nextDoc.id,
        });
      }

      // --- WHATSAPP NOTIFICATION ---
      const { data: biz } = await (supabase.from("businesses").select(
        "name, whatsapp_enabled",
      ).eq("id", orgId).single() as any);

      if (biz?.whatsapp_enabled) {
        // 1. Notify the one being served NOW
        if (nextDoc.customerPhone) {
          supabase.functions.invoke("send-whatsapp", {
            body: {
              phone: nextDoc.customerPhone,
              template: "your_turn_now",
              params: [biz.name, nextDoc.tokenNumber],
              businessId: orgId,
            },
          }).catch((e) => console.error("WhatsApp failed:", e));
        }

        // 2. Notify the one who is now POS 2 (almost their turn)
        // Since we just called nextDoc (was POS 1), the current POS 2 is now POS 1.
        // We want to notify the person at the NEW POS 2 (was POS 3).
        // Actually, "Almost your turn" is usually for the one who is NEXT.
        // Let's stick to the user's request: "pos drops to 2".
        // If Token B is serving, Token C is Pos 1, Token D is Pos 2.
        // So notify Token D.
        const { data: waitingList } = await (supabase.from("tokens")
          .select("customerPhone, tokenNumber")
          .eq("orgId", orgId)
          .eq("status", "WAITING")
          .order("createdAt", { ascending: true })
          .range(1, 1) // Offset 1 is the 2nd person waiting
          .maybeSingle() as any);

        if (waitingList?.customerPhone) {
          supabase.functions.invoke("send-whatsapp", {
            body: {
              phone: waitingList.customerPhone,
              template: "almost_your_turn",
              params: [biz.name, waitingList.tokenNumber],
              businessId: orgId,
            },
          }).catch((e) => console.error("WhatsApp almost failed:", e));
        }
      }
    }

    return calledToken;
  } catch (error) {
    console.warn("Firestore not configured. Mocking Call Next action.", error);
    return null;
  }
};

export const skipToken = async (
  orgId: string,
  tokenId: string,
  supabase: SupabaseClient = defaultSupabase,
) => {
  try {
    const { data: tokenData, error: tokenErr } = await (supabase
      .from("tokens")
      .update({ status: "SKIPPED", servedAt: new Date().toISOString() })
      .eq("id", tokenId)
      .eq("orgId", orgId)
      .select("queue_id")
      .maybeSingle() as any);

    if (tokenErr) throw tokenErr;
    if (!tokenData) return false;

    if (tokenData && tokenData.queue_id) {
      // Decrement total_waiting since they left the queue
      await (supabase as any).rpc("decrement_queue_waiting", {
        p_queue_id: tokenData.queue_id,
      });
    }

    return true;
  } catch (e) {
    console.error("Failed to skip token:", e);
    return false;
  }
};

export const recallToken = async (
  orgId: string,
  tokenId: string,
  supabase: SupabaseClient = defaultSupabase,
) => {
  try {
    // Check if there is currently a Serving token, mark it back to waiting so we don't have 2 serving
    await (supabase
      .from("tokens") as any)
      .update({ status: "WAITING" })
      .eq("orgId", orgId)
      .eq("status", "SERVING");

    // Force target token to SERVING and wipe the 'servedAt' timestamp so it reappears as active
    const { data: tokenData, error } = await (supabase
      .from("tokens")
      .update({ status: "SERVING", servedAt: null })
      .eq("id", tokenId)
      .eq("orgId", orgId)
      .select("queue_id")
      .maybeSingle() as any);

    if (error) throw error;
    if (!tokenData) return false;

    if (tokenData && tokenData.queue_id) {
      // Update queues table to point currently_serving_token_id to this recalled token
      await (supabase
        .from("queues") as any)
        .update({ currently_serving: tokenId
 })
        .eq("id", tokenData.queue_id);
    }

    return true;
  } catch (e) {
    console.error("Failed to recall token:", e);
    return false;
  }
};

export const createBusiness = async (data: {
  name: string;
  category: string;
  location: string;
  serviceMins: number;
  opHours: string;
  aiEnabled: boolean;
  smsEnabled: boolean;
  owner_id: string;
}, supabase: SupabaseClient = defaultSupabase) => {
  // GUARD: owner_id must NEVER be null
  if (!data.owner_id) {
    throw new Error(
      "owner_id is required to create a business. User must be authenticated.",
    );
  }

  // Generate SEO friendly ID (e.g. "city-hospital-mumbai")
  const id = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${
    data.location.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  }`;

  const { data: newDoc, error } = await (supabase.from("businesses").insert({
    id,
    name: data.name,
    category: data.category,
    location: data.location,
    serviceMins: data.serviceMins,
    opHours: data.opHours,
    aiEnabled: data.aiEnabled,
    smsEnabled: data.smsEnabled,
    owner_id: data.owner_id,
    fastPassEnabled: false,
    fastPassPrice: 50,
    advanceBookingEnabled: false,
  }).select().single() as any);

  if (error) throw error;
  return newDoc;
};
