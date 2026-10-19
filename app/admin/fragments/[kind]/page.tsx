import { notFound } from "next/navigation";
import FragmentList from "@/components/Fragment/FragmentList";
import { KIND_BY_SEGMENT } from "@/lib/fragment-routes";

export default async function FragmentsPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const kind = KIND_BY_SEGMENT[(await params).kind];
  if (!kind) return notFound();

  return <FragmentList kind={kind} />;
}
