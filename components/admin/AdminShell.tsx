"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin",            label: "Dashboard", icon: "▦" },
  { href: "/admin/products",   label: "Products",  icon: "◈" },
  { href: "/admin/orders",     label: "Orders",    icon: "◇" },
  { href: "/admin/customers",  label: "Customers", icon: "○" },
  { href: "/admin/discounts",  label: "Discounts", icon: "%" },
  { href: "/admin/content",    label: "Content",   icon: "☰" },
  { href: "/admin/analytics",  label: "Analytics", icon: "◎" },
  { href: "/admin/finance",    label: "Finance",   icon: "◑" },
  { href: "/admin/logs",       label: "Logs",      icon: "≡" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => { if (typeof document !== "undefined") document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <style>{`
        /* ── Sidebar ── */
        .admin-sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh; width: 240px;
          overflow-y: auto;
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: var(--color-black);
          border-right: 1px solid #2a2a2a;
          transition: transform 250ms cubic-bezier(.4,0,.2,1);
        }

        /* ── Layout shell ── */
        .admin-main {
          padding-left: 240px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .admin-content {
          flex: 1;
          padding: 2.5rem 2.5rem 4rem;
        }

        /* ── Mobile top bar ── */
        .admin-topbar {
          display: none;
        }
        .admin-sidebar-close {
          display: none;
        }

        /* ── Tables → cards on mobile ── */
        .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* ── Responsive: ≤ 768px ── */
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            padding-left: 0;
          }
          .admin-content {
            padding: 1rem 1rem 4rem;
          }
          .admin-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            padding: 0 1rem;
            background: var(--color-black);
            position: sticky;
            top: 0;
            z-index: 30;
            border-bottom: 1px solid #2a2a2a;
          }
          .admin-sidebar-close {
            display: flex;
          }
          /* Stack stat cards */
          .admin-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          /* Product table → scrollable */
          .admin-table-wrap {
            margin: 0 -1rem;
            padding: 0 1rem;
          }
          /* Cards in product list */
          .admin-product-table { display: none !important; }
          .admin-product-cards { display: flex !important; }
          /* Orders table */
          .admin-orders-table { display: none !important; }
          .admin-orders-cards { display: flex !important; }
          /* Customers table */
          .admin-customers-table { display: none !important; }
          .admin-customers-cards { display: flex !important; }
          /* Filters stack */
          .admin-filters-row { flex-direction: column !important; }
          .admin-filters-row > * { width: 100% !important; }
        }

        /* ── Responsive: ≤ 480px ── */
        @media (max-width: 480px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-page-header { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>

        {/* ── Mobile top bar ── */}
        <div className="admin-topbar">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.8)", fontSize: "1.25rem",
              padding: "0.5rem", display: "flex", alignItems: "center",
            }}
          >
            ☰
          </button>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <span style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase",
            }}>MSS Admin</span>
          </Link>
          <Link href="/" style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)", textDecoration: "none",
          }}>Store ↗</Link>
        </div>

        {/* ── Overlay ── */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 49, backdropFilter: "blur(2px)",
            }}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar${open ? " open" : ""}`}>
          {/* Logo + close */}
          <div style={{
            height: "64px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 1.25rem 0 1.5rem",
            borderBottom: "1px solid #2a2a2a",
          }}>
            <Link href="/admin" style={{ textDecoration: "none" }}>
              <span style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>MSS Admin</span>
            </Link>
            {/* Close button — mobile only */}
            <button
              className="admin-sidebar-close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.5)", fontSize: "1.5rem", lineHeight: 1,
                padding: "0.25rem", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {NAV.map(({ href, label, icon }) => {
              const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.7rem 0.875rem", borderRadius: "2px", textDecoration: "none",
                  background: isActive ? "rgba(184,134,11,0.12)" : "transparent",
                  color: isActive ? "var(--color-primary)" : "rgba(255,255,255,0.6)",
                  borderLeft: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                  transition: "all 150ms ease",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", fontWeight: isActive ? 600 : 400,
                }}>
                  <span style={{ fontSize: "0.875rem", opacity: 0.7, width: "16px", textAlign: "center" }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div style={{ flexShrink: 0, padding: "1rem 1.25rem", borderTop: "1px solid #2a2a2a", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <Link href="/" style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)", textDecoration: "none",
            }}>← View Store</Link>
            <button
              onClick={() => signOut({ callbackUrl: "/account/login" })}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)", textAlign: "left", transition: "color 150ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.color = "#EF4444"; }}
              onMouseLeave={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.35)"; }}
            >Sign Out</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="admin-main">
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </>
  );
}
