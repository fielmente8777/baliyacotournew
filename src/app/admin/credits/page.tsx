import type { Metadata } from "next";
import TokensView from "@/features/admin/TokensView";

export const metadata: Metadata = { title: "Design credits | Baliye Admin" };

export default function TokensPage() {
  return <TokensView />;
}
