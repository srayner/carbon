import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Renderer from "@/components/Page/Renderer";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { blocks: true },
  });

  if (!page) return notFound();

  console.log(page);

  return (
    <main className="prose prose-lg mx-auto p-8">
      <Renderer page={page} />
    </main>
  );
}
