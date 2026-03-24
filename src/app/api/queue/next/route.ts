import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Initialize admin client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Get current queue
    const { data: queue, error: qErr } = await supabaseAdmin
      .from("queues")
      .select("*")
      .eq("org_id", orgId)
      .eq("session_date", new Date().toISOString().split("T")[0])
      .eq("is_active", true)
      .single();

    if (qErr || !queue) {
      return NextResponse.json({ error: "No active queue found" }, { status: 404 });
    }

    // 2. Mark current serving token as SERVED if it exists
    if (queue.currently_serving) {
      await supabaseAdmin
        .from("tokens")
        .update({ 
          status: "SERVED",
          servedAt: new Date().toISOString()
        })
        .eq("id", queue.currently_serving);
    }

    // 3. Find next WAITING token
    const { data: nextToken, error: nErr } = await supabaseAdmin
      .from("tokens")
      .select("*")
      .eq("orgId", orgId)
      .eq("status", "WAITING")
      .order("createdAt", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nErr) throw nErr;

    let updatedQueue;
    if (nextToken) {
      // 4. Update next token to SERVING
      await supabaseAdmin
        .from("tokens")
        .update({ status: "SERVING" })
        .eq("id", nextToken.id);

      // 5. Update queue table
      const { data: uQ, error: uQErr } = await supabaseAdmin
        .from("queues")
        .update({
          currently_serving: nextToken.id,
          total_waiting: Math.max(0, queue.total_waiting - 1)
        })
        .eq("id", queue.id)
        .select()
        .single();
      
      if (uQErr) throw uQErr;
      updatedQueue = uQ;
    } else {
      // No more tokens waiting
      const { data: uQ, error: uQErr } = await supabaseAdmin
        .from("queues")
        .update({
          currently_serving: null,
          total_waiting: 0
        })
        .eq("id", queue.id)
        .select()
        .single();
      
      if (uQErr) throw uQErr;
      updatedQueue = uQ;
    }

    return NextResponse.json({ 
      success: true, 
      nextToken: nextToken || null,
      queue: updatedQueue
    });
  } catch (err: any) {
    console.error("Next token error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
