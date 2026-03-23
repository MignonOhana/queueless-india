import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per minute per IP
  if (!rateLimit(req, 5, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const supabase = await createClient();

    // Extract authenticated user server-side
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      ...body,
      userId: user?.id ?? body.userId ?? null,
    };

    const { orgId, userId, customerName, customerPhone } = payload;
    const counterPrefix = payload.counterPrefix || 'Q';

    if (!orgId || !customerName) {
         return NextResponse.json({ error: "Missing required payload fields" }, { status: 400 });
    }

    // 1. Check business
    const { data: bizData } = await supabase
      .from('businesses')
      .select('name, whatsapp_enabled')
      .eq('id', orgId)
      .single();

    if (!bizData) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // 2. Custom Token Generation (No RPC)
    // First, find today's max token number for this org
    const { data: tokens } = await supabase
      .from('tokens')
      .select('tokenNumber')
      .eq('orgId', orgId)
      .gte('createdAt', todayDate)
      .order('createdAt', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (tokens && tokens.length > 0 && tokens[0].tokenNumber) {
       const match = tokens[0].tokenNumber.match(/\d+/);
       if (match) {
         nextNumber = parseInt(match[0], 10) + 1;
       }
    }

    const paddedNumber = String(nextNumber).padStart(3, '0');
    const tokenStr = `${counterPrefix}-${paddedNumber}`;

    // Get number of people currently waiting for wait time estimate
    const { count: waitingCount } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('orgId', orgId)
      .eq('status', 'WAITING')
      .gte('createdAt', todayDate);

    const estimatedWaitMins = (waitingCount || 0) * 5;

    // 3. Insert the token document via SECURITY DEFINER RPC to bypass RLS.
    // The `create_queue_token` function runs with elevated privileges and allows
    // both authenticated and guest (userId=NULL) inserts safely from the server.
    const adminSupabase = createServiceRoleClient();
    const { data: tokenRows, error: insertErr } = await adminSupabase
      .rpc('create_queue_token', {
        p_org_id: orgId,
        p_user_id: userId || null,         // null for guests
        p_customer_name: customerName,
        p_customer_phone: customerPhone || '',
        p_token_number: tokenStr,
        p_estimated_wait_mins: estimatedWaitMins,
      });

    if (insertErr || !tokenRows || tokenRows.length === 0) {
       console.error("Insert error:", JSON.stringify(insertErr, null, 2));
       return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
    }

    const tokenDoc = tokenRows[0];

    return NextResponse.json({
      ...tokenDoc,
      id: tokenDoc.id,
      orgId: tokenDoc.orgId
    });
  } catch (error: any) {
    console.error("Queue join API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
