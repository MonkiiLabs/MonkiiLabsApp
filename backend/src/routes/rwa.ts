import { Router } from "express";
import { z } from "zod";
import type { PoolClient } from "pg";
import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import { isRwaElectionsEnabled } from "../lib/settings";

export const rwaRouter = Router();

export interface EligibleTokenRecord {
  symbol: string;
  name: string;
  contractAddress: string;
  /** Null while no price source exists for this token yet. */
  chainlinkFeedAddress: string | null;
  corporateActionMultiplier: number;
  isLiquid: boolean;
  isSuspended: boolean;
  /** "live" once a price source is configured, "pending" until then. */
  feedStatus: "live" | "pending";
}

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/**
 * Knowing a token and being able to price it are two different things.
 *
 * A bad contract address means we do not know what the token is, and nothing
 * downstream can recover from that, so such a row is reported suspended and
 * illiquid, which the election validator already refuses.
 *
 * A missing price source is a narrower problem. Robinhood Chain publishes no
 * equity aggregators yet, so every ticker here is pending one. That blocks
 * settlement, not election, and Sprint F is accrual-only: nobody is being paid
 * in stock tokens today. Rather than hide the tickers until an oracle exists,
 * the state is named and carried, so whatever eventually settles a payout can
 * refuse a pending token on its own terms.
 *
 * A feed that is present but malformed is treated as pending, never as live.
 */
function gateOnPriceability(token: EligibleTokenRecord): EligibleTokenRecord {
  const feed = token.chainlinkFeedAddress;
  const feedIsLive = typeof feed === "string" && EVM_ADDRESS.test(feed);

  if (!EVM_ADDRESS.test(token.contractAddress)) {
    return {
      ...token,
      chainlinkFeedAddress: feedIsLive ? feed : null,
      feedStatus: feedIsLive ? "live" : "pending",
      isLiquid: false,
      isSuspended: true,
    };
  }

  return {
    ...token,
    chainlinkFeedAddress: feedIsLive ? feed : null,
    feedStatus: feedIsLive ? "live" : "pending",
  };
}

/**
 * Whether a token can actually be paid out in kind. Nothing calls this yet,
 * because Sprint F accrues and does not settle. The settlement leg must,
 * before it converts a single unit of yield.
 */
export function canSettle(token: EligibleTokenRecord): boolean {
  return token.feedStatus === "live" && token.isLiquid && !token.isSuspended;
}

/**
 * Served only when the registry table cannot be read, so it mirrors what
 * migration 010 writes: real Robinhood Chain contracts, price source pending.
 */
const FALLBACK_TOKENS: EligibleTokenRecord[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp Tokenized Stock",
    contractAddress: "0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec",
    chainlinkFeedAddress: null,
    corporateActionMultiplier: 1.0,
    isLiquid: true,
    isSuspended: false,
    feedStatus: "pending",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc Tokenized Stock",
    contractAddress: "0x322f0929c4625ed5bad873c95208d54e1c003b2d",
    chainlinkFeedAddress: null,
    corporateActionMultiplier: 1.0,
    isLiquid: true,
    isSuspended: false,
    feedStatus: "pending",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc Tokenized Stock",
    contractAddress: "0xaf3d76f1834a1d425780943c99ea8a608f8a93f9",
    chainlinkFeedAddress: null,
    corporateActionMultiplier: 1.0,
    isLiquid: true,
    isSuspended: false,
    feedStatus: "pending",
  },
  {
    symbol: "META",
    name: "Meta Platforms Tokenized Stock",
    contractAddress: "0xc0d6457c16cc70d6790dd43521c899c87ce02f35",
    chainlinkFeedAddress: null,
    corporateActionMultiplier: 1.0,
    isLiquid: true,
    isSuspended: false,
    feedStatus: "pending",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc Tokenized Stock",
    contractAddress: "0x12f190a9f9d7d37a250758b26824b97ce941bf54",
    chainlinkFeedAddress: null,
    corporateActionMultiplier: 1.0,
    isLiquid: true,
    isSuspended: false,
    feedStatus: "pending",
  },
];

const allocationItemSchema = z.object({
  symbol: z.string().min(1).max(16),
  percentage: z.number().int().min(1).max(100),
});

