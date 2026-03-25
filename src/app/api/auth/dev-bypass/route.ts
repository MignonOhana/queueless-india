import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: NextRequest) {
  // STRICT SECURITY: Only allow on localhost and non-production
  const hostname = req.headers.get("host") || "";
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  if (!isLocal && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();
    
    const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = listData.users.find(u => u.email === email);

    if (!targetUser) {
      const { data: newData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: "Rahul V (Dev)" }
      });
      if (createError) throw createError;
      targetUser = newData.user;
    }

    if (!targetUser) throw new Error("Could not create or find user");

    // 2. Ensure Profile exists
    const { data: profile } = await adminSupabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      await (adminSupabase.from("user_profiles") as any).insert({
        id: targetUser.id,
        email: email,
        full_name: "Rahul V (Dev)",
        is_business_owner: true,
        kyc_status: "VERIFIED"
      });
    }
    
    // 3. Generate Magic Link
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'http://localhost:3000/dashboard'
      }
    });

    if (linkError) throw linkError;

    return NextResponse.json({ 
      success: true, 
      magicLink: linkData.properties.action_link,
      bypassCookie: "queueless_dev_bypass=true; Path=/; Max-Age=30; SameSite=Lax"
    });
  } catch (err: any) {
    console.error("Dev Bypass Catch Error:", err);
    return NextResponse.json({ error: err.message || "Internal Error" }, { status: 500 });
  }
}
