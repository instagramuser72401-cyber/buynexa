import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { isEnabled } = await req.json();
  const coupon = await prisma.coupon.update({ where: { id: params.id }, data: { isEnabled } });
  return NextResponse.json({ coupon });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
