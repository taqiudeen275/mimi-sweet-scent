"use client";

interface Variant {
  id: string;
  optionLabel: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedId: string;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
      {variants.map((v: Variant) => {
        const isSelected = v.id === selectedId;
        const outOfStock = v.stock === 0;
        return (
          <button
            key={v.id}
            onClick={() => !outOfStock && onSelect(v)}
            disabled={outOfStock}
            style={{
              padding: "0.5rem 1.125rem",
              border: isSelected
                ? "1px solid var(--color-primary)"
                : "1px solid var(--color-gray-200)",
              background: isSelected ? "var(--color-primary)" : "transparent",
              color: isSelected
                ? "var(--color-white)"
                : outOfStock
                  ? "var(--color-gray-400)"
                  : "var(--color-black)",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: outOfStock ? "not-allowed" : "pointer",
              opacity: outOfStock ? 0.5 : 1,
              transition: "all 150ms ease",
              position: "relative",
            }}
          >
            {v.optionLabel}
            {outOfStock && (
              <span style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "var(--color-gray-400)",
                  transform: "rotate(-20deg)",
                }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
