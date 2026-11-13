"use client";

import React, { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import BlockEditor from "@/components/Block/BlockEditor";
import { Loaded } from "@/components/Loaded";
import { fetchFragment, saveFragment } from "@/lib/api/fragments";
import { KIND_LABELS } from "@/lib/fragment-routes";
import type { Fragment } from "@/types/entities";
import type { FragmentKind } from "@/types/templates";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

type FragmentEditorProps = {
  fragmentId?: string; // undefined for add mode
  kind: FragmentKind; // the kind to create in add mode
  afterSave?: (fragmentId: string) => void;
};

/**
 * Loads the fragment, then shows the editor for it. The editor only appears
 * once the fragment is there, so nothing added can be overwritten by the load.
 */
const FragmentEditor: React.FC<FragmentEditorProps> = ({ fragmentId, kind, afterSave }) =>
  fragmentId ? (
    <Loaded id={fragmentId} load={fetchFragment} failedMessage="Failed to load content.">
      {(fragment) => <FragmentForm key={fragmentId} initial={fragment} afterSave={afterSave} />}
    </Loaded>
  ) : (
    <FragmentForm initial={{ id: null, name: "", kind, blocks: [] }} afterSave={afterSave} />
  );

type FragmentFormProps = {
  initial: Fragment; // the fragment as loaded, or a blank one to add
  afterSave?: (fragmentId: string) => void;
};

const FragmentForm: React.FC<FragmentFormProps> = ({ initial, afterSave }) => {
  const [fragment, setFragment] = useState<Fragment>(initial);
  // The fragment as last loaded or saved; any difference is unsaved
  const [saved, setSaved] = useState<Fragment>(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(fragment) !== JSON.stringify(saved);
  useUnsavedChanges(dirty);
  const { setPageActions } = usePageActions();

  useEffect(() => {
    const handleSave = async () => {
      const sent = fragment;
      setSaving(true);
      try {
        const result = await saveFragment(sent);
        const id = result.id!;
        // What was sent is now saved; edits made while saving stay unsaved
        setSaved({ ...sent, id });
        setFragment((prev) => ({ ...prev, id }));
        toast.success("Saved.");
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
      showAddButton: false,
      showSaveButton: true,
      onSave: handleSave,
      dirty,
      saving,
    });

    return () => {
      setPageActions({});
    };
  }, [fragment, dirty, saving, setPageActions, afterSave]);

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
              className="w-full border rounded-sm px-2 py-1 text-sm"
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
