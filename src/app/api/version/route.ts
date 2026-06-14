import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    app: "bharosa-winback",
    build: "2026-06-14",
    features: [
      "settings-view-edit",
      "lead-filters-dynamic",
      "send-status-ux",
      "lead-detail-server-load",
    ],
  });
}
