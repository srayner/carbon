"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LayoutPreview from "@/components/Template/LayoutPreview";
import { fetchFragments } from "@/lib/api/fragments";
import { fetchTemplate, updateTemplate } from "@/lib/api/templates";
import { KIND_LABELS } from "@/lib/fragment-routes";
import type { FragmentSummary, Template } from "@/types/entities";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();

  const [template, setTemplate] = useState<Template | null>(null);
  const [fragments, setFragments] = useState<FragmentSummary[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchTemplate(id), fetchFragments()])
      .then(([loaded, allFragments]) => {
        setTemplate(loaded);
        setFragments(allFragments);
        setName(loaded.name);
        setDescription(loaded.description ?? "");
        setSlots(loaded.slots);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load.")
      );
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await updateTemplate(id, {
        name,
        description: description || null,
        slots,
      });
      setTemplate(saved.template);
      toast.success("Saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!template) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/templates"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Templates
        </Link>
        <h1 className="text-2xl font-semibold mt-1">{template.name}</h1>
        <p className="text-sm text-muted-foreground">
          Used by {template.pageCount} page{template.pageCount === 1 ? "" : "s"}
          {template.isSystem && " · preset"}
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm mb-1" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="description">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2">Layout</h2>
          <LayoutPreview layout={template.layout} />
        </div>

        {Object.keys(template.layout.slots).length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Slots</h2>
            {Object.entries(template.layout.slots).map(([slot, { kind }]) => (
              <div key={slot}>
                <label className="block text-sm mb-1" htmlFor={`slot-${slot}`}>
                  {slot}{" "}
                  <span className="text-muted-foreground">
                    ({KIND_LABELS[kind].toLowerCase()})
                  </span>
                </label>
                <select
                  id={`slot-${slot}`}
                  className="w-full border rounded-md px-3 h-9 text-sm bg-background"
                  value={slots[slot] ?? ""}
                  onChange={(e) =>
                    setSlots((prev) => {
                      const next = { ...prev };
                      if (e.target.value) next[slot] = e.target.value;
                      else delete next[slot];
                      return next;
                    })
                  }
                >
                  <option value="">None</option>
                  {fragments
                    .filter((f) => f.kind === kind)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div>
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </main>
  );
}
