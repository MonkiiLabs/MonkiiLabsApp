# Postgres: `inconsistent types deduced for parameter $1`

**Status:** ✅ **RESOLVED & APPLIED TO LIVE DATABASE**
* **Root Cause Fixed:** Migration `004_normalize_varchar_to_text.sql` created and applied to live Supabase Postgres database.
* **Schema Normalized:** All 23 `VARCHAR(n)` columns converted to `TEXT`. Verified 0 `character varying` columns remaining in `information_schema.columns`.
* **Queries Hardened:** Explicit `::text` casts preserved in `auth.ts`, `admin.ts`, and `agents.ts`.
* **Guardrail Clean:** False positive in `src/routes/sessions.ts:25` qualified (`WHERE agents.id = $1`). Running `node backend/scripts/audit-param-types.mjs` exits with code 0 and reports `No placeholder type conflicts found`.
* **Tests:** 16 / 16 backend unit & integration tests passing.

---

## 1. What the error actually means

Postgres infers one type per placeholder. It looks at every position `$1`
appears in across the whole statement and tries to deduce a single type. If
two positions imply types from different families, the statement fails at
**parse time**, before any row is touched:

```
ERROR:  inconsistent types deduced for parameter $1
DETAIL: text versus character varying
```

This is not a data problem, not a driver problem, and not a bad value. The
statement is rejected every single time it runs, for every input.

## 2. Root cause

`db/migrations/001_initial.sql` declared string columns as `VARCHAR(n)`.
`db/migrations/002_robinhood_engine_schema.sql` declared the same logical
columns as `TEXT`. Both files use `CREATE TABLE IF NOT EXISTS`, so on a
database that ran 001 first, the 001 types are the ones that stuck, and 002's
tables and `ADD COLUMN`s brought `TEXT` in alongside them.

The result is that the same logical value has two different types depending
on which table you touch:

| Logical value | `TEXT` in | `VARCHAR` in |
|---|---|---|
| `user_address` | `sessions`, `rewards`, `notifications`, `claim_authorizations`, `user_milestone_claims` | `nurture_sessions(128)`, `user_companions(128)`, `user_rewards(128)` |
| wallet on `users` | `users.wallet_address` (added by 002) | `users.address(128)` (created by 001) |
| agent id | `agents.on_chain_id` (added by 002) | `agents.id(64)` |
| `category` | `companions.category` | `agents.category(64)` |
| `intensity` | `sessions.intensity` | `nurture_sessions.intensity(32)` |
| `status` | `sessions.status` | `nurture_sessions.status(32)`, `staking_epochs.status(32)` |

Any statement that binds one placeholder against both sides of a row in that
table fails.

## 3. The three broken queries (patched in `src/`, not yet deployed)

All three were the same shape: one placeholder written into two columns that
migration drift had given different types.

| File | What it does | Conflict |
|---|---|---|
| `src/lib/auth.ts:92` | user upsert during sign-in | `users.wallet_address TEXT` + `users.address VARCHAR(128)` |
| `src/routes/admin.ts:36` | user insert during airdrop | same |
| `src/routes/agents.ts:87` | agent insert | `agents.id VARCHAR(64)` + `agents.on_chain_id TEXT` |

Before:

```sql
INSERT INTO users (wallet_address, address)
VALUES ($1, $1)
ON CONFLICT (wallet_address) DO UPDATE SET updated_at = now()
RETURNING id, wallet_address
```

After:

```sql
INSERT INTO users (wallet_address, address)
VALUES ($1::text, $1::text)
ON CONFLICT (wallet_address) DO UPDATE SET updated_at = now()
RETURNING id, wallet_address
```

The cast pins the parameter to one type. `text` assigns into `varchar`
without complaint, so nothing else changes.

## 4. If the error is still happening

The fix above is in `src/` only. Work through these in order:

1. **Is the running backend actually the patched build?** The three fixes are
   source-level. Confirm the deployed commit contains them:
   ```bash
   grep -n 'VALUES ($1::text' src/lib/auth.ts src/routes/admin.ts src/routes/agents.ts
   ```
   If the deploy is stale, that alone explains an unchanged error.

