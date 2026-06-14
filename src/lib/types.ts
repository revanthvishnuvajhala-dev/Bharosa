export type Garment = "shirt" | "pant";
export type Gender = "men" | "women";
export type Fit = "slim" | "regular" | "relaxed" | "oversized";
export type Pattern = "solid" | "striped" | "checked" | "printed" | "textured";

export interface Celebrity {
  id: string;
  name: string;
  aliases: string[];
  gender: Gender;
  influence_score: number;
  last_scored_at: string;
  created_at: string;
}

export interface Post {
  id: string;
  source: string;
  source_url: string;
  image_url: string;
  posted_at: string;
  celebrity_id: string;
  detection_confidence: number;
  ingested_at: string;
  raw_meta: Record<string, unknown>;
}

export interface Spotting {
  id: string;
  post_id: string;
  celebrity_id: string;
  spotting_date: string;
  garment: Garment;
  fit: Fit;
  colour: string;
  colour_hex: string;
  fabric: string;
  pattern: Pattern;
  trend_cluster_id: string;
}

export interface AttributeSignature {
  garment: Garment;
  fit: Fit;
  colour: string;
  fabric: string;
  pattern: Pattern;
}

export interface TrendCluster {
  id: string;
  label: string;
  description: string;
  garment: Garment;
  gender: Gender;
  attribute_signature: AttributeSignature;
  created_at: string;
  updated_at: string;
}

export interface DailyRanking {
  id: string;
  date: string;
  trend_cluster_id: string;
  score: number;
  rank: number;
}

export interface Retailer {
  id: string;
  phone: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  retailer_id: string;
  trend_cluster_id: string;
  created_at: string;
}

export interface TrendWithDetails extends TrendCluster {
  score: number;
  rank: number;
  cover_image_url: string;
  spottings: SpottingWithCelebrity[];
}

export interface SpottingWithCelebrity extends Spotting {
  celebrity: Celebrity;
  post: Post;
}

export interface TrendFilters {
  segment?: Garment | "all";
  fit?: Fit[];
  colour?: string[];
  fabric?: string[];
  pattern?: Pattern[];
}

export interface FilterOptions {
  fits: Fit[];
  colours: string[];
  fabrics: string[];
  patterns: Pattern[];
}
