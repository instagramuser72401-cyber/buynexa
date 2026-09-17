import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Valid mobile number required" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        customerPhone: {
          contains: phone.slice(-10),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
        payment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("my-orders error:", error);
    return NextResponse.json(
      { error: "Unable to load orders" },
      { status: 500 }
    );
  }
}
