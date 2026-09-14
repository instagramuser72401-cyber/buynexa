"use client";

import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, imageUrl: imageUrl || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create category");
      return;
    }
    setName(""); setSlug(""); setImageUrl("");
    load();
  }

  // Auto-suggest a slug from the name if the user hasn't typed one themselves.
  function handleNameChange(v: string) {
    setName(v);
    setSlug((prev) =>
      prev === "" || prev === slugify(name) ? slugify(v) : prev
    );
  }
  function slugify(v: string) {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    load();
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <form onSubmit={handleCreate} className="card p-5 mb-6 grid sm:grid-cols-3 gap-3">
        <input required placeholder="Category Name" className="input" value={name} onChange={(e) => handleNameChange(e.target.value)} />
        <input required placeholder="Slug" className="input" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input placeholder="Image/Icon URL (optional)" className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        {error && <p className="text-red-600 text-sm sm:col-span-3">{error}</p>}
        <button type="submit" className="btn-primary sm:col-span-3">Add Category</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="card p-4 text-center">
            {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-10 h-10 mx-auto mb-2 object-contain" />}
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-gray-400">/{c.slug}</p>
            <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:underline mt-2">Delete</button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-400">No categories yet.</p>}
      </div>
    </div>
  );
}
