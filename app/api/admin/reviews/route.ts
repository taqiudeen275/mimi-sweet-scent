import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const page      = Math.max(1, Number(searchParams.get("page") ?? 1));
  const productId = searchParams.get("productId") ?? "";
  const rating    = searchParams.get("rating") ?? "";
  const verified  = searchParams.get("verified") ?? "";

  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  if (rating)    where.rating    = Number(rating);
  if (verified === "true")  where.verified = true;
  if (verified === "false") where.verified = false;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user:    { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / PAGE_SIZE) });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
