"use client";

import { useState } from "react";

export default function SupportPage() {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSent(false);

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
      setForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        subject: "",
        message: "",
      });
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Customer Support</h1>
      <p className="text-gray-600 mb-6">
        Koi bhi question, problem ya help chahiye to message bhejiye.
      </p>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <input
          className="input w-full"
          placeholder="Your Name"
          required
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        />

        <input
          className="input w-full"
          placeholder="Mobile Number"
          required
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
        />

        <input
          className="input w-full"
          type="email"
          placeholder="Email (optional)"
          value={form.customerEmail}
          onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
        />

        <input
          className="input w-full"
          placeholder="Subject (optional)"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />

        <textarea
          className="input w-full min-h-40"
          placeholder="Apni problem ya message yahan likhiye..."
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        {sent && (
          <p className="text-green-600 font-medium">
            Message successfully sent. Hum jaldi reply karenge.
          </p>
        )}
      </form>
    </main>
  );
}
