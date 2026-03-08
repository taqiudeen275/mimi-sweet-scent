"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  images: { url: string }[];
}

interface WishlistVariant {
  id: string;
  optionLabel: string;
  price: number;
  stock: number;
}

interface WishlistItem {
  id: string;
  product: WishlistProduct;
  productVariant: WishlistVariant;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/account/login?callbackUrl=/account/wishlist");
    }
  }, [status, router]);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, fetchWishlist]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }

  async function handleRemove(variantId: string) {
    setActionLoading(prev => ({ ...prev, [`remove-${variantId}`]: true }));
    try {
      await fetch(`/api/wishlist?variantId=${variantId}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.productVariant.id !== variantId));
      showToast("Removed from wishlist");
    } catch {
      showToast("Something went wrong");
    } finally {
      setActionLoading(prev => ({ ...prev, [`remove-${variantId}`]: false }));
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    const variantId = item.productVariant.id;
    setActionLoading(prev => ({ ...prev, [`cart-${variantId}`]: true }));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productVariantId: variantId, quantity: 1 }),
      });
      if (res.ok) {
        showToast("Added to bag");
      } else {
        const data = await res.json();
        showToast(data.error ?? "Could not add to bag");
      }
    } catch {
      showToast("Something went wrong");
    } finally {
      setActionLoading(prev => ({ ...prev, [`cart-${variantId}`]: false }));
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.875rem",
          color: "var(--color-gray-600)",
        }}>
          Loading…
        </p>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "var(--color-black)",
          color: "var(--color-white)",
          padding: "0.75rem 1.25rem",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          zIndex: 9999,
          pointerEvents: "none",
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2.5rem",
      }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          My Wishlist
        </h1>
        <Link href="/account/profile" style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.625rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-primary)",
          textDecoration: "none",
        }}>
          ← Profile
        </Link>
      </div>

      {items.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          border: "1px solid var(--color-gray-200)",
          background: "var(--color-cream)",
        }}>
          <p style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.5rem",
            color: "var(--color-black)",
            marginBottom: "1rem",
          }}>
            Your wishlist is empty
          </p>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.875rem",
            color: "var(--color-gray-600)",
            marginBottom: "2rem",
          }}>
            Browse our collection to save items you love.
          </p>
          <Link href="/shop" style={{
            display: "inline-block",
            background: "var(--color-black)",
            color: "var(--color-white)",
            padding: "0.75rem 2rem",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            Browse Collection
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}>
          {items.map((item) => {
            const imageUrl = item.product.images[0]?.url;
            const variantId = item.productVariant.id;
            const isRemoving = actionLoading[`remove-${variantId}`];
            const isAddingCart = actionLoading[`cart-${variantId}`];
            const inStock = item.productVariant.stock > 0;

            return (
              <div key={item.id} style={{
                border: "1px solid var(--color-gray-200)",
                background: "var(--color-white)",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Product image */}
                <Link href={`/product/${item.product.slug}`} style={{ display: "block" }}>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    background: "var(--color-cream)",
                    overflow: "hidden",
                  }}>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 280px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--color-cream)",
                      }} />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div style={{
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  flex: 1,
                }}>
                  <Link href={`/product/${item.product.slug}`} style={{ textDecoration: "none" }}>
                    <h3 style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.125rem",
                      fontWeight: 400,
                      color: "var(--color-black)",
                      margin: 0,
                      lineHeight: 1.2,
                    }}>
                      {item.product.name}
                    </h3>
                  </Link>

                  <p style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    color: "var(--color-gray-600)",
                    letterSpacing: "0.05em",
                    margin: 0,
                  }}>
                    {item.productVariant.optionLabel}
                  </p>

                  <p style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.125rem",
                    fontWeight: 300,
                    color: "var(--color-black)",
                    margin: 0,
                  }}>
                    {formatPrice(item.productVariant.price)}
                  </p>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!inStock || isAddingCart}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        background: inStock ? "var(--color-primary)" : "var(--color-gray-200)",
                        color: inStock ? "var(--color-white)" : "var(--color-gray-400)",
                        border: "none",
                        cursor: inStock && !isAddingCart ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.625rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        transition: "opacity 150ms ease",
                        opacity: isAddingCart ? 0.6 : 1,
                      }}
                    >
                      {isAddingCart ? "Adding…" : inStock ? "Add to Bag" : "Out of Stock"}
                    </button>

                    <button
                      onClick={() => handleRemove(variantId)}
                      disabled={isRemoving}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: isRemoving ? "default" : "pointer",
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.625rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-gray-600)",
                        textDecoration: "underline",
                        padding: "0.25rem 0",
                        opacity: isRemoving ? 0.4 : 1,
                        transition: "opacity 150ms ease",
                      }}
                    >
                      {isRemoving ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
