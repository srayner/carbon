import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isPageLive } from "@/lib/page-status";
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
    include: { blocks: { orderBy: { order: "asc" } }, meta: true },
  }) as Page | null;

  if (!page) return notFound();

  // Drafts and scheduled pages are only visible to admins (for previewing)
  const isPreview = !isPageLive(page.publishedAt);
  if (isPreview) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return notFound();
  }

  return (
    <>
      {isPreview && (
        <div className="flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
          <span>
            <strong>Preview</strong>
            {" — "}
            {page.publishedAt
              ? `scheduled for ${new Date(page.publishedAt).toLocaleString(
                  "en-GB",
                  { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }
                )} UTC`
              : "this page is a draft"}
            . Visitors can&apos;t see it yet.
          </span>
          <Link
            href={`/admin/pages/${page.id}`}
            className="font-medium underline"
          >
            Edit page
          </Link>
        </div>
      )}
      <main className="prose prose-lg mx-auto p-8">
        <Renderer page={page} />
      </main>
    </>
  );
}
