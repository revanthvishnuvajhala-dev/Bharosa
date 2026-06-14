import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { findOrCreateOffer, getLeadMessages } from "@/lib/leads";
import { normalizeLeadOffer } from "@/lib/normalize";
import { normalizeMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*, offers(*)")
      .eq("id", id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const messages = await getLeadMessages(id);

    return NextResponse.json({
      lead: normalizeLeadOffer(lead),
      messages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load lead" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.last_purchase !== undefined) {
      updates.last_purchase = body.last_purchase?.trim() || null;
    }
    if (body.context !== undefined) {
      updates.context = body.context?.trim() || null;
    }

    if (body.mobile !== undefined) {
      const mobile = normalizeMobile(body.mobile);
      if (!mobile) {
        return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
      }
      updates.mobile = mobile;
    }

    if (body.offer_text !== undefined) {
      const offerId = await findOrCreateOffer(body.offer_text);
      updates.offer_id = offerId;
      if (!offerId) updates.redemption_code = null;
    }

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select("*, offers(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update lead" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete lead" },
      { status: 500 },
    );
  }
}
