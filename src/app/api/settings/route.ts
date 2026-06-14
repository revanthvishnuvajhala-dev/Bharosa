import { NextRequest, NextResponse } from "next/server";
import { loadSettingsForUi, saveSettingsToDb } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await loadSettingsForUi();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    id: "00000000-0000-0000-0000-000000000001",
    ...data,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await saveSettingsToDb({
      business_description: String(body.business_description ?? ""),
      system_prompt: String(body.system_prompt ?? ""),
      twilio_account_sid: String(body.twilio_account_sid ?? ""),
      twilio_whatsapp_number: String(body.twilio_whatsapp_number ?? ""),
      twilio_auth_token: body.twilio_auth_token
        ? String(body.twilio_auth_token)
        : undefined,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const { data } = await loadSettingsForUi();
    return NextResponse.json({
      id: "00000000-0000-0000-0000-000000000001",
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 },
    );
  }
}
