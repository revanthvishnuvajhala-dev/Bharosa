export type SendStatus = "sent" | "queued" | "failed" | "skipped";

export type LeadStatus =
  | "sent"
  | "replied"
  | "escalated"
  | "no_response"
  | "message_failed_to_send"
  | "code_redeemed";

export type MessageDirection = "outbound" | "inbound";

export interface Settings {
  id: string;
  business_description: string;
  system_prompt: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_whatsapp_number: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  text: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  last_purchase: string | null;
  context: string | null;
  offer_id: string | null;
  redemption_code: string | null;
  status: LeadStatus;
  summary: string;
  escalated: boolean;
  created_at: string;
  updated_at: string;
  offers?: Offer | null;
}

export interface Message {
  id: string;
  lead_id: string;
  direction: MessageDirection;
  body: string;
  sent_at: string | null;
  created_at: string;
}

export interface LeadWithOffer extends Lead {
  offers: Offer | null;
}

export interface LeadMetrics {
  total_contacted: number;
  replied: number;
  codes_redeemed: number;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  sent: "Sent",
  replied: "Replied",
  escalated: "Escalated",
  no_response: "No response",
  message_failed_to_send: "Failed",
  code_redeemed: "Code redeemed",
};

export const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";
