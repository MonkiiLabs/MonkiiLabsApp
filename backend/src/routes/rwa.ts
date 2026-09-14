import { Router } from "express";
import { z } from "zod";
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
    try {
      const sanitizedAllocations =
        body.mode === "stock_elected"
          ? body.allocations.map((a) => ({
              symbol: a.symbol.toUpperCase(),
              percentage: a.percentage,
            }))
          : [];

      const { rows } = await pool.query<{
        mode: string;
        allocations: any;
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
        [userAddress, body.mode, JSON.stringify(sanitizedAllocations)],
      );

      const saved = rows[0];
      res.json({
        ok: true,
        userAddress,
        mode: saved.mode,
        allocations: saved.allocations,
        isEnabled: saved.is_enabled,
        updatedAt: saved.updated_at,
        isElectionsActive,
        stage: "sprint_f_accrual_only",
        message:
          body.mode === "stock_elected"
            ? "Stock election preferences saved. In Sprint F, accrual is recorded off-chain; settlement conversion will execute upon Sprint G activation."
            : "Reverted to plain $PONS payouts.",
      });
    } catch (err: any) {
      console.error("[rwa] Error saving election:", err);
      res.status(500).json({
        error: "save_failed",
        message: err.message || "Failed to persist RWA stock election preferences.",
      });
    }
  }),
);
