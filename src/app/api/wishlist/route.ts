import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDemoWishlist } from "@/lib/data/repository";

export async function GET() {
  const cookieStore = await cookies();
  const retailerId = cookieStore.get("demo_session")?.value;

  if (!retailerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trends = getDemoWishlist(retailerId);
  return NextResponse.json({ trends });
}
