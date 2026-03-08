"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { VariantSelector } from "./VariantSelector";

interface Variant {
  id: string;
  optionLabel: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
}

interface ProductActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
  productType: "PERFUME" | "JEWELRY";
  imageUrl: string;
  variants: Variant[];
}

export function ProductActions({
  productId,
  productName,
  productSlug,
  productType,
  imageUrl,
  variants,
}: ProductActionsProps) {
  const { addItem, openDrawer } = useCart();
  const [selected, setSelected] = useState<Variant>(variants[0]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!selected) return null;

  const hasDiscount = !!selected.compareAtPrice;
  const inStock = selected.stock > 0;

  const handleAdd = () => {
    if (!inStock || adding) return;
    setAdding(true);
    addItem({
      variantId: selected.id,
      productId,
      productName,
      productSlug,
      productType,
      variantLabel: selected.optionLabel,
      price: selected.price,
      imageUrl,
      quantity: qty,
      maxStock: selected.stock,
    });
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
        <span style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.75rem",
          fontWeight: 300,
          color: "var(--color-black)",
        }}>
          {formatPrice(selected.price)}
        </span>
        {hasDiscount && selected.compareAtPrice && (
          <span style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.25rem",
            fontWeight: 300,
            color: "var(--color-gray-400)",
            textDecoration: "line-through",
          }}>
            {formatPrice(selected.compareAtPrice)}
          </span>
        )}
        {hasDiscount && selected.compareAtPrice && (
          <span style={{
            background: "var(--color-primary)",
            color: "var(--color-white)",
            fontSize: "0.625rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0.2rem 0.5rem",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 600,
          }}>
            Sale
          </span>
        )}
      </div>

      {/* Variant selector */}
      {variants.length > 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-gray-600)",
          }}>
            {productType === "PERFUME" ? "Size" : "Option"}: <strong style={{ color: "var(--color-black)" }}>{selected.optionLabel}</strong>
          </p>
          <VariantSelector
            variants={variants}
            selectedId={selected.id}
            onSelect={(v) => { setSelected(v); setQty(1); }}
          />
        </div>
      )}

      {/* Qty + Add to Bag */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "stretch" }}>
        {/* Qty */}
        <div style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid var(--color-gray-200)",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            style={{
              width: "40px", height: "48px",
              background: "none", border: "none",
              cursor: "pointer", fontSize: "1.125rem",
              color: "var(--color-black)",
            }}
          >
            −
          </button>
          <span style={{
            width: "40px", height: "48px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.875rem",
            borderLeft: "1px solid var(--color-gray-200)",
            borderRight: "1px solid var(--color-gray-200)",
          }}>
            {qty}
          </span>
          <button
            onClick={() => setQty(q => Math.min(selected.stock, q + 1))}
            style={{
              width: "40px", height: "48px",
              background: "none", border: "none",
              cursor: "pointer", fontSize: "1.125rem",
              color: "var(--color-black)",
            }}
          >
            +
          </button>
        </div>

        {/* Add to bag */}
        <button
          onClick={handleAdd}
          disabled={!inStock || adding}
          style={{
            flex: 1,
            height: "48px",
            background: inStock ? "var(--color-black)" : "var(--color-gray-200)",
            color: inStock ? "var(--color-white)" : "var(--color-gray-400)",
            border: "none",
            cursor: inStock ? "pointer" : "not-allowed",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            transition: "background 200ms ease",
          }}
        >
          {adding ? "Added ✓" : inStock ? "Add to Bag" : "Out of Stock"}
        </button>
      </div>

      {/* Stock warning */}
      {inStock && selected.stock <= 5 && (
        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.6875rem",
          color: "#C0392B",
          letterSpacing: "0.05em",
        }}>
          Only {selected.stock} left in stock
        </p>
      )}
    </div>
  );
}
