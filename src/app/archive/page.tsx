"use client";

import { useEffect, useState, useMemo } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  aadhaar_last4: string | null;
  created_at: string;
  archived_at: string;
  is_archived: boolean;
};

export default function ArchivePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function fetchArchivedCustomers() {
    try {
      setLoading(true);
      const res = await fetch("/api/customers/archived");
      if (!res.ok) {
        // If endpoint doesn't exist, fetch all and filter
        const allRes = await fetch("/api/customers");
        const allData = await allRes.json();
        
        let customerArray: any[] = [];
        if (Array.isArray(allData)) {
          customerArray = allData;
        } else if (allData && Array.isArray(allData.items)) {
          customerArray = allData.items;
        }
        
        // Filter archived customers manually
        const archivedCustomers = customerArray.filter((c: any) => c.is_archived);
        setCustomers(archivedCustomers as Customer[]);
        return;
      }
      
      const data = await res.json();
      let customerArray: any[] = [];
      
      if (Array.isArray(data)) {
        customerArray = data;
      } else if (data && Array.isArray(data.items)) {
        customerArray = data.items;
      }
      
      setCustomers(customerArray as Customer[]);
    } catch (err) {
      console.error("fetch archived customers error", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  async function restoreCustomer(id: string, name: string) {
    const ok = window.confirm(
      `Restore customer "${name}"? They will be moved back to active customers.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/customers/${id}/restore`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to restore customer");
        return;
      }

      setMessage(`Customer "${name}" restored successfully!`);
      // Remove from current view
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("restore customer error", err);
      alert("Unexpected error while restoring");
    }
  }

  useEffect(() => {
    fetchArchivedCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((c) => {
      const haystack = [
        c.name ?? "",
        c.phone ?? "",
        c.aadhaar_last4 ?? "",
        c.email ?? "",
        c.address ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, search]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header card */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Customer Archive</h1>
              <p className="text-sm text-slate-400">
                Archived customers are hidden from main views but their data is preserved.
                Payments linked to archived customers remain accessible.
              </p>
            </div>
            <a
              href="/customers"
              className="rounded-md border border-slate-600 text-slate-100 px-4 py-2 hover:bg-slate-700 text-sm whitespace-nowrap"
            >
              ← Back to Active Customers
            </a>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-md">
              <p className="text-sm text-emerald-300">{message}</p>
            </div>
          )}
        </div>

        {/* Table card */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Archived Customers</h2>
              <p className="text-xs text-slate-400 mt-1">
                {filteredCustomers.length} archived customers
              </p>
            </div>
            <input
              type="text"
              placeholder="Search archived customers..."
              className="w-full md:w-64 rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-300">Loading archived customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-300 mb-2">No archived customers found.</p>
              <p className="text-sm text-slate-500">
                {search ? "Try a different search term." : "Customers you archive will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 pr-4 text-left text-slate-300">Customer</th>
                    <th className="py-3 px-4 text-left text-slate-300">Contact</th>
                    <th className="py-3 px-4 text-left text-slate-300">Aadhaar</th>
                    <th className="py-3 px-4 text-left text-slate-300">Created</th>
                    <th className="py-3 px-4 text-left text-slate-300">Archived</th>
                    <th className="py-3 px-4 text-left text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/40"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium">{c.name}</div>
                        {c.address && (
                          <div className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                            {c.address}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {c.phone && (
                            <div className="text-slate-300">{c.phone}</div>
                          )}
                          {c.email && (
                            <div className="text-xs text-slate-400">{c.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {c.aadhaar_last4 ? (
                          <span className="font-mono">****{c.aadhaar_last4}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {c.archived_at ? (
                          new Date(c.archived_at).toLocaleDateString()
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => restoreCustomer(c.id, c.name)}
                          className="rounded-md border border-emerald-500/60 text-emerald-300 px-3 py-1 text-xs hover:bg-emerald-500/10"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-3">About Customer Archive</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">✓</span>
              <span>Archived customers are hidden from main customer lists</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">✓</span>
              <span>Payments linked to archived customers remain accessible</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-2">✓</span>
              <span>Restored customers reappear in active customer lists</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">!</span>
              <span>Archiving is reversible - no data is permanently deleted</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}