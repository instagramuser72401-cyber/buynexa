"use client";

import { useEffect, useState } from "react";

const emptyForm = { code: "", type: "PERCENT", value: "", minOrderAmount: "0", expiresAt: "", maxUsage: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Could not create coupon"); return; }
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function toggleEnabled(id: string, isEnabled: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isEnabled }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary !px-4 !py-2 text-sm">
          {showForm ? "Cancel" : "+ Add Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-6 grid sm:grid-cols-3 gap-3">
          <input required placeholder="Coupon Code (e.g. WELCOME10)" className="input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="PERCENT">Percentage off</option>
            <option value="FIXED">Fixed amount off</option>
          </select>
          <input required type="number" placeholder={form.type === "PERCENT" ? "e.g. 10 (for 10%)" : "Amount in ₹"} className="input" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          <input type="number" placeholder="Minimum order amount (₹)" className="input" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
          <input type="date" placeholder="Expiry date" className="input" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          <input type="number" placeholder="Max usage (optional)" className="input" value={form.maxUsage} onChange={(e) => setForm((f) => ({ ...f, maxUsage: e.target.value }))} />
          {error && <p className="text-red-600 text-sm sm:col-span-3">{error}</p>}
          <button type="submit" className="btn-primary sm:col-span-3">Create Coupon</button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Enabled</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-3">₹{c.minOrderAmount}</td>
                <td className="p-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                <td className="p-3">{c.usageCount}{c.maxUsage ? ` / ${c.maxUsage}` : ""}</td>
                <td className="p-3"><input type="checkbox" checked={c.isEnabled} onChange={(e) => toggleEnabled(c.id, e.target.checked)} /></td>
                <td className="p-3"><button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="text-gray-400 p-4">No coupons yet.</p>}
      </div>
    </div>
  );
}
