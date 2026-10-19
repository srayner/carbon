"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoryFormDialog, {
  CategoryDialogState,
} from "@/components/Category/CategoryFormDialog";
import {
  CategoryFormData,
  createCategory,
  deleteCategory,
  fetchCategories,
  moveCategory,
  updateCategory,
} from "@/lib/api/categories";
import {
  CategoryRow,
  MAX_CATEGORY_DEPTH,
  flattenCategories,
} from "@/lib/category-tree";
import type { Category } from "@/types/entities";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<CategoryDialogState | null>(null);
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo(() => flattenCategories(categories), [categories]);

  const load = useCallback(async () => {
    try {
      setCategories(await fetchCategories());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (data: CategoryFormData) => {
    if (dialog?.mode === "edit") {
      await updateCategory(dialog.category.id, data);
    } else {
      await createCategory(data);
    }
    setDialog(null);
    await load();
  };

  const handleMove = async (row: CategoryRow, direction: -1 | 1) => {
    try {
      await moveCategory(row.id, direction);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Move failed.");
    }
  };

  const handleToggleActive = async (row: CategoryRow) => {
    try {
      await updateCategory(row.id, {
        name: row.name,
        description: row.description,
        parentId: row.parentId,
        isActive: !row.isActive,
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(toDelete.id, toDelete.pageCount > 0);
      toast.success(`Deleted "${toDelete.name}".`);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => setDialog({ mode: "create", parentId: null })}>
          Add
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">No categories yet.</p>
      ) : (
        <table className="w-full border border-gray-200 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Pages</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td
                  className="p-2 border-b"
                  style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                >
                  <span className={row.isEffectivelyActive ? "" : "text-gray-400"}>
                    {row.name}
                  </span>
                  {row.description && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {row.description}
                    </span>
                  )}
                </td>
                <td className="p-2 border-b">{row.pageCount}</td>
                <td className="p-2 border-b">
                  <button
                    type="button"
                    className={`font-semibold hover:underline ${
                      row.isActive ? "text-green-600" : "text-gray-500"
                    }`}
                    title={row.isActive ? "Deactivate" : "Activate"}
                    onClick={() => handleToggleActive(row)}
                  >
                    {row.isActive ? "Active" : "Inactive"}
                  </button>
                  {row.isActive && !row.isEffectivelyActive && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (parent inactive)
                    </span>
                  )}
                </td>
                <td className="p-2 border-b">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Move up"
                      disabled={row.isFirst}
                      onClick={() => handleMove(row, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Move down"
                      disabled={row.isLast}
                      onClick={() => handleMove(row, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={
                        row.depth >= MAX_CATEGORY_DEPTH
                          ? "Maximum depth reached"
                          : "Add sub-category"
                      }
                      disabled={row.depth >= MAX_CATEGORY_DEPTH}
                      onClick={() =>
                        setDialog({ mode: "create", parentId: row.id })
                      }
                    >
                      <Plus />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Edit"
                      onClick={() => setDialog({ mode: "edit", category: row })}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Delete"
                      onClick={() => setToDelete(row)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CategoryFormDialog
        state={dialog}
        rows={rows}
        onClose={() => setDialog(null)}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{toDelete?.name}&rdquo;?</DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-col gap-2">
                {toDelete && toDelete.childCount > 0 ? (
                  <p>
                    This category has {plural(toDelete.childCount, "sub-category")}.
                    Move or delete {toDelete.childCount === 1 ? "it" : "them"}{" "}
                    first.
                  </p>
                ) : toDelete && toDelete.pageCount > 0 ? (
                  <p className="text-amber-600">
                    This category is used by {plural(toDelete.pageCount, "page")}.
                    Deleting it removes it from{" "}
                    {toDelete.pageCount === 1 ? "that page" : "those pages"}. The
                    pages themselves are not deleted.
                  </p>
                ) : (
                  <p>This category isn&apos;t used by any pages.</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || (toDelete?.childCount ?? 0) > 0}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
