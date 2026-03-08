import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusUpdater } from "./OrderStatusUpdater";

export const metadata: Metadata = { title: "Orders" };
export const revalidate = 0; // always fresh

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "#FEF3C7", color: "#92400E" },
  PROCESSING: { bg: "#DBEAFE", color: "#1E40AF" },
  SHIPPED:    { bg: "#EDE9FE", color: "#6D28D9" },
  DELIVERED:  { bg: "#D1FAE5", color: "#065F46" },
  CANCELLED:  { bg: "#FEE2E2", color: "#991B1B" },
  REFUNDED:   { bg: "#F3F4F6", color: "#6B7280" },
};

const PAY_COLORS: Record<string, { bg: string; color: string }> = {
  UNPAID:         { bg: "#FEE2E2", color: "#991B1B" },
  PAID:           { bg: "#D1FAE5", color: "#065F46" },
  REFUNDED:       { bg: "#F3F4F6", color: "#6B7280" },
  PARTIAL_REFUND: { bg: "#FEF3C7", color: "#92400E" },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          Orders
        </h1>
        <span style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.6875rem",
          color: "var(--color-gray-600)",
        }}>
          {orders.length} total
        </span>
      </div>

      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-gray-200)", background: "#FAFAFA" }}>
              {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                <th key={h} style={{
                  padding: "0.875rem 1rem",
                  textAlign: "left",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING;
              const pc = PAY_COLORS[order.paymentStatus] ?? PAY_COLORS.UNPAID;
              return (
                <tr key={order.id} style={{
                  borderBottom: i < orders.length - 1 ? "1px solid var(--color-gray-200)" : "none",
                }}>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "var(--color-black)",
                      letterSpacing: "0.05em",
                    }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                      maxWidth: "180px",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {order.email}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                    }}>
                      {order._count.items}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "0.9375rem",
                      color: "var(--color-black)",
                    }}>
                      {formatPrice(order.totalAmount)}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.2rem 0.5rem",
                      background: pc.bg,
                      color: pc.color,
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.2rem 0.5rem",
                      background: sc.bg,
                      color: sc.color,
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                      whiteSpace: "nowrap",
                    }}>
                      {order.createdAt.toLocaleDateString("en-GH")}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} style={{
                  padding: "3rem",
                  textAlign: "center",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  color: "var(--color-gray-400)",
                }}>
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
