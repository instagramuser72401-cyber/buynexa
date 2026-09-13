import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Configure this URL in the Razorpay Dashboard > Webhooks, subscribed to
 * "payment.captured" and "payment.failed". Set a Webhook Secret there and
 * put the same value in RAZORPAY_WEBHOOK_SECRET.
 *
 * Why both this AND /api/payment/verify? The client-side verify call can be
 * lost if the user closes the tab right after paying. The webhook is the
 * durable source of truth; verify is what makes the success page instant.
 * Both paths are idempotent (see the `payment.status === "PAID"` check).
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") || "";
  const rawBody = await req.text();

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const razorpayOrderId = event.payload?.payment?.entity?.order_id;
  if (!razorpayOrderId) return NextResponse.json({ received: true });

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) return NextResponse.json({ received: true });

  if (event.event === "payment.captured" && payment.status !== "PAID") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: event.payload.payment.entity.id,
          verifiedAt: new Date(),
        },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "PAID", orderStatus: "PAYMENT_CONFIRMED", paymentCompletedAt: new Date() },
      });
      for (const item of payment.order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
    });
  } else if (event.event === "payment.failed") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "FAILED" } });
  }

  return NextResponse.json({ received: true });
}
