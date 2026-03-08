import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Orders" };

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "var(--status-pending-bg)",    color: "var(--status-pending-color)" },
  PROCESSING: { bg: "var(--status-processing-bg)", color: "var(--status-processing-color)" },
  SHIPPED:    { bg: "var(--status-shipped-bg)",    color: "var(--status-shipped-color)" },
  DELIVERED:  { bg: "var(--status-delivered-bg)",  color: "var(--status-delivered-color)" },
  CANCELLED:  { bg: "var(--status-cancelled-bg)",  color: "var(--status-cancelled-color)" },
  REFUNDED:   { bg: "var(--status-refunded-bg)",   color: "var(--status-refunded-color)" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: { include: { images: { take: 1 } } },
            },
          },
        },
      },
    },
  });

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          My Orders
        </h1>
        <Link href="/account/profile" style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.625rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-primary)",
          textDecoration: "none",
        }}>
          ← Profile
        </Link>
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          border: "1px solid var(--color-gray-200)",
          background: "var(--color-cream)",
        }}>
          <p style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.5rem",
            color: "var(--color-black)",
            marginBottom: "1rem",
          }}>
            No orders yet
          </p>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.875rem",
            color: "var(--color-gray-600)",
            marginBottom: "2rem",
          }}>
            Discover our fragrances and jewelry
          </p>
          <Link href="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {orders.map((order) => {
            const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING;
            return (
              <div key={order.id} style={{
                border: "1px solid var(--color-gray-200)",
                background: "var(--color-white)",
              }}>
                {/* Order header */}
                <div style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid var(--color-gray-200)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}>
                  <div>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.625rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-gray-600)",
                    }}>
                      Order #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <p style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                      marginTop: "0.25rem",
                    }}>
                      {order.createdAt.toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.125rem",
                      color: "var(--color-black)",
                    }}>
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span style={{
                      display: "inline-block",
                      padding: "0.25rem 0.625rem",
                      background: sc.bg,
                      color: sc.color,
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5625rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {order.items.map((item) => {
                    const imageUrl = item.productVariant.product.images[0]?.url;
                    return (
                      <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageUrl}
                            alt={item.productVariant.product.name}
                            style={{
                              width: "52px",
                              height: "64px",
                              objectFit: "cover",
                              flexShrink: 0,
                              background: "var(--color-cream)",
                            }}
                          />
                        ) : (
                          <div style={{ width: "52px", height: "64px", background: "var(--color-cream)", flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <Link
                            href={`/product/${item.productVariant.product.slug}`}
                            style={{
                              fontFamily: "var(--font-cormorant), Georgia, serif",
                              fontSize: "1rem",
                              color: "var(--color-black)",
                              textDecoration: "none",
                              display: "block",
                            }}
                          >
                            {item.productVariant.product.name}
                          </Link>
                          <p style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontSize: "0.625rem",
                            color: "var(--color-gray-600)",
                            marginTop: "0.25rem",
                            letterSpacing: "0.05em",
                          }}>
                            {item.productVariant.optionLabel} × {item.quantity}
                          </p>
                        </div>
                        <span style={{
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontSize: "0.9375rem",
                          color: "var(--color-black)",
                          flexShrink: 0,
                        }}>
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking */}
                {order.trackingNumber && (
                  <div style={{
                    padding: "0.875rem 1.5rem",
                    borderTop: "1px solid var(--color-gray-200)",
                    background: "var(--color-cream)",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    color: "var(--color-gray-600)",
                  }}>
                    Tracking: <strong style={{ color: "var(--color-black)" }}>{order.trackingNumber}</strong>
                    {order.carrier && ` via ${order.carrier}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
