import { createServiceClient } from "@/lib/supabase/server";
import { getLeadMessages } from "@/lib/leads";
import { normalizeLeadOffer } from "@/lib/normalize";
import { LeadDetail } from "@/components/LeadDetail";
import type { Message } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function loadLeadPageData(id: string) {
  const supabase = createServiceClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*, offers(*)")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return { error: error?.message ?? "Lead not found" };
  }

  const messages = (await getLeadMessages(id)) as Message[];
  return {
    lead: normalizeLeadOffer(lead),
    messages,
  };
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let result: Awaited<ReturnType<typeof loadLeadPageData>>;
  try {
    result = await loadLeadPageData(id);
  } catch (error) {
    result = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  if ("error" in result && result.error) {
    return (
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to leads
        </Link>
        <p className="mt-4 text-sm text-red-600">Could not load lead: {result.error}</p>
      </div>
    );
  }

  if (!("lead" in result) || !result.lead) {
    return (
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to leads
        </Link>
        <p className="mt-4 text-sm text-red-600">Lead not found</p>
      </div>
    );
  }

  return (
    <LeadDetail
      key={id}
      leadId={id}
      initialLead={result.lead}
      initialMessages={result.messages ?? []}
    />
  );
}
