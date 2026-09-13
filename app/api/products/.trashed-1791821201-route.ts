import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUBLIC endpoint. Only ever select fields safe for public display.
// Never include customer/order data here.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStockOnly = searchParams.get("inStock") === "true";
  const featured = searchParams.get("featured") === "true";
  const bestseller = searchParams.get("bestseller") === "true";
  const sort = searchParams.get("sort") || "newest"; // newest | price_asc | price_desc | popularity

  const where: any = { isEnabled: true };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (inStockOnly) where.stock = { gt: 0 };
  if (featured) where.isFeatured = true;
  if (bestseller) where.isBestseller = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy: any =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "popularity"
      ? { isBestseller: "desc" } // swap for a real "unitsSold" counter in production
      : { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      originalPrice: true,
      stock: true,
      isFeatured: true,
      isBestseller: true,
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    take: 60,
  });

  return NextResponse.json({ products });
}
