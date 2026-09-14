-- 008_enable_rwa_elections.sql
-- Activate Sprint F RWA stock elections in protocol settings

INSERT INTO protocol_settings (key, value, updated_at)
VALUES ('rwa_elections', 'true', NOW())
ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = NOW();
