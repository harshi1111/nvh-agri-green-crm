import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("LOGIN ATTEMPT:", { email, password });

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

    // Create response with cookies
    const response = NextResponse.json(
      { success: true, redirectTo: "/dashboard" },
      { status: 200 }
    );

    // Set session cookies
    response.cookies.set({
      name: 'sb-access-token',
      value: data.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    response.cookies.set({
      name: 'sb-refresh-token',
      value: data.session.refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log("Session cookies set for user:", data.user.email);

    return response;

  } catch (err) {
    console.error("LOGIN_ERROR", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}