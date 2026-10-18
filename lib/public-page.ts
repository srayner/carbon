import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isPageLive } from "@/lib/page-status";
import { Page } from "@/types/entities";

export type PublicPageResult = { page: Page; isPreview: boolean };

/**
 * Load a page for the public site. Returns null when the page does not
 * exist, or is a draft or scheduled and the viewer is not an admin.
 */
export const loadPublicPage = async (
  slug: string
): Promise<PublicPageResult | null> => {
  const page = (await prisma.page.findUnique({
    where: { slug },
    include: { blocks: { orderBy: { order: "asc" } }, meta: true },
  })) as Page | null;

  if (!page) return null;

  // Drafts and scheduled pages are only visible to admins (for previewing)
  const isPreview = !isPageLive(page.publishedAt);
  if (isPreview) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return null;
  }

  return { page, isPreview };
};

export const getPageMetadata = (page: Page) => ({
  title: page.meta?.metaTitle || page.title,
  description: page.meta?.metaDescription || undefined,
});
