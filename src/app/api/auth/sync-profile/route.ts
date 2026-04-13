import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, role, fullName } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();

    // Upsert the user profile using Service Role to bypass RLS
    const { data, error } = await adminSupabase
      .from("user_profiles")
      .upsert({ 
        id: userId, 
        role: role || "customer",
        email: email,
        full_name: fullName || null,
        updated_at: new Date().toISOString()
      } as any, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error("Profile sync error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error: unknown) {
    console.error("Sync Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
