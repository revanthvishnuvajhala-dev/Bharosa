"use client";

import type { FilterOptions, TrendFilters } from "@/lib/types";
import { X } from "lucide-react";

interface FilterBarProps {
  filters: TrendFilters;
  options: FilterOptions;
  onChange: (filters: TrendFilters) => void;
}

type FilterKey = "fit" | "colour" | "fabric" | "pattern";

const filterLabels: Record<FilterKey, string> = {
  fit: "Fit",
  colour: "Colour",
  fabric: "Fabric",
  pattern: "Pattern",
};

export function FilterBar({ filters, options, onChange }: FilterBarProps) {
  function toggleFilter(key: FilterKey, value: string) {
    const current = (filters[key] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    onChange({
      ...filters,
      [key]: next.length ? next : undefined,
    });
  }

  function clearAll() {
    onChange({ segment: filters.segment });
  }

  const hasActiveFilters = Boolean(
    filters.fit?.length ||
      filters.colour?.length ||
      filters.fabric?.length ||
      filters.pattern?.length
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider">
          Filter by attribute
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      <div className="space-y-3">
        {(Object.keys(filterLabels) as FilterKey[]).map((key) => {
          const values = options[`${key === "colour" ? "colours" : key + "s"}` as keyof FilterOptions] as string[];
          if (!values?.length) return null;

          return (
            <div key={key}>
              <p className="text-xs text-ink-muted mb-1.5 capitalize">
                {filterLabels[key]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {values.map((value) => {
                  const active = filters[key]?.includes(value as never);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleFilter(key, value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                        active
                          ? "bg-ink text-cream"
                          : "bg-white border border-sand text-ink-muted hover:border-ink/20 hover:text-ink"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
