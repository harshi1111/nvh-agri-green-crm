import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Check if we're in a build environment
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return res; // Skip auth during build
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  try {
    // Only check auth for protected routes
    const path = req.nextUrl.pathname;
    const isProtected =
      path.startsWith("/customers") || 
      path.startsWith("/payments") || 
      path.startsWith("/dashboard") ||
      path === "/"; // Also protect home page

    if (isProtected) {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        const redirectUrl = new URL("/login", req.url);
        redirectUrl.searchParams.set("redirectTo", path);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (error) {
    // Silently fail during build
    console.error("Middleware error:", error);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};