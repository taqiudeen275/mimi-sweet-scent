import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants:      { orderBy: { price: "asc" } },
      images:        { orderBy: { position: "asc" } },
      fragranceNotes:{ orderBy: { type: "asc" } },
      collection:    true,
      categories:    true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product || product.status === "ARCHIVED") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}
