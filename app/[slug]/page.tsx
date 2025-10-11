import { notFound } from "next/navigation";

const demoContent = [
  { slug: "project-alpha", text: "Demo content for Project Alpha." },
  { slug: "project-beta", text: "Demo content for Project Beta." },
  { slug: "project-gamma", text: "Demo content for Project Gamma." },
];

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  const content = demoContent.find((c) => c.slug === params.slug);
  if (!content) return notFound();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{content.slug}</h1>
      <p>{content.text}</p>
    </main>
  );
}
