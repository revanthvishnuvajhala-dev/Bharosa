import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("settings")
      .select(
        "id, business_description, system_prompt, twilio_account_sid, twilio_auth_token, twilio_whatsapp_number, updated_at",
      )
      .eq("id", SETTINGS_ID)
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      business_description: data.business_description ?? "",
      system_prompt: data.system_prompt ?? "",
      twilio_account_sid: data.twilio_account_sid ?? "",
      twilio_whatsapp_number: data.twilio_whatsapp_number ?? "",
      updated_at: data.updated_at,
      has_auth_token: Boolean(data.twilio_auth_token),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { data: existing, error: loadError } = await supabase
      .from("settings")
      .select(
        "id, business_description, system_prompt, twilio_account_sid, twilio_auth_token, twilio_whatsapp_number",
      )
      .eq("id", SETTINGS_ID)
      .maybeSingle();

    if (loadError) throw loadError;

    const record = {
      id: SETTINGS_ID,
      business_description:
        body.business_description !== undefined
          ? String(body.business_description)
          : (existing?.business_description ?? ""),
      system_prompt:
        body.system_prompt !== undefined
          ? String(body.system_prompt)
          : (existing?.system_prompt ?? ""),
      twilio_account_sid:
        body.twilio_account_sid !== undefined
          ? String(body.twilio_account_sid)
          : (existing?.twilio_account_sid ?? ""),
      twilio_auth_token:
        body.twilio_auth_token !== undefined && body.twilio_auth_token !== ""
          ? String(body.twilio_auth_token)
          : (existing?.twilio_auth_token ?? ""),
      twilio_whatsapp_number:
        body.twilio_whatsapp_number !== undefined
          ? String(body.twilio_whatsapp_number)
          : (existing?.twilio_whatsapp_number ?? ""),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("settings")
      .upsert(record, { onConflict: "id" })
      .select(
        "id, business_description, system_prompt, twilio_account_sid, twilio_auth_token, twilio_whatsapp_number, updated_at",
      )
      .single();

    if (error) throw error;

    revalidatePath("/settings");

    return NextResponse.json({
      id: data.id,
      business_description: data.business_description ?? "",
      system_prompt: data.system_prompt ?? "",
      twilio_account_sid: data.twilio_account_sid ?? "",
      twilio_whatsapp_number: data.twilio_whatsapp_number ?? "",
      updated_at: data.updated_at,
      has_auth_token: Boolean(data.twilio_auth_token),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 },
    );
  }
}
