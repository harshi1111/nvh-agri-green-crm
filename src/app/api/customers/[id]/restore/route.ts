import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Customer id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("customers")
      .update({
        is_archived: false,
        archived_at: null
      })
      .eq("id", id);

    if (error) {
      console.error("RESTORE_CUSTOMER_ERROR", error);
      return NextResponse.json(
        { error: "Failed to restore customer: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Customer restored successfully" 
    }, { status: 200 });
    
  } catch (err) {
    console.error("UNEXPECTED RESTORE ERROR:", err);
    return NextResponse.json(
      { error: "Unexpected server error: " + (err as Error).message },
      { status: 500 }
    );
  }
}