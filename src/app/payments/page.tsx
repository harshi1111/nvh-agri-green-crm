"use client";

import { useEffect, useState, useMemo } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
};

type PaymentForm = {
  customer_id: string;
  amount: string;
  payment_mode: "cash" | "cheque" | "upi" | "bank";
  bank_name: string;
  cheque_no: string;
  ifsc_code: string;
  cheque_date: string;
  account_no: string;
};

type Payment = {
  id: string;
  customer_id: string;
  amount: number;
  payment_mode: string;
  invoice_no: string | null;
  bank_name: string | null;
  cheque_no: string | null;
  ifsc_code: string | null;
  cheque_date: string | null;
  account_no: string | null;
  created_at: string;
  customer_name?: string;
  customer_phone?: string | null;
};

type DateFilter = "all" | "today" | "custom";
type ModeFilter = "all" | "cash" | "cheque" | "upi" | "bank";

// List of Indian banks for dropdown
const INDIAN_BANKS = [
  "Select Bank",
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Axis Bank",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "Indian Bank",
  "Central Bank of India",
  "IndusInd Bank",
  "Kotak Mahindra Bank",
  "IDBI Bank",
  "Yes Bank",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",
  "Federal Bank",
  "IDFC First Bank",
  "Bandhan Bank",
  "South Indian Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "Dhanlaxmi Bank",
  "DCB Bank",
  "RBL Bank",
  "Jana Small Finance Bank",
  "Equitas Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "ESAF Small Finance Bank",
  "Suryoday Small Finance Bank",
  "Fincare Small Finance Bank",
  "North East Small Finance Bank",
  "Utkarsh Small Finance Bank",
  "Shivalik Small Finance Bank",
  "Other Bank"
];

