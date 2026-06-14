import { TrendDetailView } from "@/components/TrendDetailView";

export default async function TrendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TrendDetailView trendId={id} />;
}
