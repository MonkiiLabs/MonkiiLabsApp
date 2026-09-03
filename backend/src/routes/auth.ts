import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { createSession, issueNonce, verifySignature } from "../lib/auth";
import { handler, parseBody } from "../lib/http";

export const authRouter = Router();

const nonceSchema = z.object({ walletAddress: z.string() });
const verifySchema = z.object({
  walletAddress: z.string(),
  signature: z.string(),
});

// POST /api/auth/nonce — issue signing challenge for Robinhood / EVM wallet
authRouter.post(
  "/auth/nonce",
  handler(async (req, res) => {
    const body = parseBody(nonceSchema, req, res);
    if (!body) return;
    try {
      const { nonce, message } = await issueNonce(body.walletAddress);
      res.json({ nonce, message });
    } catch {
      res.status(400).json({ error: "invalid_address" });
    }
  }),
);

// POST /api/auth/verify — verify signed message, return JWT session token
authRouter.post(
  "/auth/verify",
  handler(async (req, res) => {
    const body = parseBody(verifySchema, req, res);
    if (!body) return;
    try {
      const user = await verifySignature(body.walletAddress, body.signature);
      const token = await createSession(user);
      res.json({ token, user });
    } catch (err: any) {
      res.status(401).json({ error: err.message || "unauthorized" });
    }
  }),
);

// GET /api/auth/me — profile & aggregate stats of authenticated user
authRouter.get(
  "/auth/me",
  handler(async (req, res) => {
    if (!req.user) {
      res.json({ user: null });
      return;
    }

    const { rows } = await pool.query<{
      id: string;
      wallet_address: string;
      display_name: string | null;
      total_monki_earned: string;
      power_rank: number | null;
      telegram_username: string | null;
      telegram_link_code: string | null;
      telegram_chat_id: string | null;
      created_at: Date;
    }>(
      `SELECT id, wallet_address, display_name, total_monki_earned, power_rank,
              telegram_username, telegram_link_code, telegram_chat_id, created_at
         FROM users WHERE wallet_address = $1`,
      [req.user.walletAddress],
    );

    const u = rows[0];
    if (!u) {
      res.json({ user: null });
      return;
    }

    res.json({
      user: {
        id: u.id,
        walletAddress: u.wallet_address,
        displayName: u.display_name,
        totalMonkiEarned: Number(u.total_monki_earned),
        powerRank: u.power_rank,
        telegram: {
          linked: Boolean(u.telegram_chat_id),
          username: u.telegram_username,
          linkCode: u.telegram_link_code,
        },
        createdAt: new Date(u.created_at).toISOString(),
      },
    });
  }),
);
