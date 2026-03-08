"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Footer() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } finally {
      setSubscribing(false);
    }
  }

  const colHeadStyle: React.CSSProperties = {
    fontSize: "0.625rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--footer-text-dim)",
    marginBottom: "1.25rem",
    fontFamily: "var(--font-montserrat), sans-serif",
    fontWeight: 600,
  };

  const linkStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8125rem",
    color: "var(--footer-text)",
    textDecoration: "none",
    marginBottom: "0.625rem",
    transition: "color 150ms ease",
  };

  return (
    <footer style={{ background: "var(--footer-bg)", color: "#FFFFFF" }}>
      {/* Newsletter */}
      <div style={{
        borderBottom: "1px solid var(--footer-border)",
        padding: "3.5rem 2rem",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)" }}>
            Stay in the Know
          </p>
          <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, color: "#FFFFFF", margin: 0 }}>
            Join our community of fragrance lovers and jewelry enthusiasts
          </p>
          {subscribed ? (
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "var(--color-primary)", letterSpacing: "0.04em" }}>
              You&apos;re on the list — thank you!
            </p>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 0, width: "100%", maxWidth: "480px" }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  flex: 1,
                  padding: "0.75rem 1.25rem",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  background: "var(--footer-input-bg)",
                  border: "1px solid var(--footer-input-border)",
                  borderRight: "none",
                  color: "#FFFFFF",
                  outline: "none",
                  letterSpacing: "0.02em",
                }}
              />
              <button
                type="submit"
                disabled={subscribing}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--color-primary)",
                  border: "1px solid var(--color-primary)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  cursor: subscribing ? "not-allowed" : "pointer",
                  opacity: subscribing ? 0.7 : 1,
                  whiteSpace: "nowrap",
                  transition: "opacity 150ms ease",
                }}
              >
                {subscribing ? "..." : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Columns */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "4rem 2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "3rem",
        borderBottom: "1px solid var(--footer-border)",
      }}>
        {/* Brand */}
        <div>
          <p style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.125rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            marginBottom: "1rem",
          }}>
            Mimi&apos;s Sweet Scent
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--footer-text)", lineHeight: 1.7, maxWidth: "240px" }}>
            Luxury perfumes and fine jewelry. Crafted with artistry, worn with elegance.
          </p>
        </div>

        {/* Shop */}
        <div>
          <p style={colHeadStyle}>Shop</p>
          {[
            { href: "/fragrances", label: "Fragrances" },
            { href: "/jewelry", label: "Jewelry" },
            { href: "/shop", label: "All Products" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Company */}
        <div>
          <p style={colHeadStyle}>Company</p>
          {[
            { href: "/about", label: "About" },
            { href: "/services", label: "Services" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Account — auth-aware */}
        <div>
          <p style={colHeadStyle}>Account</p>
          {isLoggedIn ? (
            <>
              {/* User name/email */}
              <p style={{ fontSize: "0.8125rem", color: "var(--footer-text-bright)", marginBottom: "0.625rem", fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                {session?.user?.name ?? session?.user?.email}
              </p>
              <Link href="/account/orders" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
              >
                My Orders
              </Link>
              <Link href="/account/profile" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
              >
                My Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" style={{ ...linkStyle, color: "var(--color-primary)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#d4a017")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--color-primary)")}
                >
                  Admin Dashboard →
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "0.8125rem",
                  color: "var(--footer-text)",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "0.625rem",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--footer-text)")}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/account/login" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
              >
                Sign In
              </Link>
              <Link href="/account/register" style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--footer-text)")}
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Contact */}
        <div>
          <p style={colHeadStyle}>Contact</p>
          <p style={{ fontSize: "0.8125rem", color: "var(--footer-text)", marginBottom: "0.5rem" }}>
            hello@mimissweetscent.com
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--footer-text)" }}>
            Mon–Sat, 9am–6pm WAT
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <p style={{ fontSize: "0.6875rem", color: "var(--footer-text-dim)" }}>
          © {new Date().getFullYear()} Mimi&apos;s Sweet Scent. All rights reserved.
        </p>
        <p style={{ fontSize: "0.6875rem", color: "var(--footer-text-dim)" }}>
          Secured by Paystack
        </p>
      </div>
    </footer>
  );
}
