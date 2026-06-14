-- Run this to confirm your database is ready

SELECT 'settings' AS table_name, count(*) AS rows FROM settings
UNION ALL
SELECT 'offers', count(*) FROM offers
UNION ALL
SELECT 'leads', count(*) FROM leads
UNION ALL
SELECT 'messages', count(*) FROM messages;

-- settings should have exactly 1 row (the default config row)
