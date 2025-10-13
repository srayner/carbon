"use client";

import React, { useRef, useState, useEffect } from "react";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";

export default function EditPostPage() {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const tiptapRef = useRef<TiptapHandle | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    async function fetchContent() {
      try {
        const res = await fetch(`/api/content/${id}`);
        if (!res.ok) throw new Error("Failed to fetch content");
        const data = await res.json();
        setTitle(data.content.title);
        if (tiptapRef.current)
          tiptapRef.current.setContent(data.content.content);
      } catch (err: unknown) {
        console.error(err);
      }
    }
    fetchContent();
  }, [id]);

  const handleSave = async () => {
    if (!tiptapRef.current) return;
    setSaving(true);

    try {
      const content = tiptapRef.current.getHTML();
      const slug = title.toLowerCase().replace(/\s+/g, "-");

      const response = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, content }),
      });

      if (!response.ok) throw new Error("Failed to update content");
      router.push("/admin/content");
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="m-4">
      <h1>Edit Post</h1>
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded mb-2 w-full"
      />
      <Tiptap ref={tiptapRef} />
      <Button onClick={handleSave} disabled={saving || !title}>
        {saving ? "Saving..." : "Save Post"}
      </Button>
    </div>
  );
}
