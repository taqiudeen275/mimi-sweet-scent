"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ShopFiltersProps {
  resultCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A–Z" },
];

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "PERFUME", label: "Fragrances" },
  { value: "JEWELRY", label: "Jewelry" },
];

export function ShopFilters({ resultCount }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const priceMin = searchParams.get("priceMin") ?? "";
  const priceMax = searchParams.get("priceMax") ?? "";

  const activeFilterCount =
    (q ? 1 : 0) +
    (type ? 1 : 0) +
    (sort !== "newest" ? 1 : 0) +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0);

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAll() {
    router.push("/shop");
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.5625rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--color-gray-600)",
    fontWeight: 600,
    marginBottom: "0.5rem",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.8125rem",
    padding: "0.5rem 0.875rem",
    border: "1px solid var(--color-gray-200)",
    outline: "none",
    color: "var(--color-black)",
    background: "var(--color-white)",
    width: "100%",
  };

  return (
    <div style={{
      background: "var(--color-cream)",
      padding: "1.5rem 2rem",
      marginBottom: "2.5rem",
      borderBottom: "1px solid var(--color-gray-200)",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "flex-end",
      }}>
        {/* Search */}
        <div style={{ flex: "1 1 200px", minWidth: "160px" }}>
          <span style={labelStyle}>Search</span>
          <input
            type="search"
            value={q}
            onChange={e => push({ q: e.target.value, })}
            placeholder="Search products…"
            style={inputStyle}
          />
        </div>

        {/* Type tabs */}
        <div style={{ flexShrink: 0 }}>
          <span style={labelStyle}>Category</span>
          <div style={{ display: "flex", gap: "0" }}>
            {TYPE_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => push({ type: tab.value })}
                style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  padding: "0.5rem 1rem",
                  border: "1px solid var(--color-gray-200)",
                  marginLeft: tab.value === "" ? "0" : "-1px",
                  cursor: "pointer",
                  background: type === tab.value ? "var(--color-black)" : "var(--color-white)",
                  color: type === tab.value ? "var(--color-white)" : "var(--color-black)",
                  transition: "background 150ms ease, color 150ms ease",
                  position: "relative",
                  zIndex: type === tab.value ? 1 : 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div style={{ flexShrink: 0 }}>
          <span style={labelStyle}>Sort by</span>
          <select
            value={sort}
            onChange={e => push({ sort: e.target.value })}
            style={{
              ...inputStyle,
              width: "auto",
              paddingRight: "2rem",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "var(--select-arrow)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              minWidth: "180px",
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div style={{ flexShrink: 0 }}>
          <span style={labelStyle}>Price (GHS)</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={priceMin}
              onChange={e => push({ priceMin: e.target.value })}
              style={{ ...inputStyle, width: "80px" }}
            />
            <span style={{ color: "var(--color-gray-600)", fontSize: "0.8rem" }}>–</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={priceMax}
              onChange={e => push({ priceMax: e.target.value })}
              style={{ ...inputStyle, width: "80px" }}
            />
          </div>
        </div>

        {/* Results + Clear */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: "1rem", flexShrink: 0 }}>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            color: "var(--color-gray-600)",
            margin: 0,
          }}>
            {resultCount} {resultCount === 1 ? "result" : "results"}
            {activeFilterCount > 0 && (
              <span style={{
                marginLeft: "0.5rem",
                background: "var(--color-primary)",
                color: "var(--color-white)",
                borderRadius: "50%",
                width: "18px", height: "18px",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.5625rem",
                fontWeight: 700,
                verticalAlign: "middle",
              }}>
                {activeFilterCount}
              </span>
            )}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
                background: "none",
                border: "1px solid var(--color-gray-200)",
                cursor: "pointer",
                padding: "0.375rem 0.75rem",
                transition: "border-color 150ms ease, color 150ms ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--color-black)";
                e.currentTarget.style.borderColor = "var(--color-black)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--color-gray-600)";
                e.currentTarget.style.borderColor = "var(--color-gray-200)";
              }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
