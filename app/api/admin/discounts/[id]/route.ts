import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

  const existing = await prisma.discountCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const validTypes: DiscountType[] = ["PERCENTAGE", "FIXED", "FREE_SHIPPING"];
  const discountType = (data.type as DiscountType | undefined) ?? existing.type;

  if (data.type && !validTypes.includes(discountType)) {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
  }

  const value = data.value !== undefined ? Number(data.value) : null;

  if (value !== null && discountType !== "FREE_SHIPPING") {
    if (value <= 0) {
      return NextResponse.json({ error: "Value must be greater than 0" }, { status: 400 });
    }
    if (discountType === "PERCENTAGE" && (value < 1 || value > 100)) {
      return NextResponse.json({ error: "Percentage must be between 1 and 100" }, { status: 400 });
    }
  }

  let storedValue = existing.value;
  if (value !== null) {
    storedValue =
      discountType === "FIXED" ? Math.round(value * 100) : discountType === "FREE_SHIPPING" ? 0 : value;
  }

  // Check code uniqueness if changed
  if (data.code) {
    const newCode = data.code.trim().toUpperCase();
    if (newCode !== existing.code) {
      const dup = await prisma.discountCode.findUnique({ where: { code: newCode } });
      if (dup) return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }
  }

  const minOrderValueRaw = data.minOrderValue !== undefined ? data.minOrderValue : undefined;

  const updated = await prisma.discountCode.update({
    where: { id },
    data: {
      ...(data.code && { code: data.code.trim().toUpperCase() }),
      ...(data.type && { type: discountType }),
      value: storedValue,
      ...(minOrderValueRaw !== undefined && {
        minOrderValue: minOrderValueRaw != null ? Math.round(Number(minOrderValueRaw) * 100) : null,
      }),
      ...(data.usageLimit !== undefined && {
        usageLimit: data.usageLimit != null ? Number(data.usageLimit) : null,
      }),
      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }),
      ...(data.active !== undefined && { active: data.active }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.discountCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.discountCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
