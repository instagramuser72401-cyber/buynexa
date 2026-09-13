"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({totalQuantity} items)</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex gap-4 items-center">
              <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg">
                <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-medium hover:text-brand-700 line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500">₹{item.price} each</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-sm text-red-500 hover:underline">Remove</button>
                </div>
              </div>
              <div className="font-bold">₹{item.price * item.quantity}</div>
            </div>
          ))}
          <Link href="/" className="text-brand-700 font-medium text-sm hover:underline">&larr; Continue Shopping</Link>
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal ({totalQuantity} items)</span>
            <span>₹{subtotal}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Delivery charges & discounts calculated at checkout.</p>
          <Link href="/checkout" className="btn-primary w-full block text-center">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
