import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify HMAC SHA512 signature
  const expectedHash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (expectedHash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: {
      reference?: string;
      status?: string;
      amount?: number;
      customer?: { email?: string };
    };
  };

  if (event.event === "charge.success") {
    const { reference, amount } = event.data;
    if (reference) {
      // Find the order first (idempotency: skip if already paid)
      const order = await prisma.order.findFirst({
        where: { paymentRef: reference },
        select: { id: true, paymentStatus: true, totalAmount: true },
      });

      if (!order) {
        // Unknown reference — log but return 200 to prevent Paystack retries
        console.warn("[webhook] Unknown paymentRef:", reference);
        return NextResponse.json({ received: true });
      }

      if (order.paymentStatus === "PAID") {
        // Already processed — idempotent no-op
        return NextResponse.json({ received: true });
      }

      // Validate amount if provided (Paystack sends in smallest currency unit — pesewas)
      if (amount != null && Math.abs(amount - order.totalAmount) > 100) {
        console.error("[webhook] Amount mismatch — expected:", order.totalAmount, "received:", amount, "ref:", reference);
        // Still process but log for fraud review; don't reject (could be FX rounding)
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "PROCESSING" },
      });

      // Decrement stock for each purchased item
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        select: { productVariantId: true, quantity: true },
      });

      if (orderItems.length > 0) {
        await prisma.$transaction(
          orderItems.map(item =>
            prisma.productVariant.update({
              where: { id: item.productVariantId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );
      }

      logAudit({
        action: "PAYMENT_RECEIVED",
        category: "payment",
        entityType: "Order",
        entityId: order.id,
        details: { reference, amount, itemsDecremented: orderItems.length },
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      });

      // Send order confirmation email (fire-and-forget)
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id: order.id },
          select: {
            id: true, email: true, totalAmount: true, discountCode: true,
            discountAmount: true, shippingAddress: true,
            items: {
              select: {
                quantity: true, unitPrice: true,
                productSnapshot: true,
                productVariant: { select: { optionLabel: true } },
              },
            },
          },
        });

        if (fullOrder) {
          const addr = fullOrder.shippingAddress as Record<string, string>;
          sendOrderConfirmation({
            orderId:       fullOrder.id,
            customerEmail: fullOrder.email,
            customerName:  addr.firstName ? `${addr.firstName} ${addr.lastName ?? ""}`.trim() : undefined,
            items: fullOrder.items.map(i => ({
              name:      (i.productSnapshot as Record<string, string>)?.name ?? "Product",
              variant:   i.productVariant.optionLabel,
              quantity:  i.quantity,
              unitPrice: i.unitPrice,
            })),
            subtotal:        fullOrder.totalAmount + fullOrder.discountAmount,
            discountCode:    fullOrder.discountCode ?? undefined,
            discountAmount:  fullOrder.discountAmount,
            totalAmount:     fullOrder.totalAmount,
            shippingAddress: {
              line1:   addr.address  ?? addr.line1 ?? "",
              city:    addr.city     ?? "",
              country: addr.country  ?? "Ghana",
            },
          }).catch(err => console.error("[email] Order confirmation failed:", err));
        }
      } catch (emailErr) {
        console.error("[email] Failed to fetch order for email:", emailErr);
      }
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
