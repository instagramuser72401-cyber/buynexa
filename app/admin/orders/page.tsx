"use client";

import { useEffect, useState, useCallback } from "react";

const STATUSES = ["PLACED", "PAYMENT_CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState({ orderNumber: "", customerName: "", customerPhone: "", city: "", pincode: "", orderStatus: "", paymentStatus: "", period: "" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { period, ...apiFilters } = filters;
    const params = new URLSearchParams(Object.entries(apiFilters).filter(([, v]) => v) as any);

    if (period) {
      const now = new Date();
      const from = new Date(now);

      if (period === "today") {
        from.setHours(0, 0, 0, 0);
      } else if (period === "week") {
        const day = from.getDay();
        const diff = day === 0 ? 6 : day - 1;
        from.setDate(from.getDate() - diff);
        from.setHours(0, 0, 0, 0);
      } else if (period === "month") {
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
      }

      params.set("dateFrom", from.toISOString());
      params.set("dateTo", now.toISOString());
    }

    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);



  useEffect(() => {
    if (loading || orders.length === 0) return;

    const newestOrderIds = orders
      .filter((order) => Date.now() - new Date(order.createdAt).getTime() <= 5 * 60 * 1000)
      .map((order) => order.id);

    const saved = new Set(newOrderIds);
    const updated = [...newOrderIds];

    newestOrderIds.forEach((id) => {
      if (!saved.has(id)) updated.push(id);
    });

    if (updated.length !== newOrderIds.length) {
      setNewOrderIds(updated);
      localStorage.setItem("buynexa-new-order-ids", JSON.stringify(updated));
    }
  }, [orders, loading]);


  async function updateStatus(orderId: string, orderStatus: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
    fetchOrders();
  }

  async function deleteOrder(orderId: string, orderNumber: string) {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setExpanded(null);
      fetchOrders();
    } else {
      alert("Could not delete order.");
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input placeholder="Order ID" className="input !py-2 text-sm" value={filters.orderNumber} onChange={(e) => setFilters((f) => ({ ...f, orderNumber: e.target.value }))} />
        <input placeholder="Customer name" className="input !py-2 text-sm" value={filters.customerName} onChange={(e) => setFilters((f) => ({ ...f, customerName: e.target.value }))} />
        <input placeholder="Phone" className="input !py-2 text-sm" value={filters.customerPhone} onChange={(e) => setFilters((f) => ({ ...f, customerPhone: e.target.value }))} />
        <input placeholder="City" className="input !py-2 text-sm" value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} />
        <input placeholder="Pincode" className="input !py-2 text-sm" value={filters.pincode} onChange={(e) => setFilters((f) => ({ ...f, pincode: e.target.value }))} />
        <select className="input !py-2 text-sm" value={filters.period} onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value }))}>
          <option value="">All orders</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select className="input !py-2 text-sm" value={filters.orderStatus} onChange={(e) => setFilters((f) => ({ ...f, orderStatus: e.target.value }))}>
          <option value="">Any order status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input !py-2 text-sm" value={filters.paymentStatus} onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}>
          <option value="">Any payment status</option>
          {["PENDING", "PAID", "FAILED", "CANCELLED"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!loading && newOrderIds.filter((id) => orders.some((o) => o.id === id)).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">New Orders</h2>
          <div className="space-y-3">
            {orders.filter((order) => newOrderIds.includes(order.id)).map((order) => (
              <div key={order.id} className="card p-4 border-2 border-orange-400">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                  onClick={() => {
                    setExpanded(expanded === order.id ? null : order.id);
                    const updated = newOrderIds.filter((id) => id !== order.id);
                    setNewOrderIds(updated);
                    localStorage.setItem("buynexa-new-order-ids", JSON.stringify(updated));
                  }}
                >
                  <div>
                    <span className="font-bold">{order.orderNumber}</span>
                    <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">NEW</span>
                    <span className="text-sm text-gray-500 ml-3">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <span className="font-bold">₹{order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-3">All Orders</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <span className="font-bold">{order.orderNumber}</span>
                  <span className="text-sm text-gray-500 ml-3">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="font-bold">₹{order.totalAmount}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-4 pt-4 border-t grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Customer (Admin only)</p>
                    <p>{order.customerName}</p>
                    <p>{order.customerPhone}</p>
                    {order.customerEmail && <p>{order.customerEmail}</p>}
                    <p className="mt-2 font-semibold">Delivery Address</p>
                    <p>{order.addressLine1}, {order.addressLine2}</p>
                    {order.landmark && <p>Landmark: {order.landmark}</p>}
                    <p>{order.city}, {order.state} - {order.pincode}</p>
                    <p>{order.country}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Items</p>
                    {order.items.map((item: any) => (
                      <p key={item.id}>{item.productName} × {item.quantity} — ₹{Number(item.unitPrice) * item.quantity}</p>
                    ))}
                    <p className="mt-2">Subtotal: ₹{order.subtotal}</p>
                    <p>Discount: -₹{order.discountAmount}</p>
                    <p>Delivery: ₹{order.deliveryCharge}</p>
                    <p className="font-bold">Total: ₹{order.totalAmount}</p>
                    {order.payment?.razorpayPaymentId && <p className="text-xs text-gray-400 mt-1">Payment ID: {order.payment.razorpayPaymentId}</p>}

                    <div className="mt-3">
                      <label className="text-xs text-gray-500 block mb-1">Order Status</label>
                      <select
                        className="input !py-2 text-sm"
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id, order.orderNumber)}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Delete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-400">No orders match these filters.</p>}
        </div>
      )}
    </div>
  );
}
