import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">Welcome to your Carbon CMS</h1>
      <Link href="/admin">
        <Button>Admin</Button>
      </Link>
    </main>
  );
}
