import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product" };

const defaultForm: ProductFormData = {
  name:            "",
  slug:            "",
  productType:     "PERFUME",
  status:          "DRAFT",
  tagline:         "",
  description:     "",
  concentration:   "",
  genderTag:       "",
  sillage:         "",
  longevity:       "",
  seasonRec:       "",
  perfumerProfile: "",
  material:        "",
  stone:           "",
  seoTitle:        "",
  seoDesc:         "",
  collectionId:    "",
  variants:        [{ optionLabel: "", sku: "", priceGHS: "", compareAtGHS: "", stock: "0" }],
  fragranceNotes:  [],
  images:          [],
};

export default function NewProductPage() {
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
            New Product
          </span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          New Product
        </h1>
      </div>

      <ProductForm initial={defaultForm} mode="create" />
    </div>
  );
}
