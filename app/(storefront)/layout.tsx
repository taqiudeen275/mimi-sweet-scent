import type { Metadata } from "next";
import { CartProvider } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Mimi's Sweet Scent",
};

const FOOTER_KEYS = [
  "siteName", "tagline", "contactEmail", "contactPhone", "contactAddress",
  "whatsappNumber", "instagramUrl", "facebookUrl", "tiktokUrl", "twitterUrl",
  "pinterestUrl", "copyrightText",
];

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // Fetch footer settings — fail gracefully
  const settings: Record<string, string> = {};
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: FOOTER_KEYS } } });
    for (const row of rows) {
      try { settings[row.key] = String(JSON.parse(row.value)); } catch { settings[row.key] = row.value; }
    }
  } catch {
    // DB unavailable — Footer uses its built-in defaults
  }

  return (
    <CartProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <AnalyticsTracker />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer settings={settings} />
      </div>
      <CartDrawer />
      <ToastContainer />
    </CartProvider>
  );
}
