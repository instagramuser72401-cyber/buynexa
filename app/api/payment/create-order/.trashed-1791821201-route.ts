import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/orderNumber";
import { calculateDeliveryCharge, validateCoupon } from "@/lib/pricing";

const CheckoutSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().min(3).max(200),
  addressLine2: z.string().min(3).max(200),
  landmark: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().min(2).max(60).default("India"),
  couponCode: z.string().max(40).optional().or(z.literal("")),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) }))
    .min(1),
  confirmedDetails: z.literal(true, {
    errorMap: () => ({ message: "Please confirm your delivery details are correct" }),
  }),
});

/**
 * PRICING SECURITY NOTE:
 * We NEVER trust prices, discounts, or delivery charges sent from the client.
 * Every amount below is recomputed from the database inside this handler.
 */
export async function POST(req: NextRequest) {
  try {
    const body = CheckoutSchema.parse(await req.json());

    // 1. Load live product data & validate stock
    const productIds = body.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isEnabled: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
    }

    let subtotal = 0;
    const itemsForOrder = body.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`OUT_OF_STOCK:${product.name}`);
      }
      subtotal += Number(product.price) * item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
      };
    });

    // 2. Coupon (server-validated)
    let discountAmount = 0;
    if (body.couponCode) {
      const result = await validateCoupon(body.couponCode, subtotal);
      if (!result.valid) {
        return NextResponse.json({ error: result.reason }, { status: 400 });
      }
      discountAmount = result.discount!;
    }

    // 3. Delivery charge (server-validated)
    const deliveryCharge = await calculateDeliveryCharge(subtotal - discountAmount);

    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
    const amountInPaise = Math.round(totalAmount * 100);

    // 4. Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: generateOrderNumber(),
    });

    // 5. Create our Order + Payment record as PENDING.
    // Stock is NOT reduced yet - only after payment is verified (see /api/payment/verify).
    const order = await prisma.order.create({
      data: {
        orderNumber: rzpOrder.receipt as string,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail || null,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        landmark: body.landmark || null,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        country: body.country,
        subtotal,
        discountAmount,
        deliveryCharge,
        totalAmount,
        couponCode: body.couponCode || null,
        items: { create: itemsForOrder },
        payment: {
          create: {
            razorpayOrderId: rzpOrder.id,
            amount: totalAmount,
            status: "PENDING",
          },
        },
      },
    });

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      internalOrderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err: any) {
    if (typeof err.message === "string" && err.message.startsWith("OUT_OF_STOCK:")) {
      return NextResponse.json(
        { error: `${err.message.split(":")[1]} is out of stock` },
        { status: 400 }
      );
    }
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 400 });
  }
}
