import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Shop All" };
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { q, type, sort = "newest", priceMin, priceMax } = params;

  // Build where clause
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }

  if (type === "PERFUME" || type === "JEWELRY") {
    where.productType = type;
  }

  // Price filter — variant price is stored in smallest unit (pesewas)
  // UI passes GHS, convert ×100
  if (priceMin || priceMax) {
    const variantFilter: Prisma.ProductVariantWhereInput = {};
    if (priceMin) variantFilter.price = { ...((variantFilter.price as object) ?? {}), gte: Math.round(parseFloat(priceMin) * 100) };
    if (priceMax) variantFilter.price = { ...((variantFilter.price as object) ?? {}), lte: Math.round(parseFloat(priceMax) * 100) };
    where.variants = { some: variantFilter };
  }

  // Build orderBy (price sort done in JS — Prisma 7 does not support _min aggregate on relation orderBy)
  type OrderByType = Prisma.ProductOrderByWithRelationInput;
  let orderBy: OrderByType = { createdAt: "desc" };
  if (sort === "name-asc") orderBy = { name: "asc" };

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { position: "asc" }, take: 1 },
      collection: { select: { name: true } },
    },
  });

  const products =
    sort === "price-asc"
      ? [...rawProducts].sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0))
      : sort === "price-desc"
      ? [...rawProducts].sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0))
      : rawProducts;

  return (
    <div style={{ minHeight: "60vh" }}>
      {/* Header */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem 2rem", textAlign: "center" }}>
        <p className="label" style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }}>Browse</p>
        <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "0 0 1.5rem" }}>
          All Products
        </h1>
      </div>

      {/* Filters — needs Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <ShopFilters resultCount={products.length} />
      </Suspense>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem 5rem" }}>
        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-600)", padding: "4rem 0" }}>
            No products found.{q ? ` Try a different search term.` : ""}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
            {products.map(product => (
              <div key={product.id} className="product-grid-item">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  productType={product.productType as "PERFUME" | "JEWELRY"}
                  concentration={product.concentration}
                  material={product.material}
                  collectionName={product.collection?.name}
                  imageUrl={product.images[0]?.url ?? ""}
                  variants={product.variants.map(v => ({ id: v.id, optionLabel: v.optionLabel, price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock }))}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
