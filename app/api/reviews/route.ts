import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating:    z.number().int().min(1).max(5),
  body:      z.string().max(1000).optional(),
});

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  return NextResponse.json({ reviews, average: avg, total: reviews.length });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Must be logged in to review" }, { status: 401 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { productId, rating, body: reviewBody } = parsed.data;

  // Check user has ordered this product (verified purchase)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productVariant: { productId },
      order: { userId: session.user.id, paymentStatus: "PAID" },
    },
  });

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        userId:   session.user.id,
        rating,
        body:     reviewBody ?? null,
        verified: !!hasPurchased,
      },
    });
    return NextResponse.json({ review });
  } catch {
    // P2002 = unique constraint (already reviewed)
    return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
  }
}
