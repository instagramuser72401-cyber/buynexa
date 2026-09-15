import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isEnabled: true },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  const products = category.products.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
  }));

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="card overflow-hidden">
          {category.imageUrl && (
            <div className="w-full bg-gray-50 flex justify-center">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}

          <div className="p-5 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {category.name}
            </h1>

            {category.offerText && (
              <p className="mt-2 text-lg font-semibold text-orange-600">
                {category.offerText}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <h2 className="text-xl font-bold mb-4">
          {category.name} Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">
            No products available in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
