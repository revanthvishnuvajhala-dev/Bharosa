import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleInboundMessage } from "@/lib/leads";
import { validateTwilioWebhook } from "@/lib/twilio";
import { SETTINGS_ID } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    const supabase = createServiceClient();
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("id", SETTINGS_ID)
      .single();

    if (!settings) {
      return new NextResponse("Settings not configured", { status: 500 });
    }

    const signature = request.headers.get("x-twilio-signature") ?? "";
    const url = process.env.TWILIO_WEBHOOK_URL ?? request.url;

    if (process.env.NODE_ENV === "production") {
      const valid = validateTwilioWebhook(settings, signature, url, params);
      if (!valid) {
        return new NextResponse("Invalid signature", { status: 403 });
      }
    }

    const from = params.From ?? "";
    const body = params.Body ?? "";

    if (from && body) {
      await handleInboundMessage(from, body);
    }

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } },
    );
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } },
    );
  }
}
