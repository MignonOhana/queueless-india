import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    // 3. Insert the token document
    const { data: tokenDoc, error: insertErr } = await supabase
      .from('tokens')
      .insert({
        orgId: orgId,
        userId: userId,
        customerName: customerName,
        customerPhone: customerPhone || "",
        tokenNumber: tokenStr,
        status: "WAITING",
        estimatedWaitMins: estimatedWaitMins,
      })
      .select()
      .single();

    if (insertErr) {
       console.error("Insert error:", insertErr);
       return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
    }

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
