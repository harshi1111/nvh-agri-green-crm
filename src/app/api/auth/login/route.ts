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
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

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

    return NextResponse.json(
      { success: true, redirectTo: "/dashboard" },
      { status: 200 }
    );
  } catch (err) {
    console.error("LOGIN_ERROR", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
} 