import type { Metadata } from "next";
import NewsletterView from "@/features/admin/NewsletterView";

export const metadata: Metadata = { title: "Newsletter | Baliye Admin" };

export default function NewsletterPage() {
  return <NewsletterView />;
}
