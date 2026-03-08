import type { Metadata } from "next";
import { CartProvider } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Mimi's Sweet Scent",
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <AnalyticsTracker />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <ToastContainer />
    </CartProvider>
  );
}
