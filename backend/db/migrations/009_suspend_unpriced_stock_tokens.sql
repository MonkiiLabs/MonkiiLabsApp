-- 009_suspend_unpriced_stock_tokens.sql
-- Hold back stock tokens whose Chainlink feed address is not a real address.
--
-- Migration 007 seeded TSLA, AAPL and AMZN with placeholder feed addresses
-- containing G, H and I, which are not hex digits. The column is TEXT, so the
-- rows stored happily and would only have failed at settlement, after a
-- nurturer had already elected an allocation against them.
--
-- Suspending and de-listing them is what the election validator already
-- refuses, so the tickers stay visible in the registry, marked unavailable,
-- rather than disappearing and taking their history with them. NVDA and SPY
-- carry real addresses and are untouched, which keeps the default 60/40
-- NVDA-SPY preset working.
--
-- To restore one: update its chainlink_feed_address to the real feed, then
-- set is_suspended = FALSE, is_liquid = TRUE.

UPDATE rwa_eligible_tokens
   SET is_liquid    = FALSE,
       is_suspended = TRUE,
       updated_at   = NOW()
 WHERE chainlink_feed_address !~ '^0x[0-9a-fA-F]{40}$'
    OR contract_address       !~ '^0x[0-9a-fA-F]{40}$';
