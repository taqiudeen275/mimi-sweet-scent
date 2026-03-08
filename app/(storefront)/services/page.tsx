import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "services" } });
  return {
    title: page?.metaTitle ?? page?.title ?? "Our Services — Mimi's Sweet Scent",
    description:
      page?.metaDesc ??
      "Discover the range of luxury services at Mimi's Sweet Scent — from bespoke consultations to corporate gifting.",
  };
}

export const revalidate = 3600;

const SERVICES = [
  {
    icon: "◈",
    title: "Bespoke Fragrance Consultation",
    description:
      "A private, one-on-one session with our fragrance specialists. We help you navigate hundreds of scent profiles to find — or create — the perfect signature fragrance.",
    tag: "By Appointment",
  },
  {
    icon: "✦",
    title: "Gift Wrapping & Packaging",
    description:
      "Every order can be dressed in our signature black-and-gold gift packaging, with handwritten cards available for that personal touch.",
    tag: "On Every Order",
  },
  {
    icon: "◎",
    title: "Personal Shopping",
    description:
      "Not sure what to choose? Our personal shoppers are available via WhatsApp to guide you through our collection and recommend the perfect gift.",
    tag: "Free Service",
  },
  {
    icon: "◇",
    title: "Corporate Gifting",
    description:
      "Impress clients and reward your team with curated luxury gift sets. Volume discounts, custom branding, and white-glove delivery available.",
    tag: "Volume Discounts",
  },
  {
    icon: "○",
    title: "Loyalty Programme",
    description:
      "Earn Mimi Points on every purchase. Redeem for discounts, exclusive products, and early access to new collections. The more you shop, the sweeter the rewards.",
    tag: "Coming Soon",
  },
  {
    icon: "▦",
    title: "Free Shipping",
    description:
      "Enjoy complimentary standard delivery on all orders above GHS 500 within Ghana. Express and same-day delivery available in Accra.",
    tag: "Orders GHS 500+",
  },
];

export default async function ServicesPage() {
  const page = await prisma.page.findUnique({ where: { slug: "services" } });

  return (
    <div>
      {/* Hero */}
      <section style={{ position: "relative", height: "55vh", minHeight: "380px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1600&q=80&auto=format&fit=crop"
          alt="Luxury service experience"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(26,26,26,0.45) 0%, rgba(26,26,26,0.75) 100%)",
        }} />
        <div style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            marginBottom: "1.25rem",
            fontWeight: 500,
          }}>
            The Mimi Experience
          </p>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 300,
            color: "#FFFFFF",
            lineHeight: 1.1,
            maxWidth: "600px",
            margin: "0 0 1.5rem",
          }}>
            {page?.title ?? "Our Services"}
          </h1>
          <div style={{
            width: "40px",
            height: "1px",
            background: "var(--color-primary)",
            margin: "0 auto",
          }} />
        </div>
      </section>

      {page?.content ? (
        /* DB-driven content */
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "5rem 2rem" }}>
          <div style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "1rem",
            lineHeight: 1.8,
            color: "var(--color-black)",
            whiteSpace: "pre-wrap",
          }}>
            {page.content}
          </div>
        </section>
      ) : (
        /* Default services content */
        <>
          {/* Intro */}
          <section style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem 2rem", textAlign: "center" }}>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "1rem",
              lineHeight: 1.8,
              color: "#555",
            }}>
              At Mimi&apos;s Sweet Scent, luxury extends far beyond the products we carry.
              From the moment you arrive to the moment your order arrives at your door, every
              detail is considered — because you deserve nothing less.
            </p>
          </section>

          {/* Services grid */}
          <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 2rem 5rem" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}>
              {SERVICES.map(({ icon, title, description, tag }) => (
                <div
                  key={title}
                  style={{
                    padding: "2.5rem",
                    border: "1px solid var(--color-gray-200)",
                    background: "var(--color-white)",
                    position: "relative",
                    transition: "border-color 250ms ease, box-shadow 250ms ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--color-primary)";
                    el.style.boxShadow = "0 4px 24px rgba(184,134,11,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--color-gray-200)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* Tag */}
                  <span style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.25rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.4375rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "var(--color-cream)",
                    color: "var(--color-primary)",
                    padding: "0.2rem 0.5rem",
                    fontWeight: 700,
                    border: "1px solid rgba(184,134,11,0.2)",
                  }}>
                    {tag}
                  </span>

                  <span style={{
                    display: "block",
                    fontSize: "1.5rem",
                    color: "var(--color-primary)",
                    marginBottom: "1.25rem",
                  }}>
                    {icon}
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.375rem",
                    fontWeight: 400,
                    color: "var(--color-black)",
                    marginBottom: "0.875rem",
                    lineHeight: 1.3,
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.8125rem",
                    lineHeight: 1.7,
                    color: "var(--color-gray-600)",
                    margin: 0,
                  }}>
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA / Contact */}
          <section style={{
            background: "#111110",
            padding: "5rem 2rem",
            textAlign: "center",
          }}>
            <div style={{ maxWidth: "620px", margin: "0 auto" }}>
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                marginBottom: "1.25rem",
                fontWeight: 600,
              }}>
                Enquiries
              </p>
              <h2 style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                fontWeight: 300,
                color: "#EDE8DC",
                marginBottom: "1.25rem",
                lineHeight: 1.2,
              }}>
                Let us curate something extraordinary for you.
              </h2>
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.875rem",
                color: "var(--color-gray-600)",
                lineHeight: 1.7,
                marginBottom: "2.5rem",
              }}>
                For corporate gifting, private consultations, or any bespoke request,
                our team is ready to assist. Reach out and we&apos;ll respond within 24 hours.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href="mailto:hello@mimissweetscent.com"
                  style={{
                    display: "inline-block",
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    padding: "0.875rem 2.5rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.625rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Email Us
                </a>
                <a
                  href="/shop"
                  style={{
                    display: "inline-block",
                    background: "transparent",
                    color: "#FFFFFF",
                    padding: "0.875rem 2.5rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.625rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  Shop Now
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
