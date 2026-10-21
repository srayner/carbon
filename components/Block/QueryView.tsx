import CardView from "@/components/Block/CardView";
import { ViewProps } from "@/types/blocks";
import { QUERY_ORDERS, QueryOrder, queryPages } from "@/services/page-query";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

// Full class names, so Tailwind can see them
const GRID_COLUMNS: Record<string, string> = {
  "1": "grid-cols-1",
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

const parseLimit = (value: string | undefined) => {
  const limit = parseInt(value ?? "", 10);
  return Number.isFinite(limit) && limit > 0
    ? Math.min(limit, MAX_LIMIT)
    : DEFAULT_LIMIT;
};

// The public rendering of a Query block: the pages found, as cards or links.
// The current page is never listed in its own query.
const QueryView = async ({
  block,
  shared,
  currentPageId,
}: ViewProps<"Query">) => {
  const { properties } = block;
  const { category, includeSubcategories, display, columns } = properties;
  const { id, className } = shared;
  const orderBy = QUERY_ORDERS.includes(properties.orderBy as QueryOrder)
    ? (properties.orderBy as QueryOrder)
    : "newest";

  const pages = await queryPages({
    categoryId: category,
    includeSubcategories: includeSubcategories !== "false",
    orderBy,
    limit: parseLimit(properties.limit),
    excludePageId: currentPageId ?? undefined,
  });

  if (pages.length === 0) return null;

  if (display === "list") {
    return (
      <ul
        id={id}
        className={`not-prose my-4 flex list-none flex-col gap-1 p-0 ${
          className ?? ""
        }`}
      >
        {pages.map((page) => (
          <li key={page.id}>
            <a href={`/${page.slug}`} className="hover:underline">
              {page.title}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      id={id}
      className={`not-prose my-8 grid gap-6 ${
        GRID_COLUMNS[columns] ?? GRID_COLUMNS["3"]
      } ${className ?? ""}`}
    >
      {pages.map((page) => (
        <CardView
          key={page.id}
          block={{
            id: page.id,
            type: "Card",
            properties: {
              title: page.title,
              image: page.image ?? "",
              alt: "",
              description: page.summary ?? "",
              linkUrl: `/${page.slug}`,
              linkLabel: "Read more",
              className: "",
              cssId: "",
            },
          }}
        />
      ))}
    </div>
  );
};

export default QueryView;
