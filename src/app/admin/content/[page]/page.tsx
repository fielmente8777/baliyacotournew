import { notFound } from "next/navigation";
import type { ContentPage } from "@/@types/admin";
import ContentEditorView from "@/features/admin/content/ContentEditorView";

const PAGES: ContentPage[] = ["home", "footer", "terms"];

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.map((page) => ({ page }));
}

export default async function ContentPageEditor({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!PAGES.includes(page as ContentPage)) notFound();
  return <ContentEditorView page={page as ContentPage} />;
}
