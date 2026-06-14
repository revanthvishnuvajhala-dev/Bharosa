import twilio from "twilio";
import type { Settings } from "@/lib/types";

export function createTwilioClient(settings: Settings) {
  return twilio(settings.twilio_account_sid, settings.twilio_auth_token);
}

export async function sendWhatsAppMessage(
  settings: Settings,
  to: string,
  body: string,
): Promise<{ sid: string }> {
  const client = createTwilioClient(settings);
  const from = settings.twilio_whatsapp_number.startsWith("whatsapp:")
    ? settings.twilio_whatsapp_number
    : `whatsapp:${settings.twilio_whatsapp_number}`;

  const message = await client.messages.create({
    from,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body,
  });

  return { sid: message.sid };
}

export function validateTwilioWebhook(
  settings: Settings,
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  return twilio.validateRequest(
    settings.twilio_auth_token,
    signature,
    url,
    params,
  );
}
