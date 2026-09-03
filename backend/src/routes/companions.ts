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
