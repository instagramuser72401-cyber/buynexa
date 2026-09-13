"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const searchParams = useSearchParams();
  const failed = searchParams.get("status") === "failed";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (failed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✕</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">Your payment could not be verified. No amount has been charged if this happened before confirmation.</p>
        <Link href="/checkout" className="btn-primary inline-block">Try Again</Link>
      </div>
    );
  }

  if (loading) return <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">Loading your order...</div>;
  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Order not found</h1>
        <Link href="/" className="btn-primary inline-block mt-4">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-brand-700">Order Placed Successfully!</h1>
        <p className="text-gray-500 mt-1">Thank you, {order.deliverySummary.name}. Your order is confirmed.</p>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Order ID</span>
          <span className="font-bold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Order Date</span>
          <span>{new Date(order.createdAt).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment Status</span>
          <span className="font-semibold text-green-600">{order.paymentStatus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Delivering to</span>
          <span>{order.deliverySummary.city}, {order.deliverySummary.state} - {order.deliverySummary.pincode}</span>
        </div>

        <div className="border-t pt-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{Number(item.unitPrice) * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total Paid</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        Save your Order ID <strong>{order.orderNumber}</strong> to track your order anytime.
      </p>

      <div className="flex gap-3 mt-6">
        <Link href="/track-order" className="btn-secondary flex-1 text-center">Track Order</Link>
        <Link href="/" className="btn-primary flex-1 text-center">Continue Shopping</Link>
      </div>
    </div>
  );
}
