import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductReviews } from "@/components/product/ProductReviews";
import { TrackView } from "@/components/product/TrackView";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
  });
  return products.map((p: (typeof products)[number]) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true, description: true, seoTitle: true, seoDesc: true, tagline: true,
      images: { take: 1, select: { url: true, altText: true }, orderBy: { position: "asc" } },
      variants: { take: 1, select: { price: true } },
    },
  });

  if (!product) return { title: "Product Not Found" };

  const title       = product.seoTitle  ?? product.name;
  const description = product.seoDesc   ?? product.tagline ?? product.description ?? "";
  const imageUrl    = product.images[0]?.url ?? null;
  const price       = product.variants[0]?.price;
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mimissweetscent.com";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type:     "website",
      url:      `${siteUrl}/product/${slug}`,
      siteName: "Mimi's Sweet Scent",
      ...(imageUrl ? {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: product.images[0]?.altText ?? product.name }],
      } : {}),
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    ...(price ? {
      other: {
        "product:price:amount":   String(price / 100),
        "product:price:currency": "GHS",
      },
    } : {}),
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
    },
  });

  if (!product) notFound();

  // Related products: same productType, excluding current, active only, up to 4
  const relatedProducts = await prisma.product.findMany({
    where: {
      productType: product.productType,
      status: "ACTIVE",
      slug: { not: slug },
    },
    take: 4,
    select: {
      id: true, name: true, slug: true, tagline: true,
      images: { take: 1, select: { url: true, altText: true }, orderBy: { position: "asc" } },
      variants: {
        take: 1,
        select: { price: true, compareAtPrice: true },
        orderBy: { price: "asc" },
      },
    },
  });

  const mainImageUrl = product.images[0]?.url ?? "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800";

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
      <TrackView
        id={product.id}
        slug={product.slug}
        name={product.name}
        price={product.variants[0]?.price ?? 0}
        imageUrl={product.images[0]?.url ?? null}
      />
      <style>{`
        @media (max-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
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
      }}
      className="pdp-grid"
      >
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
            variants={product.variants.map((v: (typeof product.variants)[number]) => ({
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

      {/* Reviews — dynamic client component (supports new review submission) */}
      <section style={{
        borderTop: "1px solid var(--color-gray-200)",
        background: "var(--color-cream)",
        padding: "4rem 2rem",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <ProductReviews productId={product.id} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{
          borderTop: "1px solid var(--color-gray-200)",
          padding: "4rem 2rem",
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}>
              {product.productType === "PERFUME" ? "From the Collection" : "Complete the Look"}
            </p>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "2rem",
              fontWeight: 300,
              color: "var(--color-black)",
              margin: "0 0 2.5rem",
            }}>
              You May Also Like
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2rem",
            }}>
              {relatedProducts.map((related) => {
                const relatedPrice = related.variants[0]?.price;
                const relatedCompare = related.variants[0]?.compareAtPrice;
                const relatedImage = related.images[0];
                return (
                  <Link
                    key={related.id}
                    href={`/product/${related.slug}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block", background: "var(--color-white)" }}
                    className="product-card"
                  >
                    <div style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      overflow: "hidden",
                      background: "var(--color-cream)",
                    }}>
                      {relatedImage ? (
                        <Image
                          src={relatedImage.url}
                          alt={relatedImage.altText ?? related.name}
                          fill
                          className="product-card-image"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, background: "var(--color-gray-200)" }} />
                      )}
                    </div>
                    <div style={{ padding: "1rem 0 1.5rem" }}>
                      <h3 style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "1.125rem",
                        fontWeight: 400,
                        color: "var(--color-black)",
                        lineHeight: 1.3,
                        margin: 0,
                      }}>
                        {related.name}
                      </h3>
                      {related.tagline && (
                        <p style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontSize: "0.9375rem",
                          fontStyle: "italic",
                          color: "var(--color-gray-600)",
                          marginTop: "0.25rem",
                          marginBottom: 0,
                        }}>
                          {related.tagline}
                        </p>
                      )}
                      {relatedPrice !== undefined && (
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <span style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontSize: "1rem",
                            fontWeight: 300,
                            color: "var(--color-black)",
                          }}>
                            {formatPrice(relatedPrice)}
                          </span>
                          {relatedCompare && (
                            <span style={{
                              fontFamily: "var(--font-cormorant), Georgia, serif",
                              fontSize: "0.875rem",
                              fontWeight: 300,
                              color: "var(--color-gray-600)",
                              textDecoration: "line-through",
                            }}>
                              {formatPrice(relatedCompare)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
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
        {notes.map((n: (typeof notes)[number]) => (
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
