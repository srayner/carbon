import { z } from "zod";

export const pageMetaSchema = z.object({
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(300).optional(),
  metaKeywords: z.string().max(500).optional(),
  canonicalPath: z.string().optional(),
  ogTitle: z.string().max(160).optional(),
  ogDescription: z.string().max(300).optional(),
  ogImage: z.string().url().optional(),
  twitterTitle: z.string().max(160).optional(),
  twitterDescription: z.string().max(300).optional(),
  twitterImage: z.string().url().optional(),
  robots: z.enum(["index, follow", "noindex, nofollow"]).optional(),
});

export type PageMetaInput = z.infer<typeof pageMetaSchema>;
