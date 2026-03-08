import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>My Profile</h1>
      <p style={{ color: "var(--color-gray-600)", marginTop: "1rem" }}>
        Profile management — coming in Phase 3.
      </p>
    </div>
  );
}
