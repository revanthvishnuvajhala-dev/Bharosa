import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .select("id, redemption_code, status")
      .eq("id", id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.redemption_code) {
      return NextResponse.json(
        { error: "This lead has no redemption code" },
        { status: 400 },
      );
    }

    if (lead.status === "code_redeemed") {
      return NextResponse.json({ error: "Code already redeemed" }, { status: 400 });
    }

    await supabase
      .from("leads")
      .update({
        status: "code_redeemed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Redemption failed" },
      { status: 500 },
    );
  }
}
