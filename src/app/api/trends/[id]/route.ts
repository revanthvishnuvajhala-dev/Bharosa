import { NextRequest, NextResponse } from "next/server";
import { getDemoTrendById } from "@/lib/data/repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trend = getDemoTrendById(id);

  if (!trend) {
    return NextResponse.json({ error: "Trend not found" }, { status: 404 });
  }

  return NextResponse.json({ trend });
}
