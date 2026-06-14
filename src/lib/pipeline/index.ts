/**
 * Daily trend pipeline — runs once per day via cron.
 *
 * Steps (per PRD §4.1):
 * 1. Ingest up to 30 celebrity posts via social-data adapter
 * 2. Identify celebrity + confidence gate
 * 3. Score celebrity influence (1-10), cache in registry
 * 4. Detect shirt/pant garments
 * 5. Tag attributes (fit, colour, fabric, pattern)
 * 6. Deduplicate spottings
 * 7. Cluster into trends + generate labels
 * 8. Score and rank over 30-day window
 * 9. Snapshot daily rankings
 */

import { computeTrendScore, rankTrends } from "../scoring";
import type { Celebrity, Spotting } from "../types";

export interface SocialPost {
  source: string;
  sourceUrl: string;
  imageUrl: string;
  postedAt: string;
  rawMeta?: Record<string, unknown>;
}

export interface SocialDataAdapter {
  fetchDailyPosts(limit: number): Promise<SocialPost[]>;
}

export interface VisionAnalysis {
  celebrityName: string;
  confidence: number;
  influenceScore: number;
  garments: {
    garment: "shirt" | "pant";
    fit: string;
    colour: string;
    colourHex: string;
    fabric: string;
    pattern: string;
  }[];
}

export interface VisionAnalyzer {
  analyzePost(imageUrl: string): Promise<VisionAnalysis>;
}

export interface PipelineDeps {
  socialAdapter: SocialDataAdapter;
  visionAnalyzer: VisionAnalyzer;
  store: PipelineStore;
}

export interface PipelineStore {
  getCelebrityByName(name: string): Promise<Celebrity | null>;
  upsertCelebrity(celebrity: Partial<Celebrity> & { name: string }): Promise<Celebrity>;
  insertPost(post: SocialPost & { celebrityId: string; confidence: number }): Promise<string>;
  insertSpotting(spotting: Omit<Spotting, "id">): Promise<void>;
  getSpottingsInWindow(days: number): Promise<Spotting[]>;
  getCelebrities(): Promise<Celebrity[]>;
  upsertTrendCluster(cluster: {
    label: string;
    description: string;
    garment: "shirt" | "pant";
    attributeSignature: Record<string, string>;
  }): Promise<string>;
  snapshotRankings(
    date: string,
    rankings: { trend_cluster_id: string; score: number; rank: number }[]
  ): Promise<void>;
}

export async function runDailyPipeline(deps: PipelineDeps): Promise<void> {
  const { socialAdapter, visionAnalyzer, store } = deps;
  const today = new Date();

  // Step 1: Ingest
  const rawPosts = await socialAdapter.fetchDailyPosts(30);

  for (const raw of rawPosts) {
    // Step 2-5: Vision analysis chain
    const analysis = await visionAnalyzer.analyzePost(raw.imageUrl);

    if (analysis.confidence < 0.85) continue;
    if (analysis.influenceScore < 6) continue;

    let celebrity = await store.getCelebrityByName(analysis.celebrityName);
    if (!celebrity) {
      celebrity = await store.upsertCelebrity({
        name: analysis.celebrityName,
        influence_score: analysis.influenceScore,
        gender: "men",
        aliases: [],
      });
    }

    const postId = await store.insertPost({
      ...raw,
      celebrityId: celebrity.id,
      confidence: analysis.confidence,
    });

    const spottingDate = raw.postedAt.split("T")[0];

    for (const garment of analysis.garments.slice(0, 2)) {
      // Step 6: Deduplicate handled by DB unique constraint
      await store.insertSpotting({
        post_id: postId,
        celebrity_id: celebrity.id,
        spotting_date: spottingDate,
        garment: garment.garment,
        fit: garment.fit as Spotting["fit"],
        colour: garment.colour,
        colour_hex: garment.colourHex,
        fabric: garment.fabric,
        pattern: garment.pattern as Spotting["pattern"],
        trend_cluster_id: "", // assigned during clustering
      });
    }
  }

  // Steps 7-9: Cluster, score, snapshot
  const spottings = await store.getSpottingsInWindow(30);
  const celebrities = await store.getCelebrities();
  const celebrityMap = new Map(celebrities.map((c) => [c.id, c]));

  // Group by attribute signature for clustering
  const clusters = new Map<string, Spotting[]>();
  for (const s of spottings) {
    const key = `${s.garment}:${s.fit}:${s.colour}:${s.fabric}:${s.pattern}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(s);
  }

  const scores: { trend_cluster_id: string; score: number }[] = [];

  for (const [, clusterSpottings] of clusters) {
    const first = clusterSpottings[0];
    const clusterId = await store.upsertTrendCluster({
      label: `${first.fit} ${first.colour} ${first.fabric} ${first.garment}s`,
      description: `Trending ${first.garment} cluster`,
      garment: first.garment,
      attributeSignature: {
        garment: first.garment,
        fit: first.fit,
        colour: first.colour,
        fabric: first.fabric,
        pattern: first.pattern,
      },
    });

    scores.push({
      trend_cluster_id: clusterId,
      score: computeTrendScore(clusterSpottings, celebrityMap, today),
    });
  }

  const ranked = rankTrends(scores);
  const dateStr = today.toISOString().split("T")[0];
  await store.snapshotRankings(dateStr, ranked);
}

// Stub adapter for development
export const stubSocialAdapter: SocialDataAdapter = {
  async fetchDailyPosts() {
    return [];
  },
};

export const stubVisionAnalyzer: VisionAnalyzer = {
  async analyzePost() {
    return {
      celebrityName: "Unknown",
      confidence: 0,
      influenceScore: 0,
      garments: [],
    };
  },
};
