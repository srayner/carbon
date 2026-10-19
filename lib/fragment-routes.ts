import type { FragmentKind } from "@/types/templates";

// The admin URL segment for each kind that has screens
export const KIND_BY_SEGMENT: Record<string, FragmentKind> = {
  headers: "HEADER",
  footers: "FOOTER",
  general: "GENERAL",
};

export const SEGMENT_BY_KIND: Partial<Record<FragmentKind, string>> = {
  HEADER: "headers",
  FOOTER: "footers",
  GENERAL: "general",
};

export const KIND_LABELS: Record<FragmentKind, string> = {
  HEADER: "Header",
  FOOTER: "Footer",
  GENERAL: "General content",
};

export const KIND_PLURALS: Record<FragmentKind, string> = {
  HEADER: "Headers",
  FOOTER: "Footers",
  GENERAL: "General content",
};
