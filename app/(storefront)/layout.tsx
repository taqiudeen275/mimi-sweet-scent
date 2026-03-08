import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mimi's Sweet Scent",
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-white)" }}>
      {/* Navigation — will be built in Phase 2 */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ borderColor: "var(--color-gray-200)", background: "var(--color-white)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="/"
            className="tracking-widest uppercase text-sm font-semibold"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.1rem",
              color: "var(--color-black)",
              letterSpacing: "0.15em",
            }}
          >
            Mimi&apos;s Sweet Scent
          </a>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase">
            <a href="/fragrances" style={{ color: "var(--color-black)" }}>Fragrances</a>
            <a href="/jewelry" style={{ color: "var(--color-black)" }}>Jewelry</a>
            <a href="/shop" style={{ color: "var(--color-black)" }}>Shop All</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/cart" aria-label="Cart" style={{ color: "var(--color-black)" }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </a>
            <a href="/account/login" aria-label="Account" style={{ color: "var(--color-black)" }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer — will be built in Phase 2 */}
      <footer
        className="border-t py-12"
        style={{
          borderColor: "var(--color-gray-200)",
          background: "var(--color-black)",
          color: "var(--color-gray-200)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="tracking-widest uppercase text-xs mb-2"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem" }}
          >
            Mimi&apos;s Sweet Scent
          </p>
          <p className="text-xs" style={{ color: "var(--color-gray-600)" }}>
            © {new Date().getFullYear()} Mimi&apos;s Sweet Scent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
