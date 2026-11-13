"use client";

import React, { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import BlockEditor from "@/components/Block/BlockEditor";
import { Loaded } from "@/components/Loaded";
import { PageSettings } from "@/components/Page/PageSettings";
import { fetchPage, savePage } from "@/lib/api/pages";
import { fetchCategories } from "@/lib/api/categories";
import { fetchTemplates } from "@/lib/api/templates";
import { CategoryRow, flattenCategories } from "@/lib/category-tree";
import { DEFAULT_TEMPLATE_ID } from "@/config/templates";
import { Page, Template } from "@/types/entities";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

type PageEditorProps = {
  pageId?: string; // undefined for add mode
  afterSave?: (pageId: string) => void;
};

const blankPage = (): Page => ({
  id: "",
  title: "",
  slug: "",
  blocks: [],
  categoryIds: [],
  templateId: DEFAULT_TEMPLATE_ID,
  summary: null,
  image: null,
  meta: null,
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Loads the page, then shows the editor for it. The editor only appears once
 * the page is there, so nothing typed or added can be overwritten by the load.
 */
const PageEditor: React.FC<PageEditorProps> = ({ pageId, afterSave }) =>
  pageId ? (
    <Loaded id={pageId} load={fetchPage} failedMessage="Failed to load page content.">
      {(page) => <PageForm key={pageId} initial={page} isNew={false} afterSave={afterSave} />}
    </Loaded>
  ) : (
    <PageForm initial={blankPage()} isNew afterSave={afterSave} />
  );

type PageFormProps = {
  initial: Page; // the page as loaded, or a blank one to add
  isNew: boolean;
  afterSave?: (pageId: string) => void;
};

const PageForm: React.FC<PageFormProps> = ({ initial, isNew, afterSave }) => {
  const [page, setPage] = useState<Page>(initial);
  // The page as last loaded or saved; any difference is unsaved
  const [saved, setSaved] = useState<Page>(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(page) !== JSON.stringify(saved);
  useUnsavedChanges(dirty);
  // Until the slug is edited by hand, a new page's slug follows its title
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { setPageActions } = usePageActions();

  useEffect(() => {
    fetchCategories()
      .then((all) => setCategories(flattenCategories(all)))
      .catch((err) => console.error("Failed to load categories:", err));
    fetchTemplates()
      .then(setTemplates)
      .catch((err) => console.error("Failed to load templates:", err));
  }, []);

  useEffect(() => {
    const handleAdd = () => console.log("Add clicked");
    const handleSave = async () => {
      const sent = page;
      setSaving(true);
      try {
        const newPage = await savePage(sent);
        const id = newPage.id!;
        // What was sent is now saved; edits made while saving stay unsaved
        setSaved({ ...sent, id });
        setPage((prev) => ({ ...prev, id }));
        toast.success("Page saved.");
        afterSave?.(id);
      } catch (err) {
        console.error("Save failed:", err);
        toast.error(err instanceof Error ? err.message : "Save failed.");
      } finally {
        setSaving(false);
      }
    };

    setPageActions({
      showEditorSidebars: true,
      showAddButton: true,
      showSaveButton: true,
      onAdd: handleAdd,
      onSave: handleSave,
      dirty,
      saving,
      // A new page has nothing to preview until its first save
      previewHref: saved.id ? `/${saved.slug}` : undefined,
    });

    return () => {
      // reset buttons when leaving page
      setPageActions({});
    };
  }, [page, saved, dirty, saving, setPageActions, afterSave]);

  const handleBlocksChange = (update: (blocks: Block[]) => Block[]) => {
    setPage((prevPage) => ({ ...prevPage, blocks: update(prevPage.blocks) }));
  };

  const handleTitleChange = (title: string) => {
    setPage((prevPage) => ({
      ...prevPage,
      title,
      slug: slugEdited ? prevPage.slug : slugify(title),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugEdited(true);
    setPage((prevPage) => ({ ...prevPage, slug }));
  };

  const handlePublishedAtChange = (publishedAt: Date | null) => {
    setPage((prevPage) => ({ ...prevPage, publishedAt }));
  };

  const handleCategoryIdsChange = (categoryIds: string[]) => {
    setPage((prevPage) => ({ ...prevPage, categoryIds }));
  };

  const handleSummaryChange = (summary: string) => {
    setPage((prevPage) => ({ ...prevPage, summary: summary || null }));
  };

  const handleImageChange = (image: string) => {
    setPage((prevPage) => ({ ...prevPage, image: image || null }));
  };

  const handleTemplateIdChange = (templateId: string) => {
    setPage((prevPage) => ({ ...prevPage, templateId }));
  };

  return (
    <BlockEditor
      blocks={page.blocks}
      onBlocksChange={handleBlocksChange}
      settingsLabel="Page"
      settings={
        <PageSettings
          title={page.title}
          slug={page.slug}
          publishedAt={page.publishedAt}
          templateId={page.templateId}
          templates={templates}
          categories={categories}
          categoryIds={page.categoryIds}
          summary={page.summary ?? ""}
          image={page.image ?? ""}
          onSummaryChange={handleSummaryChange}
          onImageChange={handleImageChange}
          onTitleChange={handleTitleChange}
          onSlugChange={handleSlugChange}
          onPublishedAtChange={handlePublishedAtChange}
          onTemplateIdChange={handleTemplateIdChange}
          onCategoryIdsChange={handleCategoryIdsChange}
        />
      }
    />
  );
};

export default PageEditor;
