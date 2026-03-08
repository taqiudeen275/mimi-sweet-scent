import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product?.name ?? "Product" };
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: "#D1FAE5", color: "#065F46" },
  DRAFT:    { bg: "#FEF3C7", color: "#92400E" },
  ARCHIVED: { bg: "#F3F4F6", color: "#6B7280" },
};

const NOTE_COLOR: Record<string, { bg: string; color: string }> = {
  TOP:   { bg: "#EDE9FE", color: "#7C3AED" },
  HEART: { bg: "#FCE7F3", color: "#9D174D" },
  BASE:  { bg: "#FEF3C7", color: "#92400E" },
};

const sectionStyle: React.CSSProperties = {
  background: "var(--color-white)",
  border: "1px solid var(--color-gray-200)",
  padding: "1.5rem",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--color-gray-600)",
  display: "block",
  marginBottom: "0.25rem",
  fontWeight: 500,
};

const valueStyle: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.875rem",
  color: "var(--color-black)",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER", "FULFILLMENT_STAFF", "CONTENT_EDITOR"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants:       { orderBy: { price: "asc" } },
      images:         { orderBy: { position: "asc" } },
      fragranceNotes: { orderBy: { type: "asc" } },
      collection:     true,
      reviews:        { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } },
      _count:         { select: { reviews: true } },
    },
  });

  if (!product) notFound();

  const s = STATUS_STYLE[product.status] ?? STATUS_STYLE.DRAFT;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Breadcrumb + actions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Link href="/admin/products" style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-gray-600)",
            textDecoration: "none",
          }}>
            Products
          </Link>
          <span style={{ color: "var(--color-gray-600)", fontSize: "0.75rem" }}>›</span>
          <span style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-black)",
          }}>
            {product.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "var(--color-black)",
              margin: 0,
            }}>
              {product.name}
            </h1>
            <span style={{
              display: "inline-block",
              padding: "0.2rem 0.625rem",
              background: s.bg,
              color: s.color,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              {product.status}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "0.5rem 1.25rem",
                border: "1px solid var(--color-gray-200)",
                background: "var(--color-white)",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
                textDecoration: "none",
              }}
            >
              View in Store ↗
            </a>
            <Link
              href={`/admin/products/${id}/edit`}
              style={{
                padding: "0.5rem 1.5rem",
                border: "none",
                background: "var(--color-primary)",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Edit Product
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Images carousel */}
          {product.images.length > 0 && (
            <section style={sectionStyle}>
              <h2 style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                color: "var(--color-black)",
                margin: "0 0 1rem",
              }}>
                Images
              </h2>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {product.images.map((img, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.altText ?? `${product.name} ${i + 1}`}
                    style={{
                      width: "100px",
                      height: "120px",
                      objectFit: "cover",
                      background: "var(--color-cream)",
                      border: i === 0 ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)",
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Basic info */}
          <section style={sectionStyle}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--color-black)",
              margin: "0 0 1.25rem",
            }}>
              Details
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Field label="Product Type" value={product.productType} />
              <Field label="Gender Tag" value={product.genderTag ?? undefined} />
              {product.productType === "PERFUME" && <>
                <Field label="Concentration" value={product.concentration ?? undefined} />
                <Field label="Sillage" value={product.sillage ?? undefined} />
                <Field label="Longevity" value={product.longevity ?? undefined} />
                <Field label="Season" value={product.seasonRec ?? undefined} />
                <Field label="Perfumer" value={product.perfumerProfile ?? undefined} />
              </>}
              {product.productType === "JEWELRY" && <>
                <Field label="Material" value={product.material ?? undefined} />
                <Field label="Stone" value={product.stone ?? undefined} />
              </>}
              <Field label="Collection" value={product.collection?.name ?? undefined} />
              <Field label="Slug" value={product.slug} />
            </div>
            {product.tagline && (
              <div style={{ marginTop: "1rem" }}>
                <span style={labelStyle}>Tagline</span>
                <p style={{ ...valueStyle, fontStyle: "italic", margin: 0 }}>{product.tagline}</p>
              </div>
            )}
            {product.description && (
              <div style={{ marginTop: "1rem" }}>
                <span style={labelStyle}>Description</span>
                <p style={{ ...valueStyle, lineHeight: 1.7, margin: 0 }}>{product.description}</p>
              </div>
            )}
          </section>

          {/* Fragrance Notes */}
          {product.fragranceNotes.length > 0 && (
            <section style={sectionStyle}>
              <h2 style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                color: "var(--color-black)",
                margin: "0 0 1rem",
              }}>
                Fragrance Notes
              </h2>
              {(["TOP", "HEART", "BASE"] as const).map(type => {
                const notes = product.fragranceNotes.filter((n: (typeof product.fragranceNotes)[number]) => n.type === type);
                if (!notes.length) return null;
                const c = NOTE_COLOR[type];
                return (
                  <div key={type} style={{ marginBottom: "0.875rem" }}>
                    <span style={{ ...labelStyle, marginBottom: "0.5rem" }}>{type} Notes</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {notes.map((n: (typeof notes)[number]) => (
                        <span key={n.id} style={{
                          padding: "0.25rem 0.75rem",
                          background: c.bg,
                          color: c.color,
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                        }}>
                          {n.icon ? `${n.icon} ` : ""}{n.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Variants */}
          <section style={sectionStyle}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--color-black)",
              margin: "0 0 1rem",
            }}>
              Variants ({product.variants.length})
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-gray-200)", background: "#FAFAFA" }}>
                  {["Option", "SKU", "Price", "Compare At", "Stock"].map(h => (
                    <th key={h} style={{
                      padding: "0.625rem 0.875rem",
                      textAlign: "left",
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5625rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-gray-600)",
                      fontWeight: 500,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--color-gray-200)", background: i % 2 === 1 ? "#FAFAFA" : "var(--color-white)" }}>
                    <td style={{ padding: "0.75rem 0.875rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "var(--color-black)" }}>{v.optionLabel}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", letterSpacing: "0.04em" }}>{v.sku}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.9375rem", color: "var(--color-black)" }}>{formatPrice(v.price)}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.875rem", color: "#9CA3AF", textDecoration: "line-through" }}>
                      {v.compareAtPrice ? formatPrice(v.compareAtPrice) : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: v.stock < 10 ? 600 : 400,
                        color: v.stock === 0 ? "#EF4444" : v.stock < 10 ? "#F59E0B" : "var(--color-gray-600)",
                      }}>
                        {v.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <section style={sectionStyle}>
              <h2 style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                color: "var(--color-black)",
                margin: "0 0 1rem",
              }}>
                Reviews ({product._count.reviews})
              </h2>
              {product.reviews.map(review => (
                <div key={review.id} style={{ padding: "1rem 0", borderBottom: "1px solid var(--color-gray-200)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-black)" }}>
                        {review.user.name ?? review.user.email}
                      </span>
                      {review.verified && (
                        <span style={{ fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "#D1FAE5", color: "#065F46", padding: "0.15rem 0.5rem", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}>
                          Verified
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ color: star <= review.rating ? "var(--color-primary)" : "#D1D5DB", fontSize: "0.875rem" }}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.body && (
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "var(--color-gray-600)", lineHeight: 1.6, margin: 0 }}>
                      {review.body}
                    </p>
                  )}
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "#9CA3AF", display: "block", marginTop: "0.375rem" }}>
                    {new Date(review.createdAt).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right column — metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.125rem",
              fontWeight: 400,
              color: "var(--color-black)",
              margin: "0 0 1rem",
            }}>
              Summary
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <span style={labelStyle}>Total Stock</span>
                <span style={{
                  ...valueStyle,
                  color: totalStock === 0 ? "#EF4444" : totalStock < 10 ? "#F59E0B" : "var(--color-black)",
                  fontWeight: totalStock < 10 ? 600 : 400,
                }}>
                  {totalStock} units
                </span>
              </div>
              <div>
                <span style={labelStyle}>Variants</span>
                <span style={valueStyle}>{product.variants.length}</span>
              </div>
              <div>
                <span style={labelStyle}>Images</span>
                <span style={valueStyle}>{product.images.length}</span>
              </div>
              <div>
                <span style={labelStyle}>Reviews</span>
                <span style={valueStyle}>{product._count.reviews}</span>
              </div>
              <div>
                <span style={labelStyle}>Created</span>
                <span style={valueStyle}>
                  {new Date(product.createdAt).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <div>
                <span style={labelStyle}>Last Updated</span>
                <span style={valueStyle}>
                  {new Date(product.updatedAt).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </section>

          {(product.seoTitle || product.seoDesc) && (
            <section style={sectionStyle}>
              <h2 style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.125rem",
                fontWeight: 400,
                color: "var(--color-black)",
                margin: "0 0 1rem",
              }}>
                SEO
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Field label="SEO Title" value={product.seoTitle ?? undefined} />
                <Field label="SEO Description" value={product.seoDesc ?? undefined} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
