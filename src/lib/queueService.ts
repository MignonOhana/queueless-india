import { supabase } from "./supabaseClient";
import { TokenItem, QueueStatus } from "./db-schema";

// Average time to serve one customer (in minutes) for estimation
const AVG_WAIT_TIME_MINS = 5;

export const joinQueue = async (
  orgId: string, 
  counterId: string, 
  counterPrefix: string, 
  userId: string, 
  customerName: string,
  customerPhone?: string
) => {
  try {
    let tokenStr = `${counterPrefix}-001`;

    // Improved service time estimation formula
    // estimated_wait = (queue_length / active_counters_assumed_1) * average_service_time 
    const { count } = await supabase
      .from("tokens")
      .select("*", { count: "exact", head: true })
      .eq("orgId", orgId)
      .eq("counterId", counterId)
      .eq("status", "WAITING");

    const estimatedWaitMins = (count || 0) * AVG_WAIT_TIME_MINS;

    // Simulate counter increment (in a real production postgres, we'd use a sequence or RPC call)
    const { data: counterData } = await supabase
      .from("counters")
      .select("lastNumber")
      .eq("id", counterId)
      .single();

    let currentNumber = (counterData?.lastNumber || 0) + 1;
    
    await supabase
      .from("counters")
      .upsert({ id: counterId, orgId, lastNumber: currentNumber });

    const paddedNumber = String(currentNumber).padStart(3, '0');
    tokenStr = `${counterPrefix}-${paddedNumber}`;

    // Add to queue
    const { data: newDoc, error } = await supabase.from("tokens").insert({
      orgId,
      counterId,
      userId,
      customerName,
      customerPhone: customerPhone || "",
      tokenNumber: tokenStr,
      status: "WAITING",
      estimatedWaitMins,
      createdAt: new Date().toISOString()
    }).select().single();

    if (error) throw error;

    return { id: newDoc.id, tokenNumber: tokenStr, estimatedWaitMins };

  } catch (error) {
    console.warn("Firestore might not be configured. Generating mock token.", error);
    // Fallback if Firebase is not linked yet
    const rad = Math.floor(Math.random() * 99) + 1;
    // Mock 15 mins wait
    return { id: `mock_${Date.now()}`, tokenNumber: `${counterPrefix}-${String(rad).padStart(3, '0')}`, estimatedWaitMins: 15 };
  }
};

export const callNextToken = async (orgId: string, counterId?: string) => {
  try {
    // Build Serving Query (either global or specific counter)
    let servingQ = supabase.from("tokens").select("*").eq("orgId", orgId).eq("status", "SERVING");
    if (counterId) servingQ = servingQ.eq("counterId", counterId);
    
    const { data: servingData } = await servingQ;
    
    // Build Waiting Query
    let waitingQ = supabase.from("tokens").select("*").eq("orgId", orgId).eq("status", "WAITING").order("createdAt", { ascending: true }).limit(1);
    if (counterId) waitingQ = waitingQ.eq("counterId", counterId);
    
    const { data: waitingData } = await waitingQ;

    let calledToken = null;

    // Mark old as served (sequential for MVP, RPC for production)
    if (servingData && servingData.length > 0) {
      for (const d of servingData) {
        await supabase.from("tokens").update({ status: "SERVED", servedAt: new Date().toISOString() }).eq("id", d.id);
      }
    }

    // Mark new as serving
    if (waitingData && waitingData.length > 0) {
      const nextDoc = waitingData[0];
      await supabase.from("tokens").update({ status: "SERVING" }).eq("id", nextDoc.id);
      calledToken = nextDoc as TokenItem;
    }
    
    return calledToken;
  } catch (error) {
    console.warn("Firestore not configured. Mocking Call Next action.", error);
    return null;
  }
};

export const skipToken = async (orgId: string, tokenId: string) => {
  try {
    const { data, error } = await supabase
      .from("tokens")
      .update({ status: "SKIPPED", servedAt: new Date().toISOString() })
      .eq("id", tokenId)
      .eq("orgId", orgId);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Failed to skip token:", e);
    return false;
  }
};

export const recallToken = async (orgId: string, tokenId: string) => {
  try {
     // Check if there is currently a Serving token, mark it back to waiting so we don't have 2 serving
     await supabase
      .from("tokens")
      .update({ status: "WAITING" })
      .eq("orgId", orgId)
      .eq("status", "SERVING");

     // Force target token to SERVING and wipe the 'servedAt' timestamp so it reappears as active
    const { data, error } = await supabase
      .from("tokens")
      .update({ status: "SERVING", servedAt: null })
      .eq("id", tokenId)
      .eq("orgId", orgId);
      
    if (error) throw error;
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
}) => {
  // Generate SEO friendly ID (e.g. "city-hospital-mumbai")
  const id = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${data.location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  
  const { data: newDoc, error } = await supabase.from("businesses").insert({
    id,
    name: data.name,
    category: data.category,
    location: data.location,
    serviceMins: data.serviceMins,
    opHours: data.opHours,
    aiEnabled: data.aiEnabled,
    smsEnabled: data.smsEnabled,
    fastPassEnabled: false,
    fastPassPrice: 50,
    advanceBookingEnabled: false
  }).select().single();

  if (error) throw error;
  return newDoc;
};

