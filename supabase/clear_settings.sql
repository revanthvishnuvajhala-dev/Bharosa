-- Run in Supabase SQL Editor to clear test/stale settings and start fresh

UPDATE settings
SET
  business_description = '',
  system_prompt = '',
  twilio_account_sid = '',
  twilio_auth_token = '',
  twilio_whatsapp_number = '',
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000001';
