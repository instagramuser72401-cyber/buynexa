import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { homeOrder: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <section className="max-w-7xl mx-auto px-4 py-7">
        <h1 className="text-2xl font-bold mb-5">All Categories</h1>

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
                    <div className="text-gray-400 text-sm">No Image</div>
                  )}
                </div>

                <div className="p-3 text-center">
                  <h2 className="font-semibold text-gray-800 text-sm">
                    {cat.name}
                  </h2>

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
    </main>
  );
}
