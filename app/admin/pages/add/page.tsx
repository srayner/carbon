"use client";

import { useRouter } from "next/navigation";
import React from "react";
import PageEditor from "@/components/Page/PageEditor";

export default function AddPostPage() {
  const router = useRouter();

  const handleSave = (pageId: string) => {
    console.log("redirecting after save");
    router.push(`/admin/pages/${pageId}`);
  };

  return <PageEditor afterSave={handleSave} />;
}
