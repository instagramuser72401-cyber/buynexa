import { prisma } from "./prisma";

/** Server-side delivery charge calculation - never trust a client-supplied delivery fee. */
export async function calculateDeliveryCharge(subtotal: number): Promise<number> {
  const settings = await prisma.deliverySettings.findUnique({ where: { id: "singleton" } });
  const fixed = settings ? Number(settings.fixedCharge) : 49;
  const freeAbove = settings ? Number(settings.freeDeliveryAbove) : 999;
  return subtotal >= freeAbove ? 0 : fixed;
}

/** Server-side coupon validation - never trust a client-supplied discount amount. */
export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isEnabled) return { valid: false, reason: "Invalid coupon code" };
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { valid: false, reason: "Coupon has expired" };
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage)
    return { valid: false, reason: "Coupon usage limit reached" };
  if (subtotal < Number(coupon.minOrderAmount))
    return { valid: false, reason: `Minimum order amount is ₹${coupon.minOrderAmount}` };

  const discount =
    coupon.type === "PERCENT"
      ? Math.round((subtotal * Number(coupon.value)) / 100)
      : Number(coupon.value);

  return { valid: true, coupon, discount: Math.min(discount, subtotal) };
}
