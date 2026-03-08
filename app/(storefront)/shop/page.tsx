import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop All" };

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        Shop All
      </h1>
      <p style={{ color: "var(--color-gray-600)", marginTop: "1rem" }}>
        Product catalog — coming in Phase 2.
      </p>
    </div>
  );
}
