import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // Default to /home (safe for customers), never /dashboard
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
      const { data: existingProfile } = await adminSupabase
        .from("user_profiles")
        .select("id, role, profile_completed")
        .eq("id", session.user.id)
        .maybeSingle() as { data: { id: string; role: string; profile_completed: boolean } | null; error: unknown };

      const isNewUser = !existingProfile;

      // Upsert the profile — preserve existing role for returning users
      await adminSupabase
        .from("user_profiles")
        .upsert({
          id: session.user.id,
          // Use existing role for returning users, new role for new users
          role: existingProfile?.role ?? role,
          email: session.user.email,
          // Carry over Google name for new users
          ...(isNewUser && session.user.user_metadata?.full_name
            ? { full_name: session.user.user_metadata.full_name }
            : {}),
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'id' });

      // New customers → onboarding; new business owners → dashboard
      if (isNewUser) {
        const destination = role === "business_owner" ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(new URL(destination, requestUrl.origin));
      }

      // Returning users: use the next param but validate role
      const effectiveRole = existingProfile?.role ?? role;
      const safeNext = effectiveRole === "business_owner" ? "/dashboard" : "/home";
      // Only honour the `next` param if it's safe for their role
      const finalNext = next === "/home" || next === "/customer/dashboard" ? next : safeNext;
      return NextResponse.redirect(new URL(finalNext, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
