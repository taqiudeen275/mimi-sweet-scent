import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

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
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
