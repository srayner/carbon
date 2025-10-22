"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationControls from "@/components/ui/PaginationControls";

type ContentItem = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
};

export default function ContentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  const limit = 5;
  const skip = (page - 1) * limit;
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const onSearchTextChange = (newText: string) => {
    setSearch(newText);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", newText);
    params.set("page", "1"); // reset to first page on search
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(1);
  };

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(
          `/api/pages?search=${search}&limit=${limit}&skip=${skip}&orderBy=title&orderDir=asc`
        );
        if (!res.ok) throw new Error("Failed to fetch content");
        const { content, totalCount } = await res.json();
        setContent(content);
        setTotalCount(totalCount);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [search, page, skip]);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Search content..."
            className="flex-1"
            value={search}
            onChange={(e) => onSearchTextChange(e.target.value)}
          />
          <Link href="/admin/pages/add">
            <Button>Add</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full border border-gray-200 text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border-b">Title</th>
                <th className="p-2 border-b">Slug</th>
                <th className="p-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item.slug}>
                  <td className="p-2 border-b">
                    <Link
                      href={`/admin/pages/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="p-2 border-b">
                    <Link
                      href={`/${item.slug}?preview=1`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.slug}
                    </Link>
                  </td>

                  <td className="p-2 border-b">
                    {item.publishedAt ? (
                      new Date(item.publishedAt) <= new Date() ? (
                        <span className="text-green-600 font-semibold">
                          Published (
                          {new Date(item.publishedAt).toLocaleDateString()})
                        </span>
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          Scheduled (
                          {new Date(item.publishedAt).toLocaleDateString()})
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500 font-semibold">Draft</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            currentPage={page}
            pageSize={limit}
            totalCount={totalCount ?? 0}
            onPageChange={(newPage) => {
              setPage(newPage);
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", newPage.toString());
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
            }}
          />
        </>
      )}
    </main>
  );
}
