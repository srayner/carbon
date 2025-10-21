export type Page = {
  id: string;
  title: string;
  slug: string;
  meta: Record<string, any>;
  blocks: Record<string, any>[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
