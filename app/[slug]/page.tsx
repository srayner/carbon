import { notFound } from "next/navigation";
import PublicPage from "@/components/Page/PublicPage";
import { getPageMetadata, loadPublicPage } from "@/lib/public-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const result = await loadPublicPage(slug);
  return result ? getPageMetadata(result.page) : {};
}

export default async function PageComponent({ params }: Props) {
  const { slug } = await params;
  const result = await loadPublicPage(slug);

  if (!result) return notFound();

  return <PublicPage {...result} />;
}
