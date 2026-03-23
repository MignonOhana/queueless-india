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

    // Fetch the active queue for this org
    const { data: queueData, error: queueErr } = await supabase
      .from('queues')
      .select('id')
      .eq('org_id', orgId)
      .single();

    if (queueErr || !queueData) {
      return NextResponse.json({ error: "No active queue found for this business" }, { status: 404 });
    }

    const adminSupabase = createServiceRoleClient();

    // 2. Atomic Token Generation via RPC
    // This uses `FOR UPDATE` in the DB, guaranteeing no duplicates under concurrent load
    const { data: nextNumber, error: incrementErr } = await adminSupabase
      .rpc('increment_queue_counter', {
        p_queue_id: (queueData as { id: string }).id
      } as any);

    if (incrementErr || !nextNumber) {
      console.error("Increment error:", incrementErr);
      return NextResponse.json({ error: "Queue is full or cannot accept tokens right now." }, { status: 400 });
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
    const { data: tokenRows, error: insertErr } = await adminSupabase
      .rpc('create_queue_token', {
        p_org_id: orgId,
        p_user_id: userId || null,         // null for guests
        p_customer_name: customerName,
        p_customer_phone: customerPhone || '',
        p_token_number: tokenStr,
        p_estimated_wait_mins: estimatedWaitMins,
      } as any);

    if (insertErr || !tokenRows || (tokenRows as any[]).length === 0) {
       console.error("Insert error:", JSON.stringify(insertErr, null, 2));
       return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
    }

    const tokenDoc = (tokenRows as Record<string, any>[])[0];

    // 4. WhatsApp Fallback (Async trigger, don't await blocking response if not critical)
    const business = bizData as { name: string, whatsapp_enabled: boolean } | null;
    if (business?.whatsapp_enabled && customerPhone) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (baseUrl && serviceKey) {
          // Trigger the send-whatsapp edge function
          fetch(`${baseUrl}/functions/v1/send-whatsapp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              phone: customerPhone,
              template: 'generic_token_confirmation',
              params: [customerName, tokenStr, business.name],
              businessId: orgId
            })
          }).catch(err => console.error("WhatsApp trigger background error:", err));
        }
      } catch (waErr) {
        console.error("WhatsApp trigger initialization error:", waErr);
      }
    }

    return NextResponse.json({
      ...tokenDoc,
      id: tokenDoc.id,
      orgId: tokenDoc.orgId
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Queue join API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
