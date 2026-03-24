import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Queue management utilities for business dashboard.
 * All functions accept a Supabase client for session-aware operations.
 */

/** Pause a queue — stops accepting new tokens */
export async function pauseQueue(queueId: string, supabase: SupabaseClient) {
  const { error } = await (supabase
    .from("queues") as any)
    .update({ is_accepting_tokens: false })
    .eq("id", queueId);
  if (error) throw error;
  return true;
}

/** Resume a queue — starts accepting new tokens */
export async function resumeQueue(queueId: string, supabase: SupabaseClient) {
  const { error } = await (supabase
    .from("queues") as any)
    .update({ is_accepting_tokens: true })
    .eq("id", queueId);
  if (error) throw error;
  return true;
}

/** Close a queue for the day — marks inactive and stops accepting */
export async function closeQueue(queueId: string, supabase: SupabaseClient) {
  const { error } = await (supabase
    .from("queues") as any)
    .update({ is_active: false, is_accepting_tokens: false })
    .eq("id", queueId);
  if (error) throw error;
  return true;
}

/** Mark a token as NO_SHOW and auto-advance to the next person */
export async function markNoShow(
  orgId: string,
  tokenId: string,
  supabase: SupabaseClient,
) {
  // 1. Mark the current token as NO_SHOW
  const { error: updateErr } = await (supabase
    .from("tokens") as any)
    .update({ status: "NO_SHOW", servedAt: new Date().toISOString() })
    .eq("id", tokenId);
  if (updateErr) throw updateErr;

  // 2. Auto-advance: find the next WAITING token and mark as SERVING
  const { data: next, error: nextErr } = await (supabase
    .from("tokens") as any)
    .select("*")
    .eq("orgId", orgId)
    .eq("status", "WAITING")
    .order("createdAt", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextErr) throw nextErr;

  if (next) {
    await (supabase
      .from("tokens") as any)
      .update({ status: "SERVING" })
      .eq("id", next.id);

    // Update the queue's currently_serving pointer
    if (next.queue_id) {
      await (supabase
        .from("queues") as any)
        .update({ currently_serving: next.id })
        .eq("id", next.queue_id);
    }
  }

  return next; // Returns the newly serving token, or null
}

/** Export daily stats as CSV string */
export function exportDailyCSV(stats: any[]): string {
  if (!stats || stats.length === 0) return "";

  const headers = [
    "Date",
    "Tokens Issued",
    "Total Served",
    "No Shows",
    "Avg Wait (mins)",
  ];
  const rows = stats.map((s: any) =>
    [
      s.stat_date,
      s.total_tokens_issued || 0,
      s.total_served || 0,
      s.total_no_shows || 0,
      s.avg_wait_mins || 0,
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
