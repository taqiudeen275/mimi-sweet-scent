"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, totalItems, removeItem, updateQty, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "4rem 2rem",
        textAlign: "center",
      }}>
        <svg width="56" height="56" fill="none" stroke="var(--color-gray-200)" strokeWidth="1" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          Your bag is empty
        </h1>
        <p style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.875rem",
          color: "var(--color-gray-600)",
        }}>
          Discover our fragrances and jewelry
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/fragrances" className="btn btn-primary">Shop Fragrances</Link>
          <Link href="/jewelry" className="btn btn-secondary">Shop Jewelry</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--color-white)" }}>
      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
          .cart-summary { position: static !important; }
        }
      `}</style>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "3rem 2rem 5rem",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2.25rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
          }}>
            Your Bag
            <span style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 400,
              color: "var(--color-gray-600)",
              marginLeft: "0.75rem",
            }}>
              ({totalItems})
            </span>
          </h1>
          <button
            onClick={clearCart}
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear All
          </button>
        </div>

        <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "3rem", alignItems: "start" }}>
          {/* Items */}
          <div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {items.map((item, i) => (
                <li key={item.variantId} style={{
                  display: "flex",
                  gap: "1.5rem",
                  padding: "1.75rem 0",
                  borderBottom: i < items.length - 1 ? "1px solid var(--color-gray-200)" : "none",
                  borderTop: i === 0 ? "1px solid var(--color-gray-200)" : "none",
                }}>
                  {/* Image */}
                  <div style={{
                    flexShrink: 0,
                    width: "100px",
                    height: "120px",
                    position: "relative",
                    background: "var(--color-cream)",
                    overflow: "hidden",
                  }}>
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="100px"
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Link
                      href={`/product/${item.productSlug}`}
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "1.25rem",
                        fontWeight: 400,
                        color: "var(--color-black)",
                        textDecoration: "none",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.productName}
                    </Link>
                    <p style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.05em",
                      color: "var(--color-gray-600)",
                      margin: 0,
                    }}>
                      {item.variantLabel}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.0625rem",
                      fontWeight: 300,
                      color: "var(--color-black)",
                      margin: "0.25rem 0 0",
                    }}>
                      {formatPrice(item.price)} each
                    </p>

                    {/* Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "auto", paddingTop: "0.75rem" }}>
                      {/* Qty stepper */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid var(--color-gray-200)",
                      }}>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          style={{
                            width: "32px", height: "32px",
                            background: "none", border: "none",
                            cursor: "pointer", fontSize: "1rem",
                            color: "var(--color-black)",
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          width: "36px", height: "32px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.8125rem",
                          borderLeft: "1px solid var(--color-gray-200)",
                          borderRight: "1px solid var(--color-gray-200)",
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          style={{
                            width: "32px", height: "32px",
                            background: "none", border: "none",
                            cursor: item.quantity >= item.maxStock ? "not-allowed" : "pointer",
                            fontSize: "1rem",
                            color: item.quantity >= item.maxStock ? "var(--color-gray-200)" : "var(--color-black)",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        style={{
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.625rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--color-gray-600)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.25rem",
                      fontWeight: 300,
                      color: "var(--color-black)",
                    }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "2rem" }}>
              <Link
                href="/shop"
                style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-primary)",
                  paddingBottom: "2px",
                }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="cart-summary" style={{
            position: "sticky",
            top: "calc(64px + 2rem)",
            background: "var(--color-cream)",
            padding: "2rem",
          }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.375rem",
              fontWeight: 400,
              color: "var(--color-black)",
              marginBottom: "1.5rem",
            }}>
              Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
              {items.map((item) => (
                <div key={item.variantId} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    color: "var(--color-gray-600)",
                    maxWidth: "180px",
                  }}>
                    {item.productName} × {item.quantity}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "0.9375rem",
                    color: "var(--color-black)",
                    flexShrink: 0,
                  }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                }}>
                  Subtotal
                </span>
                <span style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "1.25rem",
                  fontWeight: 300,
                  color: "var(--color-black)",
                }}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                color: "var(--color-gray-600)",
                marginBottom: "1.5rem",
                letterSpacing: "0.03em",
              }}>
                Shipping calculated at checkout
              </p>

              <Link
                href="/checkout"
                className="btn btn-primary"
                style={{ display: "block", textAlign: "center", width: "100%" }}
              >
                Proceed to Checkout
              </Link>

              <div style={{
                marginTop: "1.25rem",
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                opacity: 0.5,
              }}>
                {["MTN MoMo", "Telecel Cash", "AirtelTigo"].map((p) => (
                  <span key={p} style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-gray-600)",
                    border: "1px solid var(--color-gray-200)",
                    padding: "0.25rem 0.375rem",
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
