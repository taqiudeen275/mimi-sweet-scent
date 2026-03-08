import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-cream)" }}>
      <div className="w-full max-w-md bg-white p-10">
        <h1
          className="mb-2 text-center"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400 }}
        >
          Create Account
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: "var(--color-gray-600)" }}>
          Join Mimi&apos;s Sweet Scent
        </p>
        <p className="text-center text-sm" style={{ color: "var(--color-gray-600)" }}>
          Registration form — coming in Phase 3.
        </p>
        <div className="mt-6 text-center text-sm">
          <span style={{ color: "var(--color-gray-600)" }}>Already have an account? </span>
          <a href="/account/login" style={{ color: "var(--color-primary)" }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
