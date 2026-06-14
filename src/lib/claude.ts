import Anthropic from "@anthropic-ai/sdk";
import type { LeadWithOffer, Message, Settings } from "@/lib/types";

const MODEL = "claude-sonnet-4-6";

export interface ConversationResult {
  reply: string | null;
  should_escalate: boolean;
  conversation_closed: boolean;
  summary: string;
}

function buildStyleRules(): string {
  return `STYLE RULES (mandatory):
- Messages must be super crisp — one or two lines max, like a real shopkeeper texting. Never paragraphs.
- Human and warm, with genuine empathy. No corporate or robotic tone.
- English only for v1.
- If presenting an offer, include the redemption code upfront and tell them to show it at the store.
- Recognize natural conversation closes (goodbye, "ok thanks", clear acceptance with code) and stop gracefully.
- If the customer expresses frustration about talking to an AI/bot or asks for a human, set should_escalate to true and reply with a brief empathetic handoff message.`;
}

function buildLeadContext(lead: LeadWithOffer): string {
  const lines = [`Customer name: ${lead.name}`];
  if (lead.last_purchase) lines.push(`Last purchase: ${lead.last_purchase}`);
  if (lead.context) lines.push(`Context: ${lead.context}`);
  if (lead.offers?.text && lead.redemption_code) {
    lines.push(`Offer: ${lead.offers.text}`);
    lines.push(`Redemption code: ${lead.redemption_code}`);
  }
  return lines.join("\n");
}

function formatHistory(messages: Message[]): string {
  if (messages.length === 0) return "(no messages yet)";

  return messages
    .filter((m) => m.sent_at || m.direction === "inbound")
    .map((m) => {
      const role = m.direction === "outbound" ? "Shop" : "Customer";
      return `${role}: ${m.body}`;
    })
    .join("\n");
}

export async function generateConversationTurn(
  settings: Settings,
  lead: LeadWithOffer,
  messages: Message[],
  options: { isOpener: boolean },
): Promise<ConversationResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `${settings.system_prompt}

BUSINESS DESCRIPTION:
${settings.business_description}

${buildStyleRules()}

ESCALATION: After each customer message, detect frustration about AI/bots or requests for a human.

OUTPUT: Respond with valid JSON only, no markdown:
{
  "reply": "next message to send, or null if conversation should end",
  "should_escalate": false,
  "conversation_closed": false,
  "summary": "rolling 3-line summary of what the customer has said so far"
}`;

  const userContent = options.isOpener
    ? `This is the PROACTIVE OPENER for a lapsed customer who has not been messaged yet.
${lead.offers?.text ? "Present the offer and redemption code upfront." : "No offer attached — warmly ask why they haven't returned and invite feedback."}
Generate the opening WhatsApp message.

LEAD CONTEXT:
${buildLeadContext(lead)}`
    : `The customer just replied. Generate the next message based on the conversation.

LEAD CONTEXT:
${buildLeadContext(lead)}

CONVERSATION HISTORY:
${formatHistory(messages)}

CURRENT SUMMARY:
${lead.summary || "(none yet)"}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as ConversationResult;
    return {
      reply: parsed.reply ?? null,
      should_escalate: Boolean(parsed.should_escalate),
      conversation_closed: Boolean(parsed.conversation_closed),
      summary: parsed.summary ?? lead.summary ?? "",
    };
  } catch {
    return {
      reply: text.slice(0, 300) || null,
      should_escalate: false,
      conversation_closed: false,
      summary: lead.summary ?? "",
    };
  }
}

export async function checkEscalation(
  inboundBody: string,
): Promise<boolean> {
  const lower = inboundBody.toLowerCase();
  const patterns = [
    /\b(real|actual|human)\s+(person|agent|staff|someone)\b/,
    /\btalk\s+to\s+(a\s+)?(human|person|someone|manager)\b/,
    /\bnot\s+a\s+bot\b/,
    /\bi\s+don'?t\s+want\s+to\s+talk\s+to\s+(a\s+)?(bot|ai|robot)\b/,
    /\bstop\s+(messaging|texting)\s+me\b/,
    /\byou\s+are\s+(a\s+)?(bot|ai|robot)\b/,
    /\bfrustrated\b.*\b(bot|ai)\b/,
  ];

  return patterns.some((p) => p.test(lower));
}
