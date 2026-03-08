import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div>
      <h2
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", marginBottom: "1.5rem" }}
      >
        Dashboard
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: "—" },
          { label: "Total Orders", value: "—" },
          { label: "New Customers", value: "—" },
          { label: "Active Products", value: "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-6 bg-white border"
            style={{ borderColor: "var(--color-gray-200)" }}
          >
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-gray-600)" }}>
              {label}
            </p>
            <p
              className="text-2xl"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300 }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm" style={{ color: "var(--color-gray-600)" }}>
        Full dashboard analytics — coming in Phase 4.
      </p>
    </div>
  );
}
