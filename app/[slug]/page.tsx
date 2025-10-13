import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.content.findUnique({
    where: { slug },
  });

  if (!post) return notFound();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{post.title}</h1>
      <div className="prose prose-lg">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </main>
  );
}
