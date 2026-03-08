"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface RecentProduct {
  id:       string;
  slug:     string;
  name:     string;
  price:    number;
  imageUrl: string | null;
}

const KEY = "mimi_recently_viewed";
const MAX = 6;

export function saveRecentlyViewed(product: RecentProduct) {
  try {
    const existing: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    const filtered = existing.filter(p => p.id !== product.id);
    const updated  = [product, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      setItems(stored.filter(p => p.id !== excludeId).slice(0, 4));
    } catch {}
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section style={{ padding: "3rem 2rem", maxWidth: "1280px", margin: "0 auto" }}>
      <p style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.5625rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--color-primary)",
        marginBottom: "0.5rem",
        fontWeight: 600,
      }}>
        Recently Viewed
      </p>
      <h2 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "1.75rem",
        fontWeight: 300,
        color: "var(--color-black)",
        margin: "0 0 2rem",
      }}>
        Continue Exploring
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "1.5rem",
      }}>
        {items.map(item => (
          <Link key={item.id} href={`/product/${item.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div>
              <div style={{
                position: "relative",
                aspectRatio: "3/4",
                background: "var(--color-cream)",
                marginBottom: "0.875rem",
                overflow: "hidden",
              }}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover", transition: "transform 400ms ease" }}
                    sizes="200px"
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: "var(--color-gray-200)" }} />
                )}
              </div>
              <p style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1rem",
                fontWeight: 400,
                color: "var(--color-black)",
                margin: "0 0 0.25rem",
              }}>
                {item.name}
              </p>
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                color: "var(--color-gray-600)",
                margin: 0,
              }}>
                {formatPrice(item.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
