import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, subject, message } = body;

    if (!customerName || !customerPhone || !message) {
      return NextResponse.json(
        { error: "Name, phone and message are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone).trim(),
        customerEmail: customerEmail ? String(customerEmail).trim() : null,
        subject: subject ? String(subject).trim() : null,
        message: String(message).trim(),
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch {
    return NextResponse.json(
      { error: "Unable to send support message" },
      { status: 500 }
    );
  }
}
