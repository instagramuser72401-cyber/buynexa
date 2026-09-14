import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, payment: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderStatus } = await req.json();
  if (!VALID_STATUSES.includes(orderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { orderStatus },
  });

  return NextResponse.json({ order });
}

    
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: { orderId: params.id },
    });

    await tx.order.delete({
      where: { id: params.id },
    });
  });

  return NextResponse.json({ success: true });
}
