"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const initialForm = {
  customerName: "", customerPhone: "", customerEmail: "",
  addressLine1: "", addressLine2: "", landmark: "",
  city: "", state: "", pincode: "", country: "India",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500">Add some products before checking out.</p>
      </div>
    );
  }

  function updateField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!confirmed) {
      setError("Please confirm your delivery details are correct.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          transactionId: paymentMethod === "ONLINE" ? transactionId : "",
          confirmedDetails: true,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/order-success/${data.internalOrderId}`);

    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      <form onSubmit={handlePay} className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-sm text-gray-500 -mt-3">No account needed — checkout as a guest.</p>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Delivery Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Full Name" className="input" value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
            <input required placeholder="Mobile Number" className="input" value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} />
          </div>
          <input type="email" placeholder="Email Address (optional)" className="input" value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} />
          <input required placeholder="House / Flat / Building" className="input" value={form.addressLine1} onChange={(e) => updateField("addressLine1", e.target.value)} />
          <input required placeholder="Street / Area" className="input" value={form.addressLine2} onChange={(e) => updateField("addressLine2", e.target.value)} />
          <input placeholder="Landmark (optional)" className="input" value={form.landmark} onChange={(e) => updateField("landmark", e.target.value)} />
          <div className="grid sm:grid-cols-3 gap-4">
            <input required placeholder="City" className="input" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            <input required placeholder="State" className="input" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
            <input required placeholder="Pincode" className="input" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
          </div>
          <input required placeholder="Country" className="input" value={form.country} onChange={(e) => updateField("country", e.target.value)} />

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />
            I confirm that my delivery details are correct.
          </label>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-3">Payment Method</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
              />
              <div>
                <p className="font-semibold">Online Payment / QR</p>
                <p className="text-xs text-gray-500">Scan the QR code below to pay using any UPI app.</p>
              </div>
            </label>

            {paymentMethod === "ONLINE" && (
              <div className="border rounded-lg p-4 text-center">
                <img
                  src="/payment-qr.png"
                  alt="BuyNexa Online Payment QR"
                  className="w-64 h-auto mx-auto rounded-lg"
                />
                <p className="font-semibold mt-3">Scan & Pay</p>
                <p className="text-sm text-gray-600 mt-1">
                  First pay the exact order amount using the QR code above.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  After payment, enter your name, mobile number and Transaction ID / UTR below.
                </p>

                <div className="mt-4 text-left space-y-3">
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    placeholder="Name"
                    required
                    className="w-full rounded-lg border px-4 py-3"
                  />
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => updateField("customerPhone", e.target.value)}
                    placeholder="Mobile Number"
                    required
                    className="w-full rounded-lg border px-4 py-3"
                  />
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction ID / UTR"
                    required
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <div>
                <p className="font-semibold">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when your order is delivered.</p>
              </div>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        <button type="submit" disabled={loading} className="btn-accent w-full text-lg">
          {loading
            ? "Processing..."
            : paymentMethod === "COD"
              ? "Place Order — Cash on Delivery"
              : "Pay Online / QR"}
        </button>
      </form>

      <div className="card p-5 h-fit">
        <h2 className="font-bold mb-4">Order Summary</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm mb-2">
            <span className="line-clamp-1">{item.name} × {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
  <p className="font-semibold text-gray-900">
    Final Price = Product Price + Delivery Charge
  </p>
  <p className="mt-1 text-gray-600">
    Jo total amount yahan show hoga, wahi final payable amount hai.
    Delivery charge isi total mein included hai.
  </p>
  <p className="mt-1 font-semibold text-red-600">
    Order cancel karne par ₹59 delivery/cancellation charge compulsory pay karna hoga.
  </p>
</div>
      </div>
    </div>
  );
}
