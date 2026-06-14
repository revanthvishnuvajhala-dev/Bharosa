import { createServiceClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/types";

export interface SettingsFormData {
  business_description: string;
  system_prompt: string;
  twilio_account_sid: string;
  twilio_whatsapp_number: string;
  has_auth_token: boolean;
}

export async function loadSettingsForUi(): Promise<{
  data?: SettingsFormData;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("settings")
      .select(
        "business_description, system_prompt, twilio_account_sid, twilio_auth_token, twilio_whatsapp_number",
      )
      .eq("id", SETTINGS_ID)
      .single();

    if (error) {
      return { error: error.message };
    }

    return {
      data: {
        business_description: data.business_description ?? "",
        system_prompt: data.system_prompt ?? "",
        twilio_account_sid: data.twilio_account_sid ?? "",
        twilio_whatsapp_number: data.twilio_whatsapp_number ?? "",
        has_auth_token: Boolean(data.twilio_auth_token),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load settings";

    if (message.includes("NEXT_PUBLIC_SUPABASE_URL")) {
      return {
        error:
          "Missing Supabase env vars. Copy .env.example to .env.local and restart npm run dev.",
      };
    }

    return { error: message };
  }
}
