import type { Metadata } from "next";
import TeamView from "@/features/admin/TeamView";

export const metadata: Metadata = { title: "Team | Baliye Admin" };

export default function TeamPage() {
  return <TeamView />;
}
