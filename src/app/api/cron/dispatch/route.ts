import { NextRequest, NextResponse } from "next/server";
import {
  dispatchPendingMessages,
  markNoResponseLeads,
} from "@/lib/leads";

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const task = searchParams.get("task") ?? "dispatch";

    if (task === "no-response") {
      const marked = await markNoResponseLeads();
      return NextResponse.json({ marked });
    }

    const sent = await dispatchPendingMessages();
    return NextResponse.json({ sent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
