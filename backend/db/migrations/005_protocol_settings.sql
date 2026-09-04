-- 005_protocol_settings.sql
-- Runtime protocol settings table for administrative gating of claiming & minting

CREATE TABLE IF NOT EXISTS protocol_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO protocol_settings (key, value)
VALUES
  ('enable_monki_claiming', 'false'),
  ('enable_pons_claiming', 'true'),
  ('enable_companion_minting', 'true')
ON CONFLICT (key) DO NOTHING;
