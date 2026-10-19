"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
import { deleteFragment, fetchFragments } from "@/lib/api/fragments";
import { KIND_LABELS, KIND_PLURALS, SEGMENT_BY_KIND } from "@/lib/fragment-routes";
import type { FragmentSummary } from "@/types/entities";
import type { FragmentKind } from "@/types/templates";

export default function FragmentList({ kind }: { kind: FragmentKind }) {
  const segment = SEGMENT_BY_KIND[kind];
  const label = KIND_LABELS[kind].toLowerCase();

  const [fragments, setFragments] = useState<FragmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<FragmentSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setFragments(await fetchFragments(kind));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteFragment(toDelete.id, toDelete.templateCount > 0);
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
        <h1 className="text-2xl font-semibold">{KIND_PLURALS[kind]}</h1>
        <Link href={`/admin/fragments/${segment}/add`}>
          <Button>Add</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : fragments.length === 0 ? (
        <p className="text-muted-foreground">No {KIND_PLURALS[kind].toLowerCase()} yet.</p>
      ) : (
        <table className="w-full border border-gray-200 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Used by templates</th>
              <th className="p-2 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fragments.map((fragment) => (
              <tr key={fragment.id}>
                <td className="p-2 border-b">
                  <Link
                    href={`/admin/fragments/${segment}/${fragment.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {fragment.name}
                  </Link>
                </td>
                <td className="p-2 border-b">{fragment.templateCount}</td>
                <td className="p-2 border-b text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setToDelete(fragment)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{toDelete?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              {toDelete && toDelete.templateCount > 0
                ? `This ${label} is used by ${toDelete.templateCount} template${
                    toDelete.templateCount === 1 ? "" : "s"
                  }. Deleting it leaves that slot empty.`
                : `This ${label} isn't used by any template.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
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
