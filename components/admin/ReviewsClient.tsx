"use client";

import { useState, useCallback } from "react";

interface ReviewRow {
  id: string;
  rating: number;
  body: string | null;
  verified: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string };
  user: { name: string | null; email: string };
}

interface ProductOption { id: string; name: string }

interface Props {
  initialReviews: ReviewRow[];
  initialTotal: number;
  products: ProductOption[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= rating ? "var(--color-primary)" : "var(--color-gray-200)" }}>★</span>
      ))}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
}

const th: React.CSSProperties = {
  padding: "0.75rem 1rem", textAlign: "left",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5rem", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
  fontWeight: 500, whiteSpace: "nowrap",
};

export function ReviewsClient({ initialReviews, initialTotal, products }: Props) {
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [total, setTotal]     = useState(initialTotal);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(Math.ceil(initialTotal / 20));
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [rating, setRating]       = useState("");
  const [verified, setVerified]   = useState("");

  const fetch_ = useCallback(async (opts: {
    page?: number; productId?: string; rating?: string; verified?: string;
  }) => {
    setLoading(true);
    const p  = opts.page      ?? page;
    const pr = opts.productId ?? productId;
    const r  = opts.rating    ?? rating;
    const v  = opts.verified  ?? verified;
    const params = new URLSearchParams({ page: String(p) });
    if (pr) params.set("productId", pr);
    if (r)  params.set("rating", r);
    if (v)  params.set("verified", v);
    const res  = await fetch(`/api/admin/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews);
    setTotal(data.total);
    setPage(data.page);
    setPages(data.pages);
    setLoading(false);
  }, [page, productId, rating, verified]);

  function applyFilter(key: string, val: string) {
    const next = { productId, rating, verified, [key]: val };
    if (key === "productId") setProductId(val);
    if (key === "rating")    setRating(val);
    if (key === "verified")  setVerified(val);
    setPage(1);
    fetch_({ page: 1, ...next });
  }

  function clearFilters() {
    setProductId(""); setRating(""); setVerified(""); setPage(1);
    fetch_({ page: 1, productId: "", rating: "", verified: "" });
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReviews(r => r.filter(x => x.id !== id));
    setTotal(t => t - 1);
  }

  const verified5 = reviews.filter(r => r.verified).length;
  const star5     = reviews.filter(r => r.rating === 5).length;
  const avgRating = reviews.length ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const hasFilters = productId || rating || verified;

  const selectStyle: React.CSSProperties = {
    padding: "0.35rem 0.625rem", border: "1px solid var(--color-gray-200)",
    background: "var(--color-white)", color: "var(--color-black)",
    fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem",
    minWidth: "140px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
        <select value={productId} onChange={e => applyFilter("productId", e.target.value)} style={selectStyle}>
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={rating} onChange={e => applyFilter("rating", e.target.value)} style={selectStyle}>
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map(n => <option key={n} value={String(n)}>{n} ★</option>)}
        </select>
        <select value={verified} onChange={e => applyFilter("verified", e.target.value)} style={selectStyle}>
          <option value="">All Reviews</option>
          <option value="true">Verified Only</option>
          <option value="false">Unverified Only</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} style={{ padding: "0.35rem 0.75rem", background: "none", border: "1px solid var(--color-gray-200)", color: "var(--color-gray-600)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Reviews",       value: total,      color: "var(--color-black)" },
          { label: "Avg Rating",          value: avgRating,  color: "var(--color-primary)" },
          { label: "Verified Purchases",  value: verified5,  color: "#16A34A" },
          { label: "5-Star Reviews",      value: star5,      color: "var(--color-primary)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", padding: "1.25rem 1.5rem" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gray-600)", margin: "0 0 0.5rem" }}>{label}</p>
            <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, color, margin: 0, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", opacity: loading ? 0.6 : 1, transition: "opacity 150ms" }}>
        {reviews.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 300, color: "var(--color-gray-600)", margin: "0 0 0.5rem" }}>No reviews found</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-400)", margin: 0 }}>Reviews will appear here once customers leave feedback.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ background: "#111110" }}>
                  {["Product", "Reviewer", "Rating", "Review", "Status", "Date", ""].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev, i) => (
                  <tr key={rev.id} style={{ borderBottom: "1px solid var(--color-gray-200)", background: i % 2 === 1 ? "rgba(0,0,0,0.015)" : "transparent" }}>
                    <td style={{ padding: "0.75rem 1rem", maxWidth: "160px" }}>
                      <a href={`/product/${rev.product.slug}`} target="_blank" rel="noreferrer"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-black)", fontWeight: 500, textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rev.product.name}
                      </a>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-black)", margin: "0 0 0.1rem", fontWeight: 500 }}>{rev.user.name ?? "Anonymous"}</p>
                      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: 0 }}>{rev.user.email}</p>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <Stars rating={rev.rating} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem", maxWidth: "220px" }}>
                      {rev.body ? (
                        <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.875rem", fontStyle: "italic", color: "var(--color-black)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          &ldquo;{rev.body}&rdquo;
                        </p>
                      ) : (
                        <span style={{ color: "var(--color-gray-400)", fontSize: "0.75rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      {rev.verified ? (
                        <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", background: "rgba(22,163,74,0.12)", color: "#16A34A", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, borderRadius: "2px" }}>
                          ✓ Verified
                        </span>
                      ) : (
                        <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", background: "rgba(0,0,0,0.05)", color: "var(--color-gray-600)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, borderRadius: "2px" }}>
                          Unverified
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", whiteSpace: "nowrap" }}>
                      {formatDate(rev.createdAt)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => deleteReview(rev.id)}
                        style={{ padding: "0.3rem 0.625rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", margin: 0 }}>
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button disabled={page <= 1} onClick={() => { const p = page-1; setPage(p); fetch_({ page: p }); }}
                style={{ padding: "0.35rem 0.875rem", border: "1px solid var(--color-gray-200)", background: "none", color: page <= 1 ? "var(--color-gray-400)" : "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: page <= 1 ? "not-allowed" : "pointer" }}>
                ← Prev
              </button>
              <span style={{ padding: "0.35rem 0.75rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)" }}>{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => { const p = page+1; setPage(p); fetch_({ page: p }); }}
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
