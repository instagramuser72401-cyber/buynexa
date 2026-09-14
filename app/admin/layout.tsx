"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/support", label: "Customer Support" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="font-bold text-lg">
            BuyNexa Admin
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm text-brand-100 hover:text-white px-3 py-2"
          >
            Log out
          </button>
        </div>

        <nav className="max-w-7xl mx-auto px-3 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                  pathname === item.href
                    ? "bg-brand-700 font-medium"
                    : "text-brand-100 hover:bg-brand-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="w-full">{children}</main>
    </div>
  );
}
