"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface JewelryFiltersProps {
  resultCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A–Z" },
];

const GENDER_OPTIONS = [
  { value: "", label: "All" },
  { value: "WOMEN", label: "Women" },
  { value: "MEN", label: "Men" },
  { value: "UNISEX", label: "Unisex" },
];

export function JewelryFilters({ resultCount }: JewelryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "newest";
  const gender = searchParams.get("gender") ?? "";

  const activeFilterCount =
    (sort !== "newest" ? 1 : 0) +
    (gender ? 1 : 0);

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/jewelry?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAll() {
    router.push("/jewelry");
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
        {/* Gender */}
        <div style={{ flexShrink: 0 }}>
          <span style={labelStyle}>For</span>
          <div style={{ display: "flex", gap: "0" }}>
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => push({ gender: opt.value })}
                style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  padding: "0.5rem 0.875rem",
                  border: "1px solid var(--color-gray-200)",
                  marginLeft: opt.value === "" ? "0" : "-1px",
                  cursor: "pointer",
                  background: gender === opt.value ? "var(--color-black)" : "var(--color-white)",
                  color: gender === opt.value ? "var(--color-white)" : "var(--color-black)",
                  transition: "background 150ms ease, color 150ms ease",
                  position: "relative",
                  zIndex: gender === opt.value ? 1 : 0,
                }}
              >
                {opt.label}
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

        {/* Results + Clear */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: "1rem", flexShrink: 0 }}>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            color: "var(--color-gray-600)",
            margin: 0,
          }}>
            {resultCount} {resultCount === 1 ? "piece" : "pieces"}
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
