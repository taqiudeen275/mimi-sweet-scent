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
    const { reference } = event.data;
    if (reference) {
      await prisma.order.updateMany({
        where: { paymentRef: reference, paymentStatus: "UNPAID" },
        data:  { paymentStatus: "PAID", status: "PROCESSING" },
      });
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
