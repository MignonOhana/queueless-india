import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(req: NextRequest) {
  // STRICT SECURITY: Only allow on localhost
  const hostname = req.headers.get("host") || "";
  const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  if (!isLocal) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const adminSupabase = createServiceRoleClient();
    
    const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = listData.users.find(u => u.email === email);
    
    if (!targetUser) {
      const { data: newData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: "Test User" }
      });
      if (createError) throw createError;
      targetUser = newData.user;
    }

    if (!targetUser) throw new Error("Could not create or find user");

    // 1.5 Ensure Profile exists
    const { data: profile } = await adminSupabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      await (adminSupabase.from("user_profiles") as any).insert({
        id: targetUser.id,
        email: email,
        full_name: "Test User",
        is_business_owner: true,
        kyc_status: "VERIFIED"
      });
    }

    // 2. Generate Magic Link
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'http://localhost:3000/dashboard'
      }
    });

    if (linkError) throw linkError;

    // 3. Set a temporary bypass cookie to assist middleware during hash processing
    const response = NextResponse.redirect(linkData.properties.action_link);
    response.cookies.set("queueless_dev_bypass", "true", { 
      path: "/", 
      maxAge: 30, // 30 seconds is plenty to process a hash
      httpOnly: false, // browser needs to see it? No, but middleware does
      sameSite: "lax"
    });
    return response;
  } catch (err: any) {
    console.error("Magic Link Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
