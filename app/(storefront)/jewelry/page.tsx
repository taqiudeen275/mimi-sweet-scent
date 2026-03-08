import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "Jewelry" };
export const revalidate = 3600;

export default async function JewelryPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", productType: "JEWELRY" },
    orderBy: { createdAt: "desc" },
    include: {
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { position: "asc" }, take: 1 },
      collection: { select: { name: true } },
    },
  });

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

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem" }}>
        <p style={{ color: "var(--color-gray-600)", fontSize: "0.875rem", marginBottom: "3rem" }}>
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-gray-600)", padding: "4rem 0" }}>No jewelry available yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem" }}>
            {products.map(product => (
              <div key={product.id} className="product-grid-item">
              <ProductCard
                key={product.id}
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
