import type { Metadata } from "next";
import StyleGuidesView from "@/features/admin/StyleGuidesView";

export const metadata: Metadata = { title: "Size & fit guide | Baliye Admin" };

export default function StyleGuidesPage() {
  return <StyleGuidesView />;
}
