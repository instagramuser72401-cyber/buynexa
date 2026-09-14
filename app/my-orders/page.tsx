"use client";

import { useState } from "react";

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function findOrders(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders/my-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load orders");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId: string) {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to cancel order");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, orderStatus: "CANCELLED" }
            : order
        )
      );
    } catch (err: any) {
      setError(err.message || "Unable to cancel order");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold">My Orders</h1>
        <p className="mb-6 text-sm text-gray-600">
          Enter your mobile number to see your orders.
        </p>

        <form
          onSubmit={findOrders}
          className="mb-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter mobile number"
            className="flex-1 rounded-lg border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Searching..." : "View Orders"}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && orders.length === 0 && !error && (
          <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
            Enter your mobile number to view your orders.
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                  {order.orderStatus}
                </span>
              </div>

              <div className="space-y-2 border-t pt-3">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{Number(item.unitPrice) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{Number(order.totalAmount)}</span>
                </div>

                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <p>
                    <span className="font-semibold">Payment:</span>{" "}
                    {order.payment?.method === "qr"
                      ? "Online Payment / QR"
                      : "Cash on Delivery (COD)"}
                  </p>

                  {order.payment?.method === "qr" && order.payment?.transactionId && (
                    <p className="mt-1">
                      <span className="font-semibold">Transaction ID / UTR:</span>{" "}
                      {order.payment.transactionId}
                    </p>
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-red-600">
                  No Return
                </p>
              </div>

              {order.orderStatus === "PLACED" && (
                <button
                  type="button"
                  onClick={() => cancelOrder(order.id)}
                  className="mt-4 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
