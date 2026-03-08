import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 2rem",
      background: "var(--color-cream)",
      textAlign: "center",
      gap: "1.5rem",
    }}>
      <p style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "8rem",
        fontWeight: 300,
        color: "var(--color-primary)",
        lineHeight: 1,
        margin: 0,
        opacity: 0.4,
      }}>
        404
      </p>
      <h1 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "2.25rem",
        fontWeight: 400,
        color: "var(--color-black)",
        margin: 0,
      }}>
        Page Not Found
      </h1>
      <p style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.875rem",
        color: "var(--color-gray-600)",
        maxWidth: "380px",
        lineHeight: 1.7,
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-white)",
            background: "var(--color-black)",
            padding: "0.875rem 2rem",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Return Home
        </Link>
        <Link
          href="/shop"
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-black)",
            border: "1px solid var(--color-gray-200)",
            padding: "0.875rem 2rem",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Shop All
        </Link>
      </div>
    </div>
  );
}
