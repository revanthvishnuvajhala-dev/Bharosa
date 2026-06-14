# Bharosa

Celebrity-driven apparel trend intelligence for Indian menswear retailers. Bharosa surfaces daily-ranked shirt and pant trends based on what high-influence Indian celebrities are spotted wearing.

## Features (v1)

- **Phone OTP auth** — self-signup, free for all retailers
- **Editorial trend feed** — merged, score-ranked list with large imagery
- **Segment toggle** — filter by shirts, pants, or all
- **Attribute filters** — colour, fit, fabric, pattern
- **Trend detail** — label, description, attribute tags, celebrity instance gallery
- **Wishlist** — heart trends to save for stocking decisions
- **Scoring engine** — 30-day rolling window with influence weighting and recency decay

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs in **demo mode** without Supabase:

1. Enter any 10-digit Indian phone number
2. Use OTP `123456`
3. Browse trends, filter, heart items, and view detail pages

## Production setup (Supabase)

1. Create a [Supabase](https://supabase.com) project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Enable Phone auth in Supabase Auth settings
4. Copy `.env.example` to `.env.local` and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Scoring formula

```
score(c) = Σ influence(celebrity) × exp(−λ × days_ago)
λ = ln(2)/12  (~12-day half-life)
Window = 30 days
```

## Project structure

```
src/
  app/           # Next.js pages and API routes
  components/    # UI components
  lib/
    data/        # Demo seed data and repository
    pipeline/    # Daily cron pipeline (§4.1)
    scoring.ts   # Trend scoring logic
    supabase/    # Supabase client helpers
supabase/
  migrations/    # Database schema
```

## Daily pipeline

The trend engine (`src/lib/pipeline/`) implements the PRD pipeline with pluggable adapters:

- `SocialDataAdapter` — swap social-data vendors (Data365, Phyllo, Apify)
- `VisionAnalyzer` — multimodal LLM for celebrity ID, garment detection, tagging
- `PipelineStore` — persistence layer (Supabase in production)

Schedule via Supabase Edge Functions cron or an external worker.

## Tech stack

- Next.js 16 + React 19 + Tailwind CSS 4
- Supabase (Postgres, Auth, Storage)
- TypeScript
