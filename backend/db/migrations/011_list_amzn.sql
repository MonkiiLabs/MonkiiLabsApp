-- 011_list_amzn.sql
-- List AMZN on its real Robinhood Chain contract.
--
-- AMZN was one of the tickers seeded with an invented feed in migration 007
-- and held back by 009. This replaces the contract address with the real one
-- and clears the suspension, on the same terms as the four in migration 010:
-- the token is known, its price source is still pending, so it is electable
-- and not yet settleable.

INSERT INTO rwa_eligible_tokens
  (symbol, name, contract_address, chainlink_feed_address,
   corporate_action_multiplier, is_liquid, is_suspended)
VALUES
  ('AMZN', 'Amazon.com Inc Tokenized Stock', '0x12f190a9f9d7d37a250758b26824b97ce941bf54', NULL, 1.0, TRUE, FALSE)
ON CONFLICT (symbol) DO UPDATE
SET name                   = EXCLUDED.name,
    contract_address       = EXCLUDED.contract_address,
    chainlink_feed_address = EXCLUDED.chainlink_feed_address,
    is_liquid              = TRUE,
    is_suspended           = FALSE,
    updated_at             = NOW();
