import type { Metadata } from "next";
import MeasurementsView from "@/features/admin/MeasurementsView";

export const metadata: Metadata = { title: "Measurement fields | Baliye Admin" };

export default function MeasurementsPage() {
  return <MeasurementsView />;
}
