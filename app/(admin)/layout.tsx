import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin — Mimi's Sweet Scent",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-cream)" }}>
      {/* Sidebar — will be built in Phase 4 */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col border-r"
        style={{ background: "var(--color-black)", borderColor: "#2a2a2a" }}
      >
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: "#2a2a2a" }}>
          <span
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            MSS Admin
          </span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 text-sm">
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/products", label: "Products" },
            { href: "/admin/orders", label: "Orders" },
            { href: "/admin/customers", label: "Customers" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="block px-3 py-2 rounded transition-colors"
              style={{ color: "var(--color-gray-200)" }}
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header
          className="h-16 flex items-center justify-between px-8 border-b bg-white"
          style={{ borderColor: "var(--color-gray-200)" }}
        >
          <h1
            className="text-sm tracking-widest uppercase"
            style={{ color: "var(--color-gray-600)" }}
          >
            Admin Panel
          </h1>
          <a
            href="/"
            className="text-xs"
            style={{ color: "var(--color-primary)" }}
          >
            View Store →
          </a>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
