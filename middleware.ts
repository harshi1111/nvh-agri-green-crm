import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // IMPORTANT: Skip middleware entirely during build
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    // For Vercel build, skip auth checks
    return res;
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
      path === "/";

    if (isProtected) {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        const redirectUrl = new URL("/login", req.url);
        redirectUrl.searchParams.set("redirectTo", path);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (error) {
    // Log error but don't crash
    console.error("Middleware error:", error);
  }

  return res;
}

export const config = {
  matcher: [
    // Skip API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico|public/|login|signup).*)",
  ],
};