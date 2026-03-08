import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const PAGE_SIZE = 20;

  const [grouped, totalGroups, totalWishlists, totalItems] = await Promise.all([
    prisma.wishlistItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.wishlistItem.groupBy({ by: ["productId"] }),
    prisma.wishlist.count(),
    prisma.wishlistItem.count(),
  ]);

  const productIds = grouped.map(g => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true, name: true, slug: true, productType: true,
      images:   { take: 1, select: { url: true }, orderBy: { position: "asc" } },
      variants: { take: 1, select: { price: true }, orderBy: { price: "asc" } },
    },
  });

  const items = grouped.map(g => ({
    productId: g.productId,
    count: g._count.productId,
    product: products.find(p => p.id === g.productId) ?? null,
  }));

  const totalDistinct = totalGroups.length;

  return NextResponse.json({
    items,
    total: totalDistinct,
    pages: Math.ceil(totalDistinct / PAGE_SIZE),
    stats: { totalWishlists, totalItems, topProductName: items[0]?.product?.name ?? null },
  });
}
