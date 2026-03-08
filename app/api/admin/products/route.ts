import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/auditLog";

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
  sku:            z.string().min(1, "Each variant needs a SKU."),
  price:          z.number().int().min(0, "Price must be 0 or more."),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  stock:          z.number().int().min(0).default(0),
  weight:         z.number().optional(),
});

const imageSchema = z.object({
  url:      z.string().min(1),
  altText:  z.string().optional().nullable(),
  position: z.number().int().default(0),
});

const fragranceNoteSchema = z.object({
  type: z.enum(["TOP", "HEART", "BASE"]),
  name: z.string().min(1, "Fragrance note name cannot be empty."),
  icon: z.string().optional().nullable(),
});

const createProductSchema = z.object({
  name:            z.string().min(1, "Product name is required."),
  slug:            z.string().min(1).regex(/^[a-z0-9-]+$/, "URL slug can only contain lowercase letters, numbers, and hyphens."),
  description:     z.string().optional().nullable(),
  productType:     z.enum(["PERFUME", "JEWELRY"]),
  concentration:   z.enum(["EDP", "EDT", "PARFUM"]).optional().nullable(),
  genderTag:       z.enum(["WOMEN", "MEN", "UNISEX"]).optional().nullable(),
  material:        z.string().optional().nullable(),
  stone:           z.string().optional().nullable(),
  tagline:         z.string().optional().nullable(),
  sillage:         z.string().optional().nullable(),
  longevity:       z.string().optional().nullable(),
  seasonRec:       z.string().optional().nullable(),
  perfumerProfile: z.string().optional().nullable(),
  collectionId:    z.string().optional().nullable(),
  status:          z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  seoTitle:        z.string().optional().nullable(),
  seoDesc:         z.string().optional().nullable(),
  variants:        z.array(variantSchema).min(1, "Please add at least one variant with a price."),
  images:          z.array(imageSchema).optional().default([]),
  fragranceNotes:  z.array(fragranceNoteSchema).optional().default([]),
});

function friendlyValidationError(error: z.ZodError): string {
  const messages: string[] = [];
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    // Use the custom message if it's already human-readable
    if (issue.message && !issue.message.startsWith("Invalid")) {
      if (!messages.includes(issue.message)) messages.push(issue.message);
      continue;
    }
    // Map field paths to friendly labels
    if (path === "name" || path.endsWith(".name")) messages.push("Product name is required.");
    else if (path === "slug") messages.push("URL slug can only contain lowercase letters, numbers, and hyphens.");
    else if (path === "variants") messages.push("Please add at least one variant.");
    else if (path.startsWith("variants") && path.endsWith("sku")) messages.push("Each variant needs a SKU.");
    else if (path.startsWith("variants") && path.endsWith("price")) messages.push("Each variant needs a valid price.");
    else if (path === "productType") messages.push("Please select a product type.");
    else if (path === "status") messages.push("Please select a product status.");
    else messages.push("Please check all required fields and try again.");
  }
  // Deduplicate
  return [...new Set(messages)].join(" ");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ipAddress = req.headers.get("x-forwarded-for") ?? "unknown";

  const body   = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: friendlyValidationError(parsed.error) }, { status: 400 });
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

  logAudit({
    action:      "PRODUCT_CREATED",
    category:    "admin",
    entityType:  "Product",
    entityId:    product.id,
    actorId:     session.user.id,
    actorEmail:  session.user.email ?? undefined,
    details:     { name: product.name },
    ipAddress,
  });

  return NextResponse.json({ data: product }, { status: 201 });
}
