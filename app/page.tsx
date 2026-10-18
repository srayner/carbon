import Link from "next/link";
import { auth } from "@/auth";
import { handleSignOut } from "@/actions/logout";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold">Welcome to your Carbon CMS</h1>
      {user ? (
        <>
          <p>Logged in as {user.name ?? user.email}</p>
          <div className="flex gap-2">
            {user.role === "ADMIN" && (
              <Link href="/admin">
                <Button>Admin</Button>
              </Link>
            )}
            <form action={handleSignOut}>
              <Button type="submit" variant="outline">
                Log out
              </Button>
            </form>
          </div>
        </>
      ) : (
        <Link href="/auth/login">
          <Button>Log in</Button>
        </Link>
      )}
    </main>
  );
}
