"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/cart-context";

const NAV_LINKS = [
  { href: "/fragrances", label: "Fragrances" },
  { href: "/jewelry", label: "Jewelry" },
  { href: "/shop", label: "Shop All" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
];

export function Navbar() {
  const { totalItems, openDrawer } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";
  const isLoggedIn = !!session?.user;

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when it opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery("");
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

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
            {NAV_LINKS.map(({ href, label }) => (
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
                  position: "relative",
                }}
                className="nav-link"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
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
          {/* Admin badge */}
          {isAdmin && (
            <Link
              href="/admin"
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary)",
                padding: "0.2rem 0.5rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
              className="desktop-nav"
            >
              Admin
            </Link>
          )}

          {/* Search */}
          <div ref={searchRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {/* Expanding search bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              maxWidth: searchOpen ? "220px" : "0",
              opacity: searchOpen ? 1 : 0,
              transition: "max-width 280ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
              marginRight: searchOpen ? "0.5rem" : "0",
            }}>
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center" }}>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products…"
                  style={{
                    width: "200px",
                    padding: "0.375rem 0.75rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.03em",
                    border: "1px solid var(--color-gray-200)",
                    outline: "none",
                    background: "var(--color-white)",
                    color: "var(--color-black)",
                  }}
                />
              </form>
            </div>

            {/* Search icon button */}
            <button
              onClick={() => setSearchOpen(o => !o)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              style={{
                background: "none", border: "none",
                cursor: "pointer", padding: 0,
                color: "var(--color-black)",
                display: "flex", alignItems: "center",
              }}
            >
              {searchOpen ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              )}
            </button>
          </div>

          {/* Account dropdown */}
          <div ref={accountRef} style={{ position: "relative" }}>
            <button
              onClick={() => setAccountOpen(o => !o)}
              aria-label="Account menu"
              style={{
                background: "none", border: "none",
                cursor: "pointer", padding: 0,
                color: "var(--color-black)",
                display: "flex", alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {isLoggedIn && status !== "loading" && (
                <span style={{
                  width: "18px", height: "18px",
                  background: "var(--color-primary)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.5rem", fontWeight: 700,
                  color: "var(--color-white)",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  lineHeight: 1,
                }}>
                  {(session?.user?.name ?? session?.user?.email ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {accountOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 0.75rem)", right: 0,
                background: "var(--color-white)",
                border: "1px solid var(--color-gray-200)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                minWidth: "180px",
                zIndex: 50,
                animation: "fadeDropdown 150ms ease",
              }}>
                {isLoggedIn ? (
                  <>
                    {session?.user?.name && (
                      <div style={{
                        padding: "0.875rem 1.25rem 0.625rem",
                        borderBottom: "1px solid var(--color-gray-200)",
                      }}>
                        <p style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontSize: "1rem",
                          color: "var(--color-black)",
                          margin: 0,
                        }}>
                          {session.user.name}
                        </p>
                        <p style={{
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.625rem",
                          color: "var(--color-gray-600)",
                          letterSpacing: "0.03em",
                          marginTop: "0.125rem",
                        }}>
                          {session.user.email}
                        </p>
                      </div>
                    )}
                    {isAdmin && (
                      <DropdownLink href="/admin" onClick={() => setAccountOpen(false)} gold>
                        Admin Dashboard
                      </DropdownLink>
                    )}
                    <DropdownLink href="/account/profile" onClick={() => setAccountOpen(false)}>
                      My Profile
                    </DropdownLink>
                    <DropdownLink href="/account/orders" onClick={() => setAccountOpen(false)}>
                      My Orders
                    </DropdownLink>
                    <div style={{ borderTop: "1px solid var(--color-gray-200)" }}>
                      <button
                        onClick={() => { setAccountOpen(false); signOut({ callbackUrl: "/" }); }}
                        style={{
                          width: "100%", textAlign: "left",
                          padding: "0.75rem 1.25rem",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.6875rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--color-gray-600)",
                          background: "none", border: "none",
                          cursor: "pointer",
                          transition: "color 150ms ease",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-error)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-gray-600)")}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <DropdownLink href="/account/login" onClick={() => setAccountOpen(false)}>
                      Sign In
                    </DropdownLink>
                    <DropdownLink href="/account/register" onClick={() => setAccountOpen(false)}>
                      Create Account
                    </DropdownLink>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
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
        borderTop: menuOpen ? "1px solid var(--color-gray-200)" : "none",
        overflow: "hidden",
        maxHeight: menuOpen ? "500px" : "0",
        transition: "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ padding: "0.5rem 1.5rem 1.25rem" }}>
          {NAV_LINKS.map(({ href, label }) => (
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
          <div style={{ paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem", letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                fontWeight: 700,
                textDecoration: "none",
                padding: "0.5rem 0",
              }}>
                ▦ Admin Dashboard
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link href="/account/profile" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>
                  My Profile
                </Link>
                <Link href="/account/orders" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>
                  My Orders
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  style={{ ...mobileLinkStyle, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/account/login" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>
                  Sign In
                </Link>
                <Link href="/account/register" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-hamburger { display: none !important; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1px;
          background: var(--color-primary);
          transform: scaleX(0);
          transition: transform 200ms ease;
        }
        .nav-link:hover::after { transform: scaleX(1); }
        @keyframes fadeDropdown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

const mobileLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-gray-600)",
  textDecoration: "none",
  display: "block",
  padding: "0.375rem 0",
};

function DropdownLink({
  href,
  onClick,
  children,
  gold,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "0.75rem 1.25rem",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.6875rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: gold ? "var(--color-primary)" : "var(--color-black)",
        textDecoration: "none",
        fontWeight: gold ? 600 : 400,
        transition: "background 150ms ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-cream)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}
