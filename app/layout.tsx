import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "BuyNexa - Har Zaroorat, Ek Jagah.",
    template: "%s | BuyNexa",
  },
  description:
    "BuyNexa - your one-stop online store for every need. Shop as a guest, no login required, secure payments via Razorpay.",
  openGraph: {
    title: "BuyNexa - Har Zaroorat, Ek Jagah.",
    description: "Shop everything you need, no account required.",
    siteName: "BuyNexa",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-brand-900 text-brand-100 mt-16 py-10">
            <div className="max-w-7xl mx-auto px-4 text-sm">
              <p className="font-bold text-white text-lg">BuyNexa</p>
              <p className="text-brand-200 mb-4">Har Zaroorat, Ek Jagah.</p>
              <div className="mb-4 flex flex-wrap gap-4">
                <a href="/terms" className="text-brand-200 hover:text-white underline">
                  Terms & Conditions
                </a>
              </div>
              <p className="text-brand-300">&copy; {new Date().getFullYear()} BuyNexa. All rights reserved.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
