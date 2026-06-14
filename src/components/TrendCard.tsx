"use client";

import Image from "next/image";
import Link from "next/link";
import type { TrendWithDetails } from "@/lib/types";
import { AttributeTags } from "./AttributeTags";
import { HeartButton } from "./HeartButton";

interface TrendCardProps {
  trend: TrendWithDetails;
  wishlisted: boolean;
  onToggleWishlist: (trendId: string) => void;
  featured?: boolean;
}

export function TrendCard({
  trend,
  wishlisted,
  onToggleWishlist,
  featured = false,
}: TrendCardProps) {
  return (
    <Link
      href={`/trends/${trend.id}`}
      className={`group relative block overflow-hidden rounded-2xl bg-card shadow-sm border border-sand/60 hover:shadow-lg transition-shadow ${
        featured ? "col-span-1 md:col-span-2 row-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          featured ? "aspect-[4/5] md:aspect-auto md:h-full min-h-[320px]" : "aspect-[3/4]"
        }`}
      >
        <Image
          src={trend.cover_image_url}
          alt={trend.label}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-3 right-3 z-10">
          <HeartButton
            wishlisted={wishlisted}
            onToggle={() => onToggleWishlist(trend.id)}
          />
        </div>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-ink backdrop-blur-sm">
            #{trend.rank}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-white/70 mb-1 capitalize">
            {trend.garment} · Score {trend.score.toFixed(1)}
          </p>
          <h2
            className={`editorial-title font-semibold text-white leading-tight ${
              featured ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl"
            }`}
          >
            {trend.label}
          </h2>
          <p
            className={`mt-2 text-white/80 line-clamp-2 ${
              featured ? "text-sm sm:text-base" : "text-xs sm:text-sm"
            }`}
          >
            {trend.description}
          </p>
          <AttributeTags
            attributes={trend.attribute_signature}
            className="mt-3 [&_span]:bg-white/20 [&_span]:text-white/90 [&_span]:backdrop-blur-sm"
          />
        </div>
      </div>
    </Link>
  );
}
