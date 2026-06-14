"use client";

import type { Garment } from "@/lib/types";

interface SegmentToggleProps {
  value: Garment | "all";
  onChange: (value: Garment | "all") => void;
}

const segments: { value: Garment | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "shirt", label: "Shirts" },
  { value: "pant", label: "Pants" },
];

export function SegmentToggle({ value, onChange }: SegmentToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-sand/50 p-1">
      {segments.map((seg) => (
        <button
          key={seg.value}
          onClick={() => onChange(seg.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
            value === seg.value
              ? "bg-white text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
