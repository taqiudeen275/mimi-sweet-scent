import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });
  return {
    title: page?.metaTitle ?? page?.title ?? "About Us — Mimi's Sweet Scent",
    description:
      page?.metaDesc ??
      "Discover the story behind Mimi's Sweet Scent — a curated collection of luxury perfumes and fine jewelry.",
  };
}

export const revalidate = 3600;

const VALUES = [
  {
    icon: "◈",
    title: "Uncompromising Quality",
    body:
      "Every fragrance and jewel is selected with the most exacting standards. We partner only with artisans who share our devotion to excellence.",
  },
  {
    icon: "✦",
    title: "Timeless Elegance",
    body:
      "Beauty that transcends trends. Our curation celebrates the enduring — pieces that age with grace and scents that become signature.",
  },
  {
    icon: "◎",
    title: "Authentic Stories",
    body:
      "Behind every bottle and every gem lies a narrative. We believe luxury should mean something — provenance, craftsmanship, meaning.",
  },
];

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });

  return (
    <div>
      {/* Hero */}
      <section style={{ position: "relative", height: "70vh", minHeight: "480px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=1600&q=80&auto=format&fit=crop"
          alt="Luxury perfume display"
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
          background: "linear-gradient(to bottom, rgba(26,26,26,0.4) 0%, rgba(26,26,26,0.7) 100%)",
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
            Our Story
          </p>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 300,
            color: "var(--color-white)",
            lineHeight: 1.1,
            maxWidth: "700px",
            margin: "0 0 1.5rem",
          }}>
            {page?.title ?? "About Mimi's Sweet Scent"}
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
            color: "#3A3A3A",
            whiteSpace: "pre-wrap",
          }}>
            {page.content}
          </div>
        </section>
      ) : (
        /* Default editorial content */
        <>
          {/* Brand story */}
          <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 2rem" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5rem",
              alignItems: "center",
            }}>
              <div>
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  marginBottom: "1.25rem",
                  fontWeight: 600,
                }}>
                  Est. 2020 — Accra, Ghana
                </p>
                <h2 style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
                  fontWeight: 300,
                  color: "var(--color-black)",
                  lineHeight: 1.2,
                  marginBottom: "2rem",
                }}>
                  Crafted with artistry,<br />worn with elegance.
                </h2>
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.9375rem",
                  lineHeight: 1.8,
                  color: "#555",
                  marginBottom: "1.5rem",
                }}>
                  Mimi&apos;s Sweet Scent was born from a singular obsession: the belief that
                  fragrance and jewelry are not mere accessories, but the most intimate expressions
                  of who we are. Founded by Mimi Asante in Accra, the brand has grown from a small
                  boutique into Ghana&apos;s premier destination for discerning luxury.
                </p>
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.9375rem",
                  lineHeight: 1.8,
                  color: "#555",
                }}>
                  Every piece in our collection tells a story — of master perfumers in Grasse, of
                  goldsmiths in Tuscany, of traditions passed through generations. We curate not just
                  products, but experiences that linger long after the first encounter.
                </p>
              </div>
              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80&auto=format&fit=crop"
                  alt="Perfume collection detail"
                  style={{
                    width: "100%",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                  }}
                />
                <div style={{
                  position: "absolute",
                  bottom: "-1.5rem",
                  left: "-1.5rem",
                  width: "120px",
                  height: "120px",
                  background: "var(--color-cream)",
                  border: "1px solid var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "2rem",
                    fontWeight: 300,
                    color: "var(--color-black)",
                    lineHeight: 1,
                  }}>
                    500+
                  </span>
                  <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    marginTop: "0.25rem",
                    textAlign: "center",
                  }}>
                    Happy Clients
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section style={{ background: "var(--color-black)", padding: "5rem 2rem" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <p style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                  fontWeight: 600,
                }}>
                  What We Stand For
                </p>
                <h2 style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 300,
                  color: "var(--color-white)",
                  margin: 0,
                }}>
                  Our Values
                </h2>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "2rem",
              }}>
                {VALUES.map(({ icon, title, body }) => (
                  <div
                    key={title}
                    style={{
                      padding: "2.5rem",
                      border: "1px solid rgba(184,134,11,0.25)",
                      position: "relative",
                    }}
                  >
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
                      color: "var(--color-white)",
                      marginBottom: "1rem",
                    }}>
                      {title}
                    </h3>
                    <p style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.8125rem",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.6)",
                      margin: 0,
                    }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Founder section */}
          <section style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 2rem", textAlign: "center" }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "var(--color-cream)",
              border: "2px solid var(--color-primary)",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80&auto=format&fit=crop&crop=face"
                alt="Mimi Asante — Founder"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <blockquote style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--color-black)",
              lineHeight: 1.5,
              margin: "0 0 1.5rem",
              maxWidth: "640px",
              marginLeft: "auto",
              marginRight: "auto",
            }}>
              &ldquo;Scent is memory. Jewelry is legacy. Together, they are how we choose to be remembered.&rdquo;
            </blockquote>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              fontWeight: 600,
            }}>
              Mimi Asante — Founder &amp; Creative Director
            </p>
          </section>
        </>
      )}

      {/* CTA */}
      <section style={{
        background: "var(--color-cream)",
        padding: "4rem 2rem",
        textAlign: "center",
        borderTop: "1px solid rgba(184,134,11,0.15)",
      }}>
        <h2 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
          fontWeight: 300,
          color: "var(--color-black)",
          marginBottom: "1.5rem",
        }}>
          Begin Your Sensory Journey
        </h2>
        <a
          href="/shop"
          style={{
            display: "inline-block",
            background: "var(--color-black)",
            color: "var(--color-white)",
            padding: "0.875rem 2.5rem",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Explore the Collection
        </a>
      </section>
    </div>
  );
}
