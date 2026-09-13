import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(1),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  stock: z.number().int().min(0),
  lowStockAlertAt: z.number().int().min(0).default(5),
  categoryId: z.string(),
  images: z.array(z.string().url()).min(1),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = ProductSchema.parse(await req.json());
    const product = await prisma.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        slug: body.slug,
        description: body.description,
        specifications: body.specifications || [],
        price: body.price,
        originalPrice: body.originalPrice,
        stock: body.stock,
        lowStockAlertAt: body.lowStockAlertAt,
        categoryId: body.categoryId,
        isFeatured: body.isFeatured,
        isBestseller: body.isBestseller,
        isEnabled: body.isEnabled,
        images: { create: body.images.map((url, i) => ({ url, sortOrder: i })) },
      },
    });
    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid product data" }, { status: 400 });
  }
}
