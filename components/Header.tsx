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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex flex-col leading-tight shrink-0">
          <span className="text-2xl font-extrabold text-brand-700">BuyNexa</span>
          <span className="text-[11px] text-gray-500 -mt-1">Har Zaroorat, Ek Jagah.</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 hidden sm:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="input rounded-r-none"
          />
          <button type="submit" className="btn-primary rounded-l-none">
            Search
          </button>
        </form>

        <nav className="flex items-center gap-3 ml-auto">
          <Link
            href="/track-order"
            className="text-sm font-medium text-gray-700 hover:text-brand-700 whitespace-nowrap hidden sm:block"
          >
            Track Order
          </Link>

          <Link href="/cart" className="relative shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
            </svg>
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700"
            aria-label="Open menu"
          >
            <span className="text-2xl leading-none">☰</span>
          </button>
        </nav>
      </div>

      <form onSubmit={handleSearch} className="sm:hidden px-4 pb-3 flex">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="input rounded-r-none"
        />
        <button type="submit" className="btn-primary rounded-l-none">
          Go
        </button>
      </form>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
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
          </nav>
        </div>
      )}
    </header>
  );
}
