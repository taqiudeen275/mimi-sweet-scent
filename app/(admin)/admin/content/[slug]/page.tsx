import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageEditor } from "./PageEditor";

export const metadata: Metadata = { title: "Edit Page" };
export const revalidate = 0;

export default async function AdminContentEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER", "CONTENT_EDITOR"].includes(session.user.role ?? "")) {
    redirect("/");
  }

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
