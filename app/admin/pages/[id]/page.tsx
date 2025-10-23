"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import PageEditor from "@/components/Page/PageEditor";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string | undefined;

  return <PageEditor pageId={id} />;
}
