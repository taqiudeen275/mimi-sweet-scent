import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const ADMIN_ROLES = ["ADMIN", "MANAGER", "CONTENT_EDITOR"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// ─── GET /api/admin/products ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q")     ?? "";
  const type   = searchParams.get("type")  ?? "";
  const status = searchParams.get("status") ?? "";
  const sort   = searchParams.get("sort")  ?? "newest";
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const where: Prisma.ProductWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (type === "PERFUME" || type === "JEWELRY") where.productType = type;
  if (status === "ACTIVE" || status === "DRAFT" || status === "ARCHIVED") {
    where.status = status;
  }

  type ProductOrderBy = Prisma.ProductOrderByWithRelationInput;
  const orderByMap: Record<string, ProductOrderBy> = {
    newest:       { createdAt: "desc" },
    oldest:       { createdAt: "asc" },
    name:         { name: "asc" },
    "price-asc":  { variants: { _count: "asc" } },
    "price-desc": { variants: { _count: "desc" } },
  };
  const orderBy: ProductOrderBy = orderByMap[sort] ?? orderByMap.newest;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        variants: { select: { id: true, optionLabel: true, price: true, stock: true } },
        images:   { orderBy: { position: "asc" }, take: 1 },
        _count:   { select: { reviews: true } },
      },
    }),
  ]);

  return NextResponse.json({ data: products, total, page, limit });
}

// ─── POST /api/admin/products ─────────────────────────────────────────────────

const variantSchema = z.object({
  optionLabel:    z.string().default("Default"),
  sku:            z.string().min(1),
  price:          z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional(),
  stock:          z.number().int().min(0).default(0),
  weight:         z.number().optional(),
});

const imageSchema = z.object({
  url:     z.string().min(1),
  altText: z.string().optional(),
  position: z.number().int().default(0),
});

const fragranceNoteSchema = z.object({
  type: z.enum(["TOP", "HEART", "BASE"]),
  name: z.string().min(1),
  icon: z.string().optional(),
});

const createProductSchema = z.object({
  name:            z.string().min(1),
  slug:            z.string().min(1).regex(/^[a-z0-9-]+$/),
  description:     z.string().optional(),
  productType:     z.enum(["PERFUME", "JEWELRY"]),
  concentration:   z.enum(["EDP", "EDT", "PARFUM"]).optional(),
  genderTag:       z.enum(["WOMEN", "MEN", "UNISEX"]).optional(),
  material:        z.string().optional(),
  stone:           z.string().optional(),
  tagline:         z.string().optional(),
  sillage:         z.string().optional(),
  longevity:       z.string().optional(),
  seasonRec:       z.string().optional(),
  perfumerProfile: z.string().optional(),
  collectionId:    z.string().optional(),
  status:          z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  seoTitle:        z.string().optional(),
  seoDesc:         z.string().optional(),
  variants:        z.array(variantSchema).min(1),
  images:          z.array(imageSchema).optional().default([]),
  fragranceNotes:  z.array(fragranceNoteSchema).optional().default([]),
});

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const body   = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { variants, images, fragranceNotes, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      variants:       { create: variants },
      images:         { create: images },
      fragranceNotes: { create: fragranceNotes },
    },
    include: {
      variants:       true,
      images:         true,
      fragranceNotes: true,
    },
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
