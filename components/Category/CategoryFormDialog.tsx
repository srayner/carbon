"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CategoryRow,
  MAX_CATEGORY_DEPTH,
  descendantIdsOf,
  subtreeHeight,
} from "@/lib/category-tree";
import type { CategoryFormData } from "@/lib/api/categories";

export type CategoryDialogState =
  | { mode: "create"; parentId: string | null }
  | { mode: "edit"; category: CategoryRow };

type Props = {
  state: CategoryDialogState | null;
  rows: CategoryRow[];
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
};

export default function CategoryFormDialog({
  state,
  rows,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    const category = state.mode === "edit" ? state.category : null;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setParentId(
      (state.mode === "edit" ? state.category.parentId : state.parentId) ?? ""
    );
    setIsActive(category?.isActive ?? true);
    setError(null);
  }, [state]);

  // A category can't go inside itself or its descendants, or anywhere that
  // would push its subtree past the depth limit
  const editing = state?.mode === "edit" ? state.category : null;
  const blocked = new Set(
    editing ? [editing.id, ...descendantIdsOf(rows, editing.id)] : []
  );
  const height = editing ? subtreeHeight(rows, editing.id) : 1;
  const parentOptions = rows.filter(
    (r) => !blocked.has(r.id) && r.depth + height <= MAX_CATEGORY_DEPTH
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name,
        description: description || null,
        parentId: parentId || null,
        isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              Categories can be nested up to {MAX_CATEGORY_DEPTH} levels deep.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label className="block text-sm mb-1" htmlFor="category-name">
              Name
            </label>
            <Input
              id="category-name"
              value={name}
              maxLength={100}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="category-parent">
              Parent
            </label>
            <select
              id="category-parent"
              className="w-full border rounded-md px-3 h-9 text-sm bg-background"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (top level)</option>
              {parentOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.path}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="category-description">
              Description
            </label>
            <Textarea
              id="category-description"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
            {editing && editing.isActive && !isActive && editing.childCount > 0 && (
              <span className="text-muted-foreground">
                (sub-categories will be deactivated too)
              </span>
            )}
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
