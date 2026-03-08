import type { Metadata } from "next";

export const metadata: Metadata = { title: "Product" };

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        Product: {slug}
      </h1>
      <p style={{ color: "var(--color-gray-600)", marginTop: "1rem" }}>
        Product detail page — coming in Phase 2.
      </p>
    </div>
  );
}
