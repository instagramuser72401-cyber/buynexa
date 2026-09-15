"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const { totalQuantity } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    router.push(`/?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10"
            aria-label="Open menu"
          >
            <span className="text-3xl leading-none">☰</span>
          </button>

          <Link href="/" className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              BuyNexa
            </div>
            <div className="text-[10px] sm:text-xs text-gray-300 -mt-1">
              Har Zaroorat, Ek Jagah.
            </div>
          </Link>

          <Link
            href="/cart"
            className="relative w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10"
            aria-label="Cart"
          >
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17" />
              <circle cx="9" cy="21" r="1" />
              <circle cx="17" cy="21" r="1" />
            </svg>

            {totalQuantity > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full h-11 px-4 rounded-l-xl bg-white text-gray-900 outline-none"
            />
            <button
              type="submit"
              className="px-5 h-11 rounded-r-xl bg-orange-500 text-white font-bold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {menuOpen && (
        <div className="border-b border-gray-200 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              🏠 Home
            </Link>

            <Link
              href="/my-orders"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              📦 My Orders
            </Link>

            <Link
              href="/track-order"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              🚚 Track Order
            </Link>

            <Link
              href="/support"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium"
            >
              💬 Customer Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
