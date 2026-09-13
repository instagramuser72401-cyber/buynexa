"use client";

import { useState } from "react";

const STATUS_STEPS = [
  "PLACED", "PAYMENT_CONFIRMED", "PROCESSING", "PACKED",
  "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED",
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, customerPhone: phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isCancelled = order?.orderStatus === "CANCELLED";
  const currentStepIndex = STATUS_STEPS.indexOf(order?.orderStatus);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Track Your Order</h1>
      <p className="text-gray-500 mb-6">Enter your Order ID and the mobile number used at checkout.</p>

      <form onSubmit={handleTrack} className="card p-5 space-y-4">
        <input required placeholder="Order ID (e.g. BXN-20260912-4821)" className="input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <input required placeholder="Mobile Number" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Searching..." : "Track Order"}</button>
      </form>

      {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-4 text-sm">{error}</p>}

      {order && (
        <div className="card p-5 mt-6">
          <div className="flex justify-between mb-4">
            <span className="font-bold">{order.orderNumber}</span>
            <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
          </div>

          {isCancelled ? (
            <p className="text-red-600 font-semibold">This order was cancelled.</p>
          ) : (
            <div className="space-y-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${i <= currentStepIndex ? "bg-brand-600" : "bg-gray-200"}`} />
                  <span className={i <= currentStepIndex ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t mt-4 pt-4">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm mb-1">
                <span>{item.productName} × {item.quantity}</span>
                <span>₹{Number(item.unitPrice) * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Delivering to {order.city}, {order.state}</p>
          </div>
        </div>
      )}
    </div>
  );
}
