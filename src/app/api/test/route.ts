// src/app/api/test/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  console.log("=== TEST ENDPOINT CALLED ===");
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log("SUPABASE_URL exists:", !!supabaseUrl);
  console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseKey);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log("ERROR: Missing environment variables");
    return NextResponse.json({ 
      error: "Missing env vars",
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey
    }, { status: 500 });
  }
  
  try {
    console.log("Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .limit(1);
    
    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json({ 
        error: "Supabase error: " + error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log("SUCCESS: Supabase connection works!");
    return NextResponse.json({ 
      success: true, 
      message: "Supabase connected successfully",
      data: data
    });
    
  } catch (err) {
    console.error("EXCEPTION:", err);
    return NextResponse.json({ 
      error: "Exception: " + (err as Error).message 
    }, { status: 500 });
  }
}