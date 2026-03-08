export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center"
        style={{
          minHeight: "90vh",
          background: "var(--color-cream)",
        }}
      >
        <div className="text-center px-4 max-w-3xl mx-auto">
          <p
            className="label mb-6"
            style={{ color: "var(--color-primary)" }}
          >
            Luxury Perfumes &amp; Fine Jewelry
          </p>
          <h1
            className="display mb-8"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              color: "var(--color-black)",
              lineHeight: 1.1,
            }}
          >
            Mimi&apos;s Sweet Scent
          </h1>
          <p
            className="mb-10 max-w-md mx-auto"
            style={{ color: "var(--color-gray-600)", fontFamily: "var(--font-montserrat), Arial, sans-serif" }}
          >
            Discover rare fragrances and handcrafted jewels — each piece a story
            told in scent and light.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/fragrances" className="btn btn-primary">
              Shop Fragrances
            </a>
            <a href="/jewelry" className="btn btn-secondary">
              Shop Jewelry
            </a>
          </div>
        </div>
      </section>

      {/* Coming Soon Placeholder */}
      <section
        className="py-24 text-center"
        style={{ background: "var(--color-white)" }}
      >
        <p
          className="label"
          style={{ color: "var(--color-gray-600)" }}
        >
          Full storefront coming in Phase 2
        </p>
      </section>
    </>
  );
}
