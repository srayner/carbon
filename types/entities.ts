import { string } from "zod";

export type Page = {
  id: string | null;
  title: string;
  slug: string;
  meta: PageMeta | null;
  blocks: Record<string, any>[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PageMeta = {
  id: string | null;
  pageId: string;
  page: Page;
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

export type Block = {
  id: string;
  type: string;
  data: Record<string, any>;
  order: number;
  pageId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
