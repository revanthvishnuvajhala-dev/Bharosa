"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TrendWithDetails } from "@/lib/types";
import { Header } from "@/components/Header";
import { AttributeTags } from "@/components/AttributeTags";
import { HeartButton } from "@/components/HeartButton";
import { InstanceGallery } from "@/components/InstanceGallery";

interface TrendDetailViewProps {
  trendId: string;
}

export function TrendDetailView({ trendId }: TrendDetailViewProps) {
  const [trend, setTrend] = useState<TrendWithDetails | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [trendRes, feedRes] = await Promise.all([
        fetch(`/api/trends/${trendId}`),
        fetch("/api/trends"),
      ]);
      const trendData = await trendRes.json();
      const feedData = await feedRes.json();

      setTrend(trendData.trend);
      setWishlisted(feedData.wishlistedIds?.includes(trendId) ?? false);
      setLoading(false);
    }
    load();
  }, [trendId]);

  async function toggleWishlist() {
    const res = await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trendId }),
    });
    const data = await res.json();
    setWishlisted(data.wishlisted);
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="h-8 w-48 bg-sand/50 rounded animate-pulse mb-8" />
          <div className="aspect-[16/9] bg-sand/50 rounded-2xl animate-pulse" />
        </div>
      </>
    );
  }

  if (!trend) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-ink-muted">Trend not found.</p>
          <Link href="/feed" className="text-accent hover:underline mt-4 inline-block">
            Back to feed
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trends
        </Link>

        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden mb-8">
          <Image
            src={trend.cover_image_url}
            alt={trend.label}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70 mb-1">
                Rank #{trend.rank} · {trend.garment} · Score {trend.score.toFixed(1)}
              </p>
              <h1 className="editorial-title text-3xl sm:text-4xl md:text-5xl font-semibold text-white">
                {trend.label}
              </h1>
            </div>
            <HeartButton wishlisted={wishlisted} onToggle={toggleWishlist} />
          </div>
        </div>

        <div className="mb-10">
          <p className="text-lg text-ink-muted leading-relaxed max-w-3xl">
            {trend.description}
          </p>
          <AttributeTags
            attributes={trend.attribute_signature}
            className="mt-4"
          />
        </div>

        <section>
          <h2 className="editorial-title text-2xl font-semibold mb-2">
            Source instances
          </h2>
          <p className="text-sm text-ink-muted mb-6">
            {trend.spottings.length} celebrity spotting
            {trend.spottings.length !== 1 ? "s" : ""} driving this trend
          </p>
          <InstanceGallery spottings={trend.spottings} />
        </section>
      </main>
    </>
  );
}
