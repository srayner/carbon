import Link from "next/link";
import SiteTheme from "@/components/Theme/SiteTheme";

export default function NotFound() {
  return (
    <SiteTheme>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-site-muted">
          404
        </p>
        <h1 className="text-4xl font-semibold">Page not found</h1>
        <p className="max-w-md text-site-muted">
          The page you are looking for does not exist, or has moved.
        </p>
        <Link href="/" className="text-site-accent underline underline-offset-4">
          Back to home
        </Link>
      </main>
    </SiteTheme>
  );
}
