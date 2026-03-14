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

    // Extract authenticated user server-side (don't trust client-sent userId)
    const { data: { user } } = await supabase.auth.getUser();

    // If user is authenticated, always use their server-verified ID
    // If not authenticated (guest join), userId stays null
    const secureBody = {
      ...body,
      userId: user?.id ?? body.userId ?? null,
    };

    // Proxy to the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("generate-token", {
      body: secureBody,
    });

    if (error) {
       console.error("Edge function error:", error);
       return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ...data,
      id: data.id,
      orgId: data.orgId
    });
  } catch (error: any) {
    console.error("Queue join API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
