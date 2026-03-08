"use client";

import { useState, useEffect } from "react";
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

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  // Check if current variant is in wishlist on mount or when variant changes
  useEffect(() => {
    let cancelled = false;
    async function checkWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const items: { productVariant: { id: string } }[] = data.items ?? [];
        setWishlisted(items.some(i => i.productVariant.id === selected.id));
      } catch {
        // not logged in or error — ignore
      }
    }
    checkWishlist();
    return () => { cancelled = true; };
  }, [selected.id]);

  function showWishlistToast(msg: string) {
    setWishlistToast(msg);
    setTimeout(() => setWishlistToast(null), 2000);
  }

  async function handleWishlistToggle() {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        const res = await fetch(`/api/wishlist?variantId=${selected.id}`, { method: "DELETE" });
        if (res.ok) {
          setWishlisted(false);
          showWishlistToast("Removed from wishlist");
        } else if (res.status === 401) {
          showWishlistToast("Sign in to manage your wishlist");
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, productVariantId: selected.id }),
        });
        if (res.ok) {
          setWishlisted(true);
          showWishlistToast("Saved to wishlist");
        } else if (res.status === 401) {
          showWishlistToast("Sign in to save to wishlist");
        }
      }
    } catch {
      showWishlistToast("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  }

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

      {/* Wishlist toggle */}
      <div style={{ position: "relative" }}>
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          style={{
            width: "100%",
            height: "44px",
            background: "none",
            border: "1px solid var(--color-gray-200)",
            cursor: wishlistLoading ? "default" : "pointer",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: wishlisted ? "var(--color-primary)" : "var(--color-gray-600)",
            fontWeight: 500,
            transition: "color 150ms ease, border-color 150ms ease",
            borderColor: wishlisted ? "var(--color-primary)" : "var(--color-gray-200)",
            opacity: wishlistLoading ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>
            {wishlisted ? "♥" : "♡"}
          </span>
          {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
        </button>

        {/* Inline toast */}
        {wishlistToast && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "var(--color-black)",
            color: "var(--color-white)",
            padding: "0.5rem 0.75rem",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.08em",
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}>
            {wishlistToast}
          </div>
        )}
      </div>

      {/* Stock warning */}
      {inStock && selected.stock <= 5 && (
        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.6875rem",
          color: "var(--color-error)",
          letterSpacing: "0.05em",
        }}>
          Only {selected.stock} left in stock
        </p>
      )}
    </div>
  );
}
