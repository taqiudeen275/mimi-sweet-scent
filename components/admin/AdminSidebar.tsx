"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/products", label: "Products", icon: "◈" },
  { href: "/admin/orders", label: "Orders", icon: "◇" },
  { href: "/admin/customers", label: "Customers", icon: "○" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "240px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--color-black)",
      borderRight: "1px solid #2a2a2a",
    }}>
      <div style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 1.5rem",
        borderBottom: "1px solid #2a2a2a",
      }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <span style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            MSS Admin
          </span>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {NAV.map(({ href, label, icon }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.875rem",
                borderRadius: "2px",
                textDecoration: "none",
                background: isActive ? "rgba(184,134,11,0.12)" : "transparent",
                color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.6)",
                borderLeft: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                transition: "all 150ms ease",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #2a2a2a" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
          }}
        >
          ← View Store
        </Link>
      </div>
    </aside>
  );
}
