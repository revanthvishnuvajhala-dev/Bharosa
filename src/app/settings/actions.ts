"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveSettingsToDb } from "@/lib/settings";

export async function saveSettings(formData: FormData) {
  const result = await saveSettingsToDb({
    business_description: String(formData.get("business_description") ?? ""),
    system_prompt: String(formData.get("system_prompt") ?? ""),
    twilio_account_sid: String(formData.get("twilio_account_sid") ?? ""),
    twilio_whatsapp_number: String(formData.get("twilio_whatsapp_number") ?? ""),
    twilio_auth_token: String(formData.get("twilio_auth_token") ?? ""),
  });

  if (result.error) {
    redirect(`/settings?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
