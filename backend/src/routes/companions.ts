import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../lib/auth";
import { handler, parseBody } from "../lib/http";
import {
  claimMilestoneReward,
  equipCompanion,
  getCompanionsCatalog,
  getUserInventory,
  unequipCompanion,
  type MilestoneKey,
} from "../lib/companions";

export const companionsRouter = Router();

// GET /api/companions/catalog — public catalog of all active companions
companionsRouter.get(
  "/companions/catalog",
  handler(async (_req, res) => {
    const companions = await getCompanionsCatalog();
    res.json({ companions });
  }),
);

// GET /api/companions/inventory — authenticated user's companion items
companionsRouter.get(
  "/companions/inventory",
  requireAuth,
  handler(async (req, res) => {
    const inventory = await getUserInventory(req.user!.walletAddress);
    res.json({ inventory });
  }),
);

const equipSchema = z.object({
  userCompanionId: z.number().int().positive(),
  agentId: z.string(),
  slotIndex: z.number().int().min(1).max(3).optional(),
});

// POST /api/companions/equip — equip companion into slot (1, 2, or 3)
companionsRouter.post(
  "/companions/equip",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(equipSchema, req, res);
    if (!body) return;

    try {
      const result = await equipCompanion(
        req.user!.walletAddress,
        body.userCompanionId,
        body.agentId,
        body.slotIndex,
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed_to_equip" });
    }
  }),
);

const unequipSchema = z.object({
  userCompanionId: z.number().int().positive(),
});

// POST /api/companions/unequip — detach companion back to inventory
companionsRouter.post(
  "/companions/unequip",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(unequipSchema, req, res);
    if (!body) return;

    try {
      const result = await unequipCompanion(req.user!.walletAddress, body.userCompanionId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed_to_unequip" });
    }
  }),
);

const milestoneSchema = z.object({
  milestoneKey: z.enum(["first_heartbeat", "thriving_streak_7d", "top_nurturer_10k"]),
});

// POST /api/companions/claim-milestone — free unlock for milestones
companionsRouter.post(
  "/companions/claim-milestone",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(milestoneSchema, req, res);
    if (!body) return;

    try {
      const companion = await claimMilestoneReward(
        req.user!.walletAddress,
        body.milestoneKey as MilestoneKey,
      );
      res.json({ ok: true, companion });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed_to_claim_milestone" });
    }
  }),
);

const verifyMintSchema = z.object({
  txHash: z.string(),
  companionId: z.string(),
});

// POST /api/companions/verify-mint — verify on-chain Robinhood Chain ERC-721 mint and register companion in inventory
companionsRouter.post(
  "/companions/verify-mint",
  requireAuth,
  handler(async (req, res) => {
    const body = parseBody(verifyMintSchema, req, res);
    if (!body) return;

    const userAddress = req.user!.walletAddress;
    const { pool } = await import("../db/index");
    const { getPublicClient } = await import("../lib/chain");

    // 1. Check anti-replay in DB
    const { rows: existing } = await pool.query(
      `SELECT id FROM user_companions WHERE mint_tx_hash = $1`,
      [body.txHash],
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "mint_already_registered" });
      return;
    }

    // 2. Fetch receipt on Robinhood Chain
    const publicClient = getPublicClient();
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: body.txHash as `0x${string}` });
    } catch {
      res.status(404).json({ error: "transaction_not_found" });
      return;
    }

    if (receipt.status !== "success") {
      res.status(400).json({ error: "transaction_failed_on_chain" });
      return;
    }

    if (receipt.from.toLowerCase() !== userAddress.toLowerCase()) {
      res.status(403).json({ error: "minter_mismatch" });
      return;
    }

    const { env } = await import("../lib/env");
    if (
      env.companionsNftAddress &&
      receipt.to?.toLowerCase() !== env.companionsNftAddress.toLowerCase()
    ) {
      res.status(400).json({ error: "invalid_contract_address" });
      return;
    }

    // Extract tokenId from Transfer event log
    let tokenId = "1";
    for (const log of receipt.logs) {
      if (
        log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
        log.topics[3]
      ) {
        tokenId = BigInt(log.topics[3]).toString();
        break;
      }
    }

    // Insert into user_companions
    const { rows: inserted } = await pool.query(
      `INSERT INTO user_companions (user_address, companion_id, on_chain_mint, mint_tx_hash, acquisition_type)
       VALUES ($1, $2, $3, $4, 'paid_mint')
       RETURNING *`,
      [userAddress, body.companionId, tokenId, body.txHash],
    );

    res.json({
      ok: true,
      companion: inserted[0],
    });
  }),
);

