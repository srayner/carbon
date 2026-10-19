"use client";

import React, { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import BlockEditor from "@/components/Block/BlockEditor";
import { fetchFragment, saveFragment } from "@/lib/api/fragments";
import { KIND_LABELS } from "@/lib/fragment-routes";
import type { Fragment } from "@/types/entities";
import type { FragmentKind } from "@/types/templates";
import { toast } from "sonner";

type FragmentEditorProps = {
  fragmentId?: string; // undefined for add mode
  kind: FragmentKind; // the kind to create in add mode
  afterSave?: (fragmentId: string) => void;
};

const FragmentEditor: React.FC<FragmentEditorProps> = ({
  fragmentId,
  kind,
  afterSave,
}) => {
  const [fragment, setFragment] = useState<Fragment>({
    id: null,
    name: "",
    kind,
    blocks: [],
  });
  const { setPageActions } = usePageActions();

  useEffect(() => {
    if (!fragmentId) return; // nothing to load in add mode

    fetchFragment(fragmentId)
      .then(setFragment)
      .catch((err) => {
        console.error("Failed to load fragment:", err);
        toast.error("Failed to load content.");
      });
  }, [fragmentId]);

  useEffect(() => {
    const handleSave = async () => {
      try {
        const saved = await saveFragment(fragment);
        toast.success("Saved.");
        afterSave?.(saved.id!);
      } catch (err) {
        console.error("Save failed:", err);
        toast.error(err instanceof Error ? err.message : "Save failed.");
      }
    };

    setPageActions({
      showEditorSidebars: true,
      showAddButton: false,
      showSaveButton: true,
      onSave: handleSave,
    });

    return () => {
      setPageActions({
        showEditorSidebars: false,
        showAddButton: false,
        showSaveButton: false,
        onAdd: undefined,
        onSave: undefined,
      });
    };
  }, [fragment, setPageActions, afterSave]);

  const handleBlocksChange = (update: (blocks: Block[]) => Block[]) => {
    setFragment((prev) => ({ ...prev, blocks: update(prev.blocks) }));
  };

  return (
    <BlockEditor
      blocks={fragment.blocks}
      onBlocksChange={handleBlocksChange}
      settingsLabel={KIND_LABELS[fragment.kind]}
      settings={
        <div className="flex flex-col gap-4 p-2">
          <section className="p-3 border rounded-md bg-background">
            <h2 className="text-sm font-semibold mb-2">
              {KIND_LABELS[fragment.kind]}
            </h2>
            <label className="block text-sm text-muted-foreground mb-1">
              Name
            </label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              value={fragment.name}
              maxLength={100}
              placeholder="Name"
              onChange={(e) =>
                setFragment((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Templates place this in their{" "}
              {KIND_LABELS[fragment.kind].toLowerCase()} slot.
            </p>
          </section>
        </div>
      }
    />
  );
};

export default FragmentEditor;
