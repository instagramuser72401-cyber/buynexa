"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image?: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("buynexa-wishlist") || "[]"));
    } catch {
      setItems([]);
    }
  }, []);

  function removeItem(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem("buynexa-wishlist", JSON.stringify(next));
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">❤️ Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link href="/" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-3">
              <Link href={`/product/${item.slug}`}>
                <div className="relative aspect-square bg-gray-50 rounded-lg mb-3">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <p className="font-medium line-clamp-2">{item.name}</p>
                <p className="font-bold mt-1">₹{item.price}</p>
                {item.originalPrice > item.price && (
                  <p className="text-xs text-gray-400 line-through">
                    ₹{item.originalPrice}
                  </p>
                )}
              </Link>

              <button
                onClick={() => removeItem(item.id)}
                className="w-full mt-3 border border-red-200 text-red-600 rounded-lg py-2 text-sm font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
