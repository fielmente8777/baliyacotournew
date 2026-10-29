import type { Metadata } from "next";
import DesignBuilderView from "@/features/admin/design-builder/DesignBuilderView";

export const metadata: Metadata = { title: "Design Builder | Baliye Admin" };

export default function DesignBuilderPage() {
  return <DesignBuilderView />;
}
