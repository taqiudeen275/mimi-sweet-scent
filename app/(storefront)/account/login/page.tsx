"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
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
            Welcome Back
          </h1>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            color: "var(--color-gray-600)",
            letterSpacing: "0.03em",
          }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              fontWeight: 500,
            }}>
              Email Address
            </label>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ama@example.com"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              fontWeight: 500,
            }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              padding: "0.75rem 1rem",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.75rem",
              color: "var(--error-text)",
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
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.75rem",
          color: "var(--color-gray-600)",
          textAlign: "center",
          marginTop: "1.75rem",
        }}>
          Don&apos;t have an account?{" "}
          <Link href="/account/register" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
