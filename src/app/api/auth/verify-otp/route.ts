import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: NextRequest) {
  try {
    const { email, token, type } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();

    // 1. Check Rate Limit via RPC
    const { data: allowed, error: limitErr } = await (adminSupabase.rpc as any)('check_otp_rate_limit', {
      p_email: email
    });

    if (limitErr) {
      console.error("Rate limit RPC error:", limitErr);
      // Fail open if RPC is broken but log it? Or fail closed for security? 
      // Usually security = fail closed.
      return NextResponse.json({ error: "Verification system error" }, { status: 500 });
    }

    if (!allowed) {
      return NextResponse.json({ 
        error: "Too many attempts. Please wait before trying again." 
      }, { status: 429 });
    }

    // 2. Final Verification
    const { data, error } = await adminSupabase.auth.verifyOtp({
      email,
      token,
      type: type || 'email'
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (error: unknown) {
    console.error("Verify OTP API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
