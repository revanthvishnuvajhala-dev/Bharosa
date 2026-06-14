import {
  celebrities,
  dailyRankings,
  getFilterOptions,
  getRankedTrends,
  getTrendWithDetails,
  posts,
  spottings,
  trendClusters,
} from "./seed";
import type { TrendFilters, TrendWithDetails } from "../types";

const demoWishlists = new Map<string, Set<string>>();

export function getDemoTrends(filters?: TrendFilters): TrendWithDetails[] {
  let trends = getRankedTrends();

  if (filters?.segment && filters.segment !== "all") {
    trends = trends.filter((t) => t.garment === filters.segment);
  }

  if (filters?.fit?.length) {
    trends = trends.filter((t) =>
      filters.fit!.includes(t.attribute_signature.fit)
    );
  }

  if (filters?.colour?.length) {
    trends = trends.filter((t) =>
      filters.colour!.includes(t.attribute_signature.colour)
    );
  }

  if (filters?.fabric?.length) {
    trends = trends.filter((t) =>
      filters.fabric!.includes(t.attribute_signature.fabric)
    );
  }

  if (filters?.pattern?.length) {
    trends = trends.filter((t) =>
      filters.pattern!.includes(t.attribute_signature.pattern)
    );
  }

  return trends;
}

export function getDemoTrendById(id: string): TrendWithDetails | null {
  return getTrendWithDetails(id);
}

export function getDemoFilterOptions() {
  return getFilterOptions();
}

export function getDemoWishlist(retailerId: string): TrendWithDetails[] {
  const ids = demoWishlists.get(retailerId) ?? new Set();
  return getRankedTrends().filter((t) => ids.has(t.id));
}

export function toggleDemoWishlist(
  retailerId: string,
  trendId: string
): boolean {
  if (!demoWishlists.has(retailerId)) {
    demoWishlists.set(retailerId, new Set());
  }
  const set = demoWishlists.get(retailerId)!;
  if (set.has(trendId)) {
    set.delete(trendId);
    return false;
  }
  set.add(trendId);
  return true;
}

export function isInDemoWishlist(
  retailerId: string,
  trendId: string
): boolean {
  return demoWishlists.get(retailerId)?.has(trendId) ?? false;
}

export const demoSeedExport = {
  celebrities,
  posts,
  spottings,
  trendClusters,
  dailyRankings,
};
