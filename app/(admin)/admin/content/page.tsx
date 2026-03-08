import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPagesList } from "./ContentPagesList";

export const metadata: Metadata = { title: "Content Pages" };
export const revalidate = 0;

export default async function AdminContentPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      metaTitle: true,
      updatedAt: true,
    },
  });

  return <ContentPagesList pages={pages} />;
}
