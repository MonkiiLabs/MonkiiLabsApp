-- 006_companion_mint_tracking.sql
-- Adds the columns POST /api/companions/verify-mint has always written to, and
-- widens the equip slot range to the 1..3 the application actually assigns.

-- 1. On-chain mint bookkeeping.
--    verify-mint reads mint_tx_hash for anti-replay and inserts on_chain_mint /
--    acquisition_type. None of the three existed, so every mint verification
--    failed with 42703 (undefined_column) and returned 500 to the browser.
ALTER TABLE user_companions ADD COLUMN IF NOT EXISTS mint_tx_hash     TEXT;
ALTER TABLE user_companions ADD COLUMN IF NOT EXISTS on_chain_mint    TEXT;
ALTER TABLE user_companions ADD COLUMN IF NOT EXISTS acquisition_type TEXT NOT NULL DEFAULT 'milestone';

-- One inventory row per transaction. The route checks this in application code
-- first, but two verify-mint calls racing on the same hash would both pass that
-- check, so the constraint is what actually makes the mint idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_companions_mint_tx_hash
  ON user_companions (mint_tx_hash)
  WHERE mint_tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_companions_user_address
  ON user_companions (user_address);

-- 2. Equip slots.
--    001_initial defined CHECK (slot_index IN (0, 1, 2)) but equipCompanion has
--    always handed out 1, 2 and 3, so slot 3 could never be filled: the insert
--    tripped the constraint and surfaced as a 400 failed_to_equip.
UPDATE user_companions
   SET equipped_agent_id = NULL, slot_index = NULL
 WHERE slot_index = 0;

ALTER TABLE user_companions DROP CONSTRAINT IF EXISTS user_companions_slot_index_check;
ALTER TABLE user_companions ADD  CONSTRAINT user_companions_slot_index_check
  CHECK (slot_index IS NULL OR slot_index IN (1, 2, 3));
