"use client";

import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-gray-400">Loading...</div>;

  const cards = [
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Today's Orders", value: stats.todaysOrders },
    { label: "Total Sales", value: `₹${stats.totalSales}` },
    { label: "Today's Sales", value: `₹${stats.todaySales}` },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Completed Orders", value: stats.completedOrders },
    { label: "Cancelled Orders", value: stats.cancelledOrders },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Low Stock Products", value: stats.lowStockProducts, warn: stats.lowStockProducts > 0 },
  ];

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.warn ? "text-red-600" : "text-gray-900"}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
