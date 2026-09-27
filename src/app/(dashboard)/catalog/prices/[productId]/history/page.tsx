import PriceHistoryChart from "@/components/features/catalog/PriceHistoryChart";
interface Props { params: { productId: string } }
export default function PriceHistoryPage({ params }: Props) {
  return <PriceHistoryChart productId={params.productId} />;
}
