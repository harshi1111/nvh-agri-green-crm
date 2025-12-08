import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/payments?page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error, count } = await supabase
      .from("payments")
      .select(
        `
        *,
        customers (
          id,
          name,
          phone,
          email
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    
    console.log("PAYMENTS_GET_ERROR", error);
    if (error) {
      console.error("Supabase payments list error", error);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    // Transform data to include customer name
    const items = (data || []).map(payment => ({
      id: payment.id,
      customer_id: payment.customer_id,
      amount: payment.amount,
      payment_mode: payment.payment_mode || "cash",
      invoice_no: payment.invoice_no || null,
      bank_name: payment.bank_name || null,
      cheque_no: payment.cheque_no || null,
      ifsc_code: payment.ifsc_code || null,
      cheque_date: payment.cheque_date || null,
      account_no: payment.account_no || null,
      created_at: payment.created_at,
      // Add customer info for frontend
      customer_name: payment.customers?.name || "Unknown Customer",
      customer_phone: payment.customers?.phone || null,
      customer_email: payment.customers?.email || null
    }));

    return NextResponse.json({
      items: items,
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Payments GET error", err);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      customer_id, 
      amount, 
      payment_mode,
      // Cheque/Bank fields
      bank_name,
      cheque_no,
      ifsc_code,
      cheque_date,
      account_no
    } = body;

    if (!customer_id || !amount || !payment_mode) {
      return NextResponse.json(
        { error: "customer_id, amount and payment_mode are required" },
        { status: 400 }
      );
    }

    // Validate cheque fields when payment_mode is "cheque"
    if (payment_mode === "cheque") {
      if (!bank_name || !cheque_no || !cheque_date) {
        return NextResponse.json(
          { error: "Bank name, cheque number and cheque date are required for cheque payments" },
          { status: 400 }
        );
      }
    }

    // Simple invoice number generator
    const invoiceNo = `INV-${Date.now()}`;

    const paymentData: any = {
      customer_id,
      amount,
      payment_mode,
      invoice_no: invoiceNo,
    };

    // Add cheque/bank fields only if provided
    if (bank_name) paymentData.bank_name = bank_name;
    if (cheque_no) paymentData.cheque_no = cheque_no;
    if (ifsc_code) paymentData.ifsc_code = ifsc_code;
    if (cheque_date) paymentData.cheque_date = cheque_date;
    if (account_no) paymentData.account_no = account_no;

    const { data, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select(
        `
        *,
        customers (
          id,
          name,
          phone,
          email
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase payments insert error", error);
      return NextResponse.json(
        { error: "Failed to create payment" },
        { status: 500 }
      );
    }

    // Return payment with customer data
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
      customer_name: data.customers?.name || "Customer",
      customer_phone: data.customers?.phone || null
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Payments POST error", err);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}