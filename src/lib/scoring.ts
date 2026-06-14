import { DECAY_LAMBDA } from "./constants";
import type { Spotting, Celebrity } from "./types";

export function decay(daysAgo: number): number {
  return Math.exp(-DECAY_LAMBDA * daysAgo);
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

export function computeTrendScore(
  spottings: Spotting[],
  celebrities: Map<string, Celebrity>,
  rankingDate: Date
): number {
  let score = 0;

  for (const spotting of spottings) {
    const celebrity = celebrities.get(spotting.celebrity_id);
    if (!celebrity) continue;

    const spottingDate = new Date(spotting.spotting_date);
    const daysAgo = daysBetween(spottingDate, rankingDate);

    if (daysAgo < 0 || daysAgo >= 30) continue;

    score += celebrity.influence_score * decay(daysAgo);
  }

  return Math.round(score * 100) / 100;
}

export function rankTrends(
  scores: { trend_cluster_id: string; score: number }[]
): { trend_cluster_id: string; score: number; rank: number }[] {
  return [...scores]
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
}
