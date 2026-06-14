import { NextRequest, NextResponse } from "next/server";
import { retryLead } from "@/lib/leads";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ok = await retryLead(id);

    if (!ok) {
      return NextResponse.json(
        { error: "Lead is not eligible for retry" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Retry failed" },
      { status: 500 },
    );
  }
}