const setElectionSchema = z.object({
  mode: z.enum(["stock_elected", "plain_pons"]).default("stock_elected"),
  allocations: z.array(allocationItemSchema).max(5).default([]),
  acceptedDisclaimer: z.boolean().default(false),
});

/** Helper to fetch eligible tokens from DB with hardcoded fallback */
export async function fetchEligibleTokens(): Promise<EligibleTokenRecord[]> {
  try {
    const { rows } = await pool.query<{
      symbol: string;
      name: string;
      contract_address: string;
      chainlink_feed_address: string | null;
      corporate_action_multiplier: string | number;
      is_liquid: boolean;
      is_suspended: boolean;
    }>(
      `SELECT symbol, name, contract_address, chainlink_feed_address,
              corporate_action_multiplier, is_liquid, is_suspended
         FROM rwa_eligible_tokens
        ORDER BY symbol ASC`,
    );

    if (rows && rows.length > 0) {
      return rows.map((r) =>
        gateOnPriceability({
          symbol: r.symbol,
          name: r.name,
          contractAddress: r.contract_address,
          chainlinkFeedAddress: r.chainlink_feed_address,
          corporateActionMultiplier: Number(r.corporate_action_multiplier || 1.0),
          isLiquid: Boolean(r.is_liquid),
          isSuspended: Boolean(r.is_suspended),
          // gateOnPriceability derives the real value; this is a
          // placeholder so the object satisfies the type first.
          feedStatus: "pending",
        }),
      );
    }
  } catch (err) {
    console.warn("[rwa] Error fetching rwa_eligible_tokens, using fallback registry:", err);
  }
  return FALLBACK_TOKENS.map(gateOnPriceability);
}

/* =====================================================================
   Election history.

   `user_rwa_elections` holds one row per wallet and is upserted, so the
   basket saved last week is gone the moment a new one is saved. Nothing
   could say what a wallet was electing at any point in the past, which
   matters for one specific reason: an accrual belongs to the basket that
   was in force when it accrued, not to whatever the wallet holds on the
   day somebody asks. Without a record of the second thing, the first is
   unprovable.

   `user_rwa_election_history` keeps each basket as a period, closed when
   the next one opens, so the periods tile a wallet's whole history with
   no gaps. The table is append-only at the database level: a trigger
   refuses deletes and every update except closing an open period.

   Writes go through `recordElectionChange` inside the same transaction
   as the upsert, so the current basket and the record of it cannot
   disagree. Saving a basket identical to the open one is not a change
   and opens no period: this is a record of what was elected, not of how
   many times somebody pressed save.
   ===================================================================== */

export interface ElectionAllocation {
  symbol: string;
  percentage: number;
}

export interface ElectionPeriod {
  id: number;
  mode: "stock_elected" | "plain_pons";
  allocations: ElectionAllocation[];
  isEnabled: boolean;
  effectiveFrom: string;
  /** Null while this is the period in force. */
  effectiveTo: string | null;
  isCurrent: boolean;
}

interface HistoryRow {
  id: string | number;
  mode: string;
  allocations: unknown;
  is_enabled: boolean;
  effective_from: Date | string;
  effective_to: Date | string | null;
}

const HISTORY_COLUMNS = "id, mode, allocations, is_enabled, effective_from, effective_to";

/** Parse stored allocations, keeping the order they were elected in. */
function readAllocations(input: unknown): ElectionAllocation[] {
  if (!Array.isArray(input)) return [];
  const out: ElectionAllocation[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const symbol = String((item as { symbol?: unknown }).symbol ?? "").toUpperCase();
    const percentage = Math.round(Number((item as { percentage?: unknown }).percentage ?? 0));
    if (symbol.length === 0 || !Number.isFinite(percentage)) continue;
    out.push({ symbol, percentage });
  }
  return out;
}

/**
 * Two baskets are the same basket regardless of the order the tickers were
 * added in, so comparison runs against a sorted copy while storage keeps the
 * elected order for display.
 */
function canonicalKey(
  mode: string,
  allocations: ElectionAllocation[],
  isEnabled: boolean,
): string {
  const sorted = [...allocations].sort((a, b) => a.symbol.localeCompare(b.symbol));
  return JSON.stringify({ mode, isEnabled, allocations: sorted });
}

