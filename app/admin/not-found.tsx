import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This admin page does not exist.
      </p>
      <Button asChild className="mt-2">
        <Link href="/admin/pages">Back to Pages</Link>
      </Button>
    </div>
  );
}
