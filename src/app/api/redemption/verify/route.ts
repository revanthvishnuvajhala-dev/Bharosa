import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code?.trim()) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: lead, error } = await supabase
      .from("leads")
      .select("id, name, mobile, redemption_code, status, offers(*)")
      .eq("redemption_code", code.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;

    if (!lead) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      lead: {
        id: lead.id,
        name: lead.name,
        mobile: lead.mobile,
        status: lead.status,
        offer: lead.offers,
        already_redeemed: lead.status === "code_redeemed",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 },
    );
  }
}
