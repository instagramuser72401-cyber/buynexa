import Razorpay from "razorpay";

// Server-side only. RAZORPAY_KEY_SECRET must never be exposed to the client
// (never prefix it with NEXT_PUBLIC_, never return it from an API route).
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});
