import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "Shop All" };
export const revalidate = 3600;

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { position: "asc" }, take: 1 },
      collection: { select: { name: true } },
    },
  });

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p className="label" style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }}>Browse</p>
        <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "0 0 1rem" }}>
          All Products
        </h1>
        <p style={{ color: "var(--color-gray-600)", fontSize: "0.875rem" }}>
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {products.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--color-gray-600)", padding: "4rem 0" }}>No products available yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
          {products.map(product => (
            <ProductCard
              key={product.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
