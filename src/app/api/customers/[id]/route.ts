// src/app/api/customers/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Params = {
  params: Promise<{ id: string }>;
};

// GET /api/customers/[id]  -> used by your receipt page
export async function GET(_req: Request, context: Params) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Customer id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("customers")
    .select(
      // add or remove fields here (include age or date_of_birth when you add them)
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
export async function DELETE(_req: Request, context: Params) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Customer id is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DELETE_CUSTOMER_ERROR", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

// PUT /api/customers/[id]
export async function PUT(req: Request, context: Params) {
  const { id } = await context.params;

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
