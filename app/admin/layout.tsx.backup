"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/coupons", label: "Coupons" },
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
    <div className="flex min-h-screen">
      <aside className="w-56 bg-brand-900 text-white shrink-0 hidden sm:flex flex-col">
        <div className="p-5 font-bold text-lg border-b border-brand-800">BuyNexa Admin</div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm ${pathname === item.href ? "bg-brand-700 font-medium" : "hover:bg-brand-800 text-brand-100"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="m-3 text-sm text-brand-200 hover:text-white text-left px-3 py-2">
          Log out
        </button>
      </aside>
      <div className="flex-1 bg-gray-50">{children}</div>
    </div>
  );
}
