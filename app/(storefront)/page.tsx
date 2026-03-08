import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 3600;

async function getHomeData() {
  try {
    const [newArrivals, collections] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          variants: { orderBy: { price: "asc" } },
          images: { orderBy: { position: "asc" }, take: 1 },
          collection: { select: { name: true } },
        },
      }),
      prisma.collection.findMany({
        orderBy: { position: "asc" },
        take: 3,
      }),
    ]);
    return { newArrivals, collections };
  } catch {
    return { newArrivals: [], collections: [] };
  }
}

export default async function HomePage() {
  const { newArrivals, collections } = await getHomeData();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "100vh", minHeight: "640px", overflow: "hidden" }}>
        <Image
          src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1920&q=80"
          alt="Mimi's Sweet Scent"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 1.5rem",
        }}>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            fontWeight: 600,
            marginBottom: "1.5rem",
            animation: "fadeUp 0.8s ease 0.2s both",
          }}>
            Luxury Perfumes &amp; Fine Jewelry
          </p>

          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#FFFFFF",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            marginBottom: "0.25rem",
            animation: "fadeUp 0.8s ease 0.4s both",
          }}>
            Mimi&apos;s
          </h1>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#FFFFFF",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            marginBottom: "2rem",
            animation: "fadeUp 0.8s ease 0.5s both",
          }}>
            Sweet Scent
          </h1>

          {/* Gold rule */}
          <div style={{
            width: "80px", height: "1px",
            background: "var(--color-primary)",
            marginBottom: "2rem",
            animation: "fadeUp 0.8s ease 0.6s both",
          }} />

          <p style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "2.5rem",
            animation: "fadeUp 0.8s ease 0.7s both",
          }}>
            Wear your story
          </p>

          <div style={{
            display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center",
            animation: "fadeUp 0.8s ease 0.85s both",
          }}>
            <Link href="/fragrances" className="btn btn-secondary" style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.6)" }}>
              Shop Fragrances
            </Link>
            <Link href="/jewelry" className="btn btn-primary" style={{ background: "var(--color-primary)", borderColor: "var(--color-primary)" }}>
              Shop Jewelry
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          animation: "fadeUp 0.8s ease 1.2s both",
        }}>
          <p style={{ fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-montserrat), sans-serif" }}>Scroll</p>
          <div style={{
            width: "1px", height: "40px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
          }} />
        </div>
      </section>

      {/* ── Collections ───────────────────────────────────────────────────────── */}
      {collections.length > 0 && (
        <section style={{ padding: "6rem 2rem", background: "var(--color-cream)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p className="label" style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }}>Our Collections</p>
              <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>
                Curated with Purpose
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {collections.map(col => (
                <Link
                  key={col.id}
                  href={col.slug === "fine-jewelry" ? "/jewelry" : "/fragrances"}
                  style={{ textDecoration: "none", color: "inherit", position: "relative", overflow: "hidden", display: "block", aspectRatio: "4/3" }}
                >
                  {col.bannerUrl ? (
                    <Image
                      src={col.bannerUrl}
                      alt={col.name}
                      fill
                      style={{ objectFit: "cover", transition: "transform 400ms ease" }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="product-card-image"
                    />
                  ) : (
                    <div style={{ background: "var(--color-black)", position: "absolute", inset: 0 }} />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)",
                    display: "flex", flexDirection: "column",
                    justifyContent: "flex-end", padding: "2rem",
                  }}>
                    <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                      {col.name}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-montserrat), sans-serif" }}>
                      Explore →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section style={{ padding: "6rem 2rem", background: "var(--color-white)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p className="label" style={{ color: "var(--color-primary)", marginBottom: "0.5rem" }}>Just Arrived</p>
                <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 4vw, 2.75rem)", margin: 0 }}>
                  New Arrivals
                </h2>
              </div>
              <Link href="/shop" style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem", letterSpacing: "0.1em",
                textTransform: "uppercase", fontWeight: 500,
                color: "var(--color-black)", textDecoration: "none",
                borderBottom: "1px solid var(--color-black)",
                paddingBottom: "2px",
              }}>
                View All
              </Link>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "2rem",
            }}>
              {newArrivals.slice(0, 8).map((product, idx) => (
                <div key={product.id} className="product-grid-item">
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  productType={product.productType as "PERFUME" | "JEWELRY"}
                  concentration={product.concentration}
                  material={product.material}
                  collectionName={product.collection?.name}
                  imageUrl={product.images[0]?.url ?? "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                  variants={product.variants.map(v => ({
                    id: v.id,
                    optionLabel: v.optionLabel,
                    price: v.price,
                    compareAtPrice: v.compareAtPrice,
                    stock: v.stock,
                  }))}
                  isNew={idx < 3}
                />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand Story / Quote ───────────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2rem", background: "#111110" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: "40px", height: "1px", background: "var(--color-primary)", margin: "0 auto 3rem" }} />
          <blockquote style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#EDE8DC",
            lineHeight: 1.35,
            margin: "0 0 3rem",
          }}>
            &ldquo;A fragrance is the invisible part of your personality. A jewel, its visible signature.&rdquo;
          </blockquote>
          <div style={{ width: "40px", height: "1px", background: "var(--color-primary)", margin: "0 auto 2rem" }} />
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem", letterSpacing: "0.2em",
            textTransform: "uppercase", color: "var(--color-primary)",
            fontWeight: 600,
          }}>
            Mimi&apos;s Sweet Scent
          </p>
        </div>
      </section>

      {/* ── Perfumes CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem", background: "var(--color-cream)" }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2px",
        }}>
          {/* Fragrances */}
          <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
            <Image
              src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&q=80"
              alt="Fragrances"
              fill style={{ objectFit: "cover" }}
              sizes="50vw"
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end",
              padding: "3rem 2rem",
              textAlign: "center",
            }}>
              <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, fontStyle: "italic", color: "#FFFFFF", marginBottom: "1.5rem" }}>
                Fragrances
              </h3>
              <Link href="/fragrances" className="btn btn-secondary" style={{ borderColor: "rgba(255,255,255,0.7)", color: "#FFFFFF" }}>
                Discover
              </Link>
            </div>
          </div>
          {/* Jewelry */}
          <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
            <Image
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80"
              alt="Jewelry"
              fill style={{ objectFit: "cover" }}
              sizes="50vw"
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end",
              padding: "3rem 2rem",
              textAlign: "center",
            }}>
              <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, fontStyle: "italic", color: "#FFFFFF", marginBottom: "1.5rem" }}>
                Fine Jewelry
              </h3>
              <Link href="/jewelry" className="btn btn-secondary" style={{ borderColor: "rgba(255,255,255,0.7)", color: "#FFFFFF" }}>
                Discover
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
