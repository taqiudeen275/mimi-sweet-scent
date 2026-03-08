import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants:      { orderBy: { price: "asc" } },
      images:        { orderBy: { position: "asc" } },
      fragranceNotes: { orderBy: { type: "asc" } },
    },
  });

  if (!product) notFound();

  const initial: ProductFormData = {
    id:              product.id,
    name:            product.name,
    slug:            product.slug,
    productType:     product.productType,
    status:          product.status,
    tagline:         product.tagline ?? "",
    description:     product.description ?? "",
    concentration:   product.concentration ?? "",
    genderTag:       product.genderTag ?? "",
    sillage:         product.sillage ?? "",
    longevity:       product.longevity ?? "",
    seasonRec:       product.seasonRec ?? "",
    perfumerProfile: product.perfumerProfile ?? "",
    material:        product.material ?? "",
    stone:           product.stone ?? "",
    seoTitle:        product.seoTitle ?? "",
    seoDesc:         product.seoDesc ?? "",
    collectionId:    product.collectionId ?? "",
    variants: product.variants.map(v => ({
      id:           v.id,
      optionLabel:  v.optionLabel,
      sku:          v.sku,
      priceGHS:     (v.price / 100).toFixed(2),
      compareAtGHS: v.compareAtPrice ? (v.compareAtPrice / 100).toFixed(2) : "",
      stock:        String(v.stock),
    })),
    fragranceNotes: product.fragranceNotes.map(n => ({
      id:   n.id,
      type: n.type,
      name: n.name,
      icon: n.icon ?? "",
    })),
    images: product.images.map(img => ({
      id:      img.id,
      url:     img.url,
      altText: img.altText ?? "",
      position: img.position,
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Breadcrumb */}
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
            Edit
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
          }}>
            {product.name}
          </h1>
          <Link
            href={`/admin/products/${id}`}
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              textDecoration: "none",
              border: "1px solid var(--color-gray-200)",
              padding: "0.375rem 0.875rem",
            }}
          >
            View Details
          </Link>
        </div>
      </div>

      <ProductForm initial={initial} />
    </div>
  );
}
