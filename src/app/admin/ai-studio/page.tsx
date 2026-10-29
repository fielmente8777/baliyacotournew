import type { Metadata } from "next";
import AiStudioView from "@/features/admin/studio/AiStudioView";

export const metadata: Metadata = { title: "AI Studio | Baliye Admin" };

export default function AiStudioPage() {
  return <AiStudioView />;
}