function isoOf(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toPeriod(row: HistoryRow): ElectionPeriod {
  return {
    id: Number(row.id),
    mode: row.mode === "stock_elected" ? "stock_elected" : "plain_pons",
    allocations: readAllocations(row.allocations),
    isEnabled: Boolean(row.is_enabled),
    effectiveFrom: isoOf(row.effective_from),
    effectiveTo: row.effective_to === null ? null : isoOf(row.effective_to),
    isCurrent: row.effective_to === null,
  };
}

/**
 * Close the open period if the basket actually changed, and open a new one.
 * Must run inside a transaction alongside the `user_rwa_elections` upsert.
 */
export async function recordElectionChange(
  client: PoolClient,
  userAddress: string,
  next: { mode: string; allocations: ElectionAllocation[]; isEnabled: boolean },
): Promise<{ period: ElectionPeriod; changed: boolean }> {
  const { rows } = await client.query<HistoryRow>(
    `SELECT ${HISTORY_COLUMNS}
       FROM user_rwa_election_history
      WHERE user_address = $1 AND effective_to IS NULL
      FOR UPDATE`,
    [userAddress],
  );

  const open = rows[0];
  const desired = canonicalKey(next.mode, next.allocations, next.isEnabled);

  if (open) {
    const current = canonicalKey(
      open.mode,
      readAllocations(open.allocations),
      Boolean(open.is_enabled),
    );
    if (current === desired) return { period: toPeriod(open), changed: false };

    // NOW() is the transaction timestamp, so the period that closes and the
    // period that opens share one instant and the history has no gap in it.
    // Truncated to milliseconds for the reason migration 014 gives: a
    // boundary we hand out has to be able to find its own period on the way
    // back in.
    await client.query(
      `UPDATE user_rwa_election_history
          SET effective_to = date_trunc('milliseconds', NOW())
        WHERE id = $1`,
      [open.id],
    );
  }

  const inserted = await client.query<HistoryRow>(
    `INSERT INTO user_rwa_election_history
       (user_address, mode, allocations, is_enabled, effective_from, effective_to)
     VALUES ($1, $2, $3::jsonb, $4, date_trunc('milliseconds', NOW()), NULL)
     RETURNING ${HISTORY_COLUMNS}`,
    [userAddress, next.mode, JSON.stringify(next.allocations), next.isEnabled],
  );

  return { period: toPeriod(inserted.rows[0]), changed: true };
}

/**
 * The basket that was live for this wallet at `at`.
 *
 * The settlement and accrual legs read this rather than
 * `user_rwa_elections`, so yield recorded against a past epoch is
 * attributed to the election that was actually in force during it.
 */
export async function electionInForceAt(
  userAddress: string,
  at: Date,
): Promise<ElectionPeriod | null> {
  const { rows } = await pool.query<HistoryRow>(
    `SELECT ${HISTORY_COLUMNS}
       FROM user_rwa_election_history
      WHERE user_address = $1
        AND effective_from <= $2
        AND (effective_to IS NULL OR effective_to > $2)
      ORDER BY effective_from DESC
      LIMIT 1`,
    [userAddress, at],
  );
  return rows[0] ? toPeriod(rows[0]) : null;
}

/** The upsert that keeps `user_rwa_elections` pointing at the live basket. */
function upsertElection(
  client: PoolClient,
  userAddress: string,
  mode: string,
  allocations: ElectionAllocation[],
) {
  return client.query<{
    mode: string;
    allocations: unknown;
    is_enabled: boolean;
    updated_at: string;
  }>(
    `INSERT INTO user_rwa_elections (user_address, mode, allocations, is_enabled, updated_at)
     VALUES ($1, $2, $3::jsonb, true, NOW())
     ON CONFLICT (user_address)
     DO UPDATE SET mode = EXCLUDED.mode,
                   allocations = EXCLUDED.allocations,
                   is_enabled = EXCLUDED.is_enabled,
                   updated_at = NOW()
     RETURNING mode, allocations, is_enabled, updated_at`,
    [userAddress, mode, JSON.stringify(allocations)],
  );
}

// GET /api/rwa/tokens — public registry of eligible Stock Tokens on Robinhood Chain (4663)
rwaRouter.get(
  "/rwa/tokens",
  handler(async (_req, res) => {
    const tokens = await fetchEligibleTokens();
    const isElectionsActive = await isRwaElectionsEnabled();

    res.json({
      ok: true,
      network: "robinhood-chain-l2",
      chainId: 4663,
      isElectionsActive,
      stage: "sprint_f_accrual_only",
      tokens,
      disclaimer:
        "Stock Tokens are debt securities with no shareholder rights, jurisdiction-gated and not for US persons. Payouts are variable fee/reward distributions in-kind — no APY or projected yields.",
    });
  }),
);

// GET /api/rwa/balances — real-time overview of $MONKI, $PONS and RWA stock token positions
rwaRouter.get(
  "/rwa/balances",
  requireAuth,
  handler(async (req, res) => {
    const userAddress = req.user!.walletAddress;
    const isElectionsActive = await isRwaElectionsEnabled();

    // 1. Fetch user rewards ledger
    let rewardsRow = {
      claimable_monki: "0",
      claimed_monki: "0",
      staked_monki: "0",
      claimable_pons: "0",
      claimed_pons: "0",
      claimable_meta_stock: "0",
      claimed_meta_stock: "0",
    };

    try {
      const { rows } = await pool.query<{
        claimable_monki: string;
        claimed_monki: string;
        staked_monki: string;
        claimable_pons: string;
        claimed_pons: string;
        claimable_meta_stock: string;
        claimed_meta_stock: string;
      }>(
        `SELECT claimable_monki, claimed_monki, staked_monki, claimable_pons, claimed_pons,
                claimable_meta_stock, claimed_meta_stock
           FROM rewards WHERE user_address = $1`,
        [userAddress],
      );
      if (rows[0]) rewardsRow = rows[0];
    } catch (err) {
      console.warn("[rwa] Error reading rewards row for balances:", err);
    }

    // 2. Fetch user election
    let election = {
      mode: "plain_pons",
      allocations: [] as Array<{ symbol: string; percentage: number }>,
      isEnabled: true,
      updatedAt: null as string | null,
    };

    try {
      const { rows } = await pool.query<{
        mode: string;
        allocations: any;
        is_enabled: boolean;
        updated_at: string;
      }>(
        `SELECT mode, allocations, is_enabled, updated_at
           FROM user_rwa_elections WHERE user_address = $1`,
        [userAddress],
      );
      if (rows[0]) {
        election = {
          mode: rows[0].mode,
          allocations: rows[0].allocations ?? [],
          isEnabled: rows[0].is_enabled,
          updatedAt: rows[0].updated_at,
        };
      }
    } catch (err) {
      console.warn("[rwa] Error reading user election for balances:", err);
    }

    // 3. Fetch eligible tokens registry
    const eligibleTokens = await fetchEligibleTokens();

    const claimableMonki = Number(rewardsRow.claimable_monki);
    const claimedMonki = Number(rewardsRow.claimed_monki);
    const stakedMonki = Number(rewardsRow.staked_monki);
    const claimablePons = Number(rewardsRow.claimable_pons);
    const claimedPons = Number(rewardsRow.claimed_pons);

    // 4. Map RWA holdings
    const allocationMap = new Map(
      (election.allocations || []).map((a) => [a.symbol.toUpperCase(), a.percentage]),
    );

    const rwaTokens = eligibleTokens.map((token) => {
      const percentage =
        election.mode === "stock_elected" ? (allocationMap.get(token.symbol.toUpperCase()) ?? 0) : 0;
      const projectedAccrual = percentage > 0 ? (claimablePons * percentage) / 100 : 0;

      return {
        symbol: token.symbol,
        name: token.name,
        contractAddress: token.contractAddress,
        chainlinkFeedAddress: token.chainlinkFeedAddress,
        corporateActionMultiplier: token.corporateActionMultiplier,
        isLiquid: token.isLiquid,
        isSuspended: token.isSuspended,
        feedStatus: token.feedStatus,
        electedPercentage: percentage,
        projectedAccrual,
      };
    });

    res.json({
      ok: true,
      userAddress,
      network: "robinhood-chain-l2",
      chainId: 4663,
      isElectionsActive,
      timestamp: new Date().toISOString(),
      monki: {
        claimable: claimableMonki,
        claimed: claimedMonki,
        staked: stakedMonki,
        total: claimableMonki + claimedMonki + stakedMonki,
      },
      pons: {
        claimable: claimablePons,
        claimed: claimedPons,
      },
      election: {
        mode: election.mode,
        isEnabled: election.isEnabled,
        allocations: election.allocations,
        updatedAt: election.updatedAt,
      },
      rwaTokens,
    });
  }),
);

// GET /api/rwa/election — fetch active election for authenticated nurturer
rwaRouter.get(
  "/rwa/election",
  requireAuth,
  handler(async (req, res) => {
    const userAddress = req.user!.walletAddress;
    const isElectionsActive = await isRwaElectionsEnabled();

    try {
      const { rows } = await pool.query<{
        mode: string;
        allocations: any;
        is_enabled: boolean;
        updated_at: string;
      }>(
        `SELECT mode, allocations, is_enabled, updated_at
           FROM user_rwa_elections
          WHERE user_address = $1`,
        [userAddress],
      );

      const election = rows[0];
      res.json({
        ok: true,
        userAddress,
        isElectionsActive,
        mode: election?.mode ?? "plain_pons",
        allocations: election?.allocations ?? [],
        isEnabled: election?.is_enabled ?? true,
        updatedAt: election?.updated_at ?? null,
        stage: "sprint_f_accrual_only",
        pipeline: {
          states: ["accrued", "eligible", "claim_authorized", "broadcast", "confirmed"],
          currentState: "accrued",
        },
      });
    } catch (err) {
      console.error("[rwa] Error fetching user election:", err);
      // Fallback response for unmigrated or fresh state
      res.json({
        ok: true,
        userAddress,
        isElectionsActive,
        mode: "plain_pons",
        allocations: [],
        isEnabled: true,
        updatedAt: null,
        stage: "sprint_f_accrual_only",
        pipeline: {
          states: ["accrued", "eligible", "claim_authorized", "broadcast", "confirmed"],
          currentState: "accrued",
        },
      });
    }
  }),
);

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// GET /api/rwa/election/history — every basket this wallet has ever elected
//
// Unlike the other reads here, a failure is not answered with a plausible
// empty result. An empty history and an unreadable history look identical to
// a nurturer, and the whole point of this record is that it can be trusted,
// so the error is allowed to surface as a 500.
rwaRouter.get(
  "/rwa/election/history",
  requireAuth,
  handler(async (req, res) => {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "invalid_query",
        message: "limit must be a whole number between 1 and 200.",
      });
      return;
    }

    const userAddress = req.user!.walletAddress;
    const { limit } = parsed.data;
    const isElectionsActive = await isRwaElectionsEnabled();

    // One row past the limit, so "there is older history" is a fact rather
    // than a guess drawn from a full page.
    const { rows } = await pool.query<HistoryRow>(
      `SELECT ${HISTORY_COLUMNS}
         FROM user_rwa_election_history
        WHERE user_address = $1
        ORDER BY effective_from DESC, id DESC
        LIMIT $2`,
      [userAddress, limit + 1],
    );

    const hasMore = rows.length > limit;
    const periods = rows.slice(0, limit).map(toPeriod);

    res.json({
      ok: true,
      userAddress,
      isElectionsActive,
      current: periods.find((period) => period.isCurrent) ?? null,
      periods,
      hasMore,
    });
  }),
);

