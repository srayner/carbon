import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Renderer from "@/components/Page/Renderer";
import { Page } from "@/types/entities";

export default async function PageComponent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { blocks: true, meta: true },
  });

  if (!page) return notFound();

  // Prisma returns proper Date objects; just need type assertion
  const typedPage = page as Page;

  return (
    <main className="prose prose-lg mx-auto p-8">
      <Renderer page={typedPage} />
    </main>
  );
}
