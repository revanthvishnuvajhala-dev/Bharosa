"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { TrendWithDetails } from "@/lib/types";
import { Header } from "@/components/Header";
import { TrendCard } from "@/components/TrendCard";

export function WishlistView() {
  const [trends, setTrends] = useState<TrendWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setTrends(data.trends ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  async function toggleWishlist(trendId: string) {
    await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trendId }),
    });
    fetchWishlist();
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-accent font-medium mb-2">
            Your saved trends
          </p>
          <h1 className="editorial-title text-3xl sm:text-4xl font-semibold text-ink">
            Wishlist
          </h1>
          <p className="mt-3 text-ink-muted">
            Trends you&apos;ve hearted for stocking decisions.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-sand/50 animate-pulse"
              />
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-sand">
            <Heart className="w-12 h-12 text-sand mx-auto mb-4" />
            <p className="text-ink-muted mb-4">No trends saved yet.</p>
            <Link
              href="/feed"
              className="inline-flex px-6 py-2.5 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              Browse trends
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((trend) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                wishlisted
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
