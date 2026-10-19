"use client";

import { useState } from "react";
import { getPageStatus, PageStatus } from "@/lib/page-status";
import { CategoryRow } from "@/lib/category-tree";
import type { Template } from "@/types/entities";
import UploadField from "@/components/Block/UploadField";

interface PageSettingsProps {
  title: string;
  slug: string;
  publishedAt: Date | null;
  templateId: string;
  templates: Template[];
  categories: CategoryRow[];
  categoryIds: string[];
  summary: string;
  image: string;
  onSummaryChange: (summary: string) => void;
  onImageChange: (image: string) => void;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onPublishedAtChange: (publishedAt: Date | null) => void;
  onTemplateIdChange: (templateId: string) => void;
  onCategoryIdsChange: (categoryIds: string[]) => void;
}

const STATUS_LABELS: Record<PageStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  live: "Live",
};

const STATUS_STYLES: Record<PageStatus, string> = {
  draft: "text-gray-600",
  scheduled: "text-amber-600",
  live: "text-green-600",
};

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time
const toLocalInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (date: Date) =>
  date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function PageSettings({
  title,
  slug,
  publishedAt,
  templateId,
  templates,
  categories,
  categoryIds,
  summary,
  image,
  onSummaryChange,
  onImageChange,
  onTitleChange,
  onSlugChange,
  onPublishedAtChange,
  onTemplateIdChange,
  onCategoryIdsChange,
}: PageSettingsProps) {
  const status = getPageStatus(publishedAt);
  const [scheduling, setScheduling] = useState(false);
  const [draftDate, setDraftDate] = useState("");

  return (
  <div className="flex flex-col gap-4 p-2">
    {/* Publishing Info */}
    <section className="p-3 border rounded-md bg-background">
      <h2 className="text-sm font-semibold mb-2">Publishing</h2>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <span
          className={`text-sm font-medium ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>
      {publishedAt && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            {status === "scheduled" ? "Goes live:" : "Live since:"}
          </span>
          <span className="text-sm font-medium">
            {formatDateTime(publishedAt)}
          </span>
        </div>
      )}
      {scheduling ? (
        <div>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1 text-sm"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              disabled={!draftDate}
              onClick={() => {
                onPublishedAtChange(new Date(draftDate));
                setScheduling(false);
              }}
            >
              Set
            </button>
            <button
              type="button"
              className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
              onClick={() => setScheduling(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => onPublishedAtChange(new Date())}
          >
            Publish now
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={() => {
              setDraftDate(
                publishedAt ? toLocalInputValue(publishedAt) : ""
              );
              setScheduling(true);
            }}
          >
            Schedule…
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
            disabled={!publishedAt}
            onClick={() => onPublishedAtChange(null)}
          >
            Unpublish
          </button>
        </div>
      )}
    </section>

    {/* Title and slug */}
    <section className="p-3 border rounded-md bg-background">
      <h2 className="text-sm font-semibold mb-2">Page</h2>
      <label className="block text-sm text-muted-foreground mb-1">
        Title
      </label>
      <input
        className="w-full border rounded px-2 py-1 text-sm mb-3"
        value={title}
        placeholder="Page title"
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <label className="block text-sm text-muted-foreground mb-1">
        Slug
      </label>
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">/</span>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          value={slug}
          placeholder="page-slug"
          onChange={(e) => onSlugChange(e.target.value)}
        />
      </div>
    </section>

    {/* Summary and image, shown when this page is listed on a card */}
    <section className="p-3 border rounded-md bg-background">
      <h2 className="text-sm font-semibold mb-2">Card</h2>
      <p className="text-xs text-muted-foreground mb-2">
        Shown when this page appears in a list of pages.
      </p>
      <label className="block text-sm text-muted-foreground mb-1">
        Summary
      </label>
      <textarea
        className="w-full border rounded px-2 py-1 text-sm mb-3 h-20"
        value={summary}
        maxLength={300}
        placeholder="A one or two sentence description"
        onChange={(e) => onSummaryChange(e.target.value)}
      />
      <label className="block text-sm text-muted-foreground mb-1">Image</label>
      <UploadField kind="image" value={image} onChange={onImageChange} />
    </section>

    {/* Template */}
    <section className="p-3 border rounded-md bg-background">
      <h2 className="text-sm font-semibold mb-2">Template</h2>
      <select
        className="w-full border rounded px-2 py-1 text-sm bg-background"
        value={templateId}
        onChange={(e) => onTemplateIdChange(e.target.value)}
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
      {templates.find((t) => t.id === templateId)?.description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {templates.find((t) => t.id === templateId)?.description}
        </p>
      )}
    </section>

    {/* Categories */}
    <section className="p-3 border rounded-md bg-background">
      <h2 className="text-sm font-semibold mb-2">Categories</h2>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No categories yet.
        </p>
      ) : (
        <div className="flex flex-col gap-1 max-h-64 overflow-auto">
          {categories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center gap-2 text-sm ${
                category.isEffectivelyActive ? "" : "text-gray-400"
              }`}
              style={{ paddingLeft: `${(category.depth - 1) * 1}rem` }}
            >
              <input
                type="checkbox"
                checked={categoryIds.includes(category.id)}
                onChange={(e) =>
                  onCategoryIdsChange(
                    e.target.checked
                      ? [...categoryIds, category.id]
                      : categoryIds.filter((id) => id !== category.id)
                  )
                }
              />
              {category.name}
              {!category.isEffectivelyActive && (
                <span className="text-xs">(inactive)</span>
              )}
            </label>
          ))}
        </div>
      )}
    </section>
  </div>
  );
}
