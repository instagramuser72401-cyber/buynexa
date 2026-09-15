import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!product || !product.isEnabled) return null;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isEnabled: true, NOT: { id: product.id } },
    include: { images: { take: 1 } },
    take: 4,
  });

  return { product, related };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProduct(params.slug);
  if (!data) return { title: "Product not found" };
  return {
    title: data.product.name,
    description: data.product.description.slice(0, 160),
    openGraph: { images: data.product.images[0]?.url ? [data.product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();

  const { product, related } = data;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(product.price),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          specifications: (product.specifications as any) || [],
          price: Number(product.price),
          originalPrice: Number(product.originalPrice),
          stock: product.stock,
          discountDurationHours: product.discountDurationHours,
          discountStartedAt: product.discountStartedAt?.toISOString() || null,
          images: product.images.map((i) => i.url),
          category: product.category.name,
        }}
        related={related.map((p) => ({
          slug: p.slug,
          name: p.name,
          price: Number(p.price),
          originalPrice: Number(p.originalPrice),
          image: p.images[0]?.url,
        }))}
      />
    </>
  );
}
