import type { Metadata } from "next";
import NotificationsView from "@/features/account/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications | Baliye Couture",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
