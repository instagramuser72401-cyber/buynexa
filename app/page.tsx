import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function getData(search?: string) {
  const [categories, featured, latest, bestsellers, searchResults] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, take: 8 }),
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
          where: { isEnabled: true, name: { contains: search, mode: "insensitive" } },
          include: { images: { take: 1 } },
          take: 24,
        })
      : Promise.resolve(null),
  ]);
  return { categories, featured, latest, bestsellers, searchResults };
}

function serializeProducts(products: any[]) {
  return products.map((p) => ({ ...p, price: Number(p.price), originalPrice: Number(p.originalPrice) }));
}

export default async function HomePage({ searchParams }: { searchParams: { search?: string } }) {
  const { categories, featured, latest, bestsellers, searchResults } = await getData(searchParams.search);

  if (searchParams.search) {
    const results = serializeProducts(searchResults || []);
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-4">
          Search results for &quot;{searchParams.search}&quot; ({results.length})
        </h1>
        {results.length === 0 ? (
          <p className="text-gray-500">No products found. Try a different search term.</p>
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
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2">BuyNexa</h1>
          <p className="text-lg sm:text-xl text-brand-100">Har Zaroorat, Ek Jagah.</p>
          <p className="mt-4 text-brand-100 max-w-xl mx-auto">
            Shop everything you need — no login, no signup. Just browse, order, and pay securely.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/?category=${cat.slug}`} className="card p-3 text-center hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-gray-700">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Featured Products" products={serializeProducts(featured)} />
      <ProductSection title="Latest Arrivals" products={serializeProducts(latest)} />
      <ProductSection title="Best Sellers" products={serializeProducts(bestsellers)} />
    </div>
  );
}

function ProductSection({ title, products }: { title: string; products: any[] }) {
  if (products.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
