-- Monkii Labs: Initial Database Schema (Robinhood Chain Architecture)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(128) UNIQUE NOT NULL,
  username VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agents Fleet Table
CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  power INTEGER NOT NULL DEFAULT 80,
  state VARCHAR(32) NOT NULL DEFAULT 'thriving', -- 'thriving', 'idle', 'fading'
  category VARCHAR(64) NOT NULL DEFAULT 'sentinel',
  avatar_url TEXT,
  decay_rate_per_min INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proof-of-Life Nurture Sessions
CREATE TABLE IF NOT EXISTS nurture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(128) NOT NULL,
  agent_id VARCHAR(64) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  intensity VARCHAR(32) NOT NULL DEFAULT 'STANDARD', -- 'LIGHT', 'STANDARD', 'MAX'
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Verified Proof-of-Life Heartbeats
CREATE TABLE IF NOT EXISTS heartbeat_proofs (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES nurture_sessions(id) ON DELETE CASCADE,
  agent_id VARCHAR(64) NOT NULL REFERENCES agents(id),
  seed TEXT NOT NULL,
  nonce TEXT NOT NULL,
  hash TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  monki_reward NUMERIC(24, 6) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Rewards & Staking Ledger
CREATE TABLE IF NOT EXISTS user_rewards (
  user_address VARCHAR(128) PRIMARY KEY,
  monki_balance NUMERIC(24, 6) NOT NULL DEFAULT 0,
  staked_monki NUMERIC(24, 6) NOT NULL DEFAULT 0,
  claimable_pons NUMERIC(24, 6) NOT NULL DEFAULT 0,
  claimable_meta_stock NUMERIC(24, 6) NOT NULL DEFAULT 0,
  total_proofs INTEGER NOT NULL DEFAULT 0,
  staking_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Companions Catalog
CREATE TABLE IF NOT EXISTS companions (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  rarity VARCHAR(32) NOT NULL, -- 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'
  earn_boost_pct INTEGER NOT NULL DEFAULT 5,
  decay_reduction_pct INTEGER NOT NULL DEFAULT 0,
  artwork_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Companions & Equipment Slots
CREATE TABLE IF NOT EXISTS user_companions (
  id BIGSERIAL PRIMARY KEY,
  user_address VARCHAR(128) NOT NULL,
  companion_id VARCHAR(64) NOT NULL REFERENCES companions(id),
  equipped_agent_id VARCHAR(64) REFERENCES agents(id) ON DELETE SET NULL,
  slot_index INTEGER CHECK (slot_index IN (0, 1, 2)),
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24h Epoch Distribution History
CREATE TABLE IF NOT EXISTS staking_epochs (
  id BIGSERIAL PRIMARY KEY,
  epoch_index INTEGER UNIQUE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_staked_monki NUMERIC(24, 6) NOT NULL DEFAULT 0,
  pons_distributed NUMERIC(24, 6) NOT NULL DEFAULT 0,
  meta_stock_distributed NUMERIC(24, 6) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED'
);

-- Seed Initial Agent
INSERT INTO agents (id, name, description, power, state, category)
VALUES (
  'monkii-prime',
  'Monkii Prime',
  'First autonomous agent nurtured on Robinhood Chain by Monkii Labs.',
  88,
  'thriving',
  'sentinel'
) ON CONFLICT (id) DO NOTHING;
