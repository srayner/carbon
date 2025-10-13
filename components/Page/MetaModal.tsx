"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MetaForm } from "./MetaForm";
import { getMeta, saveMeta } from "@/lib/api/meta";
import { toast } from "sonner";
import { PageMetaInput } from "@/lib/schema/page-meta";

interface MetaModalProps {
  pageId: string;
  trigger: React.ReactNode;
}

export function MetaModal({ pageId, trigger }: MetaModalProps) {
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState<PageMetaInput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    const data = await getMeta(pageId);
    setMeta(data);
    setLoading(false);
  };

  const handleSubmit = async (data: PageMetaInput) => {
    try {
      await saveMeta(pageId, data);
      toast.success("Metadata saved!");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to save metadata.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={handleOpen}>{trigger}</div>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SEO Meta Data</DialogTitle>
          <DialogDescription>
            Edit SEO and social media metadata for this page.
          </DialogDescription>
        </DialogHeader>
        {!loading && (
          <MetaForm initialData={meta || {}} onSubmit={handleSubmit} />
        )}
      </DialogContent>
    </Dialog>
  );
}
