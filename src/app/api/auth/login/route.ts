import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("LOGIN ATTEMPT:", { email });

    // Get cookie store
    const cookieStore = await cookies();
    
    // Create server client with the SAME configuration as middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use ANON key, not service role
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Ignore errors in API routes
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch {
              // Ignore errors in API routes
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("SUPABASE RESPONSE:", { 
      error: error?.message, 
      hasSession: !!data?.session,
      user: data?.user?.email 
    });

    if (error || !data.session) {
      return NextResponse.json(
        { 
          error: "Invalid email or password",
          debug: error?.message || "No session created"
        },
        { status: 401 }
      );
    }

    console.log("Login successful for:", data.user.email);

    // Return response - the supabase client already set cookies
    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
      user: data.user
    });

  } catch (err) {
    console.error("LOGIN_ERROR", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}