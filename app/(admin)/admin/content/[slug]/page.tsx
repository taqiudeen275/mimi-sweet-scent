import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageEditor } from "./PageEditor";

export const metadata: Metadata = { title: "Edit Page" };
export const revalidate = 0;

export default async function AdminContentEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isNew = slug === "new";

  let page: {
    id: string;
    slug: string;
    title: string;
    content: string;
    metaTitle: string | null;
    metaDesc: string | null;
    updatedAt: Date;
  } | null = null;

  if (!isNew) {
    page = await prisma.page.findUnique({ where: { slug } });
  }

  return <PageEditor page={page} isNew={isNew} />;
}
