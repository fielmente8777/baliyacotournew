import type { Metadata } from "next";
import TokensPanel from "@/features/account/TokensPanel";

export const metadata: Metadata = {
  title: "Design Credits | Baliye Couture",
  robots: { index: false, follow: false },
};

export default function TokensPage() {
  return <TokensPanel />;
}
