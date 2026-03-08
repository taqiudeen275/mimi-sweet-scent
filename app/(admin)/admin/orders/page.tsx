import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", marginBottom: "1.5rem" }}>
        Orders
      </h2>
      <p style={{ color: "var(--color-gray-600)" }}>Order management — coming in Phase 4.</p>
    </div>
  );
}
