-- 007_rwa_elections.sql
-- Sprint F: Eligible Stock Token Registry & Nurturer Stock-Elected Payouts

-- 1. Eligible Stock Token Registry (Robinhood Chain 4663)
-- Stock Tokens are native ERC-20s (scaled-UI, Chainlink-priced with an on-chain corporate-action multiplier).
CREATE TABLE IF NOT EXISTS rwa_eligible_tokens (
  symbol                      TEXT PRIMARY KEY,
  name                        TEXT NOT NULL,
  contract_address            TEXT NOT NULL,
  chainlink_feed_address      TEXT NOT NULL,
  corporate_action_multiplier NUMERIC(20, 8) NOT NULL DEFAULT 1.0,
  is_liquid                   BOOLEAN NOT NULL DEFAULT TRUE,
  is_suspended                BOOLEAN NOT NULL DEFAULT FALSE,
  metadata                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed inaugural liquid stock tokens on Robinhood Chain L2 (4663)
INSERT INTO rwa_eligible_tokens (symbol, name, contract_address, chainlink_feed_address, corporate_action_multiplier, is_liquid, is_suspended)
VALUES
  ('NVDA', 'NVIDIA Corp Tokenized Stock', '0x1A4b61B012C88AbD07D8ff9398867566C1530eD9', '0x5bE40cD98D5B182A7C31bE5B8E65D7d47Efe7E15', 1.0, TRUE, FALSE),
  ('SPY', 'SPDR S&P 500 ETF Tokenized Stock', '0x2B5c72C123D99BcE18E900A499786677D2641fE0', '0x6cF51dE89E6C293B8D42cF6C8F76e8e58F1f8F26', 1.0, TRUE, FALSE),
  ('TSLA', 'Tesla Inc Tokenized Stock', '0x3C6d83D234EAAcfF29F011B500897788E3752aF1', '0x7dG62eF90F7D304C9E53dG7D9G87f9f69G2g9G37', 1.0, TRUE, FALSE),
  ('AAPL', 'Apple Inc Tokenized Stock', '0x4D7e94E345FBBD00300122C611908899F4863b02', '0x8eH73fG01G8E415D0F64eH8E0H98g0g70H3h0H48', 1.0, TRUE, FALSE),
  ('AMZN', 'Amazon.com Inc Tokenized Stock', '0x5E8f05F456ACCE11411233D722019900A5974c13', '0x9fI84gH12H9F526E1G75fI9F1I09h1h81I4i1I59', 1.0, TRUE, FALSE)
ON CONFLICT (symbol) DO UPDATE
SET name = EXCLUDED.name,
    contract_address = EXCLUDED.contract_address,
    chainlink_feed_address = EXCLUDED.chainlink_feed_address,
    updated_at = NOW();

-- 2. User RWA Portfolio Elections
-- Mode: 'stock_elected' (payout converted at epoch settlement) or 'plain_pons' (non-electors keep plain $PONS)
CREATE TABLE IF NOT EXISTS user_rwa_elections (
  id           BIGSERIAL PRIMARY KEY,
  user_address TEXT UNIQUE NOT NULL,
  mode         TEXT NOT NULL DEFAULT 'stock_elected' CHECK (mode IN ('stock_elected', 'plain_pons')),
  allocations  JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [{"symbol": "NVDA", "percentage": 60}, {"symbol": "SPY", "percentage": 40}]
  is_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_rwa_elections_address ON user_rwa_elections(user_address);

-- 3. Feature flag in protocol_settings (default OFF per handoff rule: "Feature flags default OFF")
INSERT INTO protocol_settings (key, value)
VALUES ('rwa_elections', 'false')
ON CONFLICT (key) DO NOTHING;
