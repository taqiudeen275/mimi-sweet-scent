"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

interface ProductVariant {
  id: string;
  optionLabel: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
}

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  productType: "PERFUME" | "JEWELRY";
  concentration?: string | null;
  material?: string | null;
  collectionName?: string | null;
  imageUrl: string;
  variants: ProductVariant[];
  isNew?: boolean;
}

export function ProductCard({
  name, slug, productType, concentration, material,
  collectionName, imageUrl, variants, isNew,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [hovering, setHovering] = useState(false);
  const [adding, setAdding] = useState(false);

  const cheapest = variants.reduce((min, v) => v.price < min.price ? v : min, variants[0]);
  const hasDiscount = !!cheapest?.compareAtPrice;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cheapest) return;
    setAdding(true);
    addItem({
      variantId: cheapest.id,
      productId: slug,
      productName: name,
      productSlug: slug,
      productType,
      variantLabel: cheapest.optionLabel,
      price: cheapest.price,
      imageUrl,
      quantity: 1,
      maxStock: cheapest.stock,
    });
    setTimeout(() => setAdding(false), 800);
  };

  const badge = productType === "PERFUME" ? concentration : material;

  return (
    <Link
      href={`/product/${slug}`}
      className="product-card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "var(--color-white)",
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image container */}
      <div style={{
        position: "relative",
        aspectRatio: "3/4",
        overflow: "hidden",
        background: "var(--color-cream)",
      }}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="product-card-image"
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges */}
        <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {isNew && (
            <span style={{
              background: "var(--color-black)",
              color: "var(--color-white)",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.25rem 0.625rem",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 600,
            }}>
              New
            </span>
          )}
          {hasDiscount && (
            <span style={{
              background: "var(--color-primary)",
              color: "var(--color-white)",
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.25rem 0.625rem",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 600,
            }}>
              Sale
            </span>
          )}
        </div>

        {/* Quick Add overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(26,26,26,0.35)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "1.5rem",
          opacity: hovering ? 1 : 0,
          transition: "opacity 250ms ease",
        }}>
          <button
            onClick={handleQuickAdd}
            style={{
              background: "var(--color-white)",
              color: "var(--color-black)",
              border: "none",
              padding: "0.625rem 1.5rem",
              fontSize: "0.6875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transform: hovering ? "translateY(0)" : "translateY(8px)",
              transition: "transform 250ms ease, background 200ms ease, color 200ms ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-primary)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-white)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-white)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-black)";
            }}
          >
            {adding ? "Added ✓" : `+ Quick Add`}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "1rem 0 1.5rem" }}>
        {collectionName && (
          <p style={{
            fontSize: "0.625rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-primary)",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 500,
            marginBottom: "0.375rem",
          }}>
            {collectionName}
          </p>
        )}
        <h3 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.125rem",
          fontWeight: 400,
          color: "var(--color-black)",
          lineHeight: 1.3,
          margin: 0,
        }}>
          {name}
        </h3>
        {badge && (
          <p style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.05em",
            color: "var(--color-gray-600)",
            fontFamily: "var(--font-montserrat), sans-serif",
            marginTop: "0.25rem",
          }}>
            {badge}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.5rem" }}>
          <span style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1rem",
            fontWeight: 300,
            color: "var(--color-black)",
          }}>
            {variants.length > 1 ? "From " : ""}{formatPrice(cheapest?.price ?? 0)}
          </span>
          {hasDiscount && cheapest?.compareAtPrice && (
            <span style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "0.875rem",
              fontWeight: 300,
              color: "var(--color-gray-600)",
              textDecoration: "line-through",
            }}>
              {formatPrice(cheapest.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
