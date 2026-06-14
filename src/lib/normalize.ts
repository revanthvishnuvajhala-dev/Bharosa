import type { Offer } from "@/lib/types";

/** Supabase may return a joined offer as object or single-element array. */
export function normalizeLeadOffer<T extends { offers?: Offer | Offer[] | null }>(
  lead: T,
): T & { offers: Offer | null } {
  const raw = lead.offers;
  const offers = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
  return { ...lead, offers };
}

export function normalizeLeads<T extends { offers?: Offer | Offer[] | null }>(
  leads: T[],
): (T & { offers: Offer | null })[] {
  return leads.map(normalizeLeadOffer);
}
