import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER", "CONTENT_EDITOR"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pages);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER", "CONTENT_EDITOR"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as {
    slug?: string;
    title?: string;
    content?: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
  };

  if (!data.slug || typeof data.slug !== "string" || data.slug.trim() === "") {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }
  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = data.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
  }

  const page = await prisma.page.create({
    data: {
      slug,
      title: data.title.trim(),
      content: typeof data.content === "string" ? data.content : "",
      metaTitle: data.metaTitle ?? null,
      metaDesc: data.metaDesc ?? null,
    },
  });

  return NextResponse.json(page, { status: 201 });
}
