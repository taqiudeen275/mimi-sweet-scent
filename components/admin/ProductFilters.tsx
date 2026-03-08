"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function ProductFilters({
  total,
  showing,
}: {
  total: number;
  showing: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const inputStyle: React.CSSProperties = {
    height: "36px",
    padding: "0 0.75rem",
    border: "1px solid var(--color-gray-200)",
    background: "var(--color-white)",
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.75rem",
    color: "var(--color-black)",
    outline: "none",
    minWidth: 0,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    paddingRight: "2rem",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.625rem center",
    cursor: "pointer",
  };

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.625rem",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", alignItems: "center" }}>
        {/* Search */}
        <input
          type="search"
          placeholder="Search products…"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={e => update("q", e.target.value)}
          style={{ ...inputStyle, width: "220px" }}
        />

        {/* Type filter */}
        <select
          value={searchParams.get("type") ?? ""}
          onChange={e => update("type", e.target.value)}
          style={{ ...selectStyle, width: "140px" }}
        >
          <option value="">All Types</option>
          <option value="PERFUME">Perfume</option>
          <option value="JEWELRY">Jewelry</option>
        </select>

        {/* Status filter */}
        <select
          value={searchParams.get("status") ?? ""}
          onChange={e => update("status", e.target.value)}
          style={{ ...selectStyle, width: "140px" }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Sort */}
        <select
          value={searchParams.get("sort") ?? "newest"}
          onChange={e => update("sort", e.target.value)}
          style={{ ...selectStyle, width: "160px" }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A–Z</option>
          <option value="price-asc">Price Low–High</option>
          <option value="price-desc">Price High–Low</option>
        </select>
      </div>

      <span style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.6875rem",
        color: "var(--color-gray-600)",
        whiteSpace: "nowrap",
      }}>
        Showing {showing} of {total}
      </span>
    </div>
  );
}
