"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  subject?: string | null;
  message: string;
  reply?: string | null;
  status: string;
  createdAt: string;
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  async function loadTickets() {
    const res = await fetch("/api/admin/support", { cache: "no-store" });

    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function sendReply(ticketId: string) {
    const reply = replies[ticketId]?.trim();

    if (!reply) return;

    setSending(ticketId);

    const res = await fetch("/api/admin/support/reply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, reply }),
    });

    setSending(null);

    if (res.ok) {
      setReplies((prev) => ({ ...prev, [ticketId]: "" }));
      await loadTickets();
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customer Support</h1>
          <p className="text-gray-600 mt-1">
            Customer ke support messages yahan dekhein aur reply karein.
          </p>
        </div>

        <button
          onClick={loadTickets}
          className="px-4 py-2 rounded-lg border bg-white text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-gray-600">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="card p-6 text-gray-600">
          Abhi koi support message nahi hai.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="font-bold text-lg">
                    {ticket.subject || "Customer Support"}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    {ticket.customerName} • {ticket.customerPhone}
                  </p>

                  {ticket.customerEmail && (
                    <p className="text-sm text-gray-500">
                      {ticket.customerEmail}
                    </p>
                  )}
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    ticket.status === "REPLIED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  CUSTOMER MESSAGE
                </p>
                <p className="whitespace-pre-wrap">{ticket.message}</p>
              </div>

              {ticket.reply && (
                <div className="mt-3 bg-brand-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-brand-700 mb-1">
                    ADMIN REPLY
                  </p>
                  <p className="whitespace-pre-wrap">{ticket.reply}</p>
                </div>
              )}

              <div className="mt-4">
                <textarea
                  className="input w-full min-h-24"
                  placeholder="Customer ko reply likhiye..."
                  value={replies[ticket.id] || ""}
                  onChange={(e) =>
                    setReplies((prev) => ({
                      ...prev,
                      [ticket.id]: e.target.value,
                    }))
                  }
                />

                <button
                  onClick={() => sendReply(ticket.id)}
                  disabled={sending === ticket.id}
                  className="btn-primary mt-2"
                >
                  {sending === ticket.id ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
