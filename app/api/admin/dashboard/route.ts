import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todaysOrders,
    paidOrders,
    todaysPaidOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
      select: { totalAmount: true },
    }),
    prisma.order.count({ where: { orderStatus: { in: ["PLACED", "PAYMENT_CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] } } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
    prisma.product.count(),
  ]);

  const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const todaySales = todaysPaidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  // Low stock needs a raw comparison of two columns on the same row - Prisma
  // can't express `stock <= lowStockAlertAt` in the query builder, so we
  // fetch enabled products and filter in JS. Fine at small-to-medium catalog
  // sizes; move to a raw SQL query (`$queryRaw`) if your catalog grows large.
  const allProducts = await prisma.product.findMany({
    where: { isEnabled: true },
    select: { stock: true, lowStockAlertAt: true },
  });
  const lowStockCount = allProducts.filter((p) => p.stock <= p.lowStockAlertAt).length;

  return NextResponse.json({
    totalOrders,
    todaysOrders,
    totalSales,
    todaySales,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalProducts,
    lowStockProducts: lowStockCount,
  });
}
