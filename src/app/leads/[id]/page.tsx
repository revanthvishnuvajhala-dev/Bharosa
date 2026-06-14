import { createServiceClient } from "@/lib/supabase/server";
import { getLeadMessages } from "@/lib/leads";
import { LeadDetail } from "@/components/LeadDetail";
import type { LeadWithOffer, Message } from "@/lib/types";
import Link from "next/link";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*, offers(*)")
    .eq("id", id)
    .single();

  if (!lead) {
    return (
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to leads
        </Link>
        <p className="mt-4 text-sm text-red-600">Lead not found</p>
      </div>
    );
  }

  const messages = (await getLeadMessages(id)) as Message[];

  return (
    <LeadDetail
      key={id}
      initialLead={lead as LeadWithOffer}
      initialMessages={messages}
    />
  );
}
