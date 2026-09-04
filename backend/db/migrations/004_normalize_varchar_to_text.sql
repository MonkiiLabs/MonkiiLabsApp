-- 004_normalize_varchar_to_text.sql
--
-- Migrations 001 and 002 disagreed on VARCHAR(n) vs TEXT for the same
-- logical columns, which makes Postgres unable to deduce a single type for
-- a placeholder used against both. Normalise everything to TEXT.
--
-- varchar(n) -> text is binary coercible, so no table rewrite is needed,
-- but each statement still takes a brief ACCESS EXCLUSIVE lock.

-- Referenced keys and their referencing columns must move together, or the
-- foreign keys will not revalidate.
ALTER TABLE contributions          ALTER COLUMN agent_id          TYPE TEXT;
ALTER TABLE heartbeat_proofs       ALTER COLUMN agent_id          TYPE TEXT;
ALTER TABLE notifications          ALTER COLUMN agent_id          TYPE TEXT;
ALTER TABLE nurture_sessions       ALTER COLUMN agent_id          TYPE TEXT;
ALTER TABLE sessions               ALTER COLUMN agent_id          TYPE TEXT;
ALTER TABLE user_companions        ALTER COLUMN equipped_agent_id TYPE TEXT;
ALTER TABLE agents                 ALTER COLUMN id                TYPE TEXT;

ALTER TABLE user_companions        ALTER COLUMN companion_id      TYPE TEXT;
ALTER TABLE user_milestone_claims  ALTER COLUMN companion_id      TYPE TEXT;
ALTER TABLE companions             ALTER COLUMN id                TYPE TEXT;

-- The column that broke sign-in.
ALTER TABLE users                  ALTER COLUMN address           TYPE TEXT;
ALTER TABLE users                  ALTER COLUMN username          TYPE TEXT;

ALTER TABLE nurture_sessions       ALTER COLUMN user_address      TYPE TEXT;
ALTER TABLE user_companions        ALTER COLUMN user_address      TYPE TEXT;
ALTER TABLE user_rewards           ALTER COLUMN user_address      TYPE TEXT;

ALTER TABLE agents                 ALTER COLUMN name              TYPE TEXT;
ALTER TABLE agents                 ALTER COLUMN state             TYPE TEXT;
ALTER TABLE agents                 ALTER COLUMN category          TYPE TEXT;
ALTER TABLE companions             ALTER COLUMN name              TYPE TEXT;
ALTER TABLE companions             ALTER COLUMN rarity            TYPE TEXT;
ALTER TABLE nurture_sessions       ALTER COLUMN intensity         TYPE TEXT;
ALTER TABLE nurture_sessions       ALTER COLUMN status            TYPE TEXT;
ALTER TABLE staking_epochs         ALTER COLUMN status            TYPE TEXT;
