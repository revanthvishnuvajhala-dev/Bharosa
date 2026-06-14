"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MetricsStrip } from "@/components/MetricsStrip";
import { StatusBadge } from "@/components/StatusBadge";
import { VerificationBox } from "@/components/VerificationBox";
import type { LeadMetrics, LeadStatus, LeadWithOffer } from "@/lib/types";
import { LEAD_STATUS_LABELS } from "@/lib/types";

const FILTERS: (LeadStatus | "all")[] = [
  "all",
  "sent",
  "replied",
  "escalated",
  "no_response",
  "message_failed_to_send",
  "code_redeemed",
];

export function Dashboard() {
  const [leads, setLeads] = useState<LeadWithOffer[]>([]);
  const [metrics, setMetrics] = useState<LeadMetrics>({
    total_contacted: 0,
    replied: 0,
    codes_redeemed: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads ?? []);
    setMetrics(data.metrics ?? { total_contacted: 0, replied: 0, codes_redeemed: 0 });
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(loadLeads, 250);
    return () => clearTimeout(timer);
  }, [loadLeads]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Win-back leads</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor WhatsApp conversations with lapsed customers.
        </p>
      </div>

      <MetricsStrip metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 sm:max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatus(filter)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    status === filter
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {filter === "all" ? "All" : LEAD_STATUS_LABELS[filter]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200">
              <thead className="bg-zinc-50">
                <tr>
                  {["Name", "Mobile", "Offer", "Status", "Summary"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                      Loading...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                      No leads yet.{" "}
                      <Link href="/leads/new" className="text-zinc-900 underline">
                        Add your first lead
                      </Link>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium text-zinc-900 hover:underline"
                        >
                          {lead.name}
                          {lead.escalated && (
                            <span className="ml-2 text-amber-600" title="Escalated">
                              ⚠
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">{lead.mobile}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {lead.offers?.text ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="max-w-xs px-4 py-3 text-sm text-zinc-500">
                        <p className="line-clamp-3 whitespace-pre-line">
                          {lead.summary || "—"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <VerificationBox />
      </div>
    </div>
  );
}
