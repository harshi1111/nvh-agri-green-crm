import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      phone,
      email,
      address,
      aadhaarLast4,
      aadhaarHash,
      consentGiven,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        name,
        phone,
        email,
        address,
        aadhaar_last4: aadhaarLast4,
        aadhaar_hash: aadhaarHash,
        consent_given: !!consentGiven,
        is_archived: false, // Ensure new customers are not archived
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/customers error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("is_archived", false); // CRITICAL: Exclude archived customers

  if (q.trim()) {
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,aadhaar_last4.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase list error", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}