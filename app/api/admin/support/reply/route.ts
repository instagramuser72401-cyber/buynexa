import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId, reply } = await req.json();

    if (!ticketId || !reply?.trim()) {
      return NextResponse.json(
        { error: "Ticket ID and reply are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        reply: reply.trim(),
        status: "REPLIED",
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch {
    return NextResponse.json(
      { error: "Unable to send reply" },
      { status: 500 }
    );
  }
}
