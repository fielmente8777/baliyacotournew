import type { Metadata } from "next";
import AdminShell from "@/features/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin | Baliye Couture",
  /* Internal tool — keep it out of search results. */
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
