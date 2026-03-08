import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", marginBottom: "1.5rem" }}>
        Customers
      </h2>
      <p style={{ color: "var(--color-gray-600)" }}>Customer management — coming in Phase 4.</p>
    </div>
  );
}
