-- 014_rwa_election_history.sql
-- Keep every stock election a nurturer has ever held, instead of overwriting.
--
-- `user_rwa_elections` is upserted with ON CONFLICT (user_address) DO UPDATE,
-- so saving a new basket destroys the previous one. Nothing anywhere can say
-- what a wallet was electing last week, which matters for one specific reason:
-- an accrual belongs to the basket that was in force when it accrued, not to
-- whatever the wallet happens to hold today. Without a record of the second
-- thing, the first is unprovable.
--
-- This table is the record. One row per period, closed when the next one
-- opens, so the periods tile the wallet's whole history with no gaps and no
-- overlaps. `effective_to IS NULL` marks the basket in force right now, and a
-- partial unique index allows exactly one of those per wallet.
--
-- Append-only is enforced in the database rather than promised by the API: a
-- trigger refuses every DELETE and every UPDATE except closing an open period.
-- History that the writer can quietly revise is not history.

-- Period bounds are stored at millisecond precision, deliberately.
--
-- Postgres keeps microseconds and an ISO-8601 timestamp carries milliseconds,
-- so a boundary handed to a client and passed straight back would land a few
-- hundred microseconds before the period it came from and match nothing. The
-- attribution question this table exists to answer is asked with timestamps
-- that have made that round trip, so the stored value is truncated to the
-- precision everything downstream can actually express.
CREATE TABLE IF NOT EXISTS user_rwa_election_history (
  id             BIGSERIAL PRIMARY KEY,
  user_address   TEXT NOT NULL,
  mode           TEXT NOT NULL CHECK (mode IN ('stock_elected', 'plain_pons')),
  allocations    JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT date_trunc('milliseconds', NOW()),
  -- NULL means this is the period currently in force.
  effective_to   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rwa_election_history_period_ordered
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- The listing order: newest period first, per wallet.
CREATE INDEX IF NOT EXISTS idx_rwa_election_history_user_from
  ON user_rwa_election_history (user_address, effective_from DESC);

-- The point-in-time lookup the accrual leg will run: which basket was live at
-- time T for this wallet.
CREATE INDEX IF NOT EXISTS idx_rwa_election_history_user_window
  ON user_rwa_election_history (user_address, effective_from, effective_to);

-- At most one open period per wallet. This is what makes "close the old one,
-- then open the new one" safe under a concurrent double save.
CREATE UNIQUE INDEX IF NOT EXISTS uq_rwa_election_history_open
  ON user_rwa_election_history (user_address)
  WHERE effective_to IS NULL;

-- ---------------------------------------------------------------------------
-- Append-only guard
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION rwa_election_history_guard() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'user_rwa_election_history is append only: rows cannot be deleted';
  END IF;

  -- The one legal mutation is closing a period that is still open.
  IF OLD.id             IS DISTINCT FROM NEW.id
  OR OLD.user_address   IS DISTINCT FROM NEW.user_address
  OR OLD.mode           IS DISTINCT FROM NEW.mode
  OR OLD.allocations    IS DISTINCT FROM NEW.allocations
  OR OLD.is_enabled     IS DISTINCT FROM NEW.is_enabled
  OR OLD.effective_from IS DISTINCT FROM NEW.effective_from
  OR OLD.created_at     IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'user_rwa_election_history is append only: only effective_to may change';
  END IF;

  IF OLD.effective_to IS NOT NULL THEN
    RAISE EXCEPTION 'user_rwa_election_history: a closed period cannot be reopened or re-closed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rwa_election_history_guard ON user_rwa_election_history;
CREATE TRIGGER trg_rwa_election_history_guard
  BEFORE UPDATE OR DELETE ON user_rwa_election_history
  FOR EACH ROW EXECUTE FUNCTION rwa_election_history_guard();

CREATE OR REPLACE FUNCTION rwa_election_history_truncate_guard() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'user_rwa_election_history is append only: the table cannot be truncated';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rwa_election_history_truncate ON user_rwa_election_history;
CREATE TRIGGER trg_rwa_election_history_truncate
  BEFORE TRUNCATE ON user_rwa_election_history
  FOR EACH STATEMENT EXECUTE FUNCTION rwa_election_history_truncate_guard();

-- ---------------------------------------------------------------------------
-- Backfill
-- ---------------------------------------------------------------------------
--
-- Every existing election becomes an open period. `updated_at` is the honest
-- start: it is when the basket now stored was actually written. Anything the
-- wallet elected before that was overwritten and is not recoverable, so no row
-- is invented to cover it. History begins here, and says so by starting at a
-- date rather than at the wallet's creation.

INSERT INTO user_rwa_election_history
  (user_address, mode, allocations, is_enabled, effective_from, effective_to)
SELECT e.user_address,
       e.mode,
       e.allocations,
       e.is_enabled,
       date_trunc('milliseconds', COALESCE(e.updated_at, e.created_at, NOW())),
       NULL
  FROM user_rwa_elections e
 WHERE NOT EXISTS (
         SELECT 1
           FROM user_rwa_election_history h
          WHERE h.user_address = e.user_address
       );
