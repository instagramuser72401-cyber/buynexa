import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updates = await req.json();
  const allowed = ["name", "slug", "imageUrl", "isActive"];
  const data: any = {};
  for (const key of allowed) if (key in updates) data[key] = updates[key];

  const category = await prisma.category.update({ where: { id: params.id }, data });
  return NextResponse.json({ category });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productsInCategory = await prisma.product.count({ where: { categoryId: params.id } });
  if (productsInCategory > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${productsInCategory} product(s) still use this category` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
