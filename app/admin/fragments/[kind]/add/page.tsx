import { notFound } from "next/navigation";
import FragmentEditorAdd from "@/components/Fragment/FragmentEditorAdd";
import { KIND_BY_SEGMENT } from "@/lib/fragment-routes";

export default async function AddFragmentPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind: segment } = await params;
  const kind = KIND_BY_SEGMENT[segment];
  if (!kind) return notFound();

  return <FragmentEditorAdd kind={kind} segment={segment} />;
}
