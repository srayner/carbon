import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">Carbon CMS Admin</h1>
      <div className="flex gap-4">
        <Link href="/">
          <Button>Browse Content</Button>
        </Link>
        <Link href="/admin/posts/add">
          <Button>Add Post</Button>
        </Link>
      </div>
    </main>
  );
}
