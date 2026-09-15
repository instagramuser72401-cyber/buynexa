"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CountdownTimer from "./CountdownTimer";

type Product = {
  id: string; slug: string; name: string; description: string;
  specifications: { key: string; value: string }[];
  price: number; originalPrice: number; stock: number; images: string[]; category: string; discountDurationHours: number | null; discountStartedAt: string | null;
};

export default function ProductDetailClient({ product, related }: { product: Product; related: any[] }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const discountPct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("buynexa-wishlist") || "[]");
      setIsWishlisted(saved.some((item: any) => item.id === product.id));
    } catch {}
  }, [product.id]);

  function toggleWishlist() {
    const saved = JSON.parse(localStorage.getItem("buynexa-wishlist") || "[]");
    const exists = saved.some((item: any) => item.id === product.id);

    const next = exists
      ? saved.filter((item: any) => item.id !== product.id)
      : [
          ...saved,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
          },
        ];

    localStorage.setItem("buynexa-wishlist", JSON.stringify(next));
    setIsWishlisted(!exists);
  }

  async function shareProduct() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on BuyNexa`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Product link copied!");
    }
  }

  function addToCart() {
    addItem(
      {
        productId: product.id, name: product.name, slug: product.slug,
        price: product.price, originalPrice: product.originalPrice,
        image: product.images[0], stock: product.stock,
      },
      qty
    );
  }

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square card overflow-hidden">
            <Image src={product.images[activeImg] || "/placeholder.png"} alt={product.name} fill className="object-contain p-6" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-16 rounded-lg border ${i === activeImg ? "border-brand-600" : "border-gray-200"}`}>
                  <Image src={img} alt="" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-brand-600 font-medium">{product.category}</p>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={shareProduct}
                aria-label="Share product"
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold shadow-sm hover:bg-gray-50"
              >
                ↗️ Share
              </button>
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`h-10 w-10 rounded-xl border flex items-center justify-center text-xl shadow-sm ${
                  isWishlisted
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-200 bg-white text-gray-500 hover:text-red-500"
                }`}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>
          </div>

          <CountdownTimer
            durationHours={product.discountDurationHours}
            startedAt={product.discountStartedAt}
          />

          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-3xl font-extrabold">₹{product.price}</span>
            {discountPct > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                <span className="text-accent-600 font-semibold">{discountPct}% off</span>
              </>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${outOfStock ? "text-red-500" : "text-green-600"}`}>
            {outOfStock ? "Out of Stock" : `In Stock — ${product.stock} available`}
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

          {!outOfStock && (
            <div className="flex items-center gap-3 mt-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100">-</button>
                <span className="px-4">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100">+</button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={addToCart} disabled={outOfStock} className="btn-secondary flex-1">Add to Cart</button>
            <button onClick={buyNow} disabled={outOfStock} className="btn-accent flex-1">Buy Now</button>
          </div>

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
            <p className="font-bold text-gray-900">Important Rules</p>
            <p className="mt-1 text-gray-700">
              Product par jo price dikh raha hai, wahi final payable price hai.
              Delivery charge isi price mein included hai.
            </p>
            <p className="mt-1 font-semibold text-red-600">
              Example: Product ₹399 = Final Payable ₹399 (delivery charge included).
            </p>
            <p className="mt-1 font-semibold text-red-600">
              Order cancel karne par ₹59 delivery/cancellation charge compulsory pay karna hoga.
            </p>
          </div>

          {product.specifications?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold mb-2">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 text-gray-500 w-1/3">{spec.key}</td>
                      <td className="py-2 text-gray-800">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="card p-3 hover:shadow-md">
                <div className="relative aspect-square bg-gray-50 rounded-lg mb-2">
                  <Image src={p.image || "/placeholder.png"} alt={p.name} fill className="object-contain p-2" />
                </div>
                <p className="text-sm line-clamp-2">{p.name}</p>
                <p className="font-bold">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
