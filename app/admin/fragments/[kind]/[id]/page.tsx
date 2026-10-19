import { notFound } from "next/navigation";
import FragmentEditor from "@/components/Fragment/FragmentEditor";
import { KIND_BY_SEGMENT } from "@/lib/fragment-routes";

export default async function EditFragmentPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind: segment, id } = await params;
  const kind = KIND_BY_SEGMENT[segment];
  if (!kind) return notFound();

  return <FragmentEditor fragmentId={id} kind={kind} />;
}
