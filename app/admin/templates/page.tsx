"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplates,
} from "@/lib/api/templates";
import type { Template } from "@/types/entities";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [basedOnId, setBasedOnId] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<Template | null>(null);

  const load = useCallback(async () => {
    try {
      const loaded = await fetchTemplates();
      setTemplates(loaded);
      setBasedOnId((current) => current || loaded[0]?.id || "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setCreateError(null);
    try {
      await createTemplate({ name, description: null, basedOnId });
      setCreating(false);
      setName("");
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTemplate(toDelete.id);
      toast.success(`Deleted "${toDelete.name}".`);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Button onClick={() => setCreating(true)}>Add</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-border text-left">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Description</th>
              <th className="p-2 border-b">Pages</th>
              <th className="p-2 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id} className="h-14">
                <td className="p-2 border-b">
                  <Link
                    href={`/admin/templates/${template.id}`}
                    className="text-primary hover:underline"
                  >
                    {template.name}
                  </Link>
                  {template.isSystem && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      preset
                    </span>
                  )}
                </td>
                <td className="p-2 border-b text-sm text-muted-foreground">
                  {template.description}
                </td>
                <td className="p-2 border-b">{template.pageCount}</td>
                <td className="p-2 border-b text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={template.isSystem}
                    title={
                      template.isSystem ? "Presets can't be deleted" : undefined
                    }
                    onClick={() => setToDelete(template)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Add template</DialogTitle>
              <DialogDescription>
                The new template starts as a copy of an existing one&apos;s
                layout and header/footer choices.
              </DialogDescription>
            </DialogHeader>
            <div>
              <label className="block text-sm mb-1" htmlFor="template-name">
                Name
              </label>
              <Input
                id="template-name"
                value={name}
                maxLength={100}
                autoFocus
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="template-based-on">
                Based on
              </label>
              <select
                id="template-based-on"
                className="w-full border rounded-md px-3 h-9 text-sm bg-background"
                value={basedOnId}
                onChange={(e) => setBasedOnId(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? "Saving…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{toDelete?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              {toDelete && toDelete.pageCount > 0
                ? `This template is used by ${toDelete.pageCount} page${
                    toDelete.pageCount === 1 ? "" : "s"
                  }. Move ${
                    toDelete.pageCount === 1 ? "it" : "them"
                  } to another template first.`
                : "This template isn't used by any pages."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={(toDelete?.pageCount ?? 0) > 0}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
