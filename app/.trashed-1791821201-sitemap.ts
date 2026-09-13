import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL as string;
  const products = await prisma.product.findMany({
    where: { isEnabled: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/track-order`, lastModified: new Date() },
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
