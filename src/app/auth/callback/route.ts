import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      },
    );
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    const role = requestUrl.searchParams.get("role") || "customer";
    if (session?.user) {
      // Use service role client to bypass RLS when creating the new profile
      const adminSupabase = createServiceRoleClient();
      
      await adminSupabase
        .from("user_profiles")
        .upsert({ 
          id: session.user.id, 
          role,
          email: session.user.email,
          updated_at: new Date().toISOString()
        } as any, { onConflict: 'id' });
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
