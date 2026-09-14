import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CANCEL_FEE = 59;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const transactionId =
      typeof body.transactionId === "string"
        ? body.transactionId.trim()
        : "";

    if (!transactionId) {
      return NextResponse.json(
        { error: "₹59 cancellation payment Transaction ID / UTR is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.orderStatus !== "PLACED") {
      return NextResponse.json(
        { error: "This order cannot be cancelled now" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "CANCELLED",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order cancelled successfully. ₹${CANCEL_FEE} cancellation/delivery charge payment recorded.`,
      cancellationFee: CANCEL_FEE,
      transactionId,
    });
  } catch (error) {
    console.error("cancel-order error:", error);

    return NextResponse.json(
      { error: "Unable to cancel order" },
      { status: 500 }
    );
  }
}
