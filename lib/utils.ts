/** Format a price in pesewas to GHS display string: 75000 → "₵750" */
export function formatPrice(pesewas: number): string {
  const amount = pesewas / 100;
  return `₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Merge class names */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Truncate text to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
