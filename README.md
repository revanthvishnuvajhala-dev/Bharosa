# Bharosa — WhatsApp Win-Back Retention Tool

A single-business dashboard where owners load lapsed customers and an LLM-driven WhatsApp bot (via Twilio) re-engages each one with empathetic messages, optionally pitches redeemable in-store offers with unique codes, and surfaces conversation summaries and full transcripts.

## Stack

- **Frontend + API:** Next.js (App Router, TypeScript)
- **Database:** Supabase (Postgres)
- **Hosting:** Vercel
- **WhatsApp:** Twilio
- **LLM:** Anthropic Claude (`claude-sonnet-4-6`)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Supabase

1. Create a Supabase project.
2. Run the migration in `supabase/migrations/001_initial.sql` in the SQL editor.
3. Copy your project URL and service role key.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `TWILIO_WEBHOOK_URL` | Public URL of `/api/webhook/twilio` |
| `CRON_SECRET` | Secret for Vercel cron authorization |

### 4. Twilio

1. Configure your WhatsApp sender in Twilio.
2. Set the inbound webhook to `https://your-domain/api/webhook/twilio` (POST).
3. Enter credentials in **Settings** in the dashboard.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub and import in Vercel.
2. Add all environment variables.
3. Cron jobs in `vercel.json` dispatch queued messages every 15 minutes and mark stale leads as "No response" daily.

## Features

- **Lead intake:** Single entry form or CSV bulk upload with validation and dedupe by mobile (E.164).
- **Automatic openers:** Fires on add; respects quiet hours (10:00–19:00 IST).
- **LLM conversations:** Fully reactive, empathetic WhatsApp dialogues via Claude.
- **Offers & codes:** Reusable offer library; 6-character unique redemption codes.
- **Escalation:** Auto-detects frustration / human requests; pauses bot.
- **Dashboard:** Filterable lead list, metrics strip, transcripts, code verification.
- **No follow-ups:** One outbound thread per customer, ever.

## Quiet hours

Outbound messages only send between **10:00 and 19:00 Asia/Kolkata**. Messages triggered outside this window are queued and dispatched by cron when the window opens. Inbound replies are always processed immediately; bot responses also respect the quiet-hours window.

## CSV format

```csv
name,mobile,last_purchase,context,offer
Priya Sharma,+919876543210,Blue silk saree,Visited during Diwali,10% off next purchase
```

## License

Private — single-business deployment.
