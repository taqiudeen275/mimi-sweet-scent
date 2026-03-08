import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { DeleteProductButton } from "@/components/admin/DeleteProductModal";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Products" };

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: "#D1FAE5", color: "#065F46" },
  DRAFT:    { bg: "#FEF3C7", color: "#92400E" },
  ARCHIVED: { bg: "#F3F4F6", color: "#6B7280" },
};

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; status?: string; sort?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER", "FULFILLMENT_STAFF", "CONTENT_EDITOR"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const params = await searchParams;
  const q      = params.q      ?? "";
  const type   = params.type   ?? "";
  const status = params.status ?? "";
  const sort   = params.sort   ?? "newest";
  const page   = Math.max(1, parseInt(params.page ?? "1", 10));

  // Build where clause
  const where: Prisma.ProductWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (type === "PERFUME" || type === "JEWELRY") where.productType = type;
  if (status === "ACTIVE" || status === "DRAFT" || status === "ARCHIVED") {
    where.status = status;
  }

  // Build orderBy
  type ProductOrderBy = Prisma.ProductOrderByWithRelationInput;
  const orderByMap: Record<string, ProductOrderBy> = {
    newest:     { createdAt: "desc" },
    oldest:     { createdAt: "asc" },
    name:       { name: "asc" },
    "price-asc":  { variants: { _count: "asc" } },
    "price-desc": { variants: { _count: "desc" } },
  };
  const orderBy: ProductOrderBy = orderByMap[sort] ?? orderByMap.newest;

  const total = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      variants: { select: { price: true, stock: true }, orderBy: { price: "asc" } },
      images:   { take: 1, orderBy: { position: "asc" }, select: { url: true, altText: true } },
      _count:   { select: { reviews: true } },
    },
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div className="admin-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          Products
        </h1>
        <Link
          href="/admin/products/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.5rem 1.25rem",
            background: "var(--color-primary)",
            color: "#fff",
            textDecoration: "none",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          New Product
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters total={total} showing={products.length} />

      {/* Desktop Table */}
      <div className="admin-product-table" style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        <div className="admin-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "580px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-gray-200)", background: "#FAFAFA" }}>
              {["Product", "Type", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.875rem 1.25rem",
                    textAlign: h === "Actions" ? "right" : "left",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-gray-600)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product: (typeof products)[number], i: number) => {
              const prices     = product.variants.map((v: (typeof product.variants)[number]) => v.price);
              const minPrice   = prices.length ? Math.min(...prices) : null;
              const maxPrice   = prices.length ? Math.max(...prices) : null;
              const totalStock = product.variants.reduce((s: number, v: (typeof product.variants)[number]) => s + v.stock, 0);
              const s          = STATUS_STYLE[product.status] ?? STATUS_STYLE.DRAFT;
              const isEven     = i % 2 === 1;

              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: "1px solid var(--color-gray-200)",
                    background: isEven ? "#FAFAFA" : "var(--color-white)",
                  }}
                >
                  {/* Product */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      {product.images[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].altText ?? product.name}
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
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-gray-200)",
                          fontSize: "1.25rem",
                        }}>
                          ◈
                        </div>
                      )}
                      <div>
                        <a
                          href={`/admin/products/${product.id}`}
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
                          color: "#9CA3AF",
                          letterSpacing: "0.04em",
                        }}>
                          {product.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: "1rem 1.25rem", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5625rem",
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

                  {/* Price */}
                  <td style={{ padding: "1rem 1.25rem", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "0.9375rem",
                      color: "var(--color-black)",
                    }}>
                      {minPrice === null
                        ? "—"
                        : minPrice === maxPrice
                          ? formatPrice(minPrice)
                          : `${formatPrice(minPrice)} – ${formatPrice(maxPrice!)}`}
                    </span>
                  </td>

                  {/* Stock */}
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

                  {/* Status */}
                  <td style={{ padding: "1rem 1.25rem", whiteSpace: "nowrap" }}>
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

                  {/* Actions */}
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", justifyContent: "flex-end" }}>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        title="Edit product"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.375rem",
                          border: "1px solid transparent",
                          color: "#9CA3AF",
                          textDecoration: "none",
                          borderRadius: "2px",
                          transition: "all 150ms ease",
                        }}
                      >
                        {/* Pencil icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{
                  padding: "4rem",
                  textAlign: "center",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  color: "#9CA3AF",
                }}>
                  {q || type || status
                    ? "No products match your filters"
                    : "No products yet — create your first one"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--color-gray-200)",
          }}>
            <span style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.6875rem",
              color: "var(--color-gray-600)",
            }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {page > 1 && (
                <Link
                  href={`/admin/products?${new URLSearchParams({ ...(q && { q }), ...(type && { type }), ...(status && { status }), sort, page: String(page - 1) })}`}
                  style={{
                    padding: "0.375rem 0.875rem",
                    border: "1px solid var(--color-gray-200)",
                    background: "var(--color-white)",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    color: "var(--color-black)",
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                  }}
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/products?${new URLSearchParams({ ...(q && { q }), ...(type && { type }), ...(status && { status }), sort, page: String(page + 1) })}`}
                  style={{
                    padding: "0.375rem 0.875rem",
                    border: "1px solid var(--color-gray-200)",
                    background: "var(--color-white)",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    color: "var(--color-black)",
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                  }}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="admin-product-cards" style={{ display: "none", flexDirection: "column", gap: 0, background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        {products.length === 0 ? (
          <p style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "#9CA3AF" }}>
            {q || type || status ? "No products match your filters" : "No products yet — create your first one"}
          </p>
        ) : products.map((product: (typeof products)[number], i: number) => {
          const prices     = product.variants.map((v: (typeof product.variants)[number]) => v.price);
          const minPrice   = prices.length ? Math.min(...prices) : null;
          const maxPrice   = prices.length ? Math.max(...prices) : null;
          const totalStock = product.variants.reduce((s: number, v: (typeof product.variants)[number]) => s + v.stock, 0);
          const s          = STATUS_STYLE[product.status] ?? STATUS_STYLE.DRAFT;
          return (
            <div key={product.id} style={{
              padding: "1rem 1.25rem",
              borderBottom: i < products.length - 1 ? "1px solid var(--color-gray-200)" : "none",
              display: "flex", gap: "0.875rem", alignItems: "flex-start",
            }}>
              {/* Thumbnail */}
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0].url} alt={product.images[0].altText ?? product.name}
                  style={{ width: "44px", height: "52px", objectFit: "cover", flexShrink: 0, background: "var(--color-cream)" }} />
              ) : (
                <div style={{ width: "44px", height: "52px", background: "var(--color-cream)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-gray-200)", fontSize: "1.25rem" }}>◈</div>
              )}
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <a href={`/admin/products/${product.id}`} style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", color: "var(--color-black)", textDecoration: "none", lineHeight: 1.3 }}>
                    {product.name}
                  </a>
                  <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                    <a href={`/admin/products/${product.id}/edit`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.375rem", color: "#9CA3AF", textDecoration: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </a>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.375rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", color: product.productType === "PERFUME" ? "#7C3AED" : "#B45309", background: product.productType === "PERFUME" ? "#EDE9FE" : "#FEF3C7", padding: "0.15rem 0.4rem", fontWeight: 600 }}>
                    {product.productType}
                  </span>
                  <span style={{ display: "inline-block", padding: "0.15rem 0.4rem", background: s.bg, color: s.color, fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                    {product.status}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.9375rem", color: "var(--color-black)" }}>
                    {minPrice === null ? "—" : minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice!)}`}
                  </span>
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: totalStock === 0 ? "#EF4444" : totalStock < 10 ? "#F59E0B" : "var(--color-gray-600)", fontWeight: totalStock < 10 ? 600 : 400 }}>
                    {totalStock} in stock
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderTop: "1px solid var(--color-gray-200)" }}>
            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)" }}>Page {page} / {totalPages}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {page > 1 && <a href={`/admin/products?${new URLSearchParams({ ...(q && { q }), ...(type && { type }), ...(status && { status }), sort, page: String(page - 1) })}`} style={{ padding: "0.375rem 0.75rem", border: "1px solid var(--color-gray-200)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-black)", textDecoration: "none" }}>← Prev</a>}
              {page < totalPages && <a href={`/admin/products?${new URLSearchParams({ ...(q && { q }), ...(type && { type }), ...(status && { status }), sort, page: String(page + 1) })}`} style={{ padding: "0.375rem 0.75rem", border: "1px solid var(--color-gray-200)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-black)", textDecoration: "none" }}>Next →</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
