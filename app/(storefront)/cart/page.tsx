import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        Your Cart
      </h1>
      <p style={{ color: "var(--color-gray-600)", marginTop: "1rem" }}>
        Cart and checkout — coming in Phase 2.
      </p>
    </div>
  );
}
