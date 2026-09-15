"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalQuantity } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(query)}`);
  }

  const isHome = pathname === "/";

  return (
    <header className={isHome ? "absolute top-0 left-0 right-0 z-50" : "sticky top-0 z-40"}>
      <div className={isHome ? "relative" : "bg-gray-950 text-white"}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="pointer-events-auto absolute top-[3.5vw] left-[3%] w-[9vw] h-[9vw] max-w-14 max-h-14 bg-transparent text-transparent"
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>
          </button>

          <Link
            href="/cart"
            className="pointer-events-auto absolute top-[3.5vw] right-[3%] w-[9vw] h-[9vw] max-w-14 max-h-14 bg-transparent text-transparent"
            aria-label="Cart"
          >
            <span className="sr-only">Cart</span>
            {totalQuantity > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>

        {isHome ? (
          <form
            onSubmit={handleSearch}
            className="pointer-events-auto absolute left-[3%] right-[3%] top-[24vw]"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
              className="w-full h-[8vw] max-h-14 min-h-11 rounded-full bg-transparent border-0 outline-none px-[8%] text-gray-900 text-base sm:text-xl"
            />
          </form>
        ) : (
          <form onSubmit={handleSearch} className="px-4 pb-4 flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full h-11 rounded-l-xl bg-white text-gray-900 px-4 outline-none"
            />
            <button type="submit" className="px-5 rounded-r-xl bg-orange-500 text-white font-bold">
              Search
            </button>
          </form>
        )}
      </div>

      {menuOpen && (
        <div className="border-b border-gray-200 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium">🏠 Home</Link>
            <Link href="/my-orders" onClick={() => setMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium">📦 My Orders</Link>
            <Link href="/track-order" onClick={() => setMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium">🚚 Track Order</Link>
            <Link href="/support" onClick={() => setMenuOpen(false)} className="block px-3 py-3 rounded-lg hover:bg-gray-50 font-medium">💬 Customer Support</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
