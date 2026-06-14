import Image from "next/image";
import type { SpottingWithCelebrity } from "@/lib/types";
import { Calendar, User } from "lucide-react";

interface InstanceGalleryProps {
  spottings: SpottingWithCelebrity[];
}

export function InstanceGallery({ spottings }: InstanceGalleryProps) {
  if (!spottings.length) {
    return (
      <p className="text-ink-muted text-sm">No source instances available.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {spottings.map((spotting) => (
        <article
          key={spotting.id}
          className="rounded-xl overflow-hidden border border-sand bg-card shadow-sm"
        >
          <div className="relative aspect-[4/5]">
            <Image
              src={spotting.post.image_url}
              alt={`${spotting.celebrity.name} wearing ${spotting.colour} ${spotting.garment}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-accent" />
              <span className="font-medium">{spotting.celebrity.name}</span>
              <span className="text-ink-muted">
                · Influence {spotting.celebrity.influence_score}/10
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Calendar className="w-4 h-4" />
              <time dateTime={spotting.spotting_date}>
                {new Date(spotting.spotting_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </div>
            <p className="text-xs text-ink-muted capitalize">
              {spotting.fit} {spotting.colour} {spotting.fabric} {spotting.garment}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
