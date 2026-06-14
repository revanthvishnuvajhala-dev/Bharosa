import { createServiceClient } from "@/lib/supabase/server";
import { generateUniqueRedemptionCode } from "@/lib/codes";
import {
  checkEscalation,
  generateConversationTurn,
} from "@/lib/claude";
import { isWithinQuietHours } from "@/lib/quiet-hours";
import { normalizeMobile } from "@/lib/phone";
import { sendWhatsAppMessage } from "@/lib/twilio";
import type { LeadStatus, LeadWithOffer, SendStatus, Settings } from "@/lib/types";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export async function getSettings(): Promise<Settings | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single();

  if (error) return null;
  return data as Settings;
}

export async function getLeadWithOffer(
  leadId: string,
): Promise<LeadWithOffer | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, offers(*)")
    .eq("id", leadId)
    .single();

  if (error) return null;
  return data as LeadWithOffer;
}

export async function getLeadByMobile(
  mobile: string,
): Promise<LeadWithOffer | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, offers(*)")
    .eq("mobile", mobile)
    .maybeSingle();

  if (error) return null;
  return data as LeadWithOffer | null;
}

export async function getLeadMessages(leadId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function dispatchOutboundMessage(
  leadId: string,
  messageId: string,
  body: string,
  settings: Settings,
  to: string,
): Promise<boolean> {
  const supabase = createServiceClient();

  try {
    await sendWhatsAppMessage(settings, to, body);
    await supabase
      .from("messages")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", messageId);

    await supabase
      .from("leads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", leadId);

    return true;
  } catch {
    await supabase
      .from("leads")
      .update({
        status: "message_failed_to_send",
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);
    return false;
  }
}

export async function sendOrQueueMessage(
  leadId: string,
  body: string,
  settings: Settings,
  to: string,
  statusUpdate?: LeadStatus,
): Promise<SendStatus> {
  const supabase = createServiceClient();

  if (!isWithinQuietHours()) {
    const { data: msg } = await supabase
      .from("messages")
      .insert({
        lead_id: leadId,
        direction: "outbound",
        body,
        sent_at: null,
      })
      .select("id")
      .single();

    if (msg && statusUpdate) {
      await supabase
        .from("leads")
        .update({ status: statusUpdate, updated_at: new Date().toISOString() })
        .eq("id", leadId);
    }
    return "queued";
  }

  const { data: msg } = await supabase
    .from("messages")
    .insert({
      lead_id: leadId,
      direction: "outbound",
      body,
      sent_at: null,
    })
    .select("id")
    .single();

  if (!msg) return "failed";

  const sent = await dispatchOutboundMessage(
    leadId,
    msg.id,
    body,
    settings,
    to,
  );

  if (sent && statusUpdate) {
    await supabase
      .from("leads")
      .update({ status: statusUpdate, updated_at: new Date().toISOString() })
      .eq("id", leadId);
  }

  return sent ? "sent" : "failed";
}

export async function fireOpener(leadId: string): Promise<SendStatus> {
  const settings = await getSettings();
  if (!settings?.twilio_account_sid || !settings.twilio_auth_token) {
    return "skipped";
  }

  const lead = await getLeadWithOffer(leadId);
  if (!lead) return "skipped";

  const result = await generateConversationTurn(
    settings,
    lead,
    [],
    { isOpener: true },
  );

  if (!result.reply) return "skipped";

  const updates: Record<string, unknown> = {
    summary: result.summary,
    updated_at: new Date().toISOString(),
  };

  if (result.should_escalate) {
    updates.escalated = true;
    updates.status = "escalated";
  }

  const supabase = createServiceClient();
  await supabase.from("leads").update(updates).eq("id", leadId);

  if (!result.should_escalate) {
    return sendOrQueueMessage(
      leadId,
      result.reply,
      settings,
      lead.mobile,
      "sent",
    );
  }

  if (result.reply) {
    return sendOrQueueMessage(leadId, result.reply, settings, lead.mobile);
  }

  return "skipped";
}

export async function handleInboundMessage(
  mobile: string,
  body: string,
): Promise<void> {
  const normalized = normalizeMobile(mobile.replace("whatsapp:", ""));
  if (!normalized) return;

  const lead = await getLeadByMobile(normalized);
  if (!lead) return;

  const settings = await getSettings();
  if (!settings) return;

  const supabase = createServiceClient();

  await supabase.from("messages").insert({
    lead_id: lead.id,
    direction: "inbound",
    body,
    sent_at: new Date().toISOString(),
  });

  if (lead.escalated || lead.status === "code_redeemed") return;

  const shouldEscalate =
    (await checkEscalation(body)) ||
    false;

  const messages = await getLeadMessages(lead.id);
  const refreshedLead = (await getLeadWithOffer(lead.id))!;

  if (shouldEscalate) {
    const handoff =
      "I completely understand — I'll have someone from our team reach out to you directly. Thank you for your patience.";
    await supabase
      .from("leads")
      .update({
        escalated: true,
        status: "escalated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    await sendOrQueueMessage(lead.id, handoff, settings, lead.mobile);
    return;
  }

  const result = await generateConversationTurn(
    settings,
    refreshedLead,
    messages,
    { isOpener: false },
  );

  const leadUpdates: Record<string, unknown> = {
    summary: result.summary,
    status: "replied",
    updated_at: new Date().toISOString(),
  };

  if (result.should_escalate) {
    leadUpdates.escalated = true;
    leadUpdates.status = "escalated";
  }

  await supabase.from("leads").update(leadUpdates).eq("id", lead.id);

  if (result.should_escalate && result.reply) {
    await sendOrQueueMessage(lead.id, result.reply, settings, lead.mobile);
    return;
  }

  if (result.conversation_closed || !result.reply) return;

  await sendOrQueueMessage(lead.id, result.reply, settings, lead.mobile);
}

export async function findOrCreateOffer(
  offerText: string | null | undefined,
): Promise<string | null> {
  if (!offerText?.trim()) return null;

  const supabase = createServiceClient();
  const text = offerText.trim();

  const { data: existing } = await supabase
    .from("offers")
    .select("id")
    .eq("text", text)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("offers")
    .insert({ text })
    .select("id")
    .single();

  if (error) {
    const { data: retry } = await supabase
      .from("offers")
      .select("id")
      .eq("text", text)
      .maybeSingle();
    return retry?.id ?? null;
  }

  return created.id;
}

export interface CreateLeadInput {
  name: string;
  mobile: string;
  last_purchase?: string | null;
  context?: string | null;
  offer_text?: string | null;
}

export interface CreateLeadResult {
  success: boolean;
  lead?: { id: string };
  send_status?: SendStatus;
  duplicate?: boolean;
  error?: string;
}

export async function createLead(
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const mobile = normalizeMobile(input.mobile);
  if (!mobile) {
    return { success: false, error: "Invalid mobile number" };
  }

  if (!input.name?.trim()) {
    return { success: false, error: "Name is required" };
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("mobile", mobile)
    .maybeSingle();

  if (existing) {
    return { success: false, duplicate: true };
  }

  const offerId = await findOrCreateOffer(input.offer_text);
  let redemptionCode: string | null = null;

  if (offerId) {
    redemptionCode = await generateUniqueRedemptionCode();
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: input.name.trim(),
      mobile,
      last_purchase: input.last_purchase?.trim() || null,
      context: input.context?.trim() || null,
      offer_id: offerId,
      redemption_code: redemptionCode,
      status: "sent",
    })
    .select("id")
    .single();

  if (error || !lead) {
    return { success: false, error: error?.message ?? "Failed to create lead" };
  }

  const send_status = await fireOpener(lead.id);

  return { success: true, lead: { id: lead.id }, send_status };
}

export async function dispatchPendingMessages(): Promise<number> {
  if (!isWithinQuietHours()) return 0;

  const settings = await getSettings();
  if (!settings?.twilio_account_sid) return 0;

  const supabase = createServiceClient();
  const { data: pending } = await supabase
    .from("messages")
    .select("id, lead_id, body, leads(mobile)")
    .is("sent_at", null)
    .eq("direction", "outbound")
    .order("created_at", { ascending: true })
    .limit(50);

  if (!pending?.length) return 0;

  let sent = 0;
  for (const msg of pending) {
    const lead = msg.leads as unknown as { mobile: string } | null;
    const leadMobile = lead?.mobile;
    if (!leadMobile) continue;

    const ok = await dispatchOutboundMessage(
      msg.lead_id,
      msg.id,
      msg.body,
      settings,
      leadMobile,
    );
    if (ok) sent++;
  }

  return sent;
}

export async function markNoResponseLeads(): Promise<number> {
  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from("leads")
    .select("id")
    .eq("status", "sent")
    .lt("updated_at", cutoff);

  if (!candidates?.length) return 0;

  let marked = 0;
  for (const lead of candidates) {
    const { data: inbound } = await supabase
      .from("messages")
      .select("id")
      .eq("lead_id", lead.id)
      .eq("direction", "inbound")
      .limit(1);

    if (inbound?.length) continue;

    await supabase
      .from("leads")
      .update({ status: "no_response", updated_at: new Date().toISOString() })
      .eq("id", lead.id);
    marked++;
  }

  return marked;
}

export async function retryLead(leadId: string): Promise<boolean> {
  const lead = await getLeadWithOffer(leadId);
  if (!lead || lead.status !== "message_failed_to_send") return false;

  const messages = await getLeadMessages(leadId);
  const hasOutbound = messages.some((m) => m.direction === "outbound");

  if (!hasOutbound) {
    await fireOpener(leadId);
    return true;
  }

  const lastFailed = [...messages]
    .reverse()
    .find((m) => m.direction === "outbound" && !m.sent_at);

  const settings = await getSettings();
  if (!settings || !lastFailed) return false;

  const supabase = createServiceClient();
  await supabase
    .from("leads")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", leadId);

  await sendOrQueueMessage(
    leadId,
    lastFailed.body,
    settings,
    lead.mobile,
    "sent",
  );

  return true;
}
