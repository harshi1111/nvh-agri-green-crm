import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET single payment
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`🔍 GET /api/payments/${id} - Fetching single payment`);
    
    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        customers (
          id,
          name,
          phone,
          email,
          address,
          aadhaar_last4
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("❌ Error fetching payment:", error);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    console.log("✅ Payment found:", {
      id: data.id,
      invoice_no: data.invoice_no,
      customer: data.customers?.name || "No customer"
    });

    const response = {
      id: data.id,
      customer_id: data.customer_id,
      amount: data.amount,
      payment_mode: data.payment_mode || "cash",
      invoice_no: data.invoice_no,
      bank_name: data.bank_name,
      cheque_no: data.cheque_no,
      ifsc_code: data.ifsc_code,
      cheque_date: data.cheque_date,
      account_no: data.account_no,
      created_at: data.created_at,
      customer: data.customers ? {
        name: data.customers.name || "Customer",
        phone: data.customers.phone || null,
        email: data.customers.email || null,
        address: data.customers.address || null,
        aadhaar_last4: data.customers.aadhaar_last4 || null
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("💥 Error in GET /api/payments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE payment
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`🗑️ DELETE /api/payments/${id} - Deleting payment`);
    
    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Error deleting payment:", error);
      return NextResponse.json(
        { error: "Failed to delete payment" },
        { status: 500 }
      );
    }

    console.log("✅ Payment deleted successfully:", id);
    return NextResponse.json(
      { success: true, message: "Payment deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("💥 Error in DELETE /api/payments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}