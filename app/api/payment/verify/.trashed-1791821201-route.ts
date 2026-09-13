import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const VerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

/**
 * This is the single point where an order becomes "paid".
 * Signature verification happens ONLY here, server-side, using the secret key.
 * Never trust a "payment success" message coming from client-side JS alone -
 * Checkout.js callbacks can be spoofed; this HMAC check cannot be.
 */
export async function POST(req: NextRequest) {
  try {
    const body = VerifySchema.parse(await req.json());
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Idempotency: if this payment was already verified (e.g. duplicate webhook/client call),
    // don't decrement stock twice.
    if (payment.status === "PAID") {
      return NextResponse.json({ success: true, orderNumber: payment.order.orderNumber });
    }

    // Mark paid + decrement stock atomically.
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "PAID",
          orderStatus: "PAYMENT_CONFIRMED",
          paymentCompletedAt: new Date(),
        },
      });

      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (payment.order.couponCode) {
        await tx.coupon.updateMany({
          where: { code: payment.order.couponCode },
          data: { usageCount: { increment: 1 } },
        });
      }
    });

    return NextResponse.json({ success: true, orderNumber: payment.order.orderNumber });
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.json({ error: "Verification error" }, { status: 500 });
  }
}
