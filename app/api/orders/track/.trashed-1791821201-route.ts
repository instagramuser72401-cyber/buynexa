import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TrackSchema = z.object({
  orderNumber: z.string().min(4),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/),
});

/**
 * PRIVACY: a customer can only see an order if they know BOTH the order
 * number AND the phone number used to place it. Never allow lookup by
 * order number alone - that would let anyone enumerate other people's
 * orders/addresses just by guessing sequential IDs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = TrackSchema.parse(await req.json());

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: body.orderNumber.trim().toUpperCase(),
        customerPhone: body.customerPhone,
      },
      select: {
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        totalAmount: true,
        deliveryCharge: true,
        discountAmount: true,
        city: true,
        state: true,
        // Deliberately return only a city/state summary here, not the full
        // street address - full address is for the order-success page the
        // customer sees right after checkout, and for Admin only.
        items: {
          select: { productName: true, quantity: true, unitPrice: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
