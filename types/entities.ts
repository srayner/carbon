import { Block } from "./blocks";

export type Page = {
  id: string | null;
  title: string;
  slug: string;
  meta: PageMeta | null;
  blocks: Block[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PageMeta = {
  id: string | null;
  pageId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalPath: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  robots: string | null;
};
