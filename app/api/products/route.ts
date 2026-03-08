import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  page:        z.coerce.number().min(1).default(1),
  limit:       z.coerce.number().min(1).max(100).default(20),
  type:        z.enum(["PERFUME", "JEWELRY"]).optional(),
  gender:      z.enum(["WOMEN", "MEN", "UNISEX"]).optional(),
  collection:  z.string().optional(),
  status:      z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  sort:        z.enum(["newest", "price_asc", "price_desc", "name_asc"]).default("newest"),
  search:      z.string().optional(),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, type, gender, collection, status, sort, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    ...(type && { productType: type }),
    ...(gender && { genderTag: gender }),
    ...(status ? { status } : { status: "ACTIVE" as const }),
    ...(collection && { collection: { slug: collection } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const orderBy = {
    newest:    { createdAt: "desc" as const },
    price_asc: { variants: { _count: "asc" as const } },
    price_desc:{ variants: { _count: "desc" as const } },
    name_asc:  { name: "asc" as const },
  }[sort];

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        variants:  { select: { id: true, optionLabel: true, price: true, stock: true } },
        images:    { orderBy: { position: "asc" }, take: 1 },
        collection:{ select: { name: true, slug: true } },
        _count:    { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
