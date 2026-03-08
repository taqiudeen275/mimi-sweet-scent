import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { logAudit } from "@/lib/auditLog";

const ADMIN_ROLES = ["ADMIN", "MANAGER", "CONTENT_EDITOR"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── GET /api/admin/products/[id] ─────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants:       { orderBy: { price: "asc" } },
      images:         { orderBy: { position: "asc" } },
      fragranceNotes: true,
      collection:     true,
      _count:         { select: { reviews: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}

// ─── PUT /api/admin/products/[id] ─────────────────────────────────────────────

function friendlyValidationError(error: z.ZodError): string {
  const messages: string[] = [];
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (issue.message && !issue.message.startsWith("Invalid")) {
      if (!messages.includes(issue.message)) messages.push(issue.message);
      continue;
    }
    if (path === "name" || path.endsWith(".name")) messages.push("Product name is required.");
    else if (path === "slug") messages.push("URL slug can only contain lowercase letters, numbers, and hyphens.");
    else if (path === "variants") messages.push("Please add at least one variant.");
    else if (path.startsWith("variants") && path.endsWith("sku")) messages.push("Each variant needs a SKU.");
    else if (path.startsWith("variants") && path.endsWith("price")) messages.push("Each variant needs a valid price.");
    else if (path === "productType") messages.push("Please select a product type.");
    else if (path === "status") messages.push("Please select a product status.");
    else messages.push("Please check all required fields and try again.");
  }
  return [...new Set(messages)].join(" ");
}

const variantUpsertSchema = z.object({
  id:             z.string().optional(),
  optionLabel:    z.string().default("Default"),
  sku:            z.string().min(1, "Each variant needs a SKU."),
  price:          z.number().int().min(0, "Price must be 0 or more."),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  stock:          z.number().int().min(0).default(0),
  weight:         z.number().optional(),
});

const imageUpsertSchema = z.object({
  id:       z.string().optional(),
  url:      z.string().min(1),
  altText:  z.string().optional().nullable(),
  position: z.number().int().default(0),
});

const noteUpsertSchema = z.object({
  id:   z.string().optional(),
  type: z.enum(["TOP", "HEART", "BASE"]),
  name: z.string().min(1),
  icon: z.string().optional().nullable(),
});

const updateProductSchema = z.object({
  name:            z.string().min(1).optional(),
  slug:            z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description:     z.string().optional().nullable(),
  productType:     z.enum(["PERFUME", "JEWELRY"]).optional(),
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
  status:          z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  seoTitle:        z.string().optional().nullable(),
  seoDesc:         z.string().optional().nullable(),
  variants:        z.array(variantUpsertSchema).optional(),
  images:          z.array(imageUpsertSchema).optional(),
  fragranceNotes:  z.array(noteUpsertSchema).optional(),
});

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ipAddress = req.headers.get("x-forwarded-for") ?? "unknown";
  const { id } = await params;

  // Check product exists
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body   = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: friendlyValidationError(parsed.error) }, { status: 400 });
  }

  const { variants, images, fragranceNotes, ...data } = parsed.data;

  // Run everything in a transaction
  const product = await prisma.$transaction(async (tx) => {
    // Update product scalars
    await tx.product.update({ where: { id }, data });

    // Upsert variants
    if (variants !== undefined) {
      const incomingIds = variants.filter(v => v.id).map(v => v.id as string);
      // Delete variants not in incoming list
      await tx.productVariant.deleteMany({
        where: { productId: id, id: { notIn: incomingIds } },
      });
      for (const v of variants) {
        const { id: vid, ...vdata } = v;
        if (vid) {
          await tx.productVariant.update({ where: { id: vid }, data: { ...vdata, compareAtPrice: vdata.compareAtPrice ?? null } });
        } else {
          await tx.productVariant.create({ data: { productId: id, ...vdata, compareAtPrice: vdata.compareAtPrice ?? null } });
        }
      }
    }

    // Upsert images
    if (images !== undefined) {
      const incomingIds = images.filter(img => img.id).map(img => img.id as string);
      await tx.productImage.deleteMany({
        where: { productId: id, id: { notIn: incomingIds } },
      });
      for (const img of images) {
        const { id: imgId, ...imgData } = img;
        if (imgId) {
          await tx.productImage.update({ where: { id: imgId }, data: { ...imgData, altText: imgData.altText ?? null } });
        } else {
          await tx.productImage.create({ data: { productId: id, ...imgData, altText: imgData.altText ?? null } });
        }
      }
    }

    // Upsert fragrance notes
    if (fragranceNotes !== undefined) {
      const incomingIds = fragranceNotes.filter(n => n.id).map(n => n.id as string);
      await tx.fragranceNote.deleteMany({
        where: { productId: id, id: { notIn: incomingIds } },
      });
      for (const n of fragranceNotes) {
        const { id: nid, ...ndata } = n;
        if (nid) {
          await tx.fragranceNote.update({ where: { id: nid }, data: { ...ndata, icon: ndata.icon ?? null } });
        } else {
          await tx.fragranceNote.create({ data: { productId: id, ...ndata, icon: ndata.icon ?? null } });
        }
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: {
        variants:       { orderBy: { price: "asc" } },
        images:         { orderBy: { position: "asc" } },
        fragranceNotes: true,
      },
    });
  });

  logAudit({
    action:     "PRODUCT_UPDATED",
    category:   "admin",
    entityType: "Product",
    entityId:   id,
    actorId:    session.user.id,
    actorEmail: session.user.email ?? undefined,
    details:    { name: product?.name },
    ipAddress,
  });

  return NextResponse.json({ data: product });
}

// ─── DELETE /api/admin/products/[id] ──────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ipAddress = req.headers.get("x-forwarded-for") ?? "unknown";
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });

  logAudit({
    action:     "PRODUCT_DELETED",
    category:   "admin",
    entityType: "Product",
    entityId:   id,
    actorId:    session.user.id,
    actorEmail: session.user.email ?? undefined,
    details:    { name: existing.name },
    ipAddress,
  });

  return NextResponse.json({ success: true });
}
