import type { AttributeSignature } from "@/lib/types";

interface AttributeTagsProps {
  attributes: AttributeSignature;
  className?: string;
}

export function AttributeTags({ attributes, className = "" }: AttributeTagsProps) {
  const tags = [
    { label: attributes.garment, color: attributes.colour },
    attributes.fit,
    attributes.colour,
    attributes.fabric,
    attributes.pattern,
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const label = typeof tag === "string" ? tag : tag.label;
        const hex = typeof tag === "object" ? tag.color : null;

        return (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sand/70 text-ink-muted capitalize"
          >
            {hex && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10"
                style={{
                  backgroundColor:
                    hex === "multicolor"
                      ? "linear-gradient(135deg, #E85D4C, #4A90D9, #F5D547)"
                      : undefined,
                  background:
                    hex === "multicolor"
                      ? "linear-gradient(135deg, #E85D4C, #4A90D9, #F5D547)"
                      : undefined,
                }}
              />
            )}
            {label}
          </span>
        );
      })}
    </div>
  );
}
