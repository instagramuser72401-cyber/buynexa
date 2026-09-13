import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      specifications: true,
      price: true,
      originalPrice: true,
      stock: true,
      sku: true,
      images: { select: { url: true }, orderBy: { sortOrder: "asc" } },
      category: { select: { name: true, slug: true } },
      isEnabled: true,
    },
  });

  if (!product || !product.isEnabled) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const related = await prisma.product.findMany({
    where: { categoryId: undefined, isEnabled: true, NOT: { id: product.id } },
    select: {
      slug: true,
      name: true,
      price: true,
      originalPrice: true,
      images: { select: { url: true }, take: 1 },
    },
    take: 4,
  });

  return NextResponse.json({ product, related });
}
