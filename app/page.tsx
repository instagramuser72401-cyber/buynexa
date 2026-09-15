import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function getData(search?: string) {
  const [categories, featured, latest, bestsellers, searchResults] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          showOnHome: true,
        },
        orderBy: [{ homeOrder: "asc" }, { name: "asc" }],
        take: 12,
      }),

      prisma.product.findMany({
        where: { isEnabled: true, isFeatured: true },
        include: { images: { take: 1 } },
        take: 8,
      }),

      prisma.product.findMany({
        where: { isEnabled: true },
        include: { images: { take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),

      prisma.product.findMany({
        where: { isEnabled: true, isBestseller: true },
        include: { images: { take: 1 } },
        take: 8,
      }),

      search
        ? prisma.product.findMany({
            where: {
              isEnabled: true,
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            include: { images: { take: 1 } },
            take: 24,
          })
        : Promise.resolve(null),
    ]);

  return {
    categories,
    featured,
    latest,
    bestsellers,
    searchResults,
  };
}

function serializeProducts(products: any[]) {
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
  }));
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const {
    categories,
    featured,
    latest,
    bestsellers,
    searchResults,
  } = await getData(searchParams.search);

  if (searchParams.search) {
    const results = serializeProducts(searchResults || []);

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-4">
          Search results for &quot;{searchParams.search}&quot; ({results.length})
        </h1>

        {results.length === 0 ? (
          <p className="text-gray-500">
            No products found. Try a different search term.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-white">
        <img
          src="/home-banner.png"
          alt="BuyNexa"
          className="w-full h-auto block"
        />
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 py-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            Shop by Category
          </h2>

          <Link
            href="/categories"
            className="text-sm font-semibold text-orange-600"
          >
            View All →
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="card p-6 text-center text-gray-500">
            Categories coming soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-3 text-center">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {cat.name}
                  </h3>

                  {cat.offerText && (
                    <p className="mt-1 text-xs font-bold text-orange-600">
                      {cat.offerText}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Feature Banner */}
      <section className="bg-white">
        <img
          src="/feature-banner.png"
          alt="BuyNexa"
          className="w-full h-auto block"
        />
      </section>

      {/* Top Deals */}
      <div id="featured-products">
        <ProductSection
          title="Top Deals"
          products={serializeProducts(featured)}
        />

        <ProductSection
          title="Latest Arrivals"
          products={serializeProducts(latest)}
        />

        <ProductSection
          title="Best Sellers"
          products={serializeProducts(bestsellers)}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg">
        <div className="grid grid-cols-3">
          <Link
            href="/"
            className="py-3 text-center text-xs font-semibold text-orange-600"
          >
            🏠
            <span className="block mt-1">Home</span>
          </Link>

          <Link
            href="/categories"
            className="py-3 text-center text-xs font-semibold text-gray-700"
          >
            🛍️
            <span className="block mt-1">Categories</span>
          </Link>

          <Link
            href="/support"
            className="py-3 text-center text-xs font-semibold text-gray-700"
          >
            💬
            <span className="block mt-1">Support</span>
          </Link>
        </div>
      </div>

      <div className="h-20 md:hidden" />
    </div>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">
        {title}
      </span>
    </div>
  );
}

function ProductSection({
  title,
  products,
}: {
  title: string;
  products: any[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-7">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        {title}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
