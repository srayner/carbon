import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isPageLive } from "@/lib/page-status";
import { parseLayout } from "@/lib/template-layout";
import { Page } from "@/types/entities";
import { Block } from "@/types/blocks";
import { TemplateLayout } from "@/types/templates";

export type PublicTemplate = {
  layout: TemplateLayout;
  // slot name -> the blocks of the fragment filling it
  slots: Record<string, Block[]>;
};

export type PublicPageResult = {
  page: Page;
  template: PublicTemplate;
  isPreview: boolean;
};

/**
 * Load a page for the public site. Returns null when the page does not
 * exist, or is a draft or scheduled and the viewer is not an admin.
 */
export const loadPublicPage = async (
  slug: string
): Promise<PublicPageResult | null> => {
  const found = await prisma.page.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
      meta: true,
      template: {
        include: {
          slots: {
            include: {
              fragment: {
                include: { blocks: { orderBy: { order: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!found) return null;

  const { template: foundTemplate, ...pageData } = found;
  const page = pageData as unknown as Page;
  const template: PublicTemplate = {
    layout: parseLayout(foundTemplate.layout),
    slots: Object.fromEntries(
      foundTemplate.slots.map((s) => [s.slot, s.fragment.blocks as unknown as Block[]])
    ),
  };

  // Drafts and scheduled pages are only visible to admins (for previewing)
  const isPreview = !isPageLive(page.publishedAt);
  if (isPreview) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return null;
  }

  return { page, template, isPreview };
};

export const getPageMetadata = (page: Page) => ({
  title: page.meta?.metaTitle || page.title,
  description: page.meta?.metaDescription || undefined,
});
