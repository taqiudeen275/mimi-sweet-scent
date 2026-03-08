"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
type OrderStatus = typeof STATUSES[number];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus as OrderStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: OrderStatus) => {
    if (newStatus === status || saving) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      disabled={saving}
      style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.625rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--color-black)",
        border: "1px solid var(--color-gray-200)",
        background: "var(--color-white)",
        padding: "0.375rem 0.5rem",
        cursor: saving ? "not-allowed" : "pointer",
        opacity: saving ? 0.6 : 1,
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
