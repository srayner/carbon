"use client";

import { useRouter } from "next/navigation";
import FragmentEditor from "@/components/Fragment/FragmentEditor";
import type { FragmentKind } from "@/types/templates";

export default function FragmentEditorAdd({
  kind,
  segment,
}: {
  kind: FragmentKind;
  segment: string;
}) {
  const router = useRouter();

  return (
    <FragmentEditor
      kind={kind}
      afterSave={(id) => router.push(`/admin/fragments/${segment}/${id}`)}
    />
  );
}
