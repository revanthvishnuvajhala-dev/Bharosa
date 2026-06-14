import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getDemoFilterOptions,
  getDemoTrends,
  getDemoWishlist,
  toggleDemoWishlist,
} from "@/lib/data/repository";
import type { Fit, Garment, Pattern, TrendFilters } from "@/lib/types";

function parseFilters(searchParams: URLSearchParams): TrendFilters {
  const segment = searchParams.get("segment") as Garment | "all" | null;
  const fit = searchParams.getAll("fit") as Fit[];
  const colour = searchParams.getAll("colour");
  const fabric = searchParams.getAll("fabric");
  const pattern = searchParams.getAll("pattern") as Pattern[];

  return {
    segment: segment ?? "all",
    fit: fit.length ? fit : undefined,
    colour: colour.length ? colour : undefined,
    fabric: fabric.length ? fabric : undefined,
    pattern: pattern.length ? pattern : undefined,
  };
}

async function getRetailerId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("demo_session")?.value ?? null;
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request.nextUrl.searchParams);
  const trends = getDemoTrends(filters);
  const filterOptions = getDemoFilterOptions();
  const retailerId = await getRetailerId();

  const wishlistedIds =
    retailerId !== null
      ? getDemoWishlist(retailerId).map((t) => t.id)
      : [];

  return NextResponse.json({ trends, filterOptions, wishlistedIds });
}

export async function POST(request: NextRequest) {
  const retailerId = await getRetailerId();
  if (!retailerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trendId } = await request.json();
  if (!trendId) {
    return NextResponse.json({ error: "trendId required" }, { status: 400 });
  }

  const wishlisted = toggleDemoWishlist(retailerId, trendId);
  return NextResponse.json({ wishlisted });
}
