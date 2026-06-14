import type { LeadMetrics } from "@/lib/types";

export function MetricsStrip({ metrics }: { metrics: LeadMetrics }) {
  const items = [
    { label: "Total contacted", value: metrics.total_contacted },
    { label: "Replied", value: metrics.replied },
    { label: "Codes redeemed", value: metrics.codes_redeemed },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
