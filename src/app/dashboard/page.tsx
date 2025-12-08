"use client";

import { useEffect, useState } from "react";

type CountResponse = {
  total: number;
};

export default function DashboardPage() {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [paymentCount, setPaymentCount] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [customersRes, paymentsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/payments"),
        ]);

        const customersData = await customersRes.json();
        const paymentsData = await paymentsRes.json();

        setCustomerCount(customersData.total ?? 0);
        setPaymentCount(paymentsData.total ?? 0);

        const sum = (paymentsData.items as any[]).reduce(
          (acc, p) => acc + Number(p.amount || 0),
          0
        );
        setTotalRevenue(sum);
      } catch (err) {
        console.error("dashboard stats error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">CRM Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Overview of customers and payments.
            </p>
          </div>
        </header>

        {/* Top stats cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Total customers
            </p>
            <p className="text-3xl font-semibold">
              {loading || customerCount === null ? "…" : customerCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Total payments
            </p>
            <p className="text-3xl font-semibold">
              {loading || paymentCount === null ? "…" : paymentCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Total revenue
            </p>
            <p className="text-3xl font-semibold">
              {loading || totalRevenue === null ? "…" : `₹${totalRevenue.toFixed(2)}`}
            </p>
          </div>
        </section>

        {/* Quick links */}
        <section className="grid gap-4 md:grid-cols-2">
          <a
            href="/customers"
            className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow hover:border-emerald-500 transition-colors"
          >
            <h2 className="text-lg font-semibold mb-1">Manage customers</h2>
            <p className="text-sm text-slate-400">
              Add and view customer records with Aadhaar last-4.
            </p>
          </a>

          <a
            href="/payments"
            className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow hover:border-emerald-500 transition-colors"
          >
            <h2 className="text-lg font-semibold mb-1">Record payments</h2>
            <p className="text-sm text-slate-400">
              Link payments to customers and track revenue.
            </p>
          </a>
        </section>
      </div>
    </main>
  );
}
