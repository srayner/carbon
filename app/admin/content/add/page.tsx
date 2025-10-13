"use client";

import React, { useRef, useState } from "react";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AddPostPage() {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const tiptapRef = useRef<TiptapHandle | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!tiptapRef.current) return;
    setSaving(true);

    try {
      const content = tiptapRef.current.getHTML(); // assumes Tiptap exposes getHTML
      const slug = title.toLowerCase().replace(/\s+/g, "-");

      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, content }),
      });

      if (!response.ok) throw new Error("Failed to save post");

      tiptapRef.current.clearContent();
      router.push("/admin/content");
      setTitle("");
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="m-4">
      <h1>Add New Post</h1>
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
      />
      <Tiptap ref={tiptapRef} />
      <Button onClick={handleSave} disabled={saving || !title}>
        {saving ? "Saving..." : "Save Post"}
      </Button>
    </div>
  );
}
