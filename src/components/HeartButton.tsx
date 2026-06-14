"use client";

import { Heart } from "lucide-react";

interface HeartButtonProps {
  wishlisted: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

export function HeartButton({
  wishlisted,
  onToggle,
  size = "md",
}: HeartButtonProps) {
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-sand/50 hover:scale-105 transition-transform`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`${iconSize} transition-colors ${
          wishlisted
            ? "fill-accent text-accent"
            : "text-ink-muted hover:text-accent"
        }`}
      />
    </button>
  );
}
