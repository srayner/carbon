import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">Carbon CMS Admin</h1>
      <div className="flex gap-4">
        <Link href="/">
          <Button>Browse Site</Button>
        </Link>
        <Link href="admin/pages/">
          <Button>List Pages</Button>
        </Link>
        <Link href="/admin/pages/add">
          <Button>Add Pages</Button>
        </Link>
      </div>
    </main>
  );
}
