import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/home";
  const role = requestUrl.searchParams.get("role") || "customer";

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

    if (session?.user) {
      const adminSupabase = createServiceRoleClient();

      // Check if profile already exists (returning user)
      // Use `as any` to bypass strict Supabase generated type inference
      const { data: existingProfile } = await (adminSupabase
        .from("user_profiles")
        .select("id, role, profile_completed")
        .eq("id", session.user.id)
        .maybeSingle() as any) as {
          data: { id: string; role: string; profile_completed: boolean } | null;
        };

      const isNewUser = !existingProfile;

      // Upsert profile — preserve existing role for returning users
      await (adminSupabase as any)
        .from("user_profiles")
        .upsert(
          {
            id: session.user.id,
            role: existingProfile ? existingProfile.role : role,
            email: session.user.email,
            ...(isNewUser && session.user.user_metadata?.full_name
              ? { full_name: session.user.user_metadata.full_name }
              : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      // New customers → onboarding; new business owners → dashboard
      if (isNewUser) {
        const destination = role === "business_owner" ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(new URL(destination, requestUrl.origin));
      }

      // Returning users — route by their stored role
      const effectiveRole = existingProfile ? existingProfile.role : role;
      const safeNext = effectiveRole === "business_owner" ? "/dashboard" : "/home";
      const finalNext = next === "/home" || next === "/customer/dashboard" ? next : safeNext;
      return NextResponse.redirect(new URL(finalNext, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
