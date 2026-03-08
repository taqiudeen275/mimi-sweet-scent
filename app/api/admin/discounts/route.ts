import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discounts = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(discounts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as {
    code?: string;
    type?: string;
    value?: number;
    minOrderValue?: number | null;
    usageLimit?: number | null;
    expiresAt?: string | null;
    active?: boolean;
  };

  if (!data.code || typeof data.code !== "string" || data.code.trim() === "") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const validTypes: DiscountType[] = ["PERCENTAGE", "FIXED", "FREE_SHIPPING"];
  if (!data.type || !validTypes.includes(data.type as DiscountType)) {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
  }

  const discountType = data.type as DiscountType;
  const value = Number(data.value ?? 0);

  if (discountType !== "FREE_SHIPPING") {
    if (!value || value <= 0) {
      return NextResponse.json({ error: "Value must be greater than 0" }, { status: 400 });
    }
    if (discountType === "PERCENTAGE" && (value < 1 || value > 100)) {
      return NextResponse.json({ error: "Percentage must be between 1 and 100" }, { status: 400 });
    }
  }

  const code = data.code.trim().toUpperCase();

  const existing = await prisma.discountCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  // FIXED values stored in pesewas (×100)
  const storedValue =
    discountType === "FIXED" ? Math.round(value * 100) : discountType === "FREE_SHIPPING" ? 0 : value;

  const minOrderValueRaw = data.minOrderValue != null ? Number(data.minOrderValue) : null;

  const discount = await prisma.discountCode.create({
    data: {
      code,
      type: discountType,
      value: storedValue,
      minOrderValue: minOrderValueRaw != null ? Math.round(minOrderValueRaw * 100) : null,
      usageLimit: data.usageLimit != null ? Number(data.usageLimit) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      active: data.active ?? true,
    },
  });

  return NextResponse.json(discount, { status: 201 });
}
