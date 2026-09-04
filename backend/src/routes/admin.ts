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
       VALUES ($1::text, $1::text)
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

// GET /api/admin/protocol-settings — live protocol claim flags
adminRouter.get(
  "/admin/protocol-settings",
  requireAdmin,
  handler(async (_req, res) => {
    const { getAllProtocolSettings } = await import("../lib/settings");
    const settings = await getAllProtocolSettings();
    res.json(settings);
  }),
);

// POST /api/admin/protocol-settings/toggle-monki-claiming
adminRouter.post(
  "/admin/protocol-settings/toggle-monki-claiming",
  requireAdmin,
  handler(async (_req, res) => {
    const { isMonkiClaimingEnabled, setProtocolSetting } = await import("../lib/settings");
    const current = await isMonkiClaimingEnabled();
    const next = !current;
    await setProtocolSetting("enable_monki_claiming", next ? "true" : "false");
    res.json({
      ok: true,
      enableMonkiClaiming: next,
      message: next ? "$MONKI claiming has been unlocked." : "$MONKI claiming is gated (Pre-Launch).",
    });
  }),
);

// POST /api/admin/protocol-settings/toggle-pons-claiming
adminRouter.post(
  "/admin/protocol-settings/toggle-pons-claiming",
  requireAdmin,
  handler(async (_req, res) => {
    const { isPonsClaimingEnabled, setProtocolSetting } = await import("../lib/settings");
    const current = await isPonsClaimingEnabled();
    const next = !current;
    await setProtocolSetting("enable_pons_claiming", next ? "true" : "false");
    res.json({
      ok: true,
      enablePonsClaiming: next,
      message: next ? "$PONS epoch claiming is active." : "$PONS claiming is paused.",
    });
  }),
);

// POST /api/admin/protocol-settings/toggle-companion-minting
adminRouter.post(
  "/admin/protocol-settings/toggle-companion-minting",
  requireAdmin,
  handler(async (_req, res) => {
    const { isCompanionMintingEnabled, setProtocolSetting } = await import("../lib/settings");
    const current = await isCompanionMintingEnabled();
    const next = !current;
    await setProtocolSetting("enable_companion_minting", next ? "true" : "false");
    res.json({
      ok: true,
      enableCompanionMinting: next,
      message: next ? "Companion minting is active." : "Companion minting is paused.",
    });
  }),
);

// GET /api/admin/stats — aggregate system telemetry
adminRouter.get(
  "/admin/stats",
  requireAdmin,
  handler(async (_req, res) => {
    const [usersCount, agentsCount, activeSessions, rewardsAgg, companionsMinted] = await Promise.all([
      pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM users`),
      pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM agents`),
      pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM sessions WHERE status = 'active'`),
      pool.query<{ total_monki: string; total_pons: string }>(
        `SELECT COALESCE(SUM(claimable_monki), 0) AS total_monki, COALESCE(SUM(claimable_pons), 0) AS total_pons FROM rewards`,
      ),
      pool.query<{ count: string }>(`SELECT COUNT(*) AS count FROM user_companions`),
    ]);

    res.json({
      totalUsers: Number(usersCount.rows[0]?.count ?? 0),
      totalAgents: Number(agentsCount.rows[0]?.count ?? 0),
      activeSessions: Number(activeSessions.rows[0]?.count ?? 0),
      totalClaimableMonki: Number(rewardsAgg.rows[0]?.total_monki ?? 0),
      totalClaimablePons: Number(rewardsAgg.rows[0]?.total_pons ?? 0),
      totalCompanionsMinted: Number(companionsMinted.rows[0]?.count ?? 0),
    });
  }),
);
