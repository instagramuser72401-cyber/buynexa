import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Very basic in-memory rate limiting per-IP (fine for a single instance;
// swap for Redis/Upstash if you deploy to multiple serverless regions).
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const record = attempts.get(ip);
  if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = LoginSchema.parse(await req.json());

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const passwordOk = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!admin || !passwordOk) {
      attempts.set(ip, {
        count: (record?.resetAt > now ? record.count : 0) + 1,
        resetAt: record?.resetAt > now ? record.resetAt : now + WINDOW_MS,
      });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    attempts.delete(ip);

    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

    const token = signAdminToken({ adminId: admin.id, email: admin.email, role: admin.role });

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours, matches JWT expiry
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
