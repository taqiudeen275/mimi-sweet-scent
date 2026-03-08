import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { JewelryFilters } from "@/components/shop/JewelryFilters";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Jewelry" };
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    gender?: string;
  }>;
}

export default async function JewelryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { sort = "newest", gender } = params;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    productType: "JEWELRY",
  };

  if (gender === "WOMEN" || gender === "MEN" || gender === "UNISEX") {
    where.genderTag = gender;
  }

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

  // Sort by price in JS — Prisma 7 does not support _min aggregate on relation orderBy
  const products =
    sort === "price-asc"
      ? [...rawProducts].sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0))
      : sort === "price-desc"
      ? [...rawProducts].sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0))
      : rawProducts;

  return (
    <>
      {/* Category hero */}
      <div style={{ position: "relative", height: "360px", overflow: "hidden" }}>
        <Image
          src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1400&q=80"
          alt="Fine Jewelry"
          fill priority
          style={{ objectFit: "cover", objectPosition: "center 60%" }}
          sizes="100vw"
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <p className="label" style={{ color: "var(--color-primary)", marginBottom: "1rem" }}>Handcrafted</p>
          <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "var(--color-white)", margin: 0 }}>
            Fine Jewelry
          </h1>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <JewelryFilters resultCount={products.length} />
      </Suspense>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem 5rem" }}>
        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-600)", padding: "4rem 0" }}>
            No jewelry matches your filters.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
            {products.map(product => (
              <div key={product.id} className="product-grid-item">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  productType="JEWELRY"
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
    </>
  );
}
