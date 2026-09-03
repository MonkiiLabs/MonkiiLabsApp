-- 002_robinhood_engine_schema.sql
-- Complete parity with nurturing engine for Robinhood Chain

-- 1. Ensure users table has all required fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;
UPDATE users SET wallet_address = address WHERE wallet_address IS NULL AND address IS NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_monki_earned NUMERIC(78, 18) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS power_rank INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_tg_link_code ON users(telegram_link_code);

-- 2. Ensure agents table has decay rates and thresholds
ALTER TABLE agents ADD COLUMN IF NOT EXISTS on_chain_id TEXT;
UPDATE agents SET on_chain_id = id WHERE on_chain_id IS NULL;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS owner_wallet TEXT NOT NULL DEFAULT '';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS current_power NUMERIC(78, 18);
UPDATE agents SET current_power = power WHERE current_power IS NULL;
ALTER TABLE agents ALTER COLUMN current_power SET DEFAULT 80;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS healthy_threshold NUMERIC(78, 18) NOT NULL DEFAULT 80;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS warning_threshold NUMERIC(78, 18) NOT NULL DEFAULT 30;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS power_decay_rate NUMERIC(78, 18) NOT NULL DEFAULT 1.0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS nurturer_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS x_handle TEXT;

-- 3. Ensure sessions table exists with numeric ID and user references
CREATE TABLE IF NOT EXISTS sessions (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  user_address       TEXT NOT NULL,
  agent_id           VARCHAR(64) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  intensity          TEXT NOT NULL DEFAULT 'standard' CHECK (intensity IN ('light', 'standard', 'max')),
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at           TIMESTAMPTZ,
  power_contributed  NUMERIC(78, 18) NOT NULL DEFAULT 0,
  monki_earned       NUMERIC(78, 18) NOT NULL DEFAULT 0,
  last_heartbeat_at  TIMESTAMPTZ,
  difficulty         INTEGER NOT NULL DEFAULT 10
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_address ON sessions(user_address);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id);

