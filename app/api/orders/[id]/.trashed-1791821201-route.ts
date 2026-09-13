import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * This route is intentionally NOT indexed or linked anywhere - the only way
 * to reach it is knowing the internal order id (a long random cuid), which
 * only the customer who just placed the order receives, via the redirect
 * URL after payment. It is used for the order-success confirmation screen.
 *
 * It is NOT a substitute for the admin orders API: it is not searchable,
 * not listable, and does not appear in any public product/customer listing.
 * For anything beyond this one confirmation screen, customers must use
 * /track-order which requires BOTH order number and phone.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      items: order.items,
      deliverySummary: {
        name: order.customerName,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
      },
    },
  });
}
