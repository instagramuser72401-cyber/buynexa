import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("cancel-order error:", error);

    return NextResponse.json(
      { error: "Unable to cancel order" },
      { status: 500 }
    );
  }
}
