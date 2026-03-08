import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/wishlist — get current user's wishlist
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: { take: 1, select: { url: true }, orderBy: { position: "asc" } } },
          },
          productVariant: { select: { id: true, optionLabel: true, price: true, stock: true } },
        },
      },
    },
  });

  return NextResponse.json({ items: wishlist?.items ?? [] });
}

// POST /api/wishlist — add item
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, productVariantId } = await req.json();
  if (!productId || !productVariantId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Ensure wishlist exists
  const wishlist = await prisma.wishlist.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // Upsert item (ignore duplicate)
  try {
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId, productVariantId },
    });
  } catch {
    // Unique constraint — already in wishlist, that's fine
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/wishlist?variantId=xxx — remove item
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const variantId = new URL(req.url).searchParams.get("variantId");
  if (!variantId) return NextResponse.json({ error: "Missing variantId" }, { status: 400 });

  const wishlist = await prisma.wishlist.findUnique({ where: { userId: session.user.id } });
  if (!wishlist) return NextResponse.json({ ok: true });

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productVariantId: variantId },
  });

  return NextResponse.json({ ok: true });
}
