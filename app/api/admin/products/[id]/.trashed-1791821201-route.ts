import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  // Whitelist fields that can be updated to avoid mass-assignment bugs.
  const allowed = [
    "name", "description", "specifications", "price", "originalPrice",
    "stock", "lowStockAlertAt", "categoryId", "isFeatured", "isBestseller", "isEnabled",
  ];
  const data: any = {};
  for (const key of allowed) if (key in updates) data[key] = updates[key];

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
