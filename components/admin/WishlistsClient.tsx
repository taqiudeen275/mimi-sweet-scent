"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface WishlistRow {
  productId: string;
  count: number;
  product: {
    id: string;
    name: string;
    slug: string;
    productType: string;
    images: { url: string }[];
    variants: { price: number }[];
  } | null;
}

interface Stats {
  totalWishlists: number;
  totalItems: number;
  topProductName: string | null;
}

interface Props {
  initialItems: WishlistRow[];
  initialTotal: number;
  initialStats: Stats;
}

const th: React.CSSProperties = {
  padding: "0.75rem 1rem", textAlign: "left",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5rem", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
  fontWeight: 500, whiteSpace: "nowrap",
};

export function WishlistsClient({ initialItems, initialTotal, initialStats }: Props) {
  const [items, setItems]   = useState<WishlistRow[]>(initialItems);
  const [total, setTotal]   = useState(initialTotal);
  const [stats]             = useState<Stats>(initialStats);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(Math.ceil(initialTotal / 20));
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async (p: number) => {
    setLoading(true);
    const res  = await fetch(`/api/admin/wishlists?page=${p}`);
    const data = await res.json();
    setItems(data.items);
    setTotal(data.total);
    setPages(data.pages);
    setPage(p);
    setLoading(false);
  }, []);

  const ten = items.filter(i => i.count >= 10).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Wishlists",     value: stats.totalWishlists,  color: "var(--color-black)" },
          { label: "Total Saved Items",   value: stats.totalItems,      color: "var(--color-black)" },
          { label: "Most Wished Product", value: stats.topProductName ?? "—", color: "var(--color-primary)", small: true },
          { label: "Products with 10+",   value: ten,                   color: "var(--color-primary)" },
        ].map(({ label, value, color, small }) => (
          <div key={label} style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", padding: "1.25rem 1.5rem" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gray-600)", margin: "0 0 0.5rem" }}>{label}</p>
            <p style={{ fontFamily: small ? "var(--font-montserrat), sans-serif" : "var(--font-cormorant), Georgia, serif", fontSize: small ? "0.75rem" : "2rem", fontWeight: small ? 500 : 300, color, margin: 0, lineHeight: 1.2 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", opacity: loading ? 0.6 : 1, transition: "opacity 150ms" }}>
        {items.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 300, color: "var(--color-gray-600)", margin: "0 0 0.5rem" }}>No wishlist data yet</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-400)", margin: 0 }}>Data will appear here once customers save products to their wishlists.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#111110" }}>
                  {["#", "Product", "Type", "Price", "Times Saved", ""].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => {
                  const p = row.product;
                  const imgUrl = p?.images[0]?.url ?? null;
                  const price  = p?.variants[0]?.price;
                  const rank   = (page - 1) * 20 + i + 1;
                  return (
                    <tr key={row.productId} style={{ borderBottom: "1px solid var(--color-gray-200)", background: i % 2 === 1 ? "rgba(0,0,0,0.015)" : "transparent" }}>
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 300, color: "var(--color-gray-400)", width: "48px" }}>
                        {rank}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          {imgUrl ? (
                            <div style={{ position: "relative", width: "40px", height: "48px", flexShrink: 0, background: "var(--color-cream)" }}>
                              <Image src={imgUrl} alt={p?.name ?? ""} fill style={{ objectFit: "cover" }} sizes="40px" />
                            </div>
                          ) : (
                            <div style={{ width: "40px", height: "48px", background: "var(--color-cream)", flexShrink: 0 }} />
                          )}
                          <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", fontWeight: 500, color: "var(--color-black)" }}>
                            {p?.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {p?.productType && (
                          <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", background: p.productType === "PERFUME" ? "rgba(184,134,11,0.1)" : "rgba(99,102,241,0.1)", color: p.productType === "PERFUME" ? "var(--color-primary)" : "#6366F1", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, borderRadius: "2px" }}>
                            {p.productType === "PERFUME" ? "Perfume" : "Jewelry"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-black)" }}>
                        {price != null ? formatPrice(price) : "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.75rem", fontWeight: 300, color: "var(--color-primary)" }}>
                          {row.count}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        {p?.slug && (
                          <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-primary)", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", margin: 0 }}>
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} products
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button disabled={page <= 1} onClick={() => fetch_(page - 1)}
                style={{ padding: "0.35rem 0.875rem", border: "1px solid var(--color-gray-200)", background: "none", color: page <= 1 ? "var(--color-gray-400)" : "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: page <= 1 ? "not-allowed" : "pointer" }}>
                ← Prev
              </button>
              <span style={{ padding: "0.35rem 0.75rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)" }}>{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => fetch_(page + 1)}
                style={{ padding: "0.35rem 0.875rem", border: "1px solid var(--color-gray-200)", background: "none", color: page >= pages ? "var(--color-gray-400)" : "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: page >= pages ? "not-allowed" : "pointer" }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
