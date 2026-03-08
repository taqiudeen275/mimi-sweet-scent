import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", marginBottom: "1.5rem" }}>
        Products
      </h2>
      <p style={{ color: "var(--color-gray-600)" }}>Product management — coming in Phase 4.</p>
    </div>
  );
}
