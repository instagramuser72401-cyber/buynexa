"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/app/product/[slug]/CountdownTimer";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  discountDurationHours: number | null;
  discountStartedAt: string | null;
  images: { url: string }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const router = useRouter();
  const discountPct = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );
  const outOfStock = product.stock <= 0;
  const image = product.images[0]?.url || "/placeholder.png";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image,
      stock: product.stock,
    });
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    handleAddToCart(e);
    router.push("/checkout");
  }

  return (
    <Link href={`/product/${product.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-gray-50">
        <Image src={image} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform" />
        {discountPct > 0 && (
          <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {discountPct}% OFF
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center font-semibold text-gray-600">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          {discountPct > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        <CountdownTimer
          durationHours={product.discountDurationHours}
          startedAt={product.discountStartedAt}
          compact
        />
        <p className={`text-xs mt-1 ${outOfStock ? "text-red-500" : "text-green-600"}`}>
          {outOfStock ? "Out of stock" : `In stock (${product.stock})`}
        </p>
        <div className="flex gap-2 mt-3">
          <button onClick={handleAddToCart} disabled={outOfStock} className="btn-secondary flex-1 !px-2 !py-2 text-xs">
            Add to Cart
          </button>
          <button onClick={handleBuyNow} disabled={outOfStock} className="btn-accent flex-1 !px-2 !py-2 text-xs">
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
