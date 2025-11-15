import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Renderer from "@/components/Page/Renderer";
import { hydrateBlocks } from "@/lib/hydrate-blocks";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dbPage = await prisma.page.findUnique({
    where: { slug },
    include: { blocks: true, meta: true },
  });

  if (!dbPage) return notFound();

  const page = {
    ...dbPage,
    blocks: hydrateBlocks(dbPage.blocks),
  };

  return (
    <main className="prose prose-lg mx-auto p-8">
      <Renderer page={page} />
    </main>
  );
}
