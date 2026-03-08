import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };
export const revalidate = 60;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: "#D1FAE5", color: "#065F46" },
  DRAFT:    { bg: "#FEF3C7", color: "#92400E" },
  ARCHIVED: { bg: "#F3F4F6", color: "#6B7280" },
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: { select: { price: true, stock: true } },
      images: { take: 1, select: { url: true } },
      _count: { select: { reviews: true } },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          Products
        </h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            color: "var(--color-gray-600)",
          }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-gray-200)", background: "#FAFAFA" }}>
              {["Product", "Type", "Price Range", "Stock", "Reviews", "Status"].map((h) => (
                <th key={h} style={{
                  padding: "0.875rem 1.25rem",
                  textAlign: "left",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.12em",
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
            {products.map((product, i) => {
              const prices = product.variants.map((v) => v.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
              const s = STATUS_STYLE[product.status] ?? STATUS_STYLE.DRAFT;

              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: i < products.length - 1 ? "1px solid var(--color-gray-200)" : "none",
                  }}
                >
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      {product.images[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          style={{
                            width: "40px",
                            height: "48px",
                            objectFit: "cover",
                            flexShrink: 0,
                            background: "var(--color-cream)",
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "40px",
                          height: "48px",
                          background: "var(--color-cream)",
                          flexShrink: 0,
                        }} />
                      )}
                      <div>
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontSize: "1rem",
                            color: "var(--color-black)",
                            textDecoration: "none",
                            display: "block",
                            lineHeight: 1.3,
                          }}
                        >
                          {product.name}
                        </a>
                        <span style={{
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.625rem",
                          color: "var(--color-gray-400)",
                          letterSpacing: "0.05em",
                        }}>
                          {product.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.625rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: product.productType === "PERFUME" ? "#7C3AED" : "#B45309",
                      background: product.productType === "PERFUME" ? "#EDE9FE" : "#FEF3C7",
                      padding: "0.2rem 0.5rem",
                      fontWeight: 600,
                    }}>
                      {product.productType}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "0.9375rem",
                      color: "var(--color-black)",
                    }}>
                      {prices.length === 0 ? "—" : minPrice === maxPrice
                        ? formatPrice(minPrice)
                        : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.75rem",
                      color: totalStock === 0 ? "#EF4444" : totalStock < 10 ? "#F59E0B" : "var(--color-gray-600)",
                      fontWeight: totalStock < 10 ? 600 : 400,
                    }}>
                      {totalStock}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.75rem",
                      color: "var(--color-gray-600)",
                    }}>
                      {product._count.reviews}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
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
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{
                  padding: "3rem",
                  textAlign: "center",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  color: "var(--color-gray-400)",
                }}>
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
