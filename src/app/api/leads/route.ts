import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createLead } from "@/lib/leads";
import { normalizeLeads } from "@/lib/normalize";
import type { LeadStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as LeadStatus | null;
    const search = searchParams.get("search")?.trim();

    let query = supabase
      .from("leads")
      .select("*, offers(*)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (search) {
      query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%`);
    }

    const { data: leads, error } = await query;
    if (error) throw error;

    const { count: total_contacted } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    const { count: replied } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("status", ["replied", "escalated", "code_redeemed"]);

    const { count: codes_redeemed } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "code_redeemed");

    return NextResponse.json({
      leads: normalizeLeads(leads ?? []),
      metrics: {
        total_contacted: total_contacted ?? 0,
        replied: replied ?? 0,
        codes_redeemed: codes_redeemed ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load leads" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createLead({
      name: body.name,
      mobile: body.mobile,
      last_purchase: body.last_purchase,
      context: body.context,
      offer_text: body.offer_text,
    });

    if (result.duplicate) {
      return NextResponse.json(
        { error: "A lead with this mobile number already exists", duplicate: true },
        { status: 409 },
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: result.lead!.id,
        send_status: result.send_status,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead" },
      { status: 500 },
    );
  }
}
