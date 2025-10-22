"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import PageEditor from "@/components/Page/PageEditor";

export default function EditPostPage() {
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    async function fetchContent() {
      try {
        const res = await fetch(`/api/pages/${id}`);
        if (!res.ok) throw new Error("Failed to fetch content");
        const data = await res.json();
      } catch (err: unknown) {
        console.error(err);
      }
    }
    fetchContent();
  }, [id]);

  return <PageEditor />;
}