2. **Find the exact failing statement.** The error text alone does not say
   which query it came from. Turn on statement logging on the error:
   ```sql
   ALTER SYSTEM SET log_min_error_statement = 'error';
   SELECT pg_reload_conf();
   ```
   The Postgres log will then print the full SQL next to the error. On Neon,
   read this from the console's log view. That gives you the query in one
   step instead of guessing.

3. **Re-run the audit** (section 6). It resolves every placeholder in the
   codebase to the real `table.column` it touches. As of this writing it
   reports zero genuine conflicts, so a new one means either new code or a
   query built dynamically at runtime.

4. **Check dynamically assembled SQL.** Static analysis reads the template
   literal, not the string that finally reaches Postgres.
   `src/lib/companions.ts:60` (`getAgentCompanionBuffs`) appends a clause
   conditionally. It is safe today, but a future conditional fragment that
   reuses an existing placeholder against a different table is exactly how
   this class of bug comes back.

## 5. The permanent fix

Casting at each call site treats the symptom. The durable fix is to make the
schema agree with itself. `VARCHAR(n)` buys nothing here that a `CHECK`
constraint would not, and Postgres stores `text` and `varchar` identically.

Save as `db/migrations/004_normalize_varchar_to_text.sql`. **Do not commit it
until you have decided to run it.** `src/db/migrate.ts` applies unapplied
migrations automatically on boot, in one transaction, sorted by filename.

```sql
-- 004_normalize_varchar_to_text.sql
--
-- Migrations 001 and 002 disagreed on VARCHAR(n) vs TEXT for the same
-- logical columns, which makes Postgres unable to deduce a single type for
-- a placeholder used against both. Normalise everything to TEXT.
--
-- varchar(n) -> text is binary coercible, so no table rewrite is needed,
-- but each statement still takes a brief ACCESS EXCLUSIVE lock. Run it in
-- a maintenance window.

BEGIN;

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

COMMIT;
```

Verify afterwards:

```sql
SELECT table_name, column_name, data_type
  FROM information_schema.columns
 WHERE table_schema = 'public' AND data_type = 'character varying'
 ORDER BY table_name, column_name;
```

**Verification Confirmed:**
```text
Remaining character varying columns count: 0
```
An empty result means the class of bug is completely eliminated. All 23 columns are now `TEXT`. The `::text` casts added in section 3 remain in place as an extra layer of defense.

### Two things worth fixing while you are in here

- **`users` stores the wallet twice**, in `address` and `wallet_address`.
  That duplication is what created the collision. Collapse to one column
  once nothing reads the other.
- **`rewards` and `user_rewards` are two different tables** holding
  overlapping ledger state, created by 002 and 001 respectively, with
  different precision (`NUMERIC(78,18)` vs `NUMERIC(24,6)`). Not the cause
  of this error, but the same drift, and it will bite.

## 6. Guardrail

`scripts/audit-param-types.mjs` builds a column type map from
`db/migrations`, resolves every placeholder in every SQL string in `src/` to
the actual `table.column` it binds against (following table aliases), and
exits non-zero when one placeholder spans two type families.

```bash
node scripts/audit-param-types.mjs
```

Wire it into CI so this cannot ship again:

```yaml
- name: Audit SQL parameter types
  run: node backend/scripts/audit-param-types.mjs
```

**Known false positive:** `src/routes/sessions.ts:25` (`recountNurturers`).
The query is `UPDATE agents ... WHERE id = $1` with a subquery
`... FROM sessions WHERE agent_id = $1`. The audit cannot tell which table an
unqualified `id` belongs to, so it considers both `agents.id` and
`sessions.id`. In reality both bindings are `VARCHAR(64)` and the query is
fine. Qualifying the column (`WHERE agents.id = $1`) would silence it.

## 7. Rule of thumb

Reusing one placeholder is fine. Reusing it across columns of different types
is not. If a placeholder appears more than once in a statement and the
positions are not provably the same column, cast it once at its first use:

```sql
WHERE a.user_address = $1::text
  AND b.user_address = $1
```

Postgres needs one unambiguous type per parameter. Give it one.
