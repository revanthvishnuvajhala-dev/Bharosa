"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilterOptions, Garment, TrendFilters, TrendWithDetails } from "@/lib/types";
import { Header } from "@/components/Header";
import { TrendCard } from "@/components/TrendCard";
import { SegmentToggle } from "@/components/SegmentToggle";
import { FilterBar } from "@/components/FilterBar";

export function FeedView() {
  const [trends, setTrends] = useState<TrendWithDetails[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fits: [],
    colours: [],
    fabrics: [],
    patterns: [],
  });
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<TrendFilters>({ segment: "all" });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.segment && filters.segment !== "all") {
      params.set("segment", filters.segment);
    }
    filters.fit?.forEach((f) => params.append("fit", f));
    filters.colour?.forEach((c) => params.append("colour", c));
    filters.fabric?.forEach((f) => params.append("fabric", f));
    filters.pattern?.forEach((p) => params.append("pattern", p));

    const res = await fetch(`/api/trends?${params}`);
    const data = await res.json();
    setTrends(data.trends);
    setFilterOptions(data.filterOptions);
    setWishlistedIds(new Set(data.wishlistedIds));
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  async function toggleWishlist(trendId: string) {
    const res = await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trendId }),
    });
    const data = await res.json();
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (data.wishlisted) {
        next.add(trendId);
      } else {
        next.delete(trendId);
      }
      return next;
    });
  }

  function handleSegmentChange(segment: Garment | "all") {
    setFilters((prev) => ({ ...prev, segment }));
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-accent font-medium mb-2">
            Today&apos;s Rankings
          </p>
          <h1 className="editorial-title text-3xl sm:text-4xl md:text-5xl font-semibold text-ink leading-tight">
            What celebrities are wearing
          </h1>
          <p className="mt-3 text-ink-muted max-w-2xl">
            Merchandising signals ranked by celebrity influence. Shirts and pants
            spotted on India&apos;s most influential men, refreshed daily.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <SegmentToggle
            value={filters.segment ?? "all"}
            onChange={handleSegmentChange}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden text-sm font-medium text-accent"
          >
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside
            className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="sticky top-24 p-4 rounded-xl bg-white border border-sand">
              <FilterBar
                filters={filters}
                options={filterOptions}
                onChange={setFilters}
              />
            </div>
          </aside>

          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-2xl bg-sand/50 animate-pulse"
                  />
                ))}
              </div>
            ) : trends.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-ink-muted">No trends match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                {trends.map((trend, index) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                    wishlisted={wishlistedIds.has(trend.id)}
                    onToggleWishlist={toggleWishlist}
                    featured={index === 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
