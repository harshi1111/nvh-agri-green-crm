import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("is_archived", true) // Only archived customers
    .order("archived_at", { ascending: false });

  if (q.trim()) {
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,aadhaar_last4.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  query = query
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase archived customers error", error);
    return NextResponse.json(
      { error: "Failed to fetch archived customers" },
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