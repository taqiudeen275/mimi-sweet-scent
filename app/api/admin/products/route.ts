import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const ADMIN_ROLES = ["ADMIN", "MANAGER", "CONTENT_EDITOR"];

async function requireAdmin(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const forbidden = await requireAdmin(req);
  if (forbidden) return forbidden;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: { select: { id: true, optionLabel: true, price: true, stock: true } },
      images:   { orderBy: { position: "asc" }, take: 1 },
      _count:   { select: { reviews: true } },
    },
  });

  return NextResponse.json({ data: products });
}

const createProductSchema = z.object({
  name:          z.string().min(1),
  slug:          z.string().min(1).regex(/^[a-z0-9-]+$/),
  description:   z.string().optional(),
  productType:   z.enum(["PERFUME", "JEWELRY"]),
  concentration: z.enum(["EDP", "EDT", "PARFUM"]).optional(),
  genderTag:     z.enum(["WOMEN", "MEN", "UNISEX"]).optional(),
  material:      z.string().optional(),
  stone:         z.string().optional(),
  tagline:       z.string().optional(),
  collectionId:  z.string().optional(),
  status:        z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  seoTitle:      z.string().optional(),
  seoDesc:       z.string().optional(),
});

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin(req);
  if (forbidden) return forbidden;

  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json({ data: product }, { status: 201 });
}
