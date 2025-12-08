// src/app/api/customers/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// === MODULE LEVEL DEBUGGING ===
console.log("=== API ROUTE LOADING ===");
console.log("SUPABASE_URL from env:", !!process.env.SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_URL from env:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_ANON_KEY from env:", !!process.env.SUPABASE_ANON_KEY);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY from env:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// FIX: Use regular env vars (not NEXT_PUBLIC_) for API routes
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log for debugging (remove in production)
if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Missing Supabase environment variables");
  console.error("supabaseUrl:", supabaseUrl);
  console.error("supabaseKey:", supabaseKey ? "Set (hidden)" : "Missing");
} else {
  console.log("Supabase credentials OK");
}

let supabase: SupabaseClient | null = null; // FIXED: Add type annotation
try {
  supabase = createClient(
    supabaseUrl!,
    supabaseKey!
  );
  console.log("Supabase client created successfully");
} catch (err) {
  console.error("FAILED to create Supabase client:", err);
  supabase = null;
}
// === END DEBUGGING ===

// GET /api/customers/[id]  -> used by your receipt page
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }  // FIXED: Use Promise
) {
  // Check if supabase client exists
  if (!supabase) {
    console.error("GET: No Supabase client available");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { id } = await context.params;  // FIXED: Await the Promise

  console.log("GET request for customer ID:", id);

  if (!id) {
    return NextResponse.json(
      { error: "Customer id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, name, phone, email, address, aadhaar_last4, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("GET_CUSTOMER_ERROR", error);
    return NextResponse.json(
      { error: "Customer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

// DELETE /api/customers/[id]
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }  // FIXED: Use Promise
) {
  try {
    // Check if supabase client exists
    if (!supabase) {
      console.error("DELETE: No Supabase client available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { id } = await context.params;  // FIXED: Await the Promise

    console.log("=== DELETE ATTEMPT START ===");
    console.log("Customer ID:", id);
    console.log("Supabase URL:", supabaseUrl ? "Set" : "Missing");
    console.log("Supabase Key:", supabaseKey ? "Set" : "Missing");

    if (!id) {
      console.log("ERROR: No ID provided");
      return NextResponse.json(
        { error: "Customer id is required" },
        { status: 400 }
      );
    }

    console.log("Calling Supabase delete...");
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("SUPABASE DELETE ERROR:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: "Failed to delete customer: " + error.message },
        { status: 500 }
      );
    }

    console.log("=== DELETE SUCCESSFUL ===");
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (err) {
    console.error("UNEXPECTED DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Unexpected server error: " + (err as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id]
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }  // FIXED: Use Promise
) {
  // Check if supabase client exists
  if (!supabase) {
    console.error("PUT: No Supabase client available");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { id } = await context.params;  // FIXED: Await the Promise

  console.log("PUT request for customer ID:", id);

  if (!id) {
    return NextResponse.json(
      { error: "Customer id is required" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { name, phone, email, address, aadhaarLast4 } = body;

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      phone,
      email,
      address,
      aadhaar_last4: aadhaarLast4 ?? null,
    })
    .eq("id", id);

  if (error) {
    console.error("UPDATE_CUSTOMER_ERROR", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}