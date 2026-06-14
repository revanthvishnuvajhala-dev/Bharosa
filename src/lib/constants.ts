export const DECAY_LAMBDA = Math.log(2) / 12;
export const RANKING_WINDOW_DAYS = 30;
export const TOP_TRENDS_LIMIT = 50;
export const DEMO_OTP = process.env.DEMO_OTP ?? "123456";

export const FIT_OPTIONS = ["slim", "regular", "relaxed", "oversized"] as const;
export const PATTERN_OPTIONS = [
  "solid",
  "striped",
  "checked",
  "printed",
  "textured",
] as const;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !key.includes("your-anon-key")
  );
}
