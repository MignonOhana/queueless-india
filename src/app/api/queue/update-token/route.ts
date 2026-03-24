import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tokenId, status, queueId } = await req.json();

    if (!tokenId || !status || !queueId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    // 1. Update Token Status
    const { error: tErr } = await (supabaseAdmin
      .from("tokens") as any)
      .update({ 
        status,
        servedAt: status === "SERVED" ? new Date().toISOString() : null
      })
      .eq("id", tokenId);

    if (tErr) throw tErr;

    // 2. If it was the currently serving token, clear it from the queue
    const { data: queue } = await (supabaseAdmin
      .from("queues") as any)
      .select("currently_serving")
      .eq("id", queueId)
      .single();

    if (queue?.currently_serving === tokenId) {
      await (supabaseAdmin
        .from("queues") as any)
        .update({ currently_serving: null })
        .eq("id", queueId);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Update token error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
