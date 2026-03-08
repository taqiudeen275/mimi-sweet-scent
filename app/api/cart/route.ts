import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const SESSION_COOKIE = "mss_cart_session";
const CART_TTL_DAYS = 7;

async function getOrCreateCart(userId: string | null, sessionId: string | null) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: { include: { images: { take: 1 } } } },
            },
          },
        },
      },
    });
  }

  if (sessionId) {
    return prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: { include: { images: { take: 1 } } } },
            },
          },
        },
      },
    });
  }

  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;

  const cart = await getOrCreateCart(session?.user?.id ?? null, sessionId);
  return NextResponse.json({ data: cart });
}

const addItemSchema = z.object({
  productVariantId: z.string(),
  quantity:         z.number().int().min(1).max(10).default(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();

  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productVariantId, quantity } = parsed.data;

  // Verify variant exists and has stock
  const variant = await prisma.productVariant.findUnique({ where: { id: productVariantId } });
  if (!variant) {
    return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
  }
  if (variant.stock < quantity) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 409 });
  }

  const userId = session?.user?.id ?? null;
  let sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;

  // Create or find cart
  let cart = userId
    ? await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} })
    : sessionId
    ? await prisma.cart.findUnique({ where: { sessionId } })
    : null;

  const res = NextResponse.json({ success: true });

  if (!cart && !userId) {
    sessionId = crypto.randomUUID();
    cart = await prisma.cart.create({
      data: {
        sessionId,
        expiresAt: new Date(Date.now() + CART_TTL_DAYS * 86400 * 1000),
      },
    });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: CART_TTL_DAYS * 86400,
      path: "/",
    });
  }

  if (!cart) return NextResponse.json({ error: "Could not create cart" }, { status: 500 });

  // Upsert cart item
  await prisma.cartItem.upsert({
    where: { cartId_productVariantId: { cartId: cart.id, productVariantId } },
    create: { cartId: cart.id, productVariantId, quantity },
    update: { quantity: { increment: quantity } },
  });

  return res;
}

const removeItemSchema = z.object({ productVariantId: z.string() });

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const body = await req.json();

  const parsed = removeItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productVariantId } = parsed.data;
  const userId = session?.user?.id ?? null;
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;

  const cart = userId
    ? await prisma.cart.findUnique({ where: { userId } })
    : sessionId
    ? await prisma.cart.findUnique({ where: { sessionId } })
    : null;

  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productVariantId },
  });

  return NextResponse.json({ success: true });
}
