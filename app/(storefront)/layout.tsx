import type { Metadata } from "next";
import { CartProvider } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Mimi's Sweet Scent",
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>

        <footer style={{ background: "var(--color-black)", color: "var(--color-white)" }}>
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            padding: "4rem 2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div>
              <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.125rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "1rem" }}>
                Mimi&apos;s Sweet Scent
              </p>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "240px" }}>
                Luxury perfumes and fine jewelry. Crafted with artistry, worn with elegance.
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1.25rem", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}>Shop</p>
              {[{ href: "/fragrances", label: "Fragrances" }, { href: "/jewelry", label: "Jewelry" }, { href: "/shop", label: "All Products" }].map(({ href, label }) => (
                <a key={href} href={href} style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: "0.625rem" }}>{label}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1.25rem", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}>Account</p>
              {[{ href: "/account/login", label: "Sign In" }, { href: "/account/register", label: "Create Account" }, { href: "/account/orders", label: "My Orders" }].map(({ href, label }) => (
                <a key={href} href={href} style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: "0.625rem" }}>{label}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "0.625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1.25rem", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}>Contact</p>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.5rem" }}>hello@mimissweetscent.com</p>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>Mon–Sat, 9am–6pm WAT</p>
            </div>
          </div>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} Mimi&apos;s Sweet Scent. All rights reserved.</p>
            <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)" }}>Secured by Paystack</p>
          </div>
        </footer>
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
