import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, orderTotal } = await req.json();
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!discount || !discount.active) {
      return NextResponse.json({ error: "Invalid or inactive discount code" }, { status: 404 });
    }

    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return NextResponse.json({ error: "This discount code has expired" }, { status: 410 });
    }

    if (discount.usageLimit != null && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 410 });
    }

    if (discount.minOrderValue != null && orderTotal < discount.minOrderValue) {
      return NextResponse.json({
        error: `Minimum order of GHS ${(discount.minOrderValue / 100).toFixed(2)} required`,
      }, { status: 422 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === "PERCENTAGE") {
      discountAmount = Math.round(orderTotal * (discount.value / 100));
    } else if (discount.type === "FIXED") {
      discountAmount = Math.min(discount.value, orderTotal);
    } else if (discount.type === "FREE_SHIPPING") {
      discountAmount = 0; // handled at display level — shipping is free
    }

    return NextResponse.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      finalTotal: orderTotal - discountAmount,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
