-- 012_zk_private_standing.sql
-- Sprint J: private standing proofs over the nurturer leaderboard.

-- 1. Identity commitments. The server stores Poseidon(secret), never the
--    secret, which the client re-derives from a wallet signature each time.
--    Registering is what puts a wallet into the provable standing at all.
CREATE TABLE IF NOT EXISTS zk_identity_commitments (
  user_address TEXT PRIMARY KEY,
  commitment   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Published standings. One row per epoch. The root is the commitment a
--    proof is checked against, so it has to be published before any proof
--    naming it is accepted, and it must never be rewritten afterwards: a
--    changed root would invalidate every proof already issued against it.
CREATE TABLE IF NOT EXISTS zk_standing_epochs (
  epoch_index  BIGINT PRIMARY KEY,
  root         TEXT NOT NULL,
  tree_height  INTEGER NOT NULL,
  leaf_count   INTEGER NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zk_standing_epochs_root ON zk_standing_epochs(root);

-- 3. The leaves behind a published root, kept so a participant can be handed
--    their Merkle path later. rank is 1-based and doubles as the leaf index,
--    so the tree position carries the placing.
CREATE TABLE IF NOT EXISTS zk_standing_leaves (
  epoch_index  BIGINT NOT NULL REFERENCES zk_standing_epochs(epoch_index) ON DELETE CASCADE,
  rank         INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  commitment   TEXT NOT NULL,
  stake        BIGINT NOT NULL,
  leaf         TEXT NOT NULL,
  PRIMARY KEY (epoch_index, rank)
);

CREATE INDEX IF NOT EXISTS idx_zk_standing_leaves_user ON zk_standing_leaves(epoch_index, user_address);

-- 4. Spent proofs. A nullifier is Poseidon(secret, root), so it is stable for
--    one participant in one epoch and reveals nothing about which participant.
--    This is what stops one standing unlocking the same perk twice, and what
--    stops a proof being passed around.
--
--    There is deliberately no user_address column here. Storing one would undo
--    the unlinkability the whole circuit exists to provide.
CREATE TABLE IF NOT EXISTS zk_spent_nullifiers (
  nullifier   TEXT NOT NULL,
  root        TEXT NOT NULL,
  perk_key    TEXT NOT NULL,
  max_rank    INTEGER NOT NULL,
  min_stake   BIGINT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (nullifier, perk_key)
);

CREATE INDEX IF NOT EXISTS idx_zk_spent_nullifiers_root ON zk_spent_nullifiers(root);

-- 5. Feature flag, off until the standing publisher has run at least once.
INSERT INTO protocol_settings (key, value)
VALUES ('zk_private_standing', 'false')
ON CONFLICT (key) DO NOTHING;
