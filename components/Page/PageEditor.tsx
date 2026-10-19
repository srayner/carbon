"use client";

import React, { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import BlockEditor from "@/components/Block/BlockEditor";
import { PageSettings } from "@/components/Page/PageSettings";
import { fetchPage, savePage } from "@/lib/api/pages";
import { fetchCategories } from "@/lib/api/categories";
import { fetchTemplates } from "@/lib/api/templates";
import { CategoryRow, flattenCategories } from "@/lib/category-tree";
import { DEFAULT_TEMPLATE_ID } from "@/config/templates";
import { Page, Template } from "@/types/entities";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";

type PageEditorProps = {
  pageId?: string; // undefined for add mode
  afterSave?: (pageId: string) => void;
};

const PageEditor: React.FC<PageEditorProps> = ({ pageId, afterSave }) => {
  const [page, setPage] = useState<Page>({
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
  // Until the slug is edited by hand, a new page's slug follows its title
  const [slugEdited, setSlugEdited] = useState(!!pageId);
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
    if (!pageId) return; // nothing to load in add mode

    const loadPage = async () => {
      try {
        const loadedPage = await fetchPage(pageId);
        setPage(loadedPage);
      } catch (err) {
        console.error("Failed to load page:", err);
        alert("Failed to load page content.");
      }
    };

    loadPage();
  }, [pageId]);

  useEffect(() => {
    const handleAdd = () => console.log("Add clicked");
    const handleSave = async () => {
      try {
        const newPage = await savePage(page);
        afterSave?.(newPage.id!);
      } catch (err) {
        console.error("Save failed:", err);
        toast.error(err instanceof Error ? err.message : "Save failed.");
      }
    };

    setPageActions({
      showEditorSidebars: true,
      showAddButton: true,
      showSaveButton: true,
      onAdd: handleAdd,
      onSave: handleSave,
    });

    return () => {
      // reset buttons when leaving page
      setPageActions({
        showEditorSidebars: false,
        showAddButton: false,
        showSaveButton: false,
        onAdd: undefined,
        onSave: undefined,
      });
    };
  }, [page, setPageActions, afterSave]);

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
