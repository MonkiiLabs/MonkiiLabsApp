import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { handler, parseBody } from "../lib/http";
import { env } from "../lib/env";
import { getSetting, setSetting } from "../lib/settings";

export const adminRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-admin-key"] || req.query.adminKey;
  if (!key || key !== env.adminMasterKey) {
    res.status(403).json({ error: "forbidden", message: "Invalid master admin key" });
    return;
  }
  next();
}

const airdropSchema = z.object({
  recipientAddress: z.string(),
  amountMonki: z.number().nonnegative().default(0),
  amountPons: z.number().nonnegative().default(0),
});

// POST /api/admin/airdrop — direct airdrop to a user
adminRouter.post(
  "/admin/airdrop",
  requireAdmin,
  handler(async (req, res) => {
    const body = parseBody(airdropSchema, req, res);
    if (!body) return;

    await pool.query(
      `INSERT INTO users (wallet_address, address)
       VALUES ($1, $1)
       ON CONFLICT (wallet_address) DO NOTHING`,
      [body.recipientAddress],
    );

    await pool.query(
      `INSERT INTO rewards (user_address, claimable_monki, claimable_pons)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_address)
       DO UPDATE SET claimable_monki = rewards.claimable_monki + $2,
                     claimable_pons = rewards.claimable_pons + $3,
                     updated_at = now()`,
      [body.recipientAddress, body.amountMonki, body.amountPons],
    );

    res.json({
      ok: true,
      recipientAddress: body.recipientAddress,
      airdroppedMonki: body.amountMonki,
      airdroppedPons: body.amountPons,
    });
  }),
);

// GET /api/admin/settings — get all settings
adminRouter.get(
  "/admin/settings",
  requireAdmin,
  handler(async (_req, res) => {
    const { rows } = await pool.query(`SELECT key, value, updated_at FROM protocol_settings`);
    res.json({ settings: rows });
  }),
);

const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// POST /api/admin/settings — update setting
adminRouter.post(
  "/admin/settings",
  requireAdmin,
  handler(async (req, res) => {
    const body = parseBody(settingSchema, req, res);
    if (!body) return;
    await setSetting(body.key, body.value);
    res.json({ ok: true, key: body.key, value: body.value });
  }),
);
