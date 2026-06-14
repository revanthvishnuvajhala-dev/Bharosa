import type { LeadStatus } from "@/lib/types";
import { LEAD_STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  sent: "bg-blue-50 text-blue-700 ring-blue-600/20",
  replied: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  escalated: "bg-amber-50 text-amber-800 ring-amber-600/20",
  no_response: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  message_failed_to_send: "bg-red-50 text-red-700 ring-red-600/20",
  code_redeemed: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
