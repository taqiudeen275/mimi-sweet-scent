"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";

export function Navbar() {
  const { totalItems, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-gray-200)",
      }}
    >
      <div style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: "0 1.5rem",
        height: "64px",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
      }}>
        {/* Left — desktop nav / mobile hamburger */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }} className="desktop-nav">
            {[
              { href: "/fragrances", label: "Fragrances" },
              { href: "/jewelry", label: "Jewelry" },
              { href: "/shop", label: "Shop All" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: "var(--color-black)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="mobile-hamburger"
            style={{
              background: "none", border: "none",
              cursor: "pointer", padding: "0.5rem",
              color: "var(--color-black)",
              display: "flex", alignItems: "center",
            }}
          >
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Center logo */}
        <Link href="/" style={{ textDecoration: "none", textAlign: "center" }}>
          <span style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(0.9375rem, 2.5vw, 1.125rem)",
            fontWeight: 400,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-black)",
            whiteSpace: "nowrap",
          }}>
            Mimi&apos;s Sweet Scent
          </span>
        </Link>

        {/* Right icons */}
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", justifyContent: "flex-end" }}>
          <Link
            href="/account/login"
            aria-label="Account"
            style={{ color: "var(--color-black)", display: "flex", alignItems: "center" }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          <button
            onClick={openDrawer}
            aria-label={`Open bag${totalItems > 0 ? ` (${totalItems} items)` : ""}`}
            style={{
              position: "relative",
              background: "none", border: "none",
              cursor: "pointer", padding: 0,
              color: "var(--color-black)",
              display: "flex", alignItems: "center",
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span style={{
                position: "absolute", top: "-6px", right: "-8px",
                background: "var(--color-primary)",
                color: "var(--color-white)",
                borderRadius: "50%",
                width: "16px", height: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.5625rem", fontWeight: 700,
                fontFamily: "var(--font-montserrat), sans-serif",
              }}>
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div style={{
        background: "var(--color-white)",
        borderTop: "1px solid var(--color-gray-200)",
        overflow: "hidden",
        maxHeight: menuOpen ? "320px" : "0",
        transition: "max-height 300ms ease",
      }}>
        <div style={{ padding: "0.75rem 1.5rem 1.5rem" }}>
          {[
            { href: "/fragrances", label: "Fragrances" },
            { href: "/jewelry", label: "Jewelry" },
            { href: "/shop", label: "Shop All" },
            { href: "/account/login", label: "Account" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "0.875rem 0",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.8125rem", letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--color-black)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-gray-200)",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-hamburger { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
