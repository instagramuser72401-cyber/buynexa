import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_JWT_SECRET as string;
const COOKIE_NAME = "buynexa_admin_session";

if (!SECRET) {
  console.warn("WARNING: ADMIN_JWT_SECRET is not set. Set it in your .env file.");
}

export type AdminTokenPayload = { adminId: string; email: string; role: string };

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

/**
 * Call at the top of every protected /api/admin/* route.
 * Returns null if the request is not an authenticated admin.
 * This is the single choke point that guards all customer-private data
 * (names, phone numbers, addresses, order details) - see PRIVACY note in README.
 */
export function requireAdmin(req: NextRequest): AdminTokenPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
