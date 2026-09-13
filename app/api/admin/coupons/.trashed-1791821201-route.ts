import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const CouponSchema = z.object({
  code: z.string().min(3).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0).default(0),
  expiresAt: z.string().datetime().optional(),
  maxUsage: z.number().int().positive().optional(),
  isEnabled: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = CouponSchema.parse(await req.json());
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        minOrderAmount: body.minOrderAmount,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        maxUsage: body.maxUsage,
        isEnabled: body.isEnabled,
      },
    });
    return NextResponse.json({ coupon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid coupon data" }, { status: 400 });
  }
}
