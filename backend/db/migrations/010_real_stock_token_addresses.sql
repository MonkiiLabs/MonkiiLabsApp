-- 010_real_stock_token_addresses.sql
-- Replace the placeholder registry with the real Robinhood Chain token
-- contracts, and separate "we know the token" from "we can price it".
--
-- Migrations 007 and 008 seeded five tickers whose addresses were invented.
-- Three of them were not even valid hex and migration 009 held those back.
-- The real NVDA address below differs from the seeded one, which confirms the
-- whole original block was placeholder data, so the two that happened to be
-- well-formed were never correct either.
--
-- The price feed is now nullable. Robinhood Chain is a young Arbitrum Orbit
-- L2 and Chainlink publishes no equity aggregators for it, so a token can be
-- known and electable while its price source is still pending. Election is
-- safe in that state because Sprint F is accrual-only; settlement is not.
-- Anything that pays out must refuse a token whose feed is NULL.

ALTER TABLE rwa_eligible_tokens ALTER COLUMN chainlink_feed_address DROP NOT NULL;

-- SPY carried invented addresses and no replacement was supplied, so it goes
-- rather than sitting in the registry looking legitimate.
DELETE FROM rwa_eligible_tokens WHERE symbol = 'SPY';

-- The four supported tickers, on their real contracts, pricing pending.
INSERT INTO rwa_eligible_tokens
  (symbol, name, contract_address, chainlink_feed_address,
   corporate_action_multiplier, is_liquid, is_suspended)
VALUES
  ('NVDA', 'NVIDIA Corp Tokenized Stock',   '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', NULL, 1.0, TRUE, FALSE),
  ('TSLA', 'Tesla Inc Tokenized Stock',     '0x322f0929c4625ed5bad873c95208d54e1c003b2d', NULL, 1.0, TRUE, FALSE),
  ('AAPL', 'Apple Inc Tokenized Stock',     '0xaf3d76f1834a1d425780943c99ea8a608f8a93f9', NULL, 1.0, TRUE, FALSE),
  ('META', 'Meta Platforms Tokenized Stock','0xc0d6457c16cc70d6790dd43521c899c87ce02f35', NULL, 1.0, TRUE, FALSE)
ON CONFLICT (symbol) DO UPDATE
SET name                   = EXCLUDED.name,
    contract_address       = EXCLUDED.contract_address,
    chainlink_feed_address = EXCLUDED.chainlink_feed_address,
    is_liquid              = TRUE,
    is_suspended           = FALSE,
    updated_at             = NOW();

-- To bring a ticker to full settlement: write its real price source into
-- chainlink_feed_address. Nothing else needs to change.
