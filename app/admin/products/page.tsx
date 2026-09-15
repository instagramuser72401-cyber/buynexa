"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  sku: "", name: "", slug: "", description: "", price: "", originalPrice: "",
  stock: "", lowStockAlertAt: "5", discountDurationHours: "15", categoryId: "", images: "", isFeatured: false,
  isBestseller: false, isEnabled: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadData() {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]);
    setProducts(pRes.products || []);
    setCategories(cRes.categories || []);
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        lowStockAlertAt: Number(form.lowStockAlertAt),
        discountDurationHours: Number(form.discountDurationHours),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create product");
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    loadData();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    const res = await fetch(`/api/admin/products/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        lowStockAlertAt: Number(form.lowStockAlertAt),
        discountDurationHours: Number(form.discountDurationHours),
        categoryId: form.categoryId,
        isFeatured: form.isFeatured,
        isBestseller: form.isBestseller,
        isEnabled: form.isEnabled,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update product");
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    loadData();
  }

  function startEdit(p: any) {
    setEditingId(p.id);
    setForm({
      sku: p.sku || "",
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      originalPrice: String(p.originalPrice ?? ""),
      stock: String(p.stock ?? ""),
      lowStockAlertAt: String(p.lowStockAlertAt ?? 5),
      discountDurationHours: String(p.discountDurationHours ?? 15),
      categoryId: p.categoryId || "",
      images: Array.isArray(p.images) ? p.images.join(", ") : "",
      isFeatured: !!p.isFeatured,
      isBestseller: !!p.isBestseller,
      isEnabled: p.isEnabled !== false,
    });
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(false);
  }

  async function toggleField(id: string, field: string, value: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    loadData();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => editingId ? cancelForm() : setShowForm((s) => !s)} className="bg-green-600 text-white px-5 py-3 rounded-lg font-bold cursor-pointer shadow-md">
          {showForm ? "Cancel" : "＋ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={editingId ? handleEdit : handleCreate} className="card p-5 mb-6 grid sm:grid-cols-2 gap-3">
          <input required placeholder="SKU" className="input" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          <input required placeholder="Name" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input required placeholder="Slug (url-friendly)" className="input" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <select required className="input" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required type="number" placeholder="Selling Price" className="input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          <input required type="number" placeholder="Original Price (MRP)" className="input" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} />
          <input required type="number" placeholder="Stock Quantity" className="input" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          <input type="number" placeholder="Low Stock Alert At" className="input" value={form.lowStockAlertAt} onChange={(e) => setForm((f) => ({ ...f, lowStockAlertAt: e.target.value }))} />
          <input type="number" min="1" placeholder="Discount Countdown (Hours)" className="input" value={form.discountDurationHours} onChange={(e) => setForm((f) => ({ ...f, discountDurationHours: e.target.value }))} />
          <textarea required placeholder="Description" className="input sm:col-span-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <input required type="url" placeholder="Image URL (https://...)" className="input sm:col-span-2" value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBestseller} onChange={(e) => setForm((f) => ({ ...f, isBestseller: e.target.checked }))} /> Bestseller</label>
          {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
          <button type="submit" className="btn-primary sm:col-span-2">{editingId ? "Save Changes" : "Create Product"}</button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Bestseller</th>
              <th className="p-3">Enabled</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">₹{p.price} <span className="text-gray-400 line-through text-xs">₹{p.originalPrice}</span></td>
                <td className={`p-3 ${p.stock <= p.lowStockAlertAt ? "text-red-600 font-semibold" : ""}`}>{p.stock}</td>
                <td className="p-3"><input type="checkbox" checked={p.isFeatured} onChange={(e) => toggleField(p.id, "isFeatured", e.target.checked)} /></td>
                <td className="p-3"><input type="checkbox" checked={p.isBestseller} onChange={(e) => toggleField(p.id, "isBestseller", e.target.checked)} /></td>
                <td className="p-3"><input type="checkbox" checked={p.isEnabled} onChange={(e) => toggleField(p.id, "isEnabled", e.target.checked)} /></td>
                <td className="p-3"><div className="flex gap-3"><button onClick={() => startEdit(p)} className="text-blue-600 hover:underline">Edit</button><button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:underline">Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-gray-400 p-4">No products yet.</p>}
      </div>
    </div>
  );
}
// deployment refresh
