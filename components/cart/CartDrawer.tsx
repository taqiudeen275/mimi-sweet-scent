"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, drawerOpen, subtotal, totalItems, removeItem, updateQty, closeDrawer } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.5)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      />

      {/* Panel */}
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(440px, 100vw)",
          background: "#fff",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 350ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-gray-200)",
          }}
        >
          <h2 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.5rem", fontWeight: 400,
            color: "var(--color-black)",
          }}>
            Your Bag
            {totalItems > 0 && (
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.75rem", fontWeight: 500,
                color: "var(--color-gray-600)",
                marginLeft: "0.5rem",
                letterSpacing: "0.05em",
              }}>
                ({totalItems})
              </span>
            )}
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Close bag"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0.5rem", color: "var(--color-black)",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.5rem" }}>
          {items.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: "1rem",
              textAlign: "center",
            }}>
              <svg width="48" height="48" fill="none" stroke="var(--color-gray-200)" strokeWidth="1" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.25rem", color: "var(--color-black)",
              }}>
                Your bag is empty
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-gray-600)" }}>
                Discover our fragrances and jewelry
              </p>
              <button
                onClick={closeDrawer}
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0" }}>
              {items.map((item, idx) => (
                <li
                  key={item.variantId}
                  style={{
                    display: "flex", gap: "1rem",
                    paddingBottom: "1.5rem",
                    marginBottom: idx < items.length - 1 ? "1.5rem" : 0,
                    borderBottom: idx < items.length - 1 ? "1px solid var(--color-gray-200)" : "none",
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    flexShrink: 0,
                    width: "80px", height: "96px",
                    position: "relative",
                    background: "var(--color-cream)",
                    overflow: "hidden",
                  }}>
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/product/${item.productSlug}`}
                      onClick={closeDrawer}
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "1rem", fontWeight: 400,
                        color: "var(--color-black)",
                        textDecoration: "none",
                        display: "block",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.productName}
                    </Link>
                    <p style={{
                      fontSize: "0.75rem",
                      color: "var(--color-gray-600)",
                      marginTop: "0.25rem",
                      letterSpacing: "0.03em",
                    }}>
                      {item.variantLabel}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1rem", fontWeight: 300,
                      color: "var(--color-black)",
                      marginTop: "0.5rem",
                    }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    {/* Qty + Remove */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.75rem" }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        border: "1px solid var(--color-gray-200)",
                      }}>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          aria-label="Decrease"
                          style={{
                            width: "28px", height: "28px",
                            background: "none", border: "none",
                            cursor: "pointer", fontSize: "1rem",
                            color: "var(--color-black)",
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          width: "28px", height: "28px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.8125rem",
                          borderLeft: "1px solid var(--color-gray-200)",
                          borderRight: "1px solid var(--color-gray-200)",
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          aria-label="Increase"
                          disabled={item.quantity >= item.maxStock}
                          style={{
                            width: "28px", height: "28px",
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
                          background: "none", border: "none",
                          cursor: "pointer", fontSize: "0.75rem",
                          color: "var(--color-gray-600)",
                          textDecoration: "underline",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            borderTop: "1px solid var(--color-gray-200)",
            padding: "1.5rem",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "baseline", marginBottom: "1.25rem",
            }}>
              <span style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}>
                Subtotal
              </span>
              <span style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.5rem", fontWeight: 300,
              }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <p style={{
              fontSize: "0.6875rem",
              color: "var(--color-gray-600)",
              marginBottom: "1rem",
              textAlign: "center",
              letterSpacing: "0.03em",
            }}>
              Shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="btn btn-primary"
              style={{ width: "100%", display: "block", textAlign: "center" }}
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeDrawer}
              style={{
                width: "100%", marginTop: "0.75rem",
                background: "none", border: "none",
                cursor: "pointer", fontSize: "0.75rem",
                color: "var(--color-gray-600)",
                letterSpacing: "0.05em",
                textDecoration: "underline",
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
