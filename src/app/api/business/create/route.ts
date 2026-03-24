import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, category, location, address, phone, description, 
      openHours, closeHours, cover_image_url 
    } = body;

    if (!name || !category || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    // 2. Generate Business ID via RPC
    const { data: businessId, error: genError } = await supabaseAdmin.rpc('generate_business_id', {
      p_location: location
    });

    if (genError) throw genError;

    // 3. Insert Business
    const { data: business, error: insError } = await (supabaseAdmin
      .from("businesses") as any)
      .insert({
        id: businessId,
        name,
        category,
        location,
        address,
        phone,
        description,
        opHours: `${openHours}-${closeHours}`,
        cover_image_url,
        owner_id: session.user.id,
        plan: 'free',
        claim_status: 'claimed',
        onboarding_step: 2,
        is_verified: false
      })
      .select()
      .single();

    if (insError) throw insError;

    // 4. Update User Profile
    const { error: upError } = await (supabaseAdmin
      .from("user_profiles") as any)
      .update({
        is_business_owner: true,
        primary_business_id: businessId,
        updated_at: new Date().toISOString()
      })
      .eq("id", session.user.id);

    if (upError) throw upError;

    return NextResponse.json({ 
      success: true, 
      businessId,
      business 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Business creation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