-- 4. PoW Challenges Table (anti-replay + nonce checks)
CREATE TABLE IF NOT EXISTS pow_challenges (
  id           BIGSERIAL PRIMARY KEY,
  session_id   BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  seed         TEXT NOT NULL,
  difficulty   INTEGER NOT NULL,
  consumed     BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pow_challenges_session ON pow_challenges(session_id);
CREATE INDEX IF NOT EXISTS idx_pow_challenges_seed ON pow_challenges(seed);

-- 5. Heartbeat Contributions Table
CREATE TABLE IF NOT EXISTS contributions (
  id                 BIGSERIAL PRIMARY KEY,
  session_id         BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  agent_id           VARCHAR(64) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  proof              TEXT NOT NULL,
  power_delta        NUMERIC(78, 18) NOT NULL DEFAULT 0,
  verified_on_chain  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contributions_session ON contributions(session_id);

-- 6. Rewards & Staking Table
CREATE TABLE IF NOT EXISTS rewards (
  id                      BIGSERIAL PRIMARY KEY,
  user_id                 UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  user_address            TEXT UNIQUE NOT NULL,
  claimable_monki         NUMERIC(78, 18) NOT NULL DEFAULT 0,
  claimed_monki           NUMERIC(78, 18) NOT NULL DEFAULT 0,
  staked_monki            NUMERIC(78, 18) NOT NULL DEFAULT 0,
  reward_multiplier       NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  claimable_pons          NUMERIC(78, 18) NOT NULL DEFAULT 0,
  claimed_pons            NUMERIC(78, 18) NOT NULL DEFAULT 0,
  claimable_meta_stock    NUMERIC(78, 18) NOT NULL DEFAULT 0,
  claimed_meta_stock      NUMERIC(78, 18) NOT NULL DEFAULT 0,
  stake_period_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pons_paid_through       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_claim_tx           TEXT,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rewards_user_address ON rewards(user_address);

-- 7. Auth Nonces (EIP-712 / SIWE challenge)
CREATE TABLE IF NOT EXISTS auth_nonces (
  id              BIGSERIAL PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  nonce           TEXT NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_nonces_address ON auth_nonces(wallet_address);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  agent_id    VARCHAR(64) REFERENCES agents(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_address);

-- 9. Protocol Settings
CREATE TABLE IF NOT EXISTS protocol_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO protocol_settings (key, value)
VALUES
  ('enable_pons_claiming', 'true'),
  ('enable_monki_claiming', 'false'),
  ('enable_meta_stock_split', 'false')
ON CONFLICT (key) DO NOTHING;

-- 10. Claim Authorizations
CREATE TABLE IF NOT EXISTS claim_authorizations (
  id           BIGSERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  action       TEXT NOT NULL,
  nonce        TEXT NOT NULL UNIQUE,
  message      TEXT NOT NULL,
  signature    TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Milestone Claims
CREATE TABLE IF NOT EXISTS user_milestone_claims (
  id             BIGSERIAL PRIMARY KEY,
  user_address   TEXT NOT NULL,
  milestone_key  TEXT NOT NULL,
  companion_id   VARCHAR(64) NOT NULL,
  claimed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_address, milestone_key)
);

-- 12. Companions Catalog Enhancement & Seeding
ALTER TABLE companions ADD COLUMN IF NOT EXISTS slug TEXT;
UPDATE companions SET slug = id WHERE slug IS NULL;
ALTER TABLE companions ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE companions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'spirit';
ALTER TABLE companions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE companions ADD COLUMN IF NOT EXISTS mint_price_pons NUMERIC(14, 4) DEFAULT 0;
ALTER TABLE companions ADD COLUMN IF NOT EXISTS supply_cap INTEGER;
ALTER TABLE companions ADD COLUMN IF NOT EXISTS minted_count INTEGER DEFAULT 0;
ALTER TABLE companions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

INSERT INTO companions (id, slug, name, description, category, rarity, image_url, earn_boost_pct, decay_reduction_pct, mint_price_pons)
VALUES
  ('spark-orb', 'spark-orb', 'Spark Orb', 'A shimmering orb of pure neural static that optimizes Proof-of-Life heartbeat transmissions.', 'spirit', 'Common', '/companions/spark-orb.png', 6, 0, 50),
  ('circuit-beetle', 'circuit-beetle', 'Circuit Beetle', 'A resilient micro-drone that fine-tunes Keccak-256 hash hashing loops.', 'mech', 'Common', '/companions/circuit-beetle.png', 8, 0, 80),
  ('solar-sprite', 'solar-sprite', 'Solar Sprite', 'A solar-charged plasma wisp that shields agent power from environmental degradation.', 'spirit', 'Uncommon', '/companions/solar-sprite.png', 12, 10, 150),
  ('byte-fox', 'byte-fox', 'Byte Fox', 'A nimble cybernetic companion capable of detecting high-yield heartbeat resonance.', 'creature', 'Uncommon', '/companions/byte-fox.png', 15, 15, 200),
  ('void-golem', 'void-golem', 'Void Golem', 'An ancient monolithic guardian that substantially buffers your agent against power decay.', 'golem', 'Rare', '/companions/void-golem.png', 20, 25, 350),
  ('quantum-phoenix', 'quantum-phoenix', 'Quantum Phoenix', 'A legendary radiant construct providing extraordinary compute acceleration and fade resistance.', 'phoenix', 'Epic', '/companions/quantum-phoenix.png', 30, 40, 750)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  earn_boost_pct = EXCLUDED.earn_boost_pct,
  decay_reduction_pct = EXCLUDED.decay_reduction_pct;

-- Seed default agents tailored for Monkii Labs
INSERT INTO agents (id, on_chain_id, name, description, category, current_power, healthy_threshold, warning_threshold, power_decay_rate, state, x_handle)
VALUES
  ('monkii-prime', 'monkii-prime', 'Monkii Prime', 'The flagship autonomous agent maintained by the Monkii Labs retail community on Robinhood Chain.', 'sentinel', 88, 80, 30, 1.0, 'thriving', 'MonkiiLabs'),
  ('neural-chimp', 'neural-chimp', 'Neural Chimp', 'Autonomous trading and arbitrage agent scanning liquidity across Robinhood Chain decentralized exchanges.', 'defi', 72, 80, 30, 1.2, 'idle', 'NeuralChimp'),
  ('cipher-ape', 'cipher-ape', 'Cipher Ape', 'Cryptographic analysis agent monitoring memecoin launches on Pons Launchpad.', 'analytics', 94, 80, 30, 0.8, 'thriving', 'CipherApe'),
  ('quantum-gorilla', 'quantum-gorilla', 'Quantum Gorilla', 'Deep learning inference agent providing natural language sentiment feeds for tokenized stocks.', 'research', 28, 80, 30, 1.5, 'fading', 'QuantumGorilla')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  healthy_threshold = EXCLUDED.healthy_threshold,
  warning_threshold = EXCLUDED.warning_threshold;
