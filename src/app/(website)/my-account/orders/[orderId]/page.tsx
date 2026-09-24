import type { Metadata } from "next";
import OrderDetailView from "@/features/account/OrderDetailView";

export const metadata: Metadata = {
  title: "Order Details | Baliye Couture",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  return <OrderDetailView orderId={orderId} />;
}
