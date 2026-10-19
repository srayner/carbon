import Link from "next/link";
import Renderer from "@/components/Page/Renderer";
import TemplateLayout from "@/components/Template/TemplateLayout";
import { PublicPageResult } from "@/lib/public-page";

const PublicPage = ({ page, template, isPreview }: PublicPageResult) => (
  <>
    {isPreview && (
      <div className="flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
        <span>
          <strong>Preview</strong>
          {" — "}
          {page.publishedAt
            ? `scheduled for ${new Date(page.publishedAt).toLocaleString(
                "en-GB",
                { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }
              )} UTC`
            : "this page is a draft"}
          . Visitors can&apos;t see it yet.
        </span>
        <Link
          href={`/admin/pages/${page.id}`}
          className="font-medium underline"
        >
          Edit page
        </Link>
      </div>
    )}
    <TemplateLayout layout={template.layout} slots={template.slots}>
      <Renderer page={page} />
    </TemplateLayout>
  </>
);

export default PublicPage;
