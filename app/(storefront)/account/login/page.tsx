import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-cream)" }}>
      <div className="w-full max-w-md bg-white p-10">
        <h1
          className="mb-2 text-center"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400 }}
        >
          Sign In
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: "var(--color-gray-600)" }}>
          Welcome back to Mimi&apos;s Sweet Scent
        </p>
        <p className="text-center text-sm" style={{ color: "var(--color-gray-600)" }}>
          Authentication form — coming in Phase 3.
        </p>
        <div className="mt-6 text-center text-sm">
          <span style={{ color: "var(--color-gray-600)" }}>Don&apos;t have an account? </span>
          <a href="/account/register" style={{ color: "var(--color-primary)" }}>Register</a>
        </div>
      </div>
    </div>
  );
}
