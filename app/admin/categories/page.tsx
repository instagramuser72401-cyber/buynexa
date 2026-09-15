"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  offerText?: string | null;
  showOnHome: boolean;
  homeOrder: number;
  isActive: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [offerText, setOfferText] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    const data = await res.json();
    setCategories(data.categories || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        imageUrl: imageUrl || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Could not create category");
      return;
    }

    setName("");
    setSlug("");
    setImageUrl("");
    setOfferText("");
    load();
  }

  function handleNameChange(v: string) {
    setName(v);
    setSlug((prev) =>
      prev === "" || prev === slugify(name) ? slugify(v) : prev
    );
  }

  function slugify(v: string) {
    return v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Could not update category");
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data.category } : c))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    load();
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <form
        onSubmit={handleCreate}
        className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <input
          required
          placeholder="Category Name"
          className="input"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />

        <input
          required
          placeholder="Slug"
          className="input"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <input
          placeholder="Category Image URL"
          className="input"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          placeholder="Offer Text e.g. Up to 55% OFF"
          className="input"
          value={offerText}
          onChange={(e) => setOfferText(e.target.value)}
        />

        {error && (
          <p className="text-red-600 text-sm sm:col-span-2 lg:col-span-4">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-4">
          Add Category
        </button>
      </form>

      <div className="space-y-4">
        {categories.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {c.imageUrl && (
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="w-20 h-20 object-contain rounded-lg border"
                />
              )}

              <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Category Name</label>
                  <input
                    className="input w-full"
                    value={c.name}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((x) =>
                          x.id === c.id ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                    onBlur={(e) =>
                      updateCategory(c.id, { name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Image URL</label>
                  <input
                    className="input w-full"
                    value={c.imageUrl || ""}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((x) =>
                          x.id === c.id
                            ? { ...x, imageUrl: e.target.value }
                            : x
                        )
                      )
                    }
                    onBlur={(e) =>
                      updateCategory(c.id, { imageUrl: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Offer Text</label>
                  <input
                    className="input w-full"
                    placeholder="Up to 55% OFF"
                    value={c.offerText || ""}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((x) =>
                          x.id === c.id
                            ? { ...x, offerText: e.target.value }
                            : x
                        )
                      )
                    }
                    onBlur={(e) =>
                      updateCategory(c.id, { offerText: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Home Order</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={c.homeOrder}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((x) =>
                          x.id === c.id
                            ? { ...x, homeOrder: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    onBlur={(e) =>
                      updateCategory(c.id, {
                        homeOrder: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={c.showOnHome}
                    onChange={(e) =>
                      updateCategory(c.id, {
                        showOnHome: e.target.checked,
                      })
                    }
                  />
                  Show on Home
                </label>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Slug: /{c.slug}
            </p>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-400">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
