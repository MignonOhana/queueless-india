import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  // 1. Refresh session (use getUser for security)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Navigation History Tracker (Cookie-based)
  supabaseResponse.cookies.set("queueless_prev_path", pathname, {
    path: "/",
    maxAge: 3600,
  });

  // 3. Route Consolidation Redirects
  if (
    pathname.startsWith("/join/") ||
    pathname.startsWith("/customer/business/")
  ) {
    const segments = pathname.split("/");
    const businessId = segments[segments.length - 1];
    return NextResponse.redirect(new URL(`/b/${businessId}`, request.url));
  }

  // 4. Authenticated User Protection (Business Owner)
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. Dashboard Access Protection — skip for demo mode
  // The dashboard page itself handles demo mode, so we only redirect
  // if the user explicitly navigates to a sub-path of /dashboard
  // For the main /dashboard page, we allow unauthenticated access so the
  // demo login button is accessible.

  // 6. Anti-Loop Logic: If user goes back to a "callback" or "redirecting" page, move them along
  if (pathname === "/auth/callback" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
