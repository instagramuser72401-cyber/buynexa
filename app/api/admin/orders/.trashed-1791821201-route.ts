import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * PRIVACY-CRITICAL ENDPOINT.
 * This is the only API route in the whole app that returns customer
 * name / phone / email / full address. It is gated by requireAdmin()
 * on every call - there is no public equivalent of this route.
 */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber") || undefined;
  const customerName = searchParams.get("customerName") || undefined;
  const customerPhone = searchParams.get("customerPhone") || undefined;
  const city = searchParams.get("city") || undefined;
  const pincode = searchParams.get("pincode") || undefined;
  const paymentStatus = searchParams.get("paymentStatus") || undefined;
  const orderStatus = searchParams.get("orderStatus") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  const where: any = {};
  if (orderNumber) where.orderNumber = { contains: orderNumber, mode: "insensitive" };
  if (customerName) where.customerName = { contains: customerName, mode: "insensitive" };
  if (customerPhone) where.customerPhone = { contains: customerPhone };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (pincode) where.pincode = pincode;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (orderStatus) where.orderStatus = orderStatus;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}
