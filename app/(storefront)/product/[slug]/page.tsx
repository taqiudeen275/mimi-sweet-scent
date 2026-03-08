import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductActions } from "@/components/product/ProductActions";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, seoTitle: true, seoDesc: true, tagline: true },
  });
  if (!product) return {};
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDesc ?? product.tagline ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { position: "asc" } },
      fragranceNotes: true,
      collection: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!product) notFound();

  const mainImageUrl = product.images[0]?.url ?? "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800";
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const topNotes = product.fragranceNotes.filter((n) => n.type === "TOP");
  const heartNotes = product.fragranceNotes.filter((n) => n.type === "HEART");
  const baseNotes = product.fragranceNotes.filter((n) => n.type === "BASE");

  const details: { label: string; value: string }[] = [];
  if (product.productType === "PERFUME") {
    if (product.concentration) details.push({ label: "Concentration", value: product.concentration });
    if (product.genderTag) details.push({ label: "Gender", value: product.genderTag.charAt(0) + product.genderTag.slice(1).toLowerCase() });
    if (product.sillage) details.push({ label: "Sillage", value: product.sillage });
    if (product.longevity) details.push({ label: "Longevity", value: product.longevity });
    if (product.seasonRec) details.push({ label: "Season", value: product.seasonRec });
    if (product.perfumerProfile) details.push({ label: "Perfumer", value: product.perfumerProfile });
  } else {
    if (product.material) details.push({ label: "Material", value: product.material });
    if (product.stone) details.push({ label: "Stone", value: product.stone });
    if (product.genderTag) details.push({ label: "Style", value: product.genderTag.charAt(0) + product.genderTag.slice(1).toLowerCase() });
  }

  return (
    <main style={{ background: "var(--color-white)" }}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "1rem 2rem",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.6875rem",
        letterSpacing: "0.08em",
        color: "var(--color-gray-600)",
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
      }}>
        <a href="/" style={{ color: "var(--color-gray-600)", textDecoration: "none" }}>Home</a>
        <span>/</span>
        <a
          href={product.productType === "PERFUME" ? "/fragrances" : "/jewelry"}
          style={{ color: "var(--color-gray-600)", textDecoration: "none" }}
        >
          {product.productType === "PERFUME" ? "Fragrances" : "Jewelry"}
        </a>
        <span>/</span>
        <span style={{ color: "var(--color-black)" }}>{product.name}</span>
      </div>

      {/* Product layout */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 2rem 5rem",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
        gap: "5rem",
        alignItems: "start",
      }}>
        {/* Left: gallery */}
        <ImageGallery
          images={product.images.length > 0
            ? product.images
            : [{ url: mainImageUrl, altText: product.name }]
          }
          productName={product.name}
        />

        {/* Right: info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", paddingTop: "0.5rem" }}>
          {product.collection && (
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              fontWeight: 500,
              margin: 0,
            }}>
              {product.collection.name}
            </p>
          )}

          <div>
            <h1 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 3vw, 2.75rem)",
              fontWeight: 300,
              color: "var(--color-black)",
              lineHeight: 1.15,
              margin: 0,
            }}>
              {product.name}
            </h1>
            {product.tagline && (
              <p style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.125rem",
                fontWeight: 300,
                color: "var(--color-gray-600)",
                fontStyle: "italic",
                marginTop: "0.5rem",
                marginBottom: 0,
              }}>
                {product.tagline}
              </p>
            )}
          </div>

          {avgRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(avgRating) ? "var(--color-primary)" : "none"} stroke="var(--color-primary)" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                color: "var(--color-gray-600)",
                letterSpacing: "0.05em",
              }}>
                {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {product.description && (
            <p style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
              color: "var(--color-gray-600)",
              fontWeight: 300,
              margin: 0,
            }}>
              {product.description}
            </p>
          )}

          <ProductActions
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            productType={product.productType}
            imageUrl={mainImageUrl}
            variants={product.variants.map((v) => ({
              id: v.id,
              optionLabel: v.optionLabel,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stock: v.stock,
            }))}
          />

          <div style={{ borderTop: "1px solid var(--color-gray-200)" }} />

          {product.productType === "PERFUME" && product.fragranceNotes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-black)",
                fontWeight: 600,
                margin: 0,
              }}>
                Fragrance Notes
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {topNotes.length > 0 && (
                  <NoteRow label="Top" notes={topNotes} />
                )}
                {heartNotes.length > 0 && (
                  <NoteRow label="Heart" notes={heartNotes} />
                )}
                {baseNotes.length > 0 && (
                  <NoteRow label="Base" notes={baseNotes} />
                )}
              </div>
            </div>
          )}

          {details.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <h3 style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-black)",
                fontWeight: 600,
                margin: 0,
              }}>
                Details
              </h3>
              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem 1.5rem", margin: 0 }}>
                {details.map(({ label, value }) => (
                  <DetailRow key={label} label={label} value={value} />
                ))}
              </dl>
            </div>
          )}

          <div style={{
            borderTop: "1px solid var(--color-gray-200)",
            paddingTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}>
            {[
              { icon: "🚚", text: "Free delivery on orders over ₵500" },
              { icon: "↩", text: "Easy 30-day returns" },
              { icon: "🔒", text: "Secure checkout via Paystack" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.05em",
                  color: "var(--color-gray-600)",
                }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section style={{
          borderTop: "1px solid var(--color-gray-200)",
          background: "var(--color-cream)",
          padding: "4rem 2rem",
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "var(--color-black)",
              marginBottom: "2.5rem",
            }}>
              Customer Reviews
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}>
              {product.reviews.map((review) => (
                <div key={review.id} style={{
                  background: "var(--color-white)",
                  padding: "1.5rem",
                }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "0.75rem" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= review.rating ? "var(--color-primary)" : "none"} stroke="var(--color-primary)" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  {review.body && (
                    <p style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1rem",
                      lineHeight: 1.6,
                      color: "var(--color-black)",
                      fontStyle: "italic",
                      marginBottom: "0.75rem",
                    }}>
                      &ldquo;{review.body}&rdquo;
                    </p>
                  )}
                  <p style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-gray-600)",
                    margin: 0,
                  }}>
                    {review.user.name ?? "Anonymous"}
                    {review.verified && (
                      <span style={{ marginLeft: "0.5rem", color: "var(--color-primary)" }}>{"\u2713"} Verified</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function NoteRow({ label, notes }: { label: string; notes: { id: string; name: string; icon: string | null }[] }) {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <div style={{
        flexShrink: 0,
        width: "56px",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.5625rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-primary)",
        fontWeight: 600,
        paddingTop: "0.125rem",
      }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {notes.map((n) => (
          <span key={n.id} style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.9375rem",
            color: "var(--color-black)",
            padding: "0.125rem 0.625rem",
            border: "1px solid var(--color-gray-200)",
            background: "var(--color-cream)",
          }}>
            {n.icon ? `${n.icon} ` : ""}{n.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.6875rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-gray-600)",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}>
        {label}
      </dt>
      <dd style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "0.9375rem",
        color: "var(--color-black)",
        margin: 0,
      }}>
        {value}
      </dd>
    </>
  );
}