export default function PaymentsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rawPayments, setRawPayments] = useState<Payment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PaymentForm>({
    customer_id: "",
    amount: "",
    payment_mode: "cash",
    bank_name: "Select Bank", // Default to "Select Bank"
    cheque_no: "",
    ifsc_code: "",
    cheque_date: "",
    account_no: ""
  });

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  useEffect(() => {
    fetchCustomers();
    fetchPayments();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        console.error("Failed to fetch customers", res.status);
        return;
      }
      
      const data = await res.json();
      
      // Handle different response structures
      let customerArray: any[] = [];
      
      if (Array.isArray(data)) {
        // If API returns direct array
        customerArray = data;
      } else if (data && Array.isArray(data.items)) {
        // If API returns { items: [...] }
        customerArray = data.items;
      } else if (data && Array.isArray(data.customers)) {
        // If API returns { customers: [...] }
        customerArray = data.customers;
      }
      
      const formattedCustomers = customerArray
        .map((c: any) => ({
          id: c.id || "",
          // Try different possible name fields
          name: c.name || 
                `${c.first_name || ""} ${c.last_name || ""}`.trim() || 
                c.email || 
                "Unknown Customer",
          phone: c.phone || c.phone_number || c.mobile || null,
          is_archived: c.is_archived || false, // Get archive status
        }))
        .filter((c: any) => 
          c.id && !c.is_archived // CRITICAL: Filter out archived customers
        ); // Remove customers without ID
      
      setCustomers(formattedCustomers);
    } catch (err) {
      console.error("fetch customers for payments error", err);
      setCustomers([]); // Set empty array on error
    }
  }

  async function fetchPayments() {
    try {
      setListLoading(true);
      const res = await fetch("/api/payments");
      if (!res.ok) {
        console.error("Failed to fetch payments", res.status);
        return;
      }
      
      const data = await res.json();
      
      // Handle different response structures
      let paymentArray: any[] = [];
      
      if (Array.isArray(data)) {
        // If API returns direct array
        paymentArray = data;
      } else if (data && Array.isArray(data.items)) {
        // If API returns { items: [...] }
        paymentArray = data.items;
      } else if (data && Array.isArray(data.payments)) {
        // If API returns { payments: [...] }
        paymentArray = data.payments;
      }
      
      // Ensure we have proper Payment objects
      const formattedPayments: Payment[] = paymentArray.map((p: any) => ({
        id: p.id || "",
        customer_id: p.customer_id || "",
        amount: Number(p.amount) || 0,
        payment_mode: p.payment_mode || p.method || "cash",
        invoice_no: p.invoice_no || null,
        bank_name: p.bank_name || null,
        cheque_no: p.cheque_no || null,
        ifsc_code: p.ifsc_code || null,
        cheque_date: p.cheque_date || null,
        account_no: p.account_no || null,
        created_at: p.created_at || new Date().toISOString(),
      }));
      
      setRawPayments(formattedPayments);
    } catch (err) {
      console.error("fetch payments error", err);
      setRawPayments([]); // Set empty array on error
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    if (!customers.length || !rawPayments.length) {
      setPayments(rawPayments.map(p => ({
        ...p,
        customer_name: "Unknown customer",
        customer_phone: null
      })));
      return;
    }
    
    const customerById = new Map(customers.map((c) => [c.id, c] as const));
    const enriched = rawPayments.map((p) => {
      const c = customerById.get(p.customer_id);
      return {
        ...p,
        customer_name: c?.name ?? "Unknown customer",
        customer_phone: c?.phone ?? null,
      };
    });
    setPayments(enriched);
  }, [customers, rawPayments]);

  function validateForm(values: PaymentForm): string | null {
    if (!values.customer_id) return "Please select a customer.";
    if (!values.amount.trim()) return "Amount is required.";
    const amountNumber = Number(values.amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      return "Amount must be a positive number.";
    }
    
    if (values.payment_mode === "cheque") {
      if (!values.bank_name.trim() || values.bank_name === "Select Bank") {
        return "Bank name is required for cheque payments.";
      }
      if (!values.cheque_no.trim()) return "Cheque number is required.";
      if (!values.cheque_date.trim()) return "Cheque date is required.";
    }
    
    if (values.payment_mode === "bank") {
      if (!values.bank_name.trim() || values.bank_name === "Select Bank") {
        return "Bank name is required for bank transfers.";
      }
    }
    
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const validationError = validateForm(form);
    if (validationError) {
      setLoading(false);
      setError(validationError);
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: form.customer_id,
          amount: Number(form.amount),
          payment_mode: form.payment_mode,
          bank_name: form.bank_name === "Select Bank" ? null : form.bank_name,
          cheque_no: form.cheque_no || null,
          ifsc_code: form.ifsc_code || null,
          cheque_date: form.cheque_date || null,
          account_no: form.account_no || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create payment");
      } else {
        setMessage("Payment recorded successfully");
        setForm({ 
          customer_id: "", 
          amount: "", 
          payment_mode: "cash",
          bank_name: "Select Bank",
          cheque_no: "",
          ifsc_code: "",
          cheque_date: "",
          account_no: ""
        });
        fetchPayments();
      }
    } catch (err) {
      console.error("create payment error", err);
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();

    const fromDate = customFrom && dateFilter === "custom"
      ? new Date(customFrom + "T00:00:00")
      : null;
    const toDate = customTo && dateFilter === "custom"
      ? new Date(customTo + "T23:59:59")
      : null;

    return payments
      .filter((p) => {
        if (q) {
          const haystack = [
            p.customer_name ?? "",
            p.customer_phone ?? "",
            p.invoice_no ?? "",
            p.amount.toString(),
            p.bank_name ?? "",
            p.cheque_no ?? "",
            p.ifsc_code ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        if (modeFilter !== "all" && p.payment_mode.toLowerCase() !== modeFilter)
          return false;

        const created = new Date(p.created_at);

        if (dateFilter === "today") {
          const sameDay =
            created.getDate() === now.getDate() &&
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear();
          if (!sameDay) return false;
        } else if (dateFilter === "custom") {
          if (fromDate && created < fromDate) return false;
          if (toDate && created > toDate) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [payments, search, dateFilter, modeFilter, customFrom, customTo]);

  const totalAmount = useMemo(
    () => filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    [filteredPayments]
  );

  // Loading state
  if (listLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-300">Loading payments...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        {/* Card 1: payment form */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold mb-4">Record Payment</h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Customer *</label>
              <select
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.customer_id}
                onChange={(e) =>
                  setForm({ ...form, customer_id: e.target.value })
                }
                disabled={customers.length === 0}
              >
                <option value="">Select customer</option>
                {customers.length === 0 ? (
                  <option value="" disabled>Loading customers...</option>
                ) : (
                  customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.phone ? ` (${c.phone})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Payment mode *</label>
              <select
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.payment_mode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment_mode: e.target.value as PaymentForm["payment_mode"],
                  })
                }
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank transfer</option>
              </select>
            </div>

            {/* CHEQUE PAYMENT FIELDS */}
            {form.payment_mode === "cheque" && (
              <div className="space-y-4 p-4 border border-slate-700 rounded-md bg-slate-950/50">
                <h3 className="text-sm font-medium text-slate-300">Cheque Details</h3>
                
                <div>
                  <label className="block text-sm mb-1">Bank Name *</label>
                  <select
                    className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    value={form.bank_name}
                    onChange={(e) =>
                      setForm({ ...form, bank_name: e.target.value })
                    }
                  >
                    {INDIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  {form.bank_name === "Select Bank" && (
                    <p className="text-xs text-amber-400 mt-1">Please select a bank</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Cheque No *</label>
                    <input
                      type="text"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.cheque_no}
                      onChange={(e) =>
                        setForm({ ...form, cheque_no: e.target.value })
                      }
                      placeholder="Enter cheque number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Cheque Date *</label>
                    <input
                      type="date"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.cheque_date}
                      onChange={(e) =>
                        setForm({ ...form, cheque_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">IFSC Code</label>
                    <input
                      type="text"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.ifsc_code}
                      onChange={(e) =>
                        setForm({ ...form, ifsc_code: e.target.value })
                      }
                      placeholder="Bank IFSC code (e.g., SBIN0001234)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Account No</label>
                    <input
                      type="text"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.account_no}
                      onChange={(e) =>
                        setForm({ ...form, account_no: e.target.value })
                      }
                      placeholder="Account number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BANK TRANSFER FIELDS */}
            {form.payment_mode === "bank" && (
              <div className="space-y-4 p-4 border border-slate-700 rounded-md bg-slate-950/50">
                <h3 className="text-sm font-medium text-slate-300">Bank Transfer Details</h3>
                
                <div>
                  <label className="block text-sm mb-1">Bank Name *</label>
                  <select
                    className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    value={form.bank_name}
                    onChange={(e) =>
                      setForm({ ...form, bank_name: e.target.value })
                    }
                  >
                    {INDIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  {form.bank_name === "Select Bank" && (
                    <p className="text-xs text-amber-400 mt-1">Please select a bank</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">IFSC Code</label>
                    <input
                      type="text"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.ifsc_code}
                      onChange={(e) =>
                        setForm({ ...form, ifsc_code: e.target.value })
                      }
                      placeholder="Bank IFSC code (e.g., HDFC0001234)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Account No *</label>
                    <input
                      type="text"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.account_no}
                      onChange={(e) =>
                        setForm({ ...form, account_no: e.target.value })
                      }
                      placeholder="Account number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Transaction ID</label>
                    <input
                      type="text"
                      className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      value={form.cheque_no} // Reusing cheque_no field for transaction ID
                      onChange={(e) =>
                        setForm({ ...form, cheque_no: e.target.value })
                      }
                      placeholder="Bank transaction reference"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || customers.length === 0}
              className="w-full mt-2 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 px-4 py-2 text-sm font-medium text-slate-950 transition"
            >
              {loading ? "Saving..." : "Record payment"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          {message && (
            <p className="mt-2 text-sm text-emerald-300">{message}</p>
          )}
        </div>

        {/* Card 2: payments table + filters */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Payments</h2>
              <p className="text-xs text-slate-400 mt-1">
                {filteredPayments.length} payments · Total{" "}
                <span className="font-semibold">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                placeholder="Search name, phone, invoice, cheque no..."
                className="w-full md:w-64 rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="flex flex-wrap gap-2 justify-end items-center">
                {[
                  { id: "all", label: "All" },
                  { id: "today", label: "Today" },
                  { id: "custom", label: "Custom" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDateFilter(opt.id as DateFilter)}
                    className={`px-2 py-1 rounded-full text-[11px] border ${
                      dateFilter === opt.id
                        ? "bg-emerald-500 text-slate-950 border-emerald-500"
                        : "bg-slate-900 text-slate-300 border-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                <select
                  className="rounded-full bg-slate-900 border border-slate-700 px-2 py-1 text-[11px]"
                  value={modeFilter}
                  onChange={(e) =>
                    setModeFilter(e.target.value as ModeFilter)
                  }
                >
                  <option value="all">All modes</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>
          </div>

          {dateFilter === "custom" && (
            <div className="flex flex-wrap gap-3 mb-4 text-xs items-center">
              <span className="text-slate-400">From</span>
              <input
                type="date"
                className="rounded-md bg-slate-950 border border-slate-700 px-2 py-1"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                className="rounded-md bg-slate-950 border border-slate-700 px-2 py-1"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}

          {filteredPayments.length === 0 ? (
            <p className="text-sm text-slate-300">
              No payments found. {payments.length === 0 ? "Try recording a payment first." : "Try changing your filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2 pr-4 text-left text-slate-300">Customer</th>
                    <th className="py-2 px-4 text-left text-slate-300">Amount</th>
                    <th className="py-2 px-4 text-left text-slate-300">Mode</th>
                    <th className="py-2 px-4 text-left text-slate-300">Cheque/Bank Details</th>
                    <th className="py-2 px-4 text-left text-slate-300">Date</th>
                    <th className="py-2 px-4 text-left text-slate-300">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-4">
                        <div className="flex flex-col">
                          <span>{p.customer_name}</span>
                          {p.customer_phone && (
                            <span className="text-xs text-slate-400">
                              {p.customer_phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 font-mono">
                        ₹{p.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-100 text-xs">
                          {p.payment_mode.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-xs">
                        {p.payment_mode === "cheque" && p.cheque_no && (
                          <div className="space-y-1">
                            <div>Cheque: {p.cheque_no}</div>
                            {p.bank_name && <div>Bank: {p.bank_name}</div>}
                            {p.cheque_date && (
                              <div>Date: {new Date(p.cheque_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        )}
                        {p.payment_mode === "bank" && p.bank_name && (
                          <div className="space-y-1">
                            <div>Bank: {p.bank_name}</div>
                            {p.account_no && <div>A/c: ****{p.account_no.slice(-4)}</div>}
                            {p.cheque_no && <div>Ref: {p.cheque_no}</div>}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-xs text-slate-400">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-xs">
                        <a
                          href={`/receipt/${p.id}`}
                          className="text-emerald-400 hover:text-emerald-300 underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}