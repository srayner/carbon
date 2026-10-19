import { Block } from "./blocks";
import type { FragmentKind, TemplateLayout } from "./templates";

export type Page = {
  id: string | null;
  title: string;
  slug: string;
  meta: PageMeta | null;
  blocks: Block[];
  categoryIds: string[];
  templateId: string;
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

export type Category = {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  pageCount: number;
  childCount: number;
};

export type Fragment = {
  id: string | null;
  name: string;
  kind: FragmentKind;
  blocks: Block[];
};

export type FragmentSummary = {
  id: string;
  name: string;
  kind: FragmentKind;
  templateCount: number;
};

export type Template = {
  id: string;
  name: string;
  description: string | null;
  layout: TemplateLayout;
  isSystem: boolean;
  pageCount: number;
  // slot name -> id of the fragment filling it
  slots: Record<string, string>;
};
