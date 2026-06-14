-- WhatsApp Win-Back Retention Tool schema (v1)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE lead_status AS ENUM (
  'sent',
  'replied',
  'escalated',
  'no_response',
  'message_failed_to_send',
  'code_redeemed'
);

CREATE TYPE message_direction AS ENUM ('outbound', 'inbound');

CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  business_description text NOT NULL DEFAULT '',
  system_prompt text NOT NULL DEFAULT '',
  twilio_account_sid text NOT NULL DEFAULT '',
  twilio_auth_token text NOT NULL DEFAULT '',
  twilio_whatsapp_number text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL UNIQUE,
  last_purchase text,
  context text,
  offer_id uuid REFERENCES offers(id) ON DELETE SET NULL,
  redemption_code text,
  status lead_status NOT NULL DEFAULT 'sent',
  summary text NOT NULL DEFAULT '',
  escalated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction message_direction NOT NULL,
  body text NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_mobile ON leads(mobile);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_redemption_code ON leads(redemption_code) WHERE redemption_code IS NOT NULL;
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_pending_outbound ON messages(lead_id) WHERE sent_at IS NULL AND direction = 'outbound';
