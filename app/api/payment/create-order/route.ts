import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orderNumber";
import { calculateDeliveryCharge } from "@/lib/pricing";

const CheckoutSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().min(1).max(200),
  landmark: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().min(2).max(60).default("India"),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  items: z
    .array(z.object({
      productId: z.string(),
      quantity: z.number().int().min(1).max(20),
    }))
    .min(1),
  confirmedDetails: z.literal(true, {
    errorMap: () => ({ message: "Please confirm your delivery details are correct" }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = CheckoutSchema.parse(await req.json());

    const productIds = body.items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isEnabled: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable" },
        { status: 400 }
      );
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

    const deliveryCharge = await calculateDeliveryCharge(subtotal);
    const totalAmount = Math.max(0, subtotal + deliveryCharge);
    const amountInPaise = Math.round(totalAmount * 100);

    // COD: create order directly without Razorpay
    if (body.paymentMethod === "COD") {
      const orderNumber = generateOrderNumber();

      const order = await prisma.order.create({
        data: {
          orderNumber,
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
          discountAmount: 0,
          deliveryCharge,
          totalAmount,
          couponCode: null,
          paymentStatus: "PENDING",
          orderStatus: "PLACED",

          items: {
            create: itemsForOrder,
          },

          payment: {
            create: {
              razorpayOrderId: null,
              amount: totalAmount,
              status: "PENDING",
              method: "cod",
            },
          },
        },
      });

      // Reserve/decrement stock for COD immediately.
      await prisma.$transaction(
        itemsForOrder.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      return NextResponse.json({
        success: true,
        paymentMethod: "COD",
        internalOrderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    // Online payment: create Razorpay order
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
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
        discountAmount: 0,
        deliveryCharge,
        totalAmount,
        couponCode: null,
        paymentStatus: "PENDING",
        orderStatus: "PLACED",
        items: { create: itemsForOrder },
        payment: {
          create: {
            razorpayOrderId: null,
            amount: totalAmount,
            status: "PENDING",
            method: "qr",
          },
        },
      },
    });

    await prisma.$transaction(
      itemsForOrder.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    return NextResponse.json({
      success: true,
      paymentMethod: body.paymentMethod,
      internalOrderId: order.id,
      orderNumber: order.orderNumber,
      amount: amountInPaise,
      currency: "INR",
    });

  } catch (err: any) {
    if (
      typeof err.message === "string" &&
      err.message.startsWith("OUT_OF_STOCK:")
    ) {
      return NextResponse.json(
        { error: `${err.message.split(":")[1]} is out of stock` },
        { status: 400 }
      );
    }

    console.error("create-order error:", err);

    return NextResponse.json(
      { error: "Could not create order" },
      { status: 400 }
    );
  }
}