// POST /api/rwa/election — configure Stock-Elected Payout preferences
rwaRouter.post(
  "/rwa/election",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(setElectionSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const isElectionsActive = await isRwaElectionsEnabled();

    // Feature flag gate (Sprint F / rwa_elections)
    // If disabled via environment and DB, reject changes unless DEV_BYPASS_FLAGS is set
    if (!isElectionsActive && process.env.DEV_BYPASS_FLAGS !== "1" && process.env.NODE_ENV === "production") {
      res.status(403).json({
        error: "rwa_elections_disabled",
        message: "Stock-Elected payouts are currently disabled (feature flag rwa_elections is OFF).",
      });
      return;
    }

    if (body.mode === "stock_elected") {
      // 1. Validate compliance disclaimer
      if (!body.acceptedDisclaimer) {
        res.status(400).json({
          error: "disclaimer_not_accepted",
          message:
            "You must acknowledge that Stock Tokens are debt securities with no shareholder rights, jurisdiction-gated, and not available to US persons.",
        });
        return;
      }

      // 2. Validate allocations sum to 100%
      if (body.allocations.length === 0) {
        res.status(400).json({
          error: "empty_allocations",
          message: "Please select at least one Stock Token for your election.",
        });
        return;
      }

      const totalPercentage = body.allocations.reduce((acc, curr) => acc + curr.percentage, 0);
      if (totalPercentage !== 100) {
        res.status(400).json({
          error: "invalid_allocation_sum",
          message: `Allocations must sum exactly to 100%. Current total: ${totalPercentage}%.`,
        });
        return;
      }

      // 3. Verify duplicate symbols
      const symbols = body.allocations.map((a) => a.symbol.toUpperCase());
      const uniqueSymbols = new Set(symbols);
      if (uniqueSymbols.size !== symbols.length) {
        res.status(400).json({
          error: "duplicate_tokens",
          message: "Each Stock Token can only be added once to your election basket.",
        });
        return;
      }

      // 4. Validate against active eligible token registry
      const eligibleTokens = await fetchEligibleTokens();
      const eligibleMap = new Map(eligibleTokens.map((t) => [t.symbol.toUpperCase(), t]));

      for (const item of body.allocations) {
        const symbolUpper = item.symbol.toUpperCase();
        const found = eligibleMap.get(symbolUpper);
        if (!found) {
          res.status(400).json({
            error: "token_not_eligible",
            message: `Token ${item.symbol} is not in the eligible RWA stock token registry.`,
          });
          return;
        }
        if (found.isSuspended) {
          res.status(400).json({
            error: "token_suspended",
            message: `Token ${item.symbol} is temporarily suspended from new elections.`,
          });
          return;
        }
        if (!found.isLiquid) {
          res.status(400).json({
            error: "token_illiquid",
            message: `Token ${item.symbol} does not currently meet liquidity thresholds.`,
          });
          return;
        }
      }
    }

    // Persist election
    const sanitizedAllocations: ElectionAllocation[] =
      body.mode === "stock_elected"
        ? body.allocations.map((a) => ({
            symbol: a.symbol.toUpperCase(),
            percentage: a.percentage,
          }))
        : [];

    const message =
      body.mode === "stock_elected"
        ? "Stock election preferences saved. In Sprint F, accrual is recorded off-chain; settlement conversion will execute upon Sprint G activation."
        : "Reverted to plain $PONS payouts.";

    const client = await pool.connect();
    try {
      // The live row and the history row are written together or not at all,
      // so the basket in force can never disagree with the record of it.
      await client.query("BEGIN");

      const { rows } = await upsertElection(
        client,
        userAddress,
        body.mode,
        sanitizedAllocations,
      );
      const saved = rows[0];

      const { period, changed } = await recordElectionChange(client, userAddress, {
        mode: saved.mode,
        allocations: sanitizedAllocations,
        isEnabled: saved.is_enabled,
      });

      await client.query("COMMIT");

      res.json({
        ok: true,
        userAddress,
        mode: saved.mode,
        allocations: saved.allocations,
        isEnabled: saved.is_enabled,
        updatedAt: saved.updated_at,
        isElectionsActive,
        stage: "sprint_f_accrual_only",
        /** The period this save opened, or the one it left standing. */
        period,
        /** False when the basket sent matches the one already in force. */
        changed,
        message,
      });
    } catch (err: any) {
      await client.query("ROLLBACK").catch(() => {});

      // No fallback path here, deliberately. An election saved without its
      // history row is exactly the disagreement this table exists to prevent,
      // and a save that quietly half-succeeds would hide the fact that
      // migration 014 never applied. If the history table is missing, the
      // save fails and says so. Boot logging a migration failure and serving
      // anyway is the actual bug, and it belongs to the config validation
      // work, not here.
      console.error("[rwa] Error saving election:", err);
      res.status(500).json({
        error: "save_failed",
        message: err.message || "Failed to persist RWA stock election preferences.",
      });
    } finally {
      client.release();
    }
  }),
);
