"use client";

import { useEffect, useState, useMemo } from "react";

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  aadhaarLast4: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  aadhaar_last4: string | null;
  created_at: string;
  is_archived?: boolean; // Added for archive feature
  archived_at?: string;  // Added for archive feature
};

export default function CustomersPage() {
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    email: "",
    address: "",
    aadhaarLast4: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function validateForm(values: CustomerForm): string | null {
    if (!values.name.trim()) {
      return "Name is required.";
    }

    if (!values.phone.trim()) {
      return "Phone number is required.";
    }

    const phoneDigits = values.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return "Phone number must be 10 digits.";
    }

    if (values.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(values.email)) {
        return "Please enter a valid email address.";
      }
    }

    if (values.aadhaarLast4.trim()) {
      const aadhaarPattern = /^\d{4}$/;
      if (!aadhaarPattern.test(values.aadhaarLast4)) {
        return "Aadhaar last 4 must be exactly 4 digits.";
      }
    }

    return null;
  }

  async function fetchCustomers() {
    try {
      setCustomersLoading(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      // Filter out archived customers on frontend too (just in case)
      const activeCustomers = data.items.filter((c: Customer) => !c.is_archived);
      setCustomers(activeCustomers as Customer[]);
    } catch (err) {
      console.error("fetch customers error", err);
    } finally {
      setCustomersLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors(null);

    const validationError = validateForm(form);
    if (validationError) {
      setLoading(false);
      setErrors(validationError);
      return;
    }

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
        aadhaarLast4: form.aadhaarLast4 || null,
      };

      let res: Response;

      if (editingId) {
        // update existing
        res = await fetch(`/api/customers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // create new
        res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            aadhaarHash: form.aadhaarLast4
              ? "demo-hash-" + form.aadhaarLast4
              : null,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Failed to save customer");
      } else {
        setMessage(
          editingId
            ? "Customer updated successfully"
            : "Customer created successfully"
        );
        setForm({
          name: "",
          phone: "",
          email: "",
          address: "",
          aadhaarLast4: "",
        });
        setEditingId(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error("save customer error", err);
      setMessage("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(id: string, name: string) {
    const ok = window.confirm(
      `Archive customer "${name}"? Customer will be moved to archive section.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE", // Still DELETE method, but now archives
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to archive customer");
        return;
      }

      // Remove from current view
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      alert("Customer archived successfully!");
    } catch (err) {
      console.error("archive customer error", err);
      alert("Unexpected error while archiving");
    }
  }

  function handleEdit(c: Customer) {
    setEditingId(c.id);
    setForm({
      name: c.name ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      aadhaarLast4: c.aadhaar_last4 ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((c) => {
      const haystack = [
        c.name ?? "",
        c.phone ?? "",
        c.aadhaar_last4 ?? "",
        c.email ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, search]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Card 1: form */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold mb-4">
            {editingId ? "Edit Customer" : "Create Customer"}
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Name *</label>
              <input
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone *</label>
              <input
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Address</label>
              <textarea
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Aadhaar last 4</label>
              <input
                maxLength={4}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                value={form.aadhaarLast4}
                onChange={(e) =>
                  setForm({ ...form, aadhaarLast4: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 px-4 py-2 text-sm font-medium text-slate-950 transition"
            >
              {loading
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update customer"
                : "Save customer"}
            </button>
          </form>

          {errors && (
            <p className="mt-4 text-sm text-red-300">{errors}</p>
          )}

          {message && (
            <p className="mt-2 text-sm text-emerald-300">{message}</p>
          )}
        </div>

        {/* Card 2: table */}
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Active Customers</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search name, phone, Aadhaar, email..."
                className="w-full md:w-64 rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <a
                href="/archive"
                className="rounded-md border border-amber-500/60 text-amber-300 px-3 py-2 text-xs hover:bg-amber-500/10 whitespace-nowrap"
              >
                View Archive
              </a>
            </div>
          </div>

          {customersLoading ? (
            <p className="text-sm text-slate-300">Loading...</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-sm text-slate-300">
              No active customers match the current search.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2 pr-4 text-left text-slate-300">Name</th>
                    <th className="py-2 px-4 text-left text-slate-300">
                      Phone
                    </th>
                    <th className="py-2 px-4 text-left text-slate-300">
                      Aadhaar last 4
                    </th>
                    <th className="py-2 px-4 text-left text-slate-300">
                      Created
                    </th>
                    <th className="py-2 px-4 text-left text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/40"
                    >
                      <td className="py-2 pr-4">{c.name}</td>
                      <td className="py-2 px-4">
                        {c.phone || (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {c.aadhaar_last4 || (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-slate-400 text-xs">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-xs space-x-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="rounded-md border border-slate-600 text-slate-100 px-2 py-1 hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(c.id, c.name)}
                          className="rounded-md border border-amber-500/60 text-amber-300 px-2 py-1 hover:bg-amber-500/10"
                        >
                          Archive
                        </button>
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