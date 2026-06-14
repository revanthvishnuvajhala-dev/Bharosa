import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/types";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("settings")
      .select(
        "id, business_description, system_prompt, twilio_account_sid, twilio_whatsapp_number, updated_at",
      )
      .eq("id", SETTINGS_ID)
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...data,
      has_auth_token: Boolean(
        (
          await supabase
            .from("settings")
            .select("twilio_auth_token")
            .eq("id", SETTINGS_ID)
            .single()
        ).data?.twilio_auth_token,
      ),
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

    const updates: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    if (body.business_description !== undefined) {
      updates.business_description = body.business_description;
    }
    if (body.system_prompt !== undefined) {
      updates.system_prompt = body.system_prompt;
    }
    if (body.twilio_account_sid !== undefined) {
      updates.twilio_account_sid = body.twilio_account_sid;
    }
    if (body.twilio_auth_token !== undefined && body.twilio_auth_token !== "") {
      updates.twilio_auth_token = body.twilio_auth_token;
    }
    if (body.twilio_whatsapp_number !== undefined) {
      updates.twilio_whatsapp_number = body.twilio_whatsapp_number;
    }

    const { data, error } = await supabase
      .from("settings")
      .update(updates)
      .eq("id", SETTINGS_ID)
      .select(
        "id, business_description, system_prompt, twilio_account_sid, twilio_whatsapp_number, updated_at",
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 },
    );
  }
}
