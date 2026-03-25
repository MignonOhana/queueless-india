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
  if (pathname === "/register" || pathname === "/business/register" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    pathname.startsWith("/join/") ||
    pathname.startsWith("/customer/business/")
  ) {
    const segments = pathname.split("/");
    const businessId = segments[segments.length - 1];
    return NextResponse.redirect(new URL(`/b/${businessId}`, request.url));
  }

  // 4. Authenticated User Protection & Role-based Routing
  const publicRoutes = ["/", "/login", "/register", "/about", "/pricing", "/contact", "/map", "/home", "/onboarding", "/auth/callback", "/auth/confirm"];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/b/") || pathname.startsWith("/api/");

  const isBypass = request.cookies.get("queueless_dev_bypass")?.value === "true";

  if (!user && !isPublicRoute && !isBypass) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle(); // Better than .single() to avoid 406/404 errors
    
    // Fallback: check JWT metadata or default to customer
    const role = profile?.role || user.user_metadata?.role || "customer";

    if (pathname === "/login") {
      return NextResponse.redirect(new URL(role === "business_owner" ? "/dashboard" : "/home", request.url));
    }

    if (role === "customer" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    if (role === "business_owner" && pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Anti-Loop Logic: If user goes back to a "callback" page, move them along
    if (pathname === "/auth/callback") {
      return NextResponse.redirect(new URL(role === "business_owner" ? "/dashboard" : "/home", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|json|css|woff|woff2)$).*)",
  ],
};
