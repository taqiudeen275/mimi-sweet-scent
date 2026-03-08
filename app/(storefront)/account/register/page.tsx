"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Auto sign in after successful registration
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/account/profile");
    router.refresh();
  };

  const inputStyle = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.875rem",
    color: "var(--color-black)",
    border: "1px solid var(--color-gray-200)",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.625rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--color-gray-600)",
    fontWeight: 500,
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "var(--color-cream)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "var(--color-white)",
        padding: "3rem 2.5rem",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            textDecoration: "none",
          }}>
            Mimi&apos;s Sweet Scent
          </Link>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: "0.75rem 0 0.5rem",
          }}>
            Create Account
          </h1>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            color: "var(--color-gray-600)",
            letterSpacing: "0.03em",
          }}>
            Join Mimi&apos;s Sweet Scent community
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ama Mensah"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={labelStyle}>Email Address</label>
            <input
              style={inputStyle}
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ama@example.com"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              style={inputStyle}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+233 24 000 0000"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              padding: "0.75rem 1rem",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.75rem",
              color: "#B91C1C",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.75rem",
          color: "var(--color-gray-600)",
          textAlign: "center",
          marginTop: "1.75rem",
        }}>
          Already have an account?{" "}
          <Link href="/account/login" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
